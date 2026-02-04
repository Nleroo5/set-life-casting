/**
 * Supabase Submissions Utility Functions
 *
 * PURPOSE: Handle submission CRUD operations with Supabase
 * REPLACES: Firebase Firestore submission operations
 *
 * Created: 2026-02-04
 * Part of: Firebase to Supabase Migration
 */

import { createClient } from './config'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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
 * Should be called with service role client for admin operations
 *
 * @param submissionId - Submission ID
 * @param status - New status
 * @returns Updated submission or error
 */
export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus
) {
  // For admin operations, we should use service role
  // But for now, use regular client (RLS policies will enforce permissions)
  const supabase = createClient()

  const updates: any = { status }

  // Set timestamps based on status
  if (status === 'booked') {
    updates.booked_at = new Date().toISOString()
  }
  if (status === 'pinned' || status === 'booked' || status === 'rejected') {
    updates.reviewed_at = new Date().toISOString()
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
 * Update submission admin notes
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
    .update({ admin_notes: notes })
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
    .select(`
      *,
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
 * @param filters - Optional filters
 * @returns Array of submissions with profile data
 */
export async function getAllSubmissions(filters?: {
  projectId?: string
  status?: SubmissionStatus
  orderBy?: string
  order?: 'asc' | 'desc'
}) {
  const supabase = createClient()

  let query = supabase
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
        eye_color,
        date_of_birth
      )
    `)

  // Apply filters
  if (filters?.projectId) {
    query = query.eq('project_id', filters.projectId)
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
  query = query.order(orderBy, { ascending: order === 'asc' })

  const { data, error } = await query

  return { data: data as any[] | null, error }
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
    .single()

  // If no error and data exists, user has submitted
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
 * @param submissionIds - Array of submission IDs
 * @param status - New status
 * @returns Success or error
 */
export async function bulkUpdateSubmissionStatus(
  submissionIds: string[],
  status: SubmissionStatus
) {
  const supabase = createClient()

  const updates: any = { status }

  // Set timestamps based on status
  if (status === 'booked') {
    updates.booked_at = new Date().toISOString()
  }
  if (status === 'pinned' || status === 'booked' || status === 'rejected') {
    updates.reviewed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('submissions')
    .update(updates)
    .in('id', submissionIds)

  return { error }
}
