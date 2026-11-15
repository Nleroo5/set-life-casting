/**
 * Supabase Submissions Utility Functions
 *
 * PURPOSE: Handle submission CRUD operations with Supabase
 * REPLACES: Firebase Firestore submission operations
 *
 * Created: 2026-02-04
 * Part of: Firebase to Supabase Migration
 *
 * NOTE: This module runs in the browser. Admin-only writes use the regular client and
 * are authorized by the admin RLS policies (migrations 013/014). The service-role
 * client cannot be used here: its key does not exist in client bundles.
 */

import { createClient } from './config'

/**
 * Submission status type (simplified 3-status system)
 */
export type SubmissionStatus = 'pinned' | 'booked' | 'rejected' | null

/**
 * Submission row structure
 */
export interface SubmissionRow {
  id: string
  user_id: string
  profile_id: string
  role_id: string
  project_id: string
  status: SubmissionStatus
  cover_letter?: string | null
  admin_notes?: string | null
  preferred_contact?: 'email' | 'phone' | 'both' | null
  submitted_at: string
  updated_at: string
  reviewed_at?: string | null
  booked_at?: string | null
}

/**
 * Submission with joined profile data (for admin views)
 */
export interface SubmissionWithProfile extends SubmissionRow {
  // Profile fields (joined)
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  city?: string
  state?: string
  gender?: string
  age?: number
  height_feet?: number
  height_inches?: number
  weight?: number
  ethnicity?: string
  hair_color?: string
  eye_color?: string
}

/**
 * Create submission
 *
 * @param userId - User ID
 * @param profileId - Profile ID
 * @param roleId - Role ID
 * @param projectId - Project ID
 * @param data - Optional submission data (cover letter, contact preference)
 * @returns Submission row or error
 *
 * Note: Will throw error code '23505' if duplicate (user_id, role_id) exists
 */
export async function createSubmission(
  userId: string,
  profileId: string,
  roleId: string,
  projectId: string,
  data?: {
    cover_letter?: string
    preferred_contact?: 'email' | 'phone' | 'both'
  }
) {
  const supabase = createClient()

  const { data: submission, error } = await supabase
    .from('submissions')
    .insert({
      user_id: userId,
      profile_id: profileId,
      role_id: roleId,
      project_id: projectId,
      status: null, // New submissions have no status
      cover_letter: data?.cover_letter || null,
      preferred_contact: data?.preferred_contact || 'email',
    })
    .select()
    .single()

  return { data: submission as SubmissionRow | null, error }
}

/**
 * Update submission status (admin only)
 *
 * Authorized by the admin RLS policies (migrations 013/014)
 *
 * @param submissionId - Submission ID
 * @param status - New status
 * @returns Updated submission or error
 */
export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus
) {
  const supabase = createClient()

  const updates: any = { status, updated_at: new Date().toISOString() }

  // Set timestamps based on status
  if (status === 'booked') {
    updates.booked_at = new Date().toISOString()
  }
  if (status === 'pinned' || status === 'booked' || status === 'rejected') {
    updates.reviewed_at = new Date().toISOString()
  } else {
    // Clear timestamps when status is cleared
    updates.reviewed_at = null
    updates.booked_at = null
  }

  const { data, error } = await supabase
    .from('submissions')
    .update(updates)
    .eq('id', submissionId)
    .select()
    .single()

  return { data: data as SubmissionRow | null, error }
}

/**
 * Update submission admin notes (admin only)
 *
 * Authorized by the admin RLS policies (migrations 013/014)
 *
 * @param submissionId - Submission ID
 * @param notes - Admin notes
 */
export async function updateSubmissionNotes(
  submissionId: string,
  notes: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submissions')
    .update({ admin_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', submissionId)
    .select()
    .single()

  return { data: data as SubmissionRow | null, error }
}

/**
 * Get submissions for a user
 *
 * @param userId - User ID
 * @returns Array of submissions
 */
export async function getUserSubmissions(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submissions')
    // Columns are named so admin_notes (admin-only) is not sent to the
    // talent's own dashboard.
    .select(`
      id,
      user_id,
      profile_id,
      role_id,
      project_id,
      status,
      cover_letter,
      preferred_contact,
      submitted_at,
      updated_at,
      reviewed_at,
      booked_at,
      roles (
        title,
        project_id
      ),
      projects (
        title
      )
    `)
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })

  return { data: data as any[] | null, error }
}

/**
 * Get submissions for a role (with profile data)
 *
 * @param roleId - Role ID
 * @returns Array of submissions with profile data
 */
