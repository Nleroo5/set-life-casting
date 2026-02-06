/**
 * Migration 018: Add Remaining Missing Profile Fields
 *
 * PURPOSE: Add final missing columns needed for complete profile data
 * FIXES: Women's pant size, bust measurement, jacket size not saving
 *
 * Created: 2026-02-05
 */

-- ============================================================================
-- ADD MISSING SIZE FIELDS
-- ============================================================================

-- Women's pant size (required for female profiles)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS womens_pant_size text;

-- Bust measurement (optional, in inches)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bust int;

-- Jacket size (optional)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS jacket_size text;

-- ============================================================================
-- ADD COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.profiles.womens_pant_size IS 'Women''s pant size (e.g., 0, 2, 4, 6, 8, 10, 12, 14)';
COMMENT ON COLUMN public.profiles.bust IS 'Bust measurement in inches (for women)';
COMMENT ON COLUMN public.profiles.jacket_size IS 'Jacket/Blazer size (e.g., 36R, 38L, 40S)';

-- ============================================================================
-- TYPE CORRECTIONS FOR EXISTING COLUMNS
-- ============================================================================

-- Note: The following columns exist as TEXT but form sends as NUMBER
-- waist, hips, neck, sleeve
-- These need to handle both number and text inputs in the mapping layer
-- No schema change needed - handled in profiles.ts

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('womens_pant_size', 'bust', 'jacket_size')
ORDER BY column_name;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

/**
 * Added columns:
 * ✓ womens_pant_size (text) - Required for female profiles
 * ✓ bust (int) - Optional measurement
 * ✓ jacket_size (text) - Optional size
 *
 * Next steps:
 * 1. Run this migration in Supabase
 * 2. Update ProfileRow interface in profiles.ts
 * 3. Update mapProfileDataToRow() to include these fields
 * 4. Update mapRowToProfileData() to include these fields
 */
