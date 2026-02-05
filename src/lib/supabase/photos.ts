/**
 * Supabase Photos Utility Functions
 *
 * PURPOSE: Handle photo uploads to Supabase Storage and metadata to database
 * REPLACES: Firebase Storage photo uploads
 *
 * Created: 2026-02-04
 * Part of: Firebase to Supabase Migration
 */

import { createClient } from './config'

/**
 * Photo metadata structure
 */
export interface PhotoMetadata {
  type: 'headshot' | 'fullbody' | 'portfolio'
  url: string
  storage_path: string
  file_name?: string
  file_size?: number
  mime_type?: string
  width?: number
  height?: number
  display_order?: number
}

/**
 * Photo row from database
 */
export interface PhotoRow {
  id: string
  user_id: string
  profile_id?: string | null
  type: 'headshot' | 'fullbody' | 'portfolio'
  url: string
  storage_path: string
  file_name?: string | null
  file_size?: number | null
  mime_type?: string | null
  width?: number | null
  height?: number | null
  display_order: number
  created_at: string
  updated_at: string
}

/**
 * Upload photo to Supabase Storage
 *
 * @param userId - User ID for folder path
 * @param file - File to upload (already compressed if needed)
 * @param type - Photo type (headshot, fullbody, portfolio)
 * @returns {url, path} - Public URL and storage path
 */
export async function uploadPhoto(
  userId: string,
  file: File,
  type: 'headshot' | 'fullbody' | 'portfolio'
): Promise<{ url: string; path: string } | { error: any }> {
  const supabase = createClient()

  // Generate unique filename with timestamp
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = `${timestamp}-${type}.${fileExt}`
  const storagePath = `${userId}/${fileName}`

  // Upload to Supabase Storage bucket "photos"
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('photos')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false, // Don't overwrite existing files
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return { error: uploadError }
  }

  // Get public URL
  const { data: urlData } = supabase
    .storage
    .from('photos')
    .getPublicUrl(storagePath)

  return {
    url: urlData.publicUrl,
    path: storagePath,
  }
}

/**
 * Save photo metadata to database
 *
 * @param userId - User ID (foreign key)
 * @param profileId - Profile ID (foreign key, optional)
 * @param photoData - Photo metadata
 * @returns Photo row or error
 */
export async function savePhotoMetadata(
  userId: string,
  profileId: string | null,
  photoData: PhotoMetadata
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('photos')
    .insert({
      user_id: userId,
      profile_id: profileId,
      type: photoData.type,
      url: photoData.url,
      storage_path: photoData.storage_path,
      file_name: photoData.file_name || null,
      file_size: photoData.file_size || null,
      mime_type: photoData.mime_type || null,
      width: photoData.width || null,
      height: photoData.height || null,
      display_order: photoData.display_order || 0,
    })
    .select()
    .single()

  return { data: data as PhotoRow | null, error }
}

/**
 * Get photos for a profile
 *
 * @param profileId - Profile ID
 * @returns Array of photo rows
 */
export async function getPhotos(profileId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('profile_id', profileId)
    .order('display_order', { ascending: true })

  return { data: data as PhotoRow[] | null, error }
}

/**
 * Get photos by user ID
 *
 * @param userId - User ID
 * @returns Array of photo rows
 */
export async function getPhotosByUserId(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true })

  return { data: data as PhotoRow[] | null, error }
}

/**
 * Get photos for multiple profiles in one query (batch fetch)
 *
 * Prevents N+1 query problem when loading many submissions
 * Returns photos grouped by profile_id
 *
 * @param profileIds - Array of profile IDs
 * @returns Map of profile_id -> photos[]
 *
 * Example usage:
 * ```
 * const profileIds = submissions.map(s => s.profile_id);
 * const { data: photosMap } = await getPhotosByProfileIds(profileIds);
 * const photosForProfile = photosMap['profile-id-123'];
 * ```
 */
export async function getPhotosByProfileIds(
  profileIds: string[]
): Promise<{ data: Record<string, PhotoRow[]> | null; error: any }> {
  const supabase = createClient()

  // Filter out null/undefined values
  const validProfileIds = profileIds.filter(Boolean)

  if (validProfileIds.length === 0) {
    return { data: {}, error: null }
  }

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .in('profile_id', validProfileIds)
    .order('display_order', { ascending: true })

  if (error || !data) {
    return { data: null, error }
  }

  // Group photos by profile_id
  const grouped = data.reduce((acc, photo) => {
    const profileId = photo.profile_id
    if (!profileId) return acc

    if (!acc[profileId]) {
      acc[profileId] = []
    }
    acc[profileId].push(photo)
    return acc
  }, {} as Record<string, PhotoRow[]>)

  return { data: grouped, error: null }
}

/**
 * Delete photo (both from storage and database)
 *
 * @param photoId - Photo database ID
 * @param storagePath - Path in storage bucket
 * @returns Success or error
 */
export async function deletePhoto(photoId: string, storagePath: string) {
  const supabase = createClient()

  // Delete from storage first
  const { error: storageError } = await supabase
    .storage
    .from('photos')
    .remove([storagePath])

  if (storageError) {
    console.error('Storage delete error:', storageError)
    return { error: storageError }
  }

  // Delete metadata from database
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId)

  return { error: dbError }
}

/**
 * Update photo display order
 *
 * @param photoId - Photo ID
 * @param displayOrder - New display order
 */
export async function updatePhotoDisplayOrder(
  photoId: string,
  displayOrder: number
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('photos')
    .update({ display_order: displayOrder })
    .eq('id', photoId)
    .select()
    .single()

  return { data: data as PhotoRow | null, error }
}

/**
 * Link photos to a profile after profile creation
 *
 * Updates all photos for a user to set the profile_id
 * Called after profile is successfully created
 *
 * @param userId - User ID
 * @param profileId - Profile ID to link photos to
 */
export async function linkPhotosToProfile(userId: string, profileId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('photos')
    .update({ profile_id: profileId })
    .eq('user_id', userId)
    .is('profile_id', null) // Only update photos not yet linked
    .select()

  return { data: data as PhotoRow[] | null, error }
}

/**
 * Delete all photos for a user
 *
 * Used for cleanup when user deletes account
 */
export async function deleteAllUserPhotos(userId: string) {
  const supabase = createClient()

  // Get all photos for user
  const { data: photos, error: fetchError } = await getPhotosByUserId(userId)

  if (fetchError || !photos) {
    return { error: fetchError }
  }

  // Delete from storage
  const storagePaths = photos.map(photo => photo.storage_path)
  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase
      .storage
      .from('photos')
      .remove(storagePaths)

    if (storageError) {
      console.error('Storage bulk delete error:', storageError)
    }
  }

  // Delete from database (CASCADE will handle this when user is deleted)
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('user_id', userId)

  return { error: dbError }
}
