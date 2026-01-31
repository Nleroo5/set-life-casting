# Security Documentation

## 🔐 Firebase API Key Rotation

### ⚠️ IMMEDIATE ACTION REQUIRED

The current Firebase API key is exposed in `.env.local` and needs to be rotated immediately.

### Step-by-Step Rotation Process

#### 1. Generate New API Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **set-life-casting**
3. Click ⚙️ Settings → Project settings
4. Navigate to **General** tab
5. Scroll to **Your apps** section
6. Find your web app (1:410393705634:web:04d96fa83f93f8c0adabfb)
7. Click **Config** to view current configuration
8. **Do NOT** regenerate the existing key yet - follow steps below first

#### 2. Update Firebase App Check (Optional but Recommended)
1. In Firebase Console → Build → App Check
2. Click **Apps** tab
3. Register your web app if not already registered
4. Enable reCAPTCHA v3 or reCAPTCHA Enterprise
5. This adds an additional layer of protection beyond just the API key

#### 3. Backup Current Configuration
```bash
# Save current .env.local to backup
cp .env.local .env.local.backup
```

#### 4. Update Local Environment
1. Open `.env.local`
2. Update `NEXT_PUBLIC_FIREBASE_API_KEY` with new key (once generated)
3. Keep all other values the same:
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=set-life-casting.firebaseapp.com`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID=set-life-casting`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=set-life-casting.firebasestorage.app`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=410393705634`
   - `NEXT_PUBLIC_FIREBASE_APP_ID=1:410393705634:web:04d96fa83f93f8c0adabfb`

#### 5. Update Production Environment
**For Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `NEXT_PUBLIC_FIREBASE_API_KEY`
3. Click Edit → Update with new key
4. Redeploy application

**For other platforms:**
- Update environment variables in your hosting platform
- Ensure new key is deployed before invalidating old key

#### 6. Test New Configuration
```bash
# Test locally
npm run dev

# Test authentication:
# 1. Try to login
# 2. Try to sign up
# 3. Verify Firebase connection works
```

#### 7. Invalidate Old Key (Only After Confirming New Key Works)
1. Return to Firebase Console → Project settings
2. Find old web app configuration
3. Remove or restrict the old API key
4. Monitor for any errors in production

#### 8. Verify .gitignore
```bash
# Ensure .env.local is NOT tracked by git
cat .gitignore | grep ".env.local"

# If not present, add it:
echo ".env.local" >> .gitignore

# Check git history for exposed keys:
git log --all --full-history -- .env.local

# If found in history, consider using git-filter-repo to remove:
# git filter-repo --path .env.local --invert-paths
```

---

## 🔒 Cookie Security Best Practices

### Current Implementation
Cookies are set with the following flags:
- ✅ `SameSite=Strict` - Prevents CSRF attacks
- ✅ `Secure` - Only transmitted over HTTPS
- ✅ `max-age=3600` - 1-hour expiration
- ⚠️ **NOT HttpOnly** - Accessible via JavaScript (XSS vulnerability)

### HttpOnly Limitation
The current implementation uses `document.cookie` which cannot set the `HttpOnly` flag. This is a known limitation documented in the code.

### Future Enhancement (Recommended)
To implement `HttpOnly` cookies, create a server-side API route:

```typescript
// app/api/auth/set-token/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { token } = await request.json();

  const response = NextResponse.json({ success: true });

  // Set HttpOnly cookie from server-side
  response.cookies.set('firebase-token', token, {
    httpOnly: true,  // ✅ Prevents XSS
    secure: true,    // ✅ HTTPS only
    sameSite: 'strict',  // ✅ CSRF protection
    maxAge: 3600,    // 1 hour
    path: '/'
  });

  return response;
}
```

Then update AuthContext to use this endpoint instead of `document.cookie`.

---

## 🛡️ Security Headers

All security headers are configured in `next.config.ts`:

- ✅ **Strict-Transport-Security**: Forces HTTPS (2-year max-age with preload)
- ✅ **X-Frame-Options**: Prevents clickjacking (SAMEORIGIN)
- ✅ **X-Content-Type-Options**: Prevents MIME sniffing (nosniff)
- ✅ **X-XSS-Protection**: Legacy XSS protection (enabled)
- ✅ **Referrer-Policy**: Controls referrer information (origin-when-cross-origin)
- ✅ **Permissions-Policy**: Disables camera, microphone, geolocation
- ✅ **Content-Security-Policy**: (Added in Phase 1) Restricts resource loading

---

## 📋 Security Checklist

### Before Production Deployment
- [ ] Rotate Firebase API key
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Check git history for exposed secrets
- [ ] Enable Firebase App Check
- [ ] Configure CSP header with proper domains
- [ ] Test authentication flow thoroughly
- [ ] Enable Firestore security rules
- [ ] Review Storage security rules
- [ ] Set up error monitoring (Sentry)
- [ ] Configure rate limiting on auth endpoints
- [ ] Review admin access controls
- [ ] Test CSRF protection

### Regular Maintenance
- [ ] Rotate API keys every 90 days
- [ ] Review security rules monthly
- [ ] Update dependencies weekly
- [ ] Run security audits quarterly
- [ ] Monitor error logs daily
- [ ] Review access logs weekly

---

## 🚨 Incident Response

### If API Key is Compromised
1. **Immediately** rotate API key following steps above
2. Check Firebase Authentication logs for unauthorized access
3. Review Firestore audit logs for unusual activity
4. Monitor for quota exhaustion or abuse
5. Enable Firebase App Check if not already enabled
6. Consider implementing rate limiting
7. Review all recent commits for additional exposed secrets

### If Session Tokens are Stolen
1. Users can logout to invalidate their token
2. Tokens automatically expire after 1 hour
3. Consider implementing token revocation list for critical incidents
4. Monitor for unusual login patterns

---

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/routing/middleware#security)
- [Content Security Policy Generator](https://csp-evaluator.withgoogle.com/)

---

**Last Updated**: 2026-01-31
**Next Review**: 2026-04-30
