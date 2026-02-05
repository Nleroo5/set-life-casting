# Debug Checklist - Admin Photo Access Issue

Follow these steps IN ORDER to diagnose the problem.

## Step 1: Verify Migrations Were Run ✅

Go to Supabase Dashboard → SQL Editor and run this query:

```sql
SELECT policyname, tablename
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname LIKE '%Admin%'
ORDER BY tablename;
```

**Expected result:** You should see:
- `Admins can read all photos` (on table: photos)
- `Admins can read all profiles` (on table: profiles)
- `Admins can read all submissions` (on table: submissions)

**If these are missing:** The migration wasn't run. Go back and run migration 013.

---

## Step 2: Verify Admin User Has Correct Role ✅

In Supabase SQL Editor:

```sql
SELECT id, email, role, created_at
FROM public.users
WHERE email = 'chazlynyu@gmail.com';
```

**Expected result:**
- `role` column should be **'admin'** (not NULL, not 'user')

**If role is wrong:** Run this to fix it:
```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'chazlynyu@gmail.com';
```

---

## Step 3: Verify Photos Exist in Database ✅

In Supabase SQL Editor:

```sql
SELECT COUNT(*) as total_photos,
       COUNT(DISTINCT user_id) as unique_users
FROM public.photos;
```

**Expected result:**
- `total_photos` > 0
- `unique_users` > 0

**If zero:** Photos aren't being saved. Check the profile creation flow.

---

## Step 4: Check Sample Photos Data ✅

In Supabase SQL Editor:

```sql
SELECT p.user_id, p.type, p.url, u.email
FROM public.photos p
LEFT JOIN public.users u ON p.user_id = u.id
LIMIT 5;
```

**Expected result:**
- Should see photos with valid `user_id` values
- Should see matching `email` from users table

**If user_id is NULL:** Photos are being saved without user_id (bug in upload function)

---

## Step 5: Run Full Diagnostic Script ✅

Copy the entire contents of `scripts/debug-admin-access.sql` and run it in Supabase SQL Editor.

**Look for these messages in the "Messages" tab:**
- ✅ "Admin role confirmed"
- ✅ "SUCCESS: Admin can see X photos"

**If you see errors:**
- "Admin user not found!" → User doesn't exist
- "User does not have admin role!" → Role is wrong
- "No photos visible to admin!" → RLS policies not working

---

## Step 6: Check Browser Console ✅

1. Open the app: http://localhost:3002/admin/talent
2. Open DevTools (F12)
3. Go to Console tab
4. Look for `[TALENT PAGE DEBUG]` messages

**You should see:**
```
[TALENT PAGE DEBUG] Current user: { userId: '...', email: 'chazlynyu@gmail.com' }
[TALENT PAGE DEBUG] User data from database: { role: 'admin' }
[TALENT PAGE DEBUG] Fetching photos for X users
[TALENT PAGE DEBUG] Photos query result: { photosCount: X, photosError: null }
[TALENT PAGE DEBUG] Grouped photos by user: { totalUsers: X }
```

**Common issues:**
- If `photosCount: 0` → RLS is blocking the query
- If `photosError: {...}` → Check the error message
- If `role: 'user'` or `role: null` → User isn't admin

---

## Step 7: Test RLS Policy Directly ✅

In Supabase SQL Editor, run AS the admin user:

```sql
-- First, confirm you're testing as the right user
SELECT auth.uid() as my_id,
       u.email,
       u.role
FROM public.users u
WHERE u.id = auth.uid();

-- Then test the photos query
SELECT COUNT(*)
FROM public.photos;
```

**IMPORTANT:** This only works if you're authenticated in the SQL Editor. Otherwise, `auth.uid()` returns NULL and RLS blocks everything.

**To authenticate in SQL Editor:**
1. Copy your session token from browser
2. In SQL Editor, click "Run as..." → Paste token

---

## Step 8: Check Network Tab ✅

1. Open DevTools → Network tab
2. Refresh /admin/talent page
3. Look for requests to `/rest/v1/photos`

**Click on the request and check:**
- Status: Should be 200
- Response: Should have array of photos
- If empty array `[]` → RLS is blocking it
- If 401/403 → Authentication issue

**Check request headers:**
- Should have `Authorization: Bearer ...` token
- Token should be for chazlynyu@gmail.com

---

## Step 9: Clear Cache and Re-login ✅

Sometimes auth tokens get stale:

1. Open DevTools → Application tab
2. Clear all cookies for localhost:3002
3. Clear Local Storage
4. Sign out completely
5. Sign in again as chazlynyu@gmail.com
6. Try accessing /admin/talent again

---

## Step 10: Check for JavaScript Errors ✅

Look in Console for ANY errors (red text), especially:
- `Cannot read property ... of undefined`
- `Network request failed`
- `Unauthorized`
- `RLS policy violation`

---

## Summary

After running all these checks, you should know:

1. ✅ Migrations exist in database
2. ✅ Admin user has role='admin'
3. ✅ Photos exist with valid user_id
4. ✅ RLS policies allow admin access
5. ✅ Browser is authenticated as admin
6. ✅ Photos query returns data

**Most likely issues:**

1. **Admin role not set:** Run `UPDATE users SET role='admin' WHERE email='chazlynyu@gmail.com'`
2. **Migration not run:** Run migration 013 in Supabase SQL Editor
3. **Stale auth token:** Clear cache and re-login
4. **Photos have NULL user_id:** Fix photo upload to include user_id

---

## Report Back

After running these checks, report back with:

1. Results from Step 2 (admin role check)
2. Results from Step 3 (photos count)
3. Results from Step 6 (browser console logs)
4. Screenshots of any errors

This will help identify the exact problem.
