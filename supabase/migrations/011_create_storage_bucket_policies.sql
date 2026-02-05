/**
 * Migration: Create Storage Bucket Policies for Photos
 *
 * PURPOSE: Enable photo uploads to Supabase Storage
 * FIXES: "Images not saving" issue
 *
 * Created: 2026-02-05
 * Part of: Image Upload Fix (Phase 3 Audit)
 *
 * BEFORE RUNNING THIS MIGRATION:
 * 1. Create storage bucket named "photos" in Supabase dashboard
 * 2. Set bucket to PUBLIC (or use signed URLs)
 * 3. Then run this SQL to create RLS policies
 */

-- ============================================================================
-- STORAGE BUCKET RLS POLICIES
-- ============================================================================

/**
 * Policy 1: Users can upload photos to their own folder
 *
 * How it works:
 * - Users upload to: {user_id}/filename.jpg
 * - Policy extracts user_id from path and checks it matches auth.uid()
 * - Prevents users from uploading to other users' folders
 */
CREATE POLICY "Users can upload own photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

/**
 * Policy 2: Users can delete their own photos
 *
 * How it works:
 * - Users can only delete files in their own folder
 * - Folder name must match their user ID
 */
CREATE POLICY "Users can delete own photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

/**
 * Policy 3: Anyone can view photos (public access)
 *
 * How it works:
 * - All photos in the 'photos' bucket are publicly viewable
 * - Necessary for displaying profile photos on the site
 * - No authentication required to view
 *
 * Note: If you want private photos, change this to:
 * - USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1])
 * - Then use signed URLs for viewing
 */
CREATE POLICY "Anyone can view photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'photos');

/**
 * Policy 4: Users can update own photos metadata (optional)
 *
 * Allows users to update metadata like display_order
 */
CREATE POLICY "Users can update own photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

/**
 * Verify policies were created successfully:
 * Run this query to see all storage policies for the photos bucket
 */
-- SELECT
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies
-- WHERE schemaname = 'storage'
--   AND tablename = 'objects'
--   AND policyname LIKE '%photos%';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

/**
 * What was created:
 * ✓ Storage policy for uploading photos (users own folder only)
 * ✓ Storage policy for deleting photos (users own photos only)
 * ✓ Storage policy for viewing photos (public access)
 * ✓ Storage policy for updating photos metadata (optional)
 *
 * Next steps:
 * 1. Test photo upload from profile creation page
 * 2. Verify photos appear in Supabase Storage > photos bucket
 * 3. Check that public URLs work
 * 4. Test deletion works
 *
 * Folder structure in bucket:
 * photos/
 *   {user-id-1}/
 *     headshot.jpg
 *     fullbody.jpg
 *     photo1.jpg
 *   {user-id-2}/
 *     headshot.jpg
 *     ...
 */
