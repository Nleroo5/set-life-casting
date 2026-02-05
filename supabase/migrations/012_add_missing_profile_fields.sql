/**
 * Migration: Add Missing Profile Fields
 *
 * PURPOSE: Add 7 missing columns to profiles table
 * FIXES: Profile fields not saving (hair_length, shirt_size, pant measurements, tattoos, facial_hair)
 *
 * Created: 2026-02-05
 * Part of: Profile Data Persistence Fix
 */

-- ============================================================================
-- ADD MISSING COLUMNS TO PROFILES TABLE
-- ============================================================================

-- Appearance: Hair Length
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hair_length text CHECK (hair_length IN ('Short', 'Medium', 'Long', 'Bald'));

-- Sizes: Shirt Size
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS shirt_size text;

-- Sizes: Pant Waist (in inches)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pant_waist int;

-- Sizes: Pant Inseam (in inches)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pant_inseam int;

-- Details: Visible Tattoos
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS visible_tattoos boolean DEFAULT false;

-- Details: Tattoo Description
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tattoos_description text;

-- Details: Facial Hair
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS facial_hair text;

-- ============================================================================
-- ADD COLUMN COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.profiles.hair_length IS 'Hair length: Short, Medium, Long, or Bald';
COMMENT ON COLUMN public.profiles.shirt_size IS 'Shirt size (e.g., S, M, L, XL, XXL, or numeric)';
COMMENT ON COLUMN public.profiles.pant_waist IS 'Pant waist measurement in inches';
COMMENT ON COLUMN public.profiles.pant_inseam IS 'Pant inseam measurement in inches';
COMMENT ON COLUMN public.profiles.visible_tattoos IS 'Whether talent has visible tattoos';
COMMENT ON COLUMN public.profiles.tattoos_description IS 'Description of tattoos if visible';
COMMENT ON COLUMN public.profiles.facial_hair IS 'Facial hair type (e.g., Clean Shaven, Mustache, Beard, Goatee)';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

/**
 * What was added:
 * ✓ hair_length (text with constraint)
 * ✓ shirt_size (text)
 * ✓ pant_waist (int)
 * ✓ pant_inseam (int)
 * ✓ visible_tattoos (boolean, default false)
 * ✓ tattoos_description (text)
 * ✓ facial_hair (text)
 *
 * Next steps:
 * 1. Run this migration in Supabase SQL Editor
 * 2. Update src/lib/supabase/profiles.ts interfaces
 * 3. Update mapProfileDataToRow() function
 * 4. Update mapRowToProfileData() function
 * 5. Test profile creation with all fields
 *
 * Verification:
 * SELECT column_name, data_type, is_nullable
 * FROM information_schema.columns
 * WHERE table_name = 'profiles'
 *   AND column_name IN ('hair_length', 'shirt_size', 'pant_waist', 'pant_inseam', 'visible_tattoos', 'tattoos_description', 'facial_hair');
 */
