/**
 * Supabase Role Archive Management Functions
 *
 * PURPOSE: Handle role archiving separate from project-level archiving
 * REPLACES: Firebase role archive functions
 *
 * Created: 2026-02-05
 * Part of: Firebase to Supabase Migration
 */

import { updateRole } from './casting'

/**
 * Archives a single role without affecting the parent project
 *
 * @param roleId - The role ID to archive
 * @param userId - The admin user ID performing the archive
 * @param reason - Optional reason for archiving
 * @returns Promise that resolves when archive is complete
 * @throws Error if the archive fails
 */
export async function archiveRole(
  roleId: string,
  userId: string,
  reason?: string
): Promise<void> {
  // Only the role changes. Its submissions keep their pinned/booked/rejected
  // status so the casting decisions survive an archive and a later restore.
  const { error: roleError } = await updateRole(roleId, {
    status: 'archived',
  })

  if (roleError) {
    throw roleError
  }
}

/**
 * Restores an individually archived role
 *
 * @param roleId - The role ID to restore
 * @returns Promise that resolves when restore is complete
 * @throws Error if the restore fails
 */
export async function restoreRole(roleId: string): Promise<void> {
  // Reopen the role. Submissions are left exactly as they are.
  const { error: roleError } = await updateRole(roleId, {
    status: 'open',
  })

  if (roleError) {
    throw roleError
  }
}
