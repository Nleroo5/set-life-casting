/**
 * Verification: Check RLS Policies After Fix
 *
 * PURPOSE: Verify infinite recursion is fixed
 * RUN THIS: After running 004_fix_infinite_recursion.sql
 *
 * Created: 2026-02-04
 */

-- ============================================================================
-- Check Current Policies
-- ============================================================================

/**
 * Expected Result: 3 policies (no "Admins can read all users")
 * 1. Users can read own data (SELECT)
 * 2. Users can update own data (UPDATE)
 * 3. Users can insert own user record (INSERT)
 */
SELECT
  policyname as "Policy Name",
  cmd as "Command",
  CASE
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as "USING",
  CASE
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as "WITH CHECK"
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- ============================================================================
-- Expected Output
-- ============================================================================

/**
 * You should see:
 *
 * | Policy Name                      | Command | USING              | WITH CHECK         |
 * |----------------------------------|---------|--------------------|---------------------|
 * | Users can insert own user record | INSERT  | No USING clause    | Has WITH CHECK clause |
 * | Users can read own data          | SELECT  | Has USING clause   | No WITH CHECK clause |
 * | Users can update own data        | UPDATE  | Has USING clause   | Has WITH CHECK clause |
 *
 * ✓ Total: 3 policies
 * ✗ "Admins can read all users" should NOT appear
 */

-- ============================================================================
-- Test Query (Should NOT Cause Infinite Recursion)
-- ============================================================================

/**
 * This query would previously cause infinite recursion.
 * Now it should work fine (returns your own user data).
 *
 * Run this as an authenticated user to verify the fix:
 */
-- SELECT id, email, role, full_name FROM public.users WHERE id = auth.uid();

/**
 * Expected: Returns your user data (1 row)
 * No errors, no infinite recursion
 */

-- ============================================================================
-- Verification Complete
-- ============================================================================

/**
 * If you see 3 policies and no "Admins can read all users" policy,
 * the fix is successful! ✓
 *
 * Next steps:
 * 1. Refresh your browser
 * 2. Open browser console (F12)
 * 3. Navigate to /signup or /dashboard
 * 4. Verify no "infinite recursion" errors appear
 * 5. Test signup flow end-to-end
 */
