/**
 * Comprehensive Diagnostic Script for Admin Photo Access Issue
 *
 * Run this in Supabase SQL Editor to diagnose the problem
 */

-- ============================================================================
-- STEP 1: Check admin user exists and has correct role
-- ============================================================================

SELECT
  'ADMIN USER CHECK' as check_type,
  id,
  email,
  role,
  created_at
FROM public.users
WHERE email = 'chazlynyu@gmail.com';

-- Expected: 1 row with role = 'admin'
-- If role is NULL or 'user', the RLS policies won't work!

-- ============================================================================
-- STEP 2: Check if photos table has data
-- ============================================================================

SELECT
  'PHOTOS TABLE CHECK' as check_type,
  COUNT(*) as total_photos,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT profile_id) as unique_profiles
FROM public.photos;

-- Expected: Some photos exist with user_id values

-- ============================================================================
-- STEP 3: Check sample of photos data
-- ============================================================================

SELECT
  'SAMPLE PHOTOS' as check_type,
  p.id,
  p.user_id,
  p.profile_id,
  p.type,
  LEFT(p.url, 50) as url_preview,
  u.email as user_email
FROM public.photos p
LEFT JOIN public.users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 5;

-- Expected: Photos with valid user_id that match users table

-- ============================================================================
-- STEP 4: Check if RLS policies exist
-- ============================================================================

SELECT
  'RLS POLICIES CHECK' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('photos', 'profiles', 'submissions')
ORDER BY tablename, policyname;

-- Expected: Should see "Admins can read all photos/profiles/submissions" policies

-- ============================================================================
-- STEP 5: Test if admin can actually query photos (simulate the query)
-- ============================================================================

-- First, get the admin user's ID
DO $$
DECLARE
  admin_id uuid;
  photo_count int;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_id
  FROM public.users
  WHERE email = 'chazlynyu@gmail.com';

  IF admin_id IS NULL THEN
    RAISE NOTICE 'ERROR: Admin user not found!';
    RETURN;
  END IF;

  RAISE NOTICE 'Admin user ID: %', admin_id;

  -- Check if admin has correct role
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = admin_id AND role = 'admin'
  ) THEN
    RAISE NOTICE 'ERROR: User does not have admin role!';
    RETURN;
  END IF;

  RAISE NOTICE 'Admin role confirmed';

  -- Count photos visible to admin (simulating RLS check)
  SELECT COUNT(*) INTO photo_count
  FROM public.photos p
  WHERE
    -- Regular user policy: own photos
    p.user_id = admin_id
    OR
    -- Admin policy: all photos if admin
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = admin_id AND u.role = 'admin'
    );

  RAISE NOTICE 'Photos visible to admin: %', photo_count;

  IF photo_count = 0 THEN
    RAISE NOTICE 'ERROR: No photos visible to admin! Check RLS policies.';
  ELSE
    RAISE NOTICE 'SUCCESS: Admin can see % photos', photo_count;
  END IF;
END $$;

-- ============================================================================
-- STEP 6: Check profiles table access
-- ============================================================================

SELECT
  'PROFILES CHECK' as check_type,
  COUNT(*) as total_profiles,
  COUNT(DISTINCT user_id) as unique_users
FROM public.profiles;

-- Expected: Some profiles exist

-- ============================================================================
-- STEP 7: Check for profiles with photos
-- ============================================================================

SELECT
  'PROFILES WITH PHOTOS' as check_type,
  pr.user_id,
  u.email,
  pr.first_name,
  pr.last_name,
  COUNT(ph.id) as photo_count
FROM public.profiles pr
LEFT JOIN public.users u ON pr.user_id = u.id
LEFT JOIN public.photos ph ON ph.user_id = pr.user_id
GROUP BY pr.user_id, u.email, pr.first_name, pr.last_name
ORDER BY photo_count DESC
LIMIT 10;

-- Expected: See profiles with photo_count > 0

-- ============================================================================
-- STEP 8: Check auth.uid() function (what user is currently logged in)
-- ============================================================================

SELECT
  'CURRENT USER' as check_type,
  auth.uid() as current_user_id,
  u.email,
  u.role
FROM public.users u
WHERE u.id = auth.uid();

-- Expected: Should show admin user when run from authenticated session
-- Note: This will be NULL when run in SQL Editor (not authenticated)

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT
  'SUMMARY' as check_type,
  (SELECT COUNT(*) FROM public.users WHERE role = 'admin') as admin_count,
  (SELECT COUNT(*) FROM public.photos) as total_photos,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'photos' AND policyname LIKE '%Admin%') as admin_photo_policies,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles' AND policyname LIKE '%Admin%') as admin_profile_policies;

-- Expected:
-- - admin_count: 1
-- - total_photos: > 0
-- - total_profiles: > 0
-- - admin_photo_policies: 1
-- - admin_profile_policies: 1
