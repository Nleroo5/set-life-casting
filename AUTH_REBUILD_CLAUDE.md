# Set Life Casting - Authentication Rebuild Instructions for Claude

## 🎯 Project Context

You are rebuilding ONLY the authentication system for an existing Next.js 14 casting platform. The goal is to replace Firebase Auth with Supabase while keeping everything else unchanged.

**CRITICAL**: This is a surgical auth replacement, not a full rebuild. Think of it like replacing the engine in a car while keeping the body, wheels, and interior exactly the same.

---

## 📋 What You're Changing vs. What You're Keeping

### ✅ CHANGE (Authentication Only)
- Login/signup mechanism (Firebase → Supabase)
- Session management (Firebase cookies → Supabase JWT)
- User authentication table (Firestore → PostgreSQL)
- Role checking logic (query public.users instead of Firestore users)
- AuthContext implementation
- Middleware auth verification

### ❌ DO NOT CHANGE (Everything Else)
- **Design & Layout**: Colors, fonts, spacing, component structure MUST stay identical
- **Firestore Data**: submissions, roles, projects, profiles stay on Firestore
- **Firebase Storage**: Photo uploads still use Firebase Storage
- **Business Logic**: Submission workflow, role management, project handling unchanged
- **UI Components**: Buttons, badges, inputs, forms keep same styling
- **Page Structure**: Admin dashboard, talent dashboard, submissions page layout unchanged

---

## 🧰 Your Toolkit

### Environment Variables You'll Need

**Supabase Credentials** (user will provide):
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Keep These (for Firestore)**:
```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
```

### Packages to Install
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Packages to Keep
- Keep `firebase` package (still needed for Firestore & Storage)
- Keep `firebase-admin` (still needed for server-side Firestore)

---

## 🏗️ Implementation Roadmap

### Phase 1: Supabase Setup (Do This First)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note the project URL and keys
   - Save credentials (user will provide these to you)

2. **Create Database Schema**
   - Run the SQL migration from AUTH_REBUILD_SPEC.md
   - Creates `public.users` table
   - Sets up Row Level Security policies
   - Creates indexes for performance

3. **Configure Email Templates**
   - Customize verification email
   - Customize password reset email
   - Add branding (Set Life Casting logo/colors)

4. **Test Basic Auth**
   - Create test user in Supabase dashboard
   - Verify email sends
   - Test RLS policies work

**Validation Checklist**:
- [ ] Can create user in Supabase dashboard
- [ ] Verification emails arrive
- [ ] RLS policies prevent unauthorized reads
- [ ] Database queries fast (< 100ms)

---

### Phase 2: Replace Auth Files (The Core Work)

#### Step 2.1: Create New Supabase Client Files

**File: `src/lib/supabase/config.ts`** (NEW)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File: `src/lib/supabase/server.ts`** (NEW)
- Copy implementation from AUTH_REBUILD_SPEC.md
- This is for server-side auth (API routes, server components)

**File: `src/lib/supabase/admin.ts`** (NEW)
- Copy implementation from AUTH_REBUILD_SPEC.md
- This is for admin operations (using service role key)

**Why separate files?**
- Browser client for client components
- Server client for middleware & API routes
- Admin client for bypassing RLS

---

#### Step 2.2: Update Middleware

**File: `src/middleware.ts`** (MAJOR REWRITE)

**Current logic**:
```typescript
// OLD: Check firebase-token cookie
const token = request.cookies.get('firebase-token')?.value;
if (!token) redirect to login
// Verify token with Firebase Admin
// Check role in Firestore users collection
```

**New logic**:
```typescript
// NEW: Use Supabase session
const supabase = createServerClient(...)
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect to login
// Check role in public.users table
const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
if (userData?.role !== 'admin') redirect to home
// CRITICAL: Must call updateSession() at end
await supabase.auth.updateSession()
```

**⚠️ CRITICAL REQUIREMENTS**:
1. Call `cookies()` before creating Supabase client (opts out of Next.js caching)
2. MUST call `updateSession()` at end or "the app will act weird" (per Supabase docs)
3. Handle cookie setting correctly (see AUTH_REBUILD_SPEC.md for full code)

**Copy the complete middleware implementation from AUTH_REBUILD_SPEC.md** - it's fully tested and handles all edge cases.

---

#### Step 2.3: Update AuthContext

**File: `src/contexts/AuthContext.tsx`** (MAJOR REWRITE)

