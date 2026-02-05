/**
 * Migration: Create Profiles Schema
 *
 * PURPOSE: Migrate profile data from Firebase Firestore to Supabase
 * REPLACES: Firebase "profiles" collection
 *
 * Created: 2026-02-04
 * Part of: Full Firebase to Supabase Migration
 */

-- ============================================================================
-- STEP 1: Create profiles table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to users
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Basic Information (Step 1)
  first_name text,
  last_name text,
  email text,
  phone text,
  city text,
  state text,

  -- Appearance (Step 2)
  gender text,
  ethnicity text,
  hair_color text,
  eye_color text,
  age int,
  date_of_birth date,

  -- Sizes/Measurements (Step 3)
  height_feet int,
  height_inches int,
  weight int,
  chest text,
  waist text,
  hips text,
  inseam text,
  neck text,
  sleeve text,
  dress_size text,
  shoe_size text,

  -- Details (Step 4)
  bio text,
  experience text,
  training text,
  special_skills text[],
  languages text[],
  unions text[],
  imdb_link text,

  -- Status tracking
  profile_complete boolean DEFAULT false,
  last_step_completed int DEFAULT 0,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Constraints
  UNIQUE(user_id)
);

-- ============================================================================
-- STEP 2: Create indexes
-- ============================================================================

-- Index for user lookup (most common query)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Index for searching by location
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(city, state);

-- Index for filtering by ethnicity
CREATE INDEX IF NOT EXISTS idx_profiles_ethnicity ON public.profiles(ethnicity);

-- Index for filtering by gender
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);

-- Index for complete profiles
CREATE INDEX IF NOT EXISTS idx_profiles_complete ON public.profiles(profile_complete) WHERE profile_complete = true;

-- ============================================================================
-- STEP 3: Enable Row Level Security
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create RLS Policies
-- ============================================================================

/**
 * POLICY 1: Users can read their own profile
 */
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

/**
 * POLICY 2: Users can insert their own profile
 */
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

/**
 * POLICY 3: Users can update their own profile
 */
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

/**
 * POLICY 4: Users can delete their own profile
 */
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = user_id);

/**
 * POLICY 5: Admins can read all profiles (using service role)
 * Note: Admin features use service role client which bypasses RLS
 * This policy is here for documentation only
 */

-- ============================================================================
-- STEP 5: Create updated_at trigger
-- ============================================================================

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: Grant permissions
-- ============================================================================

-- Allow authenticated users full access (subject to RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- Allow service role full access (bypasses RLS for admin)
GRANT ALL ON public.profiles TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

/**
 * What was created:
 * ✓ profiles table with all fields from Firebase
 * ✓ Indexes for performance
 * ✓ RLS enabled with 4 policies
 * ✓ Auto-update trigger for updated_at
 * ✓ Proper permissions granted
 *
 * Next steps:
 * 1. Run this migration in Supabase SQL editor
 * 2. Verify table exists and RLS is enabled
 * 3. Create photos table (007_create_photos_schema.sql)
 * 4. Create projects/roles/submissions tables
 */
