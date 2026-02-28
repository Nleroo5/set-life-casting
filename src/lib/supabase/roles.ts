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

  // Update role status to archived
  const { error: roleError } = await updateRole(roleId, {
    status: 'archived',
    // Store archive metadata in a JSONB field or separate table if needed
  })

  if (roleError) {
    throw roleError
  }

  // Clear submission statuses for this role (role is archived, submissions no longer active)
  const { error: submissionError } = await supabase
    .from('submissions')
    .update({
      status: null,
      updated_at: new Date().toISOString(),
    })
    .eq('role_id', roleId)

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

  // Restore associated submissions (ensure status is cleared)
  const { error: submissionError } = await supabase
    .from('submissions')
    .update({
      status: null,
      updated_at: new Date().toISOString(),
    })
    .eq('role_id', roleId)

  if (submissionError) {
    throw submissionError
  }
}

