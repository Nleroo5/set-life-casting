# Professional Email Setup Guide

This guide explains how to set up professional password reset emails using Resend.

## Overview

The application now uses custom-branded, professional password reset emails instead of Firebase's default emails. This provides:

- Full control over email design and branding
- Better deliverability (when DNS records are configured)
- Mobile-responsive, accessible email templates
- Professional appearance that builds trust

## Current State

### What's Implemented

1. **Custom Email Template** (`src/emails/PasswordResetEmail.tsx`)
   - Professional, branded design matching your site
   - Responsive layout (mobile-friendly)
   - Accessible (WCAG compliant)
   - Security information displayed clearly

2. **Password Reset API** (`src/app/api/auth/request-reset/route.ts`)
   - Generates secure reset tokens
   - Stores tokens in Firestore
   - Sends branded email via Resend

3. **Custom Reset Page** (`src/app/auth/reset-password/page.tsx`)
   - User-friendly password reset form
   - Token verification
   - Clear success/error messaging

4. **Updated Login Flow** (`src/app/login/page.tsx`)
   - Uses new custom email API
   - Maintained existing UI/UX

## Setup Instructions

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address
4. Navigate to "API Keys" in the dashboard
5. Create a new API key
6. Copy the API key (starts with `re_`)

### Step 2: Add Environment Variables

Add these variables to your `.env.local` file:

```bash
# Resend API Key (required)
RESEND_API_KEY=re_your_api_key_here

# Your app URL (required for reset links)
NEXT_PUBLIC_APP_URL=https://set-life-casting.vercel.app
```

For local development, you can use:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Step 3: Add to Vercel Environment Variables

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add both variables:
   - `RESEND_API_KEY` = `re_your_api_key_here`
   - `NEXT_PUBLIC_APP_URL` = `https://set-life-casting.vercel.app`
4. Apply to all environments (Production, Preview, Development)
5. Redeploy your application

### Step 4: DNS Configuration (For Better Deliverability)

**Note:** This step is optional but highly recommended for production use. You can skip this initially and configure it later.

#### Current Email Sender

Right now, emails are sent from Resend's default domain:
- **From:** `Set Life Casting <onboarding@resend.dev>`

This works for testing but is not ideal for production.

#### Setting Up Custom Domain

Once you're ready to improve deliverability, follow these steps:

1. **Verify Your Domain in Resend**
   - Go to Resend dashboard → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `setlifecasting.com`)

2. **Add DNS Records**

   Resend will provide DNS records to add to your domain:

   **SPF Record (TXT)**
   ```
   Name: @
   Value: v=spf1 include:resend.com ~all
   ```

   **DKIM Records (CNAME)** - Resend provides 3 records like:
   ```
   Name: resend1._domainkey
   Value: [provided by Resend]

   Name: resend2._domainkey
   Value: [provided by Resend]

   Name: resend3._domainkey
   Value: [provided by Resend]
   ```

   **DMARC Record (TXT)**
   ```
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:your-email@example.com
   ```

3. **Update Email Sender in Code**

   Once your domain is verified, update this line in `src/app/api/auth/request-reset/route.ts`:

   ```typescript
   // Change from:
   from: "Set Life Casting <onboarding@resend.dev>",

   // To:
   from: "Set Life Casting <noreply@setlifecasting.com>",
   ```

