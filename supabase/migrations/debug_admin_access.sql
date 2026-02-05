-- ============================================================================
-- DEBUG: Admin Access Issues
-- Run this to diagnose why you're getting 403 errors
-- ============================================================================

-- 1. Check your current user and role
SELECT
  '=== YOUR CURRENT USER ===' as section,
  auth.uid() as your_user_id,
  u.email,
  u.role,
  CASE
    WHEN u.role = 'admin' THEN '✅ You ARE an admin'
    WHEN u.role IS NULL THEN '❌ You have NO role set'
    ELSE '❌ You are NOT an admin (role: ' || u.role || ')'
  END as admin_status
FROM public.users u
WHERE u.id = auth.uid();

-- 2. Check if policies exist for projects table
SELECT
  '=== PROJECTS TABLE POLICIES ===' as section;

SELECT
  policyname,
  cmd as operation,
  '✅ EXISTS' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'projects'
ORDER BY cmd, policyname;

-- 3. Check if policies exist for roles table
SELECT
  '=== ROLES TABLE POLICIES ===' as section;

SELECT
  policyname,
  cmd as operation,
  '✅ EXISTS' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'roles'
ORDER BY cmd, policyname;

-- 4. Test if you can see projects (should work if you're admin)
SELECT
  '=== PROJECTS YOU CAN SEE ===' as section;

SELECT
  COUNT(*) as total_projects,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ You can see projects'
    ELSE '❌ You CANNOT see any projects (403 error expected)'
  END as access_status
FROM public.projects;

-- 5. Check all users with admin role
SELECT
  '=== ALL ADMIN USERS ===' as section;

SELECT
  id,
  email,
  role,
  created_at
FROM public.users
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
--
-- Section 1: Should show YOUR email with role='admin'
-- Section 2: Should show 5 policies for projects (SELECT, INSERT, UPDATE, DELETE for admins + SELECT for public)
-- Section 3: Should show 5 policies for roles (SELECT, INSERT, UPDATE, DELETE for admins + SELECT for public)
-- Section 4: Should show total_projects > 0 if you're admin
-- Section 5: Should show your email in the list of admins
--
-- ============================================================================
-- TROUBLESHOOTING:
-- ============================================================================
--
-- If Section 1 shows "You have NO role set" or "You are NOT an admin":
--   → Run this to fix it:
--      UPDATE public.users SET role = 'admin' WHERE email = 'YOUR_EMAIL@example.com';
--
-- If Section 2 or 3 show no policies:
--   → The migration didn't run correctly. Re-run migration 016.
--
-- If Section 4 shows "You CANNOT see any projects":
--   → Either you're not admin, or the policies aren't working.
--   → Check Section 1 first.
--
-- ============================================================================
