/**
 * Supabase Casting Utility Functions (Projects & Roles)
 *
 * PURPOSE: Handle project and role operations with Supabase
 * REPLACES: Firebase Firestore projects and roles collections
 *
 * Created: 2026-02-04
 * Part of: Firebase to Supabase Migration
 */

import { createClient } from './config'

/**
 * Project row structure
 */
export interface ProjectRow {
  id: string
  title: string
  description?: string | null
  production_company?: string | null
  director?: string | null
  producer?: string | null
  location?: string | null
  project_type?: 'film' | 'tv' | 'commercial' | 'theater' | 'web' | 'other' | null
  start_date?: string | null
  end_date?: string | null
  posting_date: string
  deadline?: string | null
  status: 'active' | 'closed' | 'archived'
  is_public: boolean
  created_at: string
  updated_at: string
}

/**
 * Role row structure
 */
export interface RoleRow {
  id: string
  project_id: string
  title: string
  description?: string | null
  character_name?: string | null
  // Requirements
  gender?: string | null
  age_min?: number | null
  age_max?: number | null
  ethnicity?: string[] | null
  height_min?: string | null
  height_max?: string | null
  // Skills
  required_skills?: string[] | null
  preferred_skills?: string[] | null
  // Compensation
  pay_rate?: string | null
  pay_type?: 'hourly' | 'daily' | 'project' | 'unpaid' | 'negotiable' | null
  pay_details?: string | null
  // Dates
  audition_date?: string | null
  audition_location?: string | null
  shoot_dates?: string | null
  shoot_location?: string | null
  // Status
  status: 'open' | 'closed' | 'filled' | 'archived'
  positions_available: number
  positions_filled: number
  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Role with project data (joined)
 */
export interface RoleWithProject extends RoleRow {
  projects?: ProjectRow
}

// ============================================================================
// PROJECT OPERATIONS
// ============================================================================

/**
 * Get all projects
 *
 * @param filters - Optional filters
 * @returns Array of projects
 */
export async function getProjects(filters?: {
  status?: 'active' | 'closed' | 'archived'
  isPublic?: boolean
}) {
  const supabase = createClient()

  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.isPublic !== undefined) {
    query = query.eq('is_public', filters.isPublic)
  }

  const { data, error } = await query

  return { data: data as ProjectRow[] | null, error }
}

/**
 * Get project by ID
 *
 * @param projectId - Project ID
 * @returns Project row
 */
export async function getProject(projectId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  return { data: data as ProjectRow | null, error }
}

/**
 * Create project (admin only)
 *
 * @param projectData - Project data
 * @returns Created project
 */
export async function createProject(projectData: Partial<ProjectRow>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single()

  return { data: data as ProjectRow | null, error }
}

/**
 * Update project (admin only)
 *
 * @param projectId - Project ID
 * @param updates - Fields to update
 * @returns Updated project
 */
export async function updateProject(
  projectId: string,
  updates: Partial<ProjectRow>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  return { data: data as ProjectRow | null, error }
}

/**
 * Delete project (admin only)
 *
 * Cascades to roles and submissions
 */
export async function deleteProject(projectId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  return { error }
}

// ============================================================================
// ROLE OPERATIONS
// ============================================================================

/**
 * Get all roles
 *
 * @param filters - Optional filters
 * @returns Array of roles
 */
export async function getRoles(filters?: {
  projectId?: string
  status?: 'open' | 'closed' | 'filled' | 'archived'
  includeProject?: boolean
}) {
  const supabase = createClient()

  let query = supabase
    .from('roles')
    .select(filters?.includeProject ? '*, projects(*)' : '*')
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.projectId) {
    query = query.eq('project_id', filters.projectId)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  return { data: data as RoleRow[] | null, error }
}

/**
 * Get role by ID
 *
 * @param roleId - Role ID
 * @param includeProject - Include project data
 * @returns Role row
 */
export async function getRole(roleId: string, includeProject = false) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('roles')
    .select(includeProject ? '*, projects(*)' : '*')
    .eq('id', roleId)
    .single()

  return { data: data as RoleRow | null, error }
}

/**
 * Get roles for a project
 *
 * @param projectId - Project ID
 * @returns Array of roles
 */
export async function getProjectRoles(projectId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  return { data: data as RoleRow[] | null, error }
}

/**
 * Get open roles (for public casting page)
 *
 * Only returns roles from active, public projects
 */
export async function getOpenRoles() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('roles')
    .select(`
      *,
      projects!inner (*)
    `)
    .eq('status', 'open')
    .eq('projects.status', 'active')
    .eq('projects.is_public', true)
    .order('created_at', { ascending: false })

  return { data: data as any[] | null, error }
}

/**
 * Create role (admin only)
 *
 * @param roleData - Role data
 * @returns Created role
 */
export async function createRole(roleData: Partial<RoleRow>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('roles')
    .insert(roleData)
    .select()
    .single()

  return { data: data as RoleRow | null, error }
}

/**
 * Update role (admin only)
 *
 * @param roleId - Role ID
 * @param updates - Fields to update
 * @returns Updated role
 */
export async function updateRole(
  roleId: string,
  updates: Partial<RoleRow>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('roles')
    .update(updates)
    .eq('id', roleId)
    .select()
    .single()

  return { data: data as RoleRow | null, error }
}

/**
 * Delete role (admin only)
 *
 * Cascades to submissions
 */
export async function deleteRole(roleId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId)

  return { error }
}

/**
 * Archive role (admin only)
 *
 * Updates status to 'archived'
 */
export async function archiveRole(roleId: string) {
  return updateRole(roleId, { status: 'archived' })
}

/**
 * Close role (admin only)
 *
 * Updates status to 'closed'
 */
export async function closeRole(roleId: string) {
  return updateRole(roleId, { status: 'closed' })
}

/**
 * Mark role as filled (admin only)
 *
 * Updates status to 'filled' and increments positions_filled
 */
export async function markRoleFilled(roleId: string) {
  const supabase = createClient()

  // Get current role
  const { data: role, error: fetchError } = await getRole(roleId)

  if (fetchError || !role) {
    return { data: null, error: fetchError }
  }

  // Update status and filled count
  return updateRole(roleId, {
    status: 'filled',
    positions_filled: (role.positions_filled || 0) + 1,
  })
}

/**
 * Get role submission count
 *
 * @param roleId - Role ID
 * @returns Number of submissions for this role
 */
export async function getRoleSubmissionCount(roleId: string): Promise<number> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('role_id', roleId)

  return count || 0
}
