/**
 * Supabase Profiles Utility Functions
 *
 * PURPOSE: Handle profile CRUD operations with Supabase
 * REPLACES: Firebase Firestore profile operations
 *
 * Created: 2026-02-04
 * Part of: Firebase to Supabase Migration
 */

import { createClient } from './config'

/**
 * Profile data types matching the Firebase structure
 */
export interface BasicInfo {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  city?: string
  state?: string
}

export interface Appearance {
  gender?: string
  ethnicity?: string[]
  hairColor?: string
  eyeColor?: string
  age?: number
  dateOfBirth?: string
}

export interface Sizes {
  heightFeet?: number
  heightInches?: number
  weight?: number
  chest?: string
  waist?: string
  hips?: string
  inseam?: string
  neck?: string
  sleeve?: string
  dressSize?: string
  shoeSize?: string
}

export interface Details {
  bio?: string
  experience?: string
  training?: string
  specialSkills?: string[]
  languages?: string[]
  unions?: string[]
  imdbLink?: string
}

export interface ProfileData {
  basicInfo?: BasicInfo
  appearance?: Appearance
  sizes?: Sizes
  details?: Details
  profileComplete?: boolean
  lastStepCompleted?: number
}

/**
 * Profile row structure from Supabase (flat columns)
 */
export interface ProfileRow {
  id: string
  user_id: string
  // Basic Info
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  city?: string | null
  state?: string | null
  // Appearance
  gender?: string | null
  ethnicity?: string | null
  hair_color?: string | null
  eye_color?: string | null
  age?: number | null
  date_of_birth?: string | null
  // Sizes
  height_feet?: number | null
  height_inches?: number | null
  weight?: number | null
  chest?: string | null
  waist?: string | null
  hips?: string | null
  inseam?: string | null
  neck?: string | null
  sleeve?: string | null
  dress_size?: string | null
  shoe_size?: string | null
  // Details
  bio?: string | null
  experience?: string | null
  training?: string | null
  special_skills?: string[] | null
  languages?: string[] | null
  unions?: string[] | null
  imdb_link?: string | null
  // Status
  profile_complete?: boolean
  last_step_completed?: number
  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Map nested Firebase structure to flat Supabase columns
 */
function mapProfileDataToRow(data: ProfileData): Partial<ProfileRow> {
  const row: Partial<ProfileRow> = {}

  // Map basicInfo
  if (data.basicInfo) {
    if (data.basicInfo.firstName !== undefined) row.first_name = data.basicInfo.firstName || null
    if (data.basicInfo.lastName !== undefined) row.last_name = data.basicInfo.lastName || null
    if (data.basicInfo.email !== undefined) row.email = data.basicInfo.email || null
    if (data.basicInfo.phone !== undefined) row.phone = data.basicInfo.phone || null
    if (data.basicInfo.city !== undefined) row.city = data.basicInfo.city || null
    if (data.basicInfo.state !== undefined) row.state = data.basicInfo.state || null
  }

  // Map appearance
  if (data.appearance) {
    if (data.appearance.gender !== undefined) row.gender = data.appearance.gender || null
    // Convert ethnicity array to single string (take first value)
    if (data.appearance.ethnicity !== undefined) {
      row.ethnicity = (Array.isArray(data.appearance.ethnicity) && data.appearance.ethnicity.length > 0)
        ? data.appearance.ethnicity[0]
        : null
    }
    if (data.appearance.hairColor !== undefined) row.hair_color = data.appearance.hairColor || null
    if (data.appearance.eyeColor !== undefined) row.eye_color = data.appearance.eyeColor || null
    if (data.appearance.age !== undefined) row.age = data.appearance.age || null
    if (data.appearance.dateOfBirth !== undefined) row.date_of_birth = data.appearance.dateOfBirth || null
  }

  // Map sizes
  if (data.sizes) {
    if (data.sizes.heightFeet !== undefined) row.height_feet = data.sizes.heightFeet || null
    if (data.sizes.heightInches !== undefined) row.height_inches = data.sizes.heightInches || null
    if (data.sizes.weight !== undefined) row.weight = data.sizes.weight || null
    if (data.sizes.chest !== undefined) row.chest = data.sizes.chest || null
    if (data.sizes.waist !== undefined) row.waist = data.sizes.waist || null
    if (data.sizes.hips !== undefined) row.hips = data.sizes.hips || null
    if (data.sizes.inseam !== undefined) row.inseam = data.sizes.inseam || null
    if (data.sizes.neck !== undefined) row.neck = data.sizes.neck || null
    if (data.sizes.sleeve !== undefined) row.sleeve = data.sizes.sleeve || null
    if (data.sizes.dressSize !== undefined) row.dress_size = data.sizes.dressSize || null
    if (data.sizes.shoeSize !== undefined) row.shoe_size = data.sizes.shoeSize || null
  }

  // Map details
  if (data.details) {
    if (data.details.bio !== undefined) row.bio = data.details.bio || null
    if (data.details.experience !== undefined) row.experience = data.details.experience || null
    if (data.details.training !== undefined) row.training = data.details.training || null
    if (data.details.specialSkills !== undefined) row.special_skills = data.details.specialSkills || null
    if (data.details.languages !== undefined) row.languages = data.details.languages || null
    if (data.details.unions !== undefined) row.unions = data.details.unions || null
    if (data.details.imdbLink !== undefined) row.imdb_link = data.details.imdbLink || null
  }

  // Map status fields
  if (data.profileComplete !== undefined) row.profile_complete = data.profileComplete
  if (data.lastStepCompleted !== undefined) row.last_step_completed = data.lastStepCompleted

  return row
}

/**
 * Map flat Supabase row back to nested Firebase structure
 */
function mapRowToProfileData(row: ProfileRow): ProfileData {
  return {
    basicInfo: {
      firstName: row.first_name || undefined,
      lastName: row.last_name || undefined,
      email: row.email || undefined,
      phone: row.phone || undefined,
      city: row.city || undefined,
      state: row.state || undefined,
    },
    appearance: {
      gender: row.gender || undefined,
      // Convert single ethnicity string back to array for form compatibility
      ethnicity: row.ethnicity ? [row.ethnicity] : undefined,
      hairColor: row.hair_color || undefined,
      eyeColor: row.eye_color || undefined,
      age: row.age || undefined,
      dateOfBirth: row.date_of_birth || undefined,
    },
    sizes: {
      heightFeet: row.height_feet || undefined,
      heightInches: row.height_inches || undefined,
      weight: row.weight || undefined,
      chest: row.chest || undefined,
      waist: row.waist || undefined,
      hips: row.hips || undefined,
      inseam: row.inseam || undefined,
      neck: row.neck || undefined,
      sleeve: row.sleeve || undefined,
      dressSize: row.dress_size || undefined,
      shoeSize: row.shoe_size || undefined,
    },
    details: {
      bio: row.bio || undefined,
      experience: row.experience || undefined,
      training: row.training || undefined,
      specialSkills: row.special_skills || undefined,
      languages: row.languages || undefined,
      unions: row.unions || undefined,
      imdbLink: row.imdb_link || undefined,
    },
    profileComplete: row.profile_complete,
    lastStepCompleted: row.last_step_completed,
  }
}

/**
 * Get profile by user ID
 *
 * Returns the profile in Firebase-compatible nested structure
 */
export async function getProfile(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // Profile doesn't exist yet - this is normal for new users
    if (error.code === 'PGRST116') {
      return { data: null, error: null }
    }
    return { data: null, error }
  }

