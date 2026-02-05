/**
 * Migration: Add Admin Access to Photos and Profiles
 *
 * PROBLEM: Admins can only see their own photos/profiles due to RLS policies
 * ROOT CAUSE: Admin pages use regular client (subject to RLS), not service role
 * SOLUTION: Add policies allowing admins to read all photos and profiles
 *
 * Created: 2026-02-05
 */

-- ============================================================================
-- Add admin read policy for profiles table
-- ============================================================================

/**
 * POLICY: Admins can read all profiles
 *
 * This allows users with role='admin' in the users table to SELECT any profile
 * Multiple policies on same table are OR'd together, so this extends access
 * without modifying the existing "Users can read own profile" policy
 */
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- ============================================================================
-- Add admin read policy for photos table
-- ============================================================================

/**
 * POLICY: Admins can read all photos
 *
 * This allows users with role='admin' in the users table to SELECT any photo
 * Multiple policies on same table are OR'd together, so this extends access
 * without modifying the existing "Users can read own photos" policy
 */
CREATE POLICY "Admins can read all photos"
  ON public.photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- ============================================================================
-- Add admin read policy for submissions table
-- ============================================================================

/**
 * POLICY: Admins can read all submissions
 *
 * This allows users with role='admin' in the users table to SELECT any submission
 * Multiple policies on same table are OR'd together, so this extends access
 * without modifying the existing "Users can read own submissions" policy
 */
CREATE POLICY "Admins can read all submissions"
  ON public.submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- What was added:
-- ✓ Admin read policy for profiles table
-- ✓ Admin read policy for photos table
-- ✓ Admin read policy for submissions table
--
-- How it works:
-- - Multiple SELECT policies are OR'd together
-- - Users can read own data (existing policies)
-- - OR admins can read all data (new policies)
--
-- Why this is needed:
-- - Admin pages use regular Supabase client (subject to RLS)
-- - Without these policies, admins can only see their own data
-- - These policies allow admins to view all talent, photos, and submissions
--
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify admin can see all profiles in /admin/talent
-- 3. Verify admin can see all photos in talent database
-- 4. Verify admin can see all submissions in /admin/submissions
