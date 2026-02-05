/**
 * Migration: Add Admin UPDATE Policies
 *
 * PROBLEM: Admins can READ all data but cannot UPDATE it (RLS blocks updates)
 * SOLUTION: Add UPDATE policies for admin users
 *
 * Created: 2026-02-05
 */

-- ============================================================================
-- Add admin UPDATE policy for profiles table
-- ============================================================================

/**
 * POLICY: Admins can update all profiles
 *
 * This allows users with role='admin' to UPDATE any profile
 * Specifically needed for: status, admin_tag, admin_notes fields
 */
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- ============================================================================
-- Add admin UPDATE policy for submissions table
-- ============================================================================

/**
 * POLICY: Admins can update all submissions
 *
 * This allows users with role='admin' to UPDATE any submission
 * Specifically needed for: status, admin_notes, reviewed_at, booked_at
 */
CREATE POLICY "Admins can update all submissions"
  ON public.submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
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
-- ✓ Admin UPDATE policy for profiles table
-- ✓ Admin UPDATE policy for submissions table
--
-- How it works:
-- - USING clause: checks if user can see the row to update
-- - WITH CHECK clause: checks if user can make the update
-- - Both check that auth.uid() has role='admin' in users table
--
-- What this enables:
-- - Admins can update profile status (active/archived)
-- - Admins can update admin_tag (green/yellow/red)
-- - Admins can update admin_notes
-- - Admins can update submission status
-- - Admins can update submission admin_notes
--
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Test updating admin_tag on a profile
-- 3. Test updating admin_notes
-- 4. Verify changes are saved and persist after refresh