export async function getRoleSubmissions(roleId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      profiles (
        first_name,
        last_name,
        email,
        phone,
        city,
        state,
        gender,
        age,
        height_feet,
        height_inches,
        weight,
        ethnicity,
        hair_color,
        eye_color
      )
    `)
    .eq('role_id', roleId)
    .order('submitted_at', { ascending: false })

  return { data: data as any[] | null, error }
}

/**
 * Get all submissions (admin view with profile JOIN)
 *
 * Uses service role to bypass RLS and fetch all submissions
 * Includes JOIN with profiles table to avoid N+1 queries
 * Supports pagination to prevent loading too much data at once
 *
 * @param filters - Optional filters and pagination
 * @returns Array of submissions with profile data + total count
 *
 * Performance: Before (N+1 queries): 300+ queries for 100 submissions, 5-10s load time
 *              After (JOIN + batch):   3-5 queries for 100 submissions, <1s load time
 *
 * Example:
 * ```
 * const { data, error, count } = await getAllSubmissions({
 *   projectId: 'abc-123',
 *   limit: 50,
 *   offset: 0
 * });
 * ```
 */
export async function getAllSubmissions(filters?: {
  projectId?: string
  roleId?: string
  status?: SubmissionStatus
  orderBy?: 'submitted_at' | 'updated_at'
  order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}): Promise<{ data: any[] | null; error: any; count?: number }> {
  const supabase = createClient()

  // Use regular client with admin RLS policies
  let query = supabase
    .from('submissions')
    .select(`
      *,
      profiles!inner (
        first_name,
        last_name,
        email,
        phone,
        city,
        state,
        gender,
        age,
        height_feet,
        height_inches,
        weight,
        ethnicity,
        hair_color,
        eye_color,
        date_of_birth,
        admin_tag,
        admin_notes
      )
    `, { count: 'exact' }) // Get total count for pagination

  // Apply filters
  if (filters?.projectId) {
    query = query.eq('project_id', filters.projectId)
  }

  if (filters?.roleId) {
    query = query.eq('role_id', filters.roleId)
  }

  if (filters?.status !== undefined) {
    if (filters.status === null) {
      query = query.is('status', null)
    } else {
      query = query.eq('status', filters.status)
    }
  }

  // Apply ordering
  const orderBy = filters?.orderBy || 'submitted_at'
  const order = filters?.order || 'desc'
  // id breaks ties: rows sharing a timestamp must come back in the same order
  // on every page, or one could appear twice and another not at all.
  query = query.order(orderBy, { ascending: order === 'asc' }).order('id', { ascending: true })

  // Apply pagination
  if (filters?.limit) {
    const offset = filters.offset || 0
    const limit = filters.limit
    query = query.range(offset, offset + limit - 1)
  }

  const { data, error, count } = await query

  return { data: data as any[] | null, error, count: count || 0 }
}

/**
 * Check if user has already submitted for a role
 *
 * @param userId - User ID
 * @param roleId - Role ID
 * @returns True if submission exists
 */
export async function hasUserSubmitted(
  userId: string,
  roleId: string
): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submissions')
    .select('id')
    .eq('user_id', userId)
    .eq('role_id', roleId)
    .maybeSingle()

  // maybeSingle() returns data=null (no error) when the user has not submitted,
  // instead of .single()'s PGRST116 error. A real query error still yields false.
  return !error && !!data
}

/**
 * Delete submission
 *
 * @param submissionId - Submission ID
 */
export async function deleteSubmission(submissionId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', submissionId)

  return { error }
}

/**
 * Get submission counts by status
 *
 * Useful for admin dashboard statistics
 */
export async function getSubmissionCounts() {
  const supabase = createClient()

  // Get total count
  const { count: total } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })

  // Get count by status
  const { count: newCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .is('status', null)

  const { count: pinnedCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pinned')

  const { count: bookedCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'booked')

  const { count: rejectedCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected')

  return {
    total: total || 0,
    new: newCount || 0,
    pinned: pinnedCount || 0,
    booked: bookedCount || 0,
    rejected: rejectedCount || 0,
  }
}

/**
 * Bulk update submission statuses (admin only)
 *
 * Authorized by the admin RLS policies (migrations 013/014)
 *
 * @param submissionIds - Array of submission IDs
 * @param status - New status
 * @returns Success or error
 */
export async function bulkUpdateSubmissionStatus(
  submissionIds: string[],
  status: SubmissionStatus
) {
  const supabase = createClient()

  const updates: any = { status, updated_at: new Date().toISOString() }

  // Set timestamps based on status
  if (status === 'booked') {
    updates.booked_at = new Date().toISOString()
  }
  if (status === 'pinned' || status === 'booked' || status === 'rejected') {
    updates.reviewed_at = new Date().toISOString()
  } else {
    // Clear timestamps when status is cleared
    updates.reviewed_at = null
    updates.booked_at = null
  }

  const { data, error } = await supabase
    .from('submissions')
    .update(updates)
    .in('id', submissionIds)
    .select()

  return { data: data as SubmissionRow[] | null, error }
}

/**
 * Get booked submissions for a project (for skins export)
 *
 * Returns submissions with status='booked' and full profile data
 * Replaces Firebase bookings collection
 *
 * @param projectId - Project ID
 * @returns Array of booked submissions with full profile data
 */
export async function getBookedSubmissions(projectId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      profiles!inner (
        first_name,
        last_name,
        email,
        phone,
        city,
        state,
        gender,
        age,
        height_feet,
        height_inches,
        weight,
        ethnicity,
        hair_color,
        eye_color,
        date_of_birth,
        shirt_size,
        pant_waist,
        pant_inseam,
        dress_size,
        womens_pant_size,
        shoe_size,
        bust,
        waist,
        hips,
        neck,
        sleeve,
        jacket_size,
        visible_tattoos,
        special_skills
      ),
      roles!inner (
        id,
        title,
        pay_rate,
        shoot_dates,
        shoot_location
      )
    `)
    .eq('project_id', projectId)
    .eq('status', 'booked')
    .order('submitted_at', { ascending: false })

  return { data: data as any[] | null, error }
}
