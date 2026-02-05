/**
 * Migration: Create Photos Schema
 *
 * PURPOSE: Store photo metadata (files live in Supabase Storage)
 * REPLACES: Firebase Storage + Firestore photo references
 *
 * Created: 2026-02-04
 * Part of: Full Firebase to Supabase Migration
 */

-- ============================================================================
-- STEP 1: Create photos table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.photos (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Photo details
  type text NOT NULL CHECK (type IN ('headshot', 'fullbody', 'portfolio')),
  url text NOT NULL,  -- Public URL from Supabase Storage
  storage_path text NOT NULL,  -- Path in storage bucket (e.g., "photos/user-id/filename.jpg")

  -- File metadata
  file_name text,
  file_size bigint,  -- Bytes
  mime_type text,
  width int,
  height int,

  -- Display order for portfolio
  display_order int DEFAULT 0,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- STEP 2: Create indexes
-- ============================================================================

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos(user_id);

-- Index for profile lookup
CREATE INDEX IF NOT EXISTS idx_photos_profile_id ON public.photos(profile_id);

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_photos_type ON public.photos(type);

-- Index for ordering portfolio photos
CREATE INDEX IF NOT EXISTS idx_photos_display_order ON public.photos(user_id, display_order);

-- ============================================================================
-- STEP 3: Enable Row Level Security
-- ============================================================================

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create RLS Policies
-- ============================================================================

/**
 * POLICY 1: Users can read their own photos
 */
CREATE POLICY "Users can read own photos"
  ON public.photos
  FOR SELECT
  USING (auth.uid() = user_id);

/**
 * POLICY 2: Users can insert their own photos
 */
CREATE POLICY "Users can insert own photos"
  ON public.photos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

/**
 * POLICY 3: Users can update their own photos
 */
CREATE POLICY "Users can update own photos"
  ON public.photos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

/**
 * POLICY 4: Users can delete their own photos
 */
CREATE POLICY "Users can delete own photos"
  ON public.photos
  FOR DELETE
  USING (auth.uid() = user_id);

/**
 * POLICY 5: Public can view talent photos (for casting directors)
 * Note: Admins use service role which bypasses RLS
 */
-- Uncomment if you want casting directors to view photos without auth
-- CREATE POLICY "Public can view photos"
--   ON public.photos
--   FOR SELECT
--   USING (true);

-- ============================================================================
-- STEP 5: Create updated_at trigger
-- ============================================================================

CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: Grant permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.photos TO authenticated;
GRANT ALL ON public.photos TO service_role;

-- ============================================================================
-- STEP 7: Setup Supabase Storage Bucket
-- ============================================================================

-- You'll need to create a storage bucket in Supabase dashboard:
--
-- 1. Go to Storage in Supabase dashboard
-- 2. Create bucket named "photos"
-- 3. Set bucket to PUBLIC (so URLs work) or PRIVATE (requires signed URLs)
-- 4. Add storage policies in Storage > Policies tab
--
-- Storage Policy 1: Users can upload own photos
-- Paste this in Supabase Storage Policies:
--
-- CREATE POLICY "Users can upload own photos"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'photos' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );
--
-- Storage Policy 2: Users can delete own photos
--
-- CREATE POLICY "Users can delete own photos"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'photos' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );
--
-- Storage Policy 3: Anyone can view photos
--
-- CREATE POLICY "Anyone can view photos"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'photos');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- What was created:
-- ✓ photos table with metadata
-- ✓ Indexes for performance
-- ✓ RLS enabled with 4 policies
-- ✓ Auto-update trigger
-- ✓ Proper permissions
--
-- Manual steps required:
-- 1. Create "photos" storage bucket in Supabase dashboard
-- 2. Add storage policies (see STEP 7 above)
--
-- Next steps:
-- 1. Run this migration
-- 2. Create storage bucket
-- 3. Create projects/roles/submissions tables
