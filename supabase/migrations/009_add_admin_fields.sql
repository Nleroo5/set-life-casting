/**
 * Migration: Add Admin-Only Fields to Profiles Table
 *
 * PURPOSE: Add status, admin_tag, and admin_notes columns for admin management
 * REQUIRED BY: Admin talent management features
 *
 * Created: 2026-02-05
 * Part of: Phase 3 Security & Performance Audit Fixes
 */

-- ============================================================================
-- STEP 1: Add admin-only fields to profiles table
-- ============================================================================

-- Add status column (active or archived)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('active', 'archived')) DEFAULT 'active';

-- Add admin_tag column (color coding: green, yellow, red)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_tag text CHECK (admin_tag IN ('green', 'yellow', 'red'));

-- Add admin_notes column (internal notes about talent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_notes text;

-- ============================================================================
-- STEP 2: Create indexes for performance
-- ============================================================================

-- Index for filtering by status (used in admin talent list)
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Index for filtering by admin_tag (partial index - only when tag exists)
CREATE INDEX IF NOT EXISTS idx_profiles_admin_tag ON public.profiles(admin_tag)
  WHERE admin_tag IS NOT NULL;

-- ============================================================================
-- STEP 3: Add column comments for documentation
-- ============================================================================

COMMENT ON COLUMN public.profiles.status IS 'Admin-only: Profile status - active or archived';
COMMENT ON COLUMN public.profiles.admin_tag IS 'Admin-only: Color coding for talent (green/yellow/red)';
COMMENT ON COLUMN public.profiles.admin_notes IS 'Admin-only: Internal notes about talent';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

/**
 * What was added:
 * ✓ status column (active/archived) with default 'active'
 * ✓ admin_tag column (green/yellow/red) - nullable
 * ✓ admin_notes column (text) - nullable
 * ✓ Indexes for filtering and performance
 * ✓ Column comments for documentation
 *
 * Security notes:
 * - These fields are admin-only (enforced by application)
 * - Users cannot see or modify these fields
 * - Admin pages use service role to bypass RLS
 * - Regular user operations use standard client with RLS
 *
 * Next steps:
 * 1. Run this migration in Supabase SQL Editor
 * 2. Verify columns exist: SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('status', 'admin_tag', 'admin_notes');
 * 3. Update admin pages to use these fields with supabaseAdmin
 */
