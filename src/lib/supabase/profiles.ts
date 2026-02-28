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
  height?: string // Format: "5'10""
  weight?: number
  hairColor?: string
  hairLength?: string
  eyeColor?: string
  age?: number
  dateOfBirth?: string
}

export interface Sizes {
  shirtSize?: string
  pantWaist?: number
  pantInseam?: number
  womensPantSize?: string
  bust?: number
  chest?: string
  waist?: string
  hips?: string
  inseam?: string
  neck?: string
  sleeve?: string
  jacketSize?: string
  dressSize?: string
  shoeSize?: string
}

export interface Details {
  visibleTattoos?: boolean
  tattoosDescription?: string
  facialHair?: string
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
  hair_length?: string | null
  eye_color?: string | null
  age?: number | null
  date_of_birth?: string | null
  // Sizes
  height_feet?: number | null
  height_inches?: number | null
  weight?: number | null
  shirt_size?: string | null
  pant_waist?: number | null
  pant_inseam?: number | null
  womens_pant_size?: string | null
  bust?: number | null
  chest?: string | null
  waist?: string | null
  hips?: string | null
  inseam?: string | null
  neck?: string | null
  sleeve?: string | null
  jacket_size?: string | null
  dress_size?: string | null
  shoe_size?: string | null
  // Details
  visible_tattoos?: boolean | null
  tattoos_description?: string | null
  facial_hair?: string | null
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
  // Admin fields
  status?: string | null
  admin_tag?: string | null
  admin_notes?: string | null
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
    // Convert ethnicity array to comma-separated string to preserve all selections
    if (data.appearance.ethnicity !== undefined) {
      row.ethnicity = (Array.isArray(data.appearance.ethnicity) && data.appearance.ethnicity.length > 0)
        ? data.appearance.ethnicity.join(', ')
        : null
    }
    // Parse height string (e.g., "5'10"") into feet and inches
    if (data.appearance.height !== undefined) {
      const heightMatch = data.appearance.height?.match(/(\d+)'(\d+)"?/)
      if (heightMatch) {
        row.height_feet = parseInt(heightMatch[1])
        row.height_inches = parseInt(heightMatch[2])
      } else {
        row.height_feet = null
        row.height_inches = null
      }
    }
    if (data.appearance.weight !== undefined) row.weight = data.appearance.weight || null
    if (data.appearance.hairColor !== undefined) row.hair_color = data.appearance.hairColor || null
    if (data.appearance.hairLength !== undefined) row.hair_length = data.appearance.hairLength || null
    if (data.appearance.eyeColor !== undefined) row.eye_color = data.appearance.eyeColor || null
    if (data.appearance.age !== undefined) row.age = data.appearance.age || null
    if (data.appearance.dateOfBirth !== undefined) row.date_of_birth = data.appearance.dateOfBirth || null
  }

  // Map sizes
  if (data.sizes) {
    if (data.sizes.shirtSize !== undefined) row.shirt_size = data.sizes.shirtSize || null
    if (data.sizes.pantWaist !== undefined) row.pant_waist = data.sizes.pantWaist || null
    if (data.sizes.pantInseam !== undefined) row.pant_inseam = data.sizes.pantInseam || null
    if (data.sizes.womensPantSize !== undefined) row.womens_pant_size = data.sizes.womensPantSize || null
    if (data.sizes.bust !== undefined) row.bust = data.sizes.bust || null
    if (data.sizes.chest !== undefined) row.chest = data.sizes.chest || null
    if (data.sizes.waist !== undefined) row.waist = data.sizes.waist != null ? String(data.sizes.waist) : null
    if (data.sizes.hips !== undefined) row.hips = data.sizes.hips != null ? String(data.sizes.hips) : null
    if (data.sizes.inseam !== undefined) row.inseam = data.sizes.inseam != null ? String(data.sizes.inseam) : null
    if (data.sizes.neck !== undefined) row.neck = data.sizes.neck != null ? String(data.sizes.neck) : null
    if (data.sizes.sleeve !== undefined) row.sleeve = data.sizes.sleeve != null ? String(data.sizes.sleeve) : null
    if (data.sizes.jacketSize !== undefined) row.jacket_size = data.sizes.jacketSize || null
    if (data.sizes.dressSize !== undefined) row.dress_size = data.sizes.dressSize || null
    if (data.sizes.shoeSize !== undefined) row.shoe_size = data.sizes.shoeSize || null
  }

  // Map details
  if (data.details) {
    if (data.details.visibleTattoos !== undefined) row.visible_tattoos = data.details.visibleTattoos ?? null
    if (data.details.tattoosDescription !== undefined) row.tattoos_description = data.details.tattoosDescription || null
    if (data.details.facialHair !== undefined) row.facial_hair = data.details.facialHair || null
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
      // Convert comma-separated ethnicity string back to array for form compatibility
      ethnicity: row.ethnicity
        ? row.ethnicity.split(', ').map(e => e.trim()).filter(Boolean)
        : undefined,
      // Convert height_feet and height_inches to height string format (e.g., "5'10"")
      height: (row.height_feet !== null && row.height_feet !== undefined && row.height_inches !== null && row.height_inches !== undefined)
        ? `${row.height_feet}'${row.height_inches}"`
        : undefined,
      weight: row.weight !== null && row.weight !== undefined ? row.weight : undefined,
      hairColor: row.hair_color || undefined,
      hairLength: row.hair_length || undefined,
      eyeColor: row.eye_color || undefined,
      age: row.age || undefined,
      dateOfBirth: row.date_of_birth || undefined,
    },
    sizes: {
      shirtSize: row.shirt_size || undefined,
      pantWaist: row.pant_waist || undefined,
      pantInseam: row.pant_inseam || undefined,
      womensPantSize: row.womens_pant_size || undefined,
      bust: row.bust || undefined,
      chest: row.chest || undefined,
      waist: row.waist || undefined,
      hips: row.hips || undefined,
      inseam: row.inseam || undefined,
      neck: row.neck || undefined,
      sleeve: row.sleeve || undefined,
      jacketSize: row.jacket_size || undefined,
      dressSize: row.dress_size || undefined,
      shoeSize: row.shoe_size || undefined,
    },
    details: {
      visibleTattoos: row.visible_tattoos ?? undefined,
      tattoosDescription: row.tattoos_description || undefined,
      facialHair: row.facial_hair || undefined,
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
