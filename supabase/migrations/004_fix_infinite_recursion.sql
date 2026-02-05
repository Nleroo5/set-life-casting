/**
 * Migration: Fix Infinite Recursion in RLS Policy
 *
 * PROBLEM: "Admins can read all users" policy causes infinite recursion
 * CAUSE: Policy queries users table to check admin status, creating loop
 * SOLUTION: Drop the problematic policy
 *
 * IMPACT: Admin users can still read their own data via "Users can read own data" policy
 * For admin-specific features, use service role client (bypasses RLS)
 *
 * Created: 2026-02-04
 */

-- ============================================================================
-- Drop Problematic Policy
-- ============================================================================

/**
 * This policy causes infinite recursion:
 * - User tries to read users table
 * - Policy checks if user is admin by querying users table
 * - That query triggers the same policy
 * - Infinite loop!
 */
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;

-- ============================================================================
-- Verify Remaining Policies
-- ============================================================================

/**
 * After this migration, you should have 3 policies:
 * 1. "Users can read own data" (SELECT)
 * 2. "Users can update own data" (UPDATE)
 * 3. "Users can insert own user record" (INSERT)
 *
 * Run this query to verify:
 */
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' ORDER BY cmd;

-- ============================================================================
-- How Admin Features Work Now
-- ============================================================================

/**
 * CLIENT-SIDE (Browser):
 * - Uses anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * - Subject to RLS policies
 * - Users can only read/update their own data
 *
 * SERVER-SIDE (Admin features):
 * - Uses service role key (SUPABASE_SERVICE_ROLE_KEY)
 * - Bypasses ALL RLS policies
 * - Can read/write any data
 *
 * Example in your code:
 * - src/lib/supabase/admin.ts uses service role
 * - Admin pages use admin client to read all users
 * - No RLS policy needed for admin access
 */

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

/**
 * What changed:
 * ✓ Removed infinite recursion policy
 * ✓ Users can still read/update their own data
 * ✓ Admins use service role client for elevated access
 *
 * Next steps:
 * 1. Refresh your browser
 * 2. Test signup flow
 * 3. Test login flow
 * 4. Verify admin features work (they use service role)
 */