**What changes**:
- Replace `firebase/auth` imports with Supabase
- Replace `onAuthStateChanged` with `supabase.auth.onAuthStateChange`
- Replace `signInWithEmailAndPassword` with `supabase.auth.signInWithPassword`
- Load userData from `public.users` table instead of Firestore

**What stays the same**:
- Export interface (other components depend on it)
- Function names (`signOut`, `useAuth`)
- Return structure (`{ user, userData, isAdmin, loading }`)

**Why keep interface?** All your app pages use `useAuth()` hook - if you change the interface, you'd have to update 20+ files. By keeping the same interface, you make this change invisible to the rest of the app.

**Copy the complete AuthContext from AUTH_REBUILD_SPEC.md** - it maintains backward compatibility while using Supabase.

---

#### Step 2.4: Update Login Page

**File: `src/app/login/page.tsx`** (MAJOR REWRITE)

**Visual design**: KEEP EXACTLY AS IS
- Same purple accent color (#8B5CF6)
- Same Galindo font for headers
- Same Outfit font for body text
- Same button styling
- Same input field styling
- Same layout/spacing

**What changes (under the hood)**:
```typescript
// OLD:
import { signInWithEmailAndPassword } from 'firebase/auth'
await signInWithEmailAndPassword(auth, email, password)

// NEW:
import { createClient } from '@/lib/supabase/config'
const supabase = createClient()
await supabase.auth.signInWithPassword({ email, password })
```

**New requirement**: Check `email_confirmed_at` before allowing login
```typescript
if (!data.user?.email_confirmed_at) {
  setError('Please verify your email before logging in')
  await supabase.auth.signOut()
  return
}
```

**Copy the complete login page from AUTH_REBUILD_SPEC.md** - it preserves the exact design while using Supabase.

---

#### Step 2.5: Update Signup Page

**File: `src/app/signup/page.tsx`** (MAJOR REWRITE)

**Visual design**: KEEP EXACTLY AS IS
**What changes**:
- Replace Firebase signup with Supabase
- Add role selection (talent/admin radio buttons)
- Create record in `public.users` after auth signup
- Show email verification notice

**Two-step signup process**:
1. Create auth.users record (Supabase Auth)
2. Create public.users record (custom user data)

```typescript
// Step 1: Auth signup
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName, role: role }
  }
})

// Step 2: Create public.users record
await supabase.from('users').insert({
  id: data.user.id,
  email: data.user.email,
  role: role,
  full_name: fullName
})
```

**Copy the complete signup page from AUTH_REBUILD_SPEC.md**.

---

### Phase 3: Update Environment Variables

**File: `.env.local`**

**ADD**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://inhdkjjrahvhrdkbkiogw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**KEEP** (still needed for Firestore):
```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

**MAYBE DELETE** (if only used for auth):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...  # Only delete if Firestore doesn't need it
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...  # Safe to delete (auth-specific)
```

**⚠️ BE CAREFUL**: Don't delete Firebase vars that Firestore needs. Check `src/lib/firebase/config.ts` to see what's actually used.

---

### Phase 4: Testing (Do NOT Skip This)

Run through ALL 8 test scenarios in AUTH_REBUILD_SPEC.md:

1. **Talent Signup Flow** - Create account, verify email, log in
2. **Admin Signup Flow** - Create admin, verify can access /admin
3. **Login with Redirect** - Test ?redirect= parameter works
4. **Email Not Verified** - Verify blocked from login
5. **Password Reset** - Test forgot password flow
6. **Unauthorized Access** - Talent blocked from /admin
7. **Session Expiry** - Test auto-refresh works
8. **Concurrent Sessions** - Multiple browsers

**Testing Checklist**:
- [ ] Talent can sign up and create profile
- [ ] Admin can access /admin/submissions
- [ ] Talent blocked from /admin
- [ ] Email verification required
- [ ] Password reset works
- [ ] Session persists across refreshes
- [ ] Logout works correctly
- [ ] No console errors

---

### Phase 5: Cleanup (Final Step)

**Files to DELETE** (only if they exist and are auth-only):
```
src/lib/firebase/auth.ts  # If exists
src/hooks/useFirebaseAuth.ts  # If exists
```

**Files to KEEP** (still needed for Firestore/Storage):
```
src/lib/firebase/config.ts  # Contains Firestore init
src/lib/firebase/admin.ts  # Contains Firestore Admin
src/lib/firebase/roles.ts
src/lib/firebase/storage.ts
```

**Remove unused imports**:
- Search codebase for `firebase/auth` imports
- Replace with Supabase equivalents
- Remove any Firebase auth functions not used

---

## 🎨 Design System Reference

### Colors (DO NOT CHANGE)
```css
--accent: #8B5CF6          /* Purple */
--secondary: #1F2937       /* Dark gray */
--danger: #EF4444          /* Red */
--success: #10B981         /* Green */
--warning: #F59E0B         /* Amber */
```

### Fonts (DO NOT CHANGE)
```css
Headings: 'Galindo', cursive
Body: 'Outfit', sans-serif
```

### Button Classes (DO NOT CHANGE)
```tsx
Primary: "bg-accent text-white hover:bg-purple-700 px-4 py-2 rounded-lg"
Outline: "border border-accent text-accent bg-white hover:bg-purple-50 px-4 py-2 rounded-lg"
```

**Why this matters**: User loves current design. Any visual changes will be rejected. Your job is to swap the auth engine while keeping the car body identical.

---

## 🚨 Common Pitfalls & How to Avoid Them

### Pitfall 1: Forgetting updateSession()
**Problem**: Middleware doesn't call `updateSession()`
**Result**: "Weird app behavior" - sessions expire randomly
**Solution**: ALWAYS call `await supabase.auth.updateSession()` at end of middleware

### Pitfall 2: Not Handling Email Verification
**Problem**: Let users log in before verifying email
**Result**: Security issue, fake accounts
**Solution**: Check `email_confirmed_at` in login page, reject if null

### Pitfall 3: Breaking the AuthContext Interface
**Problem**: Change return type of `useAuth()` hook
**Result**: 20+ files need updates, massive refactor
**Solution**: Keep same interface, only change implementation

### Pitfall 4: Deleting Firestore Config
**Problem**: Delete `src/lib/firebase/config.ts` thinking it's all auth
**Result**: Submissions, roles, projects stop working
**Solution**: Only delete files that are 100% auth-specific

### Pitfall 5: Forgetting cookies() Call
**Problem**: Create Supabase client without calling `cookies()` first
**Result**: Next.js caches middleware, auth breaks randomly
**Solution**: Always call `cookies()` before creating server client

### Pitfall 6: Not Testing Role Separation
**Problem**: Assume role checks work without testing
**Result**: Talent can access admin routes
**Solution**: Test with both talent and admin accounts

### Pitfall 7: Changing Button/Input Styling
**Problem**: "Improve" the login page design while you're there
**Result**: User asks you to revert it
**Solution**: Keep visual design 100% identical

### Pitfall 8: Using Wrong Supabase Client
**Problem**: Use browser client in middleware
**Result**: Cookies don't work, auth fails
**Solution**: Browser client for components, server client for middleware

---

## 📊 Progress Tracking

Use this checklist as you work:

### Week 1: Supabase Setup
- [ ] Created Supabase project
- [ ] Got project URL and keys from user
- [ ] Ran SQL migration (created public.users table)
- [ ] Set up RLS policies
- [ ] Customized email templates
- [ ] Tested basic signup in Supabase dashboard
- [ ] Verified emails send correctly

### Week 2: Core Files Created
- [ ] Created src/lib/supabase/config.ts
- [ ] Created src/lib/supabase/server.ts
- [ ] Created src/lib/supabase/admin.ts
- [ ] Updated src/middleware.ts
- [ ] Updated src/contexts/AuthContext.tsx
- [ ] npm install @supabase/supabase-js @supabase/ssr

### Week 3: Auth Pages Updated
- [ ] Updated src/app/login/page.tsx
- [ ] Updated src/app/signup/page.tsx
- [ ] Updated .env.local with Supabase vars
- [ ] Tested signup flow end-to-end
- [ ] Tested login flow end-to-end
- [ ] Verified email verification works

### Week 4: Testing
- [ ] Test 1: Talent signup flow ✓
- [ ] Test 2: Admin signup flow ✓
- [ ] Test 3: Login with redirect ✓
- [ ] Test 4: Email not verified ✓
- [ ] Test 5: Password reset ✓
- [ ] Test 6: Unauthorized access ✓
- [ ] Test 7: Session expiry ✓
- [ ] Test 8: Concurrent sessions ✓

### Week 5: Validation
- [ ] No Firebase auth imports remaining
- [ ] All pages load without errors
- [ ] Submissions still work (Firestore unchanged)
- [ ] Roles still work (Firestore unchanged)
- [ ] Projects still work (Firestore unchanged)
- [ ] Photo upload still works (Firebase Storage unchanged)
- [ ] Design looks identical to before

### Week 6: Cleanup & Documentation
- [ ] Removed unused Firebase auth files
- [ ] Updated package.json (if needed)
- [ ] Removed debug console.logs
- [ ] Updated README with Supabase setup
- [ ] Documented any known issues
- [ ] Created rollback plan

---

## 🆘 When You're Stuck

### "I don't understand the difference between browser and server clients"
**Answer**:
- Browser client: Used in React components (client-side)
- Server client: Used in middleware, API routes (server-side)
- Admin client: Used for operations that bypass RLS (admin tasks)

### "Middleware keeps failing with 'Cannot read cookies'"
**Answer**: You forgot to call `cookies()` before creating Supabase client. See AUTH_REBUILD_SPEC.md for correct pattern.

### "Sessions expire randomly"
**Answer**: You're not calling `updateSession()` in middleware. Add it at the end.

### "How do I know what to delete vs. keep?"
**Answer**:
- If file has "auth" in name → likely deletable
- If file has "firestore", "storage", "roles", "submissions" → KEEP
- When in doubt, ask the user

### "Email verification not working"
**Answer**: Check Supabase dashboard → Authentication → Email Templates. Make sure "Confirm signup" is enabled.

### "Role check always fails"
**Answer**: Verify public.users table has records. Check that signup page creates record in that table.

---

## 🎯 Definition of Success

You're done when:

1. ✅ User can sign up as talent or admin
2. ✅ Email verification required and working
3. ✅ User can log in with email/password
4. ✅ Admin can access /admin routes
5. ✅ Talent blocked from /admin routes
6. ✅ Password reset works
7. ✅ Sessions persist across page refreshes
8. ✅ Logout works correctly
9. ✅ Design looks identical to before
10. ✅ Submissions/roles/projects still work (Firestore unchanged)
11. ✅ No Firebase auth code remaining
12. ✅ No console errors

**Final Validation**: User can log in as admin, review submissions, and everything works exactly like before - they shouldn't notice ANY difference except auth is now Supabase.

---

## 📚 Reference Documents

1. **AUTH_REBUILD_SPEC.md** - Complete technical specification with all code
2. **Current codebase** - Study existing design patterns
3. **Supabase Docs** - https://supabase.com/docs/guides/auth/quickstarts/nextjs
4. **Next.js 14 App Router** - https://nextjs.org/docs/app

---

## 🤝 Working with the User

### What to Ask
- "Can you provide Supabase project URL and keys?"
- "Should I delete Firebase Auth env vars or keep them?"
- "Do you want password requirements changed?" (default: 8 chars)
- "Should I customize email templates?" (verification, password reset)

### What NOT to Ask
- "Should I redesign the login page?" → NO, keep design identical
- "Should I refactor the submissions page?" → NO, only touching auth
- "Should I add new features?" → NO, only auth replacement

### When to Pause
- If you're about to delete Firestore code
- If you're about to change visual design
- If you're about to modify business logic
- If tests are failing and you don't know why

---

## 🔧 Debugging Checklist

**If signup fails**:
- [ ] Check Supabase project URL is correct
- [ ] Check anon key is correct
- [ ] Check public.users table exists
- [ ] Check RLS policies allow insert
- [ ] Check browser console for errors
- [ ] Check Supabase dashboard → Authentication → Users

**If login fails**:
- [ ] Check email is verified (email_confirmed_at not null)
- [ ] Check password is correct
- [ ] Check user exists in auth.users AND public.users
- [ ] Check browser console for errors
- [ ] Check Network tab for API errors

**If middleware blocks everyone**:
- [ ] Check you're calling cookies() before creating client
- [ ] Check you're calling updateSession()
- [ ] Check role query is correct
- [ ] Check user ID matches between auth.users and public.users

**If sessions expire immediately**:
- [ ] Check updateSession() is called in middleware
- [ ] Check cookie settings (SameSite, secure)
- [ ] Check access token expiry (should be 1 hour)

---

**Good luck! You've got this. The spec has all the code you need - your job is to copy it carefully and test thoroughly. Keep the design identical, test every flow, and you'll have a successful migration.**

**Remember**: You're a surgeon replacing the heart, not an interior designer. The patient should wake up feeling exactly the same, just with a better heart. 🫀→💚
