# Fix Infinite Recursion Error - Action Required

## 🚨 Current Issue

Your browser console shows:
```
{code: '42P17', message: 'infinite recursion detected in policy for relation "users"'}
```

This happens because the "Admins can read all users" RLS policy creates an infinite loop.

---

## ✅ Solution (3 Steps)

### Step 1: Run the Fix in Supabase

1. Open **Supabase Dashboard**: https://supabase.com/dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New query**
4. Copy and paste this SQL:

```sql
-- Run the fix migration
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
```

5. Click **Run** (green button)
6. You should see: **"Success. No rows returned"**

### Step 2: Verify the Fix

1. In SQL Editor, click **New query** again
2. Copy and paste this verification query:

```sql
-- Check remaining policies
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd;
```

3. Click **Run**
4. You should see **3 policies** (not 4):
   - `Users can insert own user record` (INSERT)
   - `Users can read own data` (SELECT)
   - `Users can update own data` (UPDATE)

5. **"Admins can read all users" should NOT appear** ✓

### Step 3: Test in Browser

1. **Refresh your browser** (Cmd+R or Ctrl+R)
2. Open **Developer Console** (F12 or Cmd+Option+I)
3. Go to your app (http://localhost:3002)
4. Navigate to `/dashboard` or `/signup`
5. **Check console** - the infinite recursion error should be GONE ✓

---

## 🔍 Why This Fixes It

### The Problem
The old policy tried to check if a user was admin by querying the users table:

```sql
CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users  -- ❌ Queries users table
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

This creates infinite recursion:
1. User tries to read `users` table
2. Policy checks if user is admin by reading `users` table
3. That triggers the same policy again
4. Infinite loop! 🔁

### The Solution
Remove the policy entirely. Admin features now work differently:

- **Regular users**: Use the anon key → Subject to RLS policies → Can only read their own data ✓
- **Admin features**: Use the service role key → Bypass ALL RLS policies → Can read any data ✓

Your `src/lib/supabase/admin.ts` file already uses the service role key correctly, so admin features will work without the problematic policy.

---

## 📊 What to Test After Fix

### Test 1: Signup Flow
1. Go to http://localhost:3002/signup
2. Fill out form and submit
3. Check email for verification link
4. Click verification link
5. Should redirect to /dashboard ✓
6. **No errors in console** ✓

### Test 2: Login Flow
1. Go to http://localhost:3002/login
2. Enter credentials
3. Should redirect to /dashboard ✓
4. **No errors in console** ✓

### Test 3: Protected Routes
1. Open /admin page (if you're admin)
2. Should load without 500 errors ✓
3. User data should load correctly ✓
4. **No infinite recursion errors** ✓

---

## 📁 Files Created

I created these files to help you fix and verify:

1. **`supabase/migrations/004_fix_infinite_recursion.sql`**
   - Drops the problematic policy
   - Explains why admin features still work

2. **`supabase/migrations/005_verify_rls_fixed.sql`**
   - Verification queries to confirm fix
   - Expected output examples

3. **This file** (`FIX_INFINITE_RECURSION.md`)
   - Step-by-step guide
   - Testing checklist

---

## ❓ Need Help?

If you still see errors after running the fix:

1. **Clear browser cache**: Cmd+Shift+Delete (Chrome) or Cmd+Shift+R (hard refresh)
2. **Restart dev server**: Kill `npm run dev` and restart
3. **Check environment variables**: Verify `.env.local` has correct Supabase URL and keys
4. **Show me the console errors**: Send screenshot if different error appears

---

## ✅ Success Criteria

You'll know it's fixed when:

- [x] SQL shows only 3 policies (not 4)
- [x] Browser console has no "infinite recursion" errors
- [x] Signup flow works without 500 errors
- [x] Login flow works without 500 errors
- [x] User data loads on /dashboard
- [x] AuthContext successfully fetches user role

---

**Next Step**: Run the SQL in Step 1 above, then test in your browser!
