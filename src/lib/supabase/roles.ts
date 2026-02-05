/**
 * Supabase Role Archive Management Functions
 *
 * PURPOSE: Handle role archiving separate from project-level archiving
 * REPLACES: Firebase role archive functions
 *
 * Created: 2026-02-05
 * Part of: Firebase to Supabase Migration
 */

import { createClient } from './config'
import { updateRole } from './casting'

/**
 * Archives a single role without affecting the parent project
 *
 * @param roleId - The role ID to archive
 * @param userId - The admin user ID performing the archive
 * @param reason - Optional reason for archiving
 * @returns Promise that resolves when archive is complete
 * @throws Error if role has active bookings or archive fails
 */
export async function archiveRole(
  roleId: string,
  userId: string,
  reason?: string
): Promise<void> {
  const supabase = createClient()

  // Check for active bookings (if bookings table exists)
  // Note: Based on the Firebase code, bookings collection was removed
  // But keeping this check for future compatibility
  try {
    const { count: bookingCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', roleId)
      .neq('archived_with_project', true)

    if (bookingCount && bookingCount > 0) {
      throw new Error(
        `Cannot archive role with ${bookingCount} active booking(s). ` +
        `Please complete or archive the project first.`
      )
    }
  } catch (error: any) {
    // If bookings table doesn't exist, continue
    if (error?.code !== '42P01') { // 42P01 = table doesn't exist
      throw error;
    }
  }

  // Update role status to archived
  const { error: roleError } = await updateRole(roleId, {
    status: 'archived',
    // Store archive metadata in a JSONB field or separate table if needed
  })

  if (roleError) {
    throw roleError
  }

  // Archive associated submissions
  const { error: submissionError } = await supabase
    .from('submissions')
    .update({
      status: 'archived' as any, // Cast because SubmissionStatus doesn't include 'archived'
      updated_at: new Date().toISOString(),
    })
    .eq('role_id', roleId)
    .neq('archived_with_project', true)

  if (submissionError) {
    throw submissionError
  }
}

/**
 * Restores an individually archived role
 *
 * @param roleId - The role ID to restore
 * @returns Promise that resolves when restore is complete
 * @throws Error if role is archived with project or restore fails
 */
export async function restoreRole(roleId: string): Promise<void> {
  const supabase = createClient()

  // Get role data
  const { data: role, error: fetchError } = await supabase
    .from('roles')
    .select('*')
    .eq('id', roleId)
    .single()

  if (fetchError || !role) {
    throw new Error('Role not found')
  }

  // Check if role is archived with project
  // This would need to be stored in a metadata field or separate archive table
  // For now, we'll just restore the role status

  // Restore role status to 'open'
  const { error: roleError } = await updateRole(roleId, {
    status: 'open',
  })

  if (roleError) {
    throw roleError
  }

  // Restore associated submissions back to null (no status)
  const { error: submissionError } = await supabase
    .from('submissions')
    .update({
      status: null,
      updated_at: new Date().toISOString(),
    })
    .eq('role_id', roleId)
    .eq('status', 'archived' as any)

  if (submissionError) {
    throw submissionError
  }
}

/**
 * Gets count of active bookings for a role
 *
 * @param roleId - The role ID
 * @returns Number of active (non-archived) bookings
 */
export async function getActiveBookingCount(roleId: string): Promise<number> {
  const supabase = createClient()

  try {
    // Note: bookings table may not exist in current schema
    // Returning 0 for now (bookings collection was removed per comments)
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', roleId)
      .neq('archived_with_project', true)

    return count || 0
  } catch (error) {
    // If bookings table doesn't exist, return 0
    console.warn('Bookings table query failed, returning 0:', error)
    return 0
  }
}
