/**
 * SAFE VERSION: Consolidated Firebase to Supabase Migration
 *
 * This version checks for existing policies before creating them
 * Safe to run multiple times - won't error if policies already exist
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
-- PART 3: Add Admin UPDATE Policies (Migration 014) - WITH SAFE CHECKS
-- ============================================================================

-- Drop existing policies if they exist (safe to re-run)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all submissions" ON public.submissions;

-- Create policies (now safe since we dropped them first)
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

-- This will run automatically and show you the results

SELECT '=== COLUMNS VERIFICATION ===' as section;

SELECT
  column_name,
  data_type,
  '✅ EXISTS' as status
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'status', 'admin_tag', 'admin_notes',
    'hair_length', 'shirt_size', 'pant_waist', 'pant_inseam',
    'visible_tattoos', 'tattoos_description', 'facial_hair'
  )
ORDER BY column_name;

SELECT '=== POLICIES VERIFICATION ===' as section;

SELECT
  tablename,
  policyname,
  '✅ EXISTS' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND (policyname LIKE '%Admin%' OR policyname LIKE '%admin%')
ORDER BY tablename, policyname;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