  // Convert flat row to nested structure
  return { data: mapRowToProfileData(data as ProfileRow), error: null }
}

/**
 * Create new profile
 *
 * Used for final submission after all steps are complete
 * Returns the profile ID
 */
export async function createProfile(userId: string, data: ProfileData) {
  const supabase = createClient()

  // Map nested structure to flat columns
  const row = mapProfileDataToRow(data)

  const { data: result, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      ...row,
    }, {
      onConflict: 'user_id',
    })
    .select('id')
    .single()

  return { data: result, error }
}

/**
 * Update profile with partial data
 *
 * Handles auto-save functionality
 * Only updates provided fields
 */
export async function updateProfile(userId: string, data: Partial<ProfileData>) {
  const supabase = createClient()

  // Map nested structure to flat columns
  const row = mapProfileDataToRow(data as ProfileData)

  const { data: result, error } = await supabase
    .from('profiles')
    .update(row)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: mapRowToProfileData(result as ProfileRow), error: null }
}

/**
 * Update a single form step (basicInfo, appearance, sizes, details)
 *
 * Used for auto-save when navigating between steps
 * Creates profile if it doesn't exist
 */
export async function updateProfileStep(
  userId: string,
  step: 'basicInfo' | 'appearance' | 'sizes' | 'details',
  stepData: BasicInfo | Appearance | Sizes | Details
) {
  const supabase = createClient()

  // Create ProfileData structure with just this step
  const profileData: ProfileData = {
    [step]: stepData,
  }

  // Map to flat columns
  const row = mapProfileDataToRow(profileData)

  // Upsert - create if doesn't exist, update if it does
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      ...row,
    }, {
      onConflict: 'user_id',
    })
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: mapRowToProfileData(data as ProfileRow), error: null }
}

/**
 * Get all profiles (admin only)
 *
 * Returns profiles in flat structure for easier admin filtering
 */
export async function getAllProfiles() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error }
  }

  return { data: data as ProfileRow[], error: null }
}

/**
 * Delete profile by user ID
 */
export async function deleteProfile(userId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('user_id', userId)

  return { error }
}
