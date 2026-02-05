/**
 * CONSOLIDATED MIGRATION: Complete Firebase to Supabase Migration
 *
 * This migration includes:
 * - Migration 009: Admin fields (status, admin_tag, admin_notes)
 * - Migration 012: Missing profile fields
 * - Migration 014: Admin UPDATE policies
 *
 * Run this ONCE in Supabase SQL Editor to prepare database for full migration
 *
 * Created: 2026-02-05
 */

-- ============================================================================
-- PART 1: Add Admin Fields to Profiles (Migration 009)
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('active', 'archived')) DEFAULT 'active';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_tag text CHECK (admin_tag IN ('green', 'yellow', 'red'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_notes text;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_admin_tag ON public.profiles(admin_tag) WHERE admin_tag IS NOT NULL;

COMMENT ON COLUMN public.profiles.status IS 'Admin-only: Profile status - active or archived';
COMMENT ON COLUMN public.profiles.admin_tag IS 'Admin-only: Color coding for talent (green/yellow/red)';
COMMENT ON COLUMN public.profiles.admin_notes IS 'Admin-only: Internal notes about talent';

-- ============================================================================
-- PART 2: Add Missing Profile Fields (Migration 012)
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hair_length text CHECK (hair_length IN ('Short', 'Medium', 'Long', 'Bald'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS shirt_size text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pant_waist int;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pant_inseam int;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS visible_tattoos boolean DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tattoos_description text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS facial_hair text;

-- ============================================================================
-- PART 3: Add Admin UPDATE Policies (Migration 014)
-- ============================================================================

-- Allow admins to UPDATE profiles
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

-- Allow admins to UPDATE submissions
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
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these after migration to verify:

-- 1. Check all new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('status', 'admin_tag', 'admin_notes', 'hair_length', 'shirt_size', 'pant_waist', 'pant_inseam', 'visible_tattoos', 'tattoos_description', 'facial_hair')
ORDER BY column_name;

-- 2. Check all policies exist
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND (policyname LIKE '%Admin%' OR policyname LIKE '%admin%')
ORDER BY tablename, policyname;

-- Expected result: Should see 5 admin policies
-- - Admins can read all profiles
-- - Admins can read all photos
-- - Admins can read all submissions
-- - Admins can update all profiles
-- - Admins can update all submissions

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Next steps:
-- 1. Verify columns and policies using queries above
-- 2. Test admin tag updates on talent profiles
-- 3. Proceed with code migration