4. **DNS Propagation**
   - DNS changes can take 24-48 hours to propagate fully
   - Use tools like [MXToolbox](https://mxtoolbox.com/) to verify records
   - Resend dashboard will show verification status

## Testing

### Local Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3001/login`

3. Click "Forgot password?"

4. Enter a test email address (must exist in your Firestore users collection)

5. Check your email inbox for the reset link

6. Click the link and test the password reset flow

### What to Test

- [ ] Email arrives in inbox (check spam folder too)
- [ ] Email displays correctly on mobile and desktop
- [ ] Reset link works when clicked
- [ ] Token expires after 1 hour
- [ ] Token can only be used once
- [ ] Password successfully updates
- [ ] User can log in with new password
- [ ] Error messages display correctly for invalid tokens

## Email Design

### Brand Colors Used

- **Primary:** `#5F65C4` (Accent purple)
- **Text:** `#2C2F3E` (Secondary)
- **Background:** `#FFFFFF`
- **Security Box:** `#F3F4F6` with purple border

### Fonts

- **Headers:** Georgia, serif (fallback for Galindo)
- **Body:** System fonts (San Francisco, Segoe UI, etc.)

### Mobile Responsiveness

- Max width: 600px
- Responsive on all devices
- Touch-friendly buttons (minimum 44x44px)
- Readable text (minimum 16px)

## Security Features

### Token Security

- **Length:** 32 characters (cryptographically secure)
- **Expiration:** 1 hour
- **One-time use:** Tokens are marked as used after verification
- **Stored securely:** Tokens stored in Firestore with timestamp

### Email Content Security

- Link expiration clearly communicated
- Request timestamp included
- "Didn't request this?" message included
- Support contact provided

## Troubleshooting

### Email Not Received

1. **Check spam folder** - New domains may go to spam initially
2. **Verify RESEND_API_KEY is set** correctly in environment
3. **Check Resend dashboard** for delivery logs
4. **Verify email exists** in Firestore users collection
5. **Check server logs** for errors

### Reset Link Not Working

1. **Check token expiration** - Links expire after 1 hour
2. **Verify NEXT_PUBLIC_APP_URL** matches your deployment URL
3. **Check Firestore** for passwordResetTokens collection
4. **Ensure token hasn't been used** already

### API Errors

1. **500 Error:** Check server logs in Vercel
2. **Firebase not initialized:** Verify Firebase config
3. **Resend API error:** Check API key is valid
4. **Missing environment variables:** Verify all env vars are set

## Monitoring

### Resend Dashboard

Monitor these metrics in your Resend dashboard:

- **Delivery rate** (should be 95%+)
- **Open rate**
- **Click rate**
- **Bounce rate** (should be <2%)
- **Spam complaint rate** (should be <0.1%)

### Firestore Collections

The following data is stored in Firestore:

**Collection:** `passwordResetTokens`

Fields:
- `email`: User's email address
- `token`: Reset token (32 characters)
- `expiresAt`: Timestamp when token expires
- `used`: Boolean indicating if token was used
- `usedAt`: Timestamp when token was used (if applicable)
- `createdAt`: Timestamp when token was created

## Future Improvements

### Phase 1 (Optional - Better Deliverability)

- [ ] Set up custom domain in Resend
- [ ] Configure SPF/DKIM/DMARC records
- [ ] Update sender email to custom domain
- [ ] Monitor deliverability metrics

### Phase 2 (Optional - Enhanced Features)

- [ ] Add email open tracking
- [ ] Add click tracking analytics
- [ ] Implement rate limiting on reset requests
- [ ] Add admin dashboard for monitoring
- [ ] Send confirmation email after password change
- [ ] Add email templates for other transactional emails

### Phase 3 (Optional - Advanced Security)

- [ ] Implement 2FA for password resets
- [ ] Add IP-based rate limiting
- [ ] Log all password reset attempts
- [ ] Send security alerts for suspicious activity
- [ ] Implement account lockout after failed attempts

## Cost

### Resend Free Tier

- 3,000 emails per month
- 100 emails per day
- Free forever
- No credit card required

This should be more than sufficient for a casting agency's password reset needs.

### Paid Plans (if needed)

Starting at $20/month for 50,000 emails.

## Support

For issues with:

- **Email delivery:** Contact [Resend Support](https://resend.com/support)
- **Application code:** Check server logs or contact developer
- **DNS configuration:** Contact your domain registrar support

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Components](https://react.email/docs)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Email Deliverability Guide](https://postmarkapp.com/guides/email-deliverability)

---

## Quick Reference

### Required Environment Variables

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Files Modified

1. `src/emails/PasswordResetEmail.tsx` - Email template
2. `src/app/api/auth/request-reset/route.ts` - Request reset API
3. `src/app/api/auth/verify-reset/route.ts` - Verify token API
4. `src/app/auth/reset-password/page.tsx` - Reset password page
5. `src/app/login/page.tsx` - Updated to use new API

### Test Checklist

- [ ] Email arrives in inbox
- [ ] Email looks professional on mobile
- [ ] Reset link works
- [ ] Password updates successfully
- [ ] User can log in with new password
- [ ] Token expires after 1 hour
- [ ] Token can only be used once
