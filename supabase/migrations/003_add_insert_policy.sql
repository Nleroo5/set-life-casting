/**
 * Migration: Add INSERT policy for user creation during signup
 *
 * PROBLEM: Users can't create their own record during signup
 * CAUSE: RLS enabled but no INSERT policy exists
 * SOLUTION: Allow users to insert their own user record
 *
 * Created: 2026-02-04
 */

-- ============================================================================
-- Add INSERT Policy for User Self-Registration
-- ============================================================================

/**
 * POLICY: Users can create their own user record during signup
 *
 * Allows: INSERT where auth.uid() = id being inserted
 * Use case: User creating their profile during signup
 * Security: User can only create a record with their own auth.uid()
 */
CREATE POLICY "Users can insert own user record"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

/**
 * To test this policy:
 * 1. Sign up a new user via the signup page
 * 2. The user record should be created successfully
 * 3. Verify the user exists in public.users table
 */

-- List all policies (should now show 4 policies including INSERT)
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' ORDER BY cmd;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
