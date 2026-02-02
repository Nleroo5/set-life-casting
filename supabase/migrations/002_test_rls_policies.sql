/**
 * RLS Policy Testing Script
 *
 * PURPOSE: Verify Row Level Security policies work correctly
 * RUN THIS: In Supabase SQL Editor to test the policies
 *
 * IMPORTANT: These are TEST queries - they will NOT affect your data
 * They just verify the security policies are working
 *
 * Created: 2026-02-02
 */

-- ============================================================================
-- TEST 1: Verify RLS is enabled
-- ============================================================================

/**
 * Expected Result: relrowsecurity = true
 * This confirms Row Level Security is turned on
 */
SELECT
  tablename,
  relrowsecurity as "RLS Enabled"
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE
  nspname = 'public'
  AND relname = 'users';

-- Should show: RLS Enabled = true ✓

-- ============================================================================
-- TEST 2: List all RLS policies
-- ============================================================================

/**
 * Expected Result: 3 policies
 * 1. Users can read own data (SELECT)
 * 2. Users can update own data (UPDATE)
 * 3. Admins can read all users (SELECT)
 */
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as "Command",
  CASE
    WHEN roles = '{public}' THEN 'Public'
    ELSE array_to_string(roles, ', ')
  END as "Roles"
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Should show 3 policies ✓

-- ============================================================================
-- TEST 3: Check indexes exist
-- ============================================================================

/**
 * Expected Result: 2 indexes
 * 1. idx_users_role (on role column)
 * 2. idx_users_email (on email column)
 */
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'users'
  AND schemaname = 'public'
ORDER BY indexname;

-- Should show idx_users_role and idx_users_email ✓

-- ============================================================================
-- TEST 4: Check trigger exists
-- ============================================================================

/**
 * Expected Result: update_users_updated_at trigger
 * This auto-updates the updated_at column on changes
 */
SELECT
  trigger_name,
  event_manipulation as "Event",
  action_statement as "Function"
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_schema = 'public';

-- Should show update_users_updated_at trigger ✓

-- ============================================================================
-- TEST 5: Verify table structure
-- ============================================================================

/**
 * Expected Result: All required columns
 * id, email, role, full_name, created_at, updated_at
 */
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Should show all 6 columns ✓

-- ============================================================================
-- TEST 6: Check role constraint
-- ============================================================================

/**
 * Expected Result: CHECK constraint on role column
 * Ensures role can only be 'admin' or 'talent'
 */
SELECT
  conname as "Constraint Name",
  pg_get_constraintdef(oid) as "Constraint Definition"
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND contype = 'c';

-- Should show: role IN ('admin', 'talent') ✓

-- ============================================================================
-- VERIFICATION SUMMARY
-- ============================================================================

/**
 * If all tests above show expected results, your database is ready! ✓
 *
 * What we verified:
 * ✓ RLS is enabled on users table
 * ✓ 3 security policies exist
 * ✓ 2 indexes exist (role, email)
 * ✓ Auto-update trigger exists
 * ✓ All columns present
 * ✓ Role constraint enforces admin/talent only
 *
 * Next steps:
 * 1. Configure email templates in Supabase dashboard
 * 2. Create a test user to verify auth flow works
 * 3. Begin Phase 2 (create Supabase client files)
 */

-- ============================================================================
-- OPTIONAL: Manual test user creation
-- ============================================================================

/**
 * NOTE: You typically DON'T need to run this manually
 * Users will be created via signup flow
 *
 * But if you want to test manually:
 * 1. Create auth user in Supabase Auth dashboard
 * 2. Copy the user ID
 * 3. Insert into public.users table
 *
 * Example (DO NOT RUN - just for reference):
 *
 * INSERT INTO public.users (id, email, role, full_name)
 * VALUES (
 *   'user-id-from-auth-dashboard',
 *   'test@example.com',
 *   'talent',
 *   'Test User'
 * );
 */
