/**
 * Supabase Admin Client Configuration
 *
 * PURPOSE: Admin operations that bypass Row Level Security (RLS)
 * USAGE: Server-side only - uses service role key
 *
 * ⚠️ WARNING: This client has FULL database access
 * - Bypasses all RLS policies
 * - Can read/write ANY data
 * - Use only when absolutely necessary
 * - Never expose service role key to client
 *
 * WHEN TO USE:
 * - Admin operations (user management)
 * - Background jobs
 * - Data migrations
 * - System-level operations
 *
 * WHEN NOT TO USE:
 * - Regular user operations (use server.ts instead)
 * - Client-side code (NEVER - would expose service role key)
 */

import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * Helper: Get user role from public.users table
 * @param userId - Supabase auth user ID
 * @returns User role ('admin' | 'talent') or null if not found
 */
export async function getUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user role:', error)
    return null
  }

  return data?.role || null
}

/**
 * Helper: Check if user is admin
 * @param userId - Supabase auth user ID
 * @returns true if user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin'
}

/**
 * Helper: Create user record in public.users
 * Called after Supabase Auth signup
 *
 * @param userId - Supabase auth user ID
 * @param email - User email
 * @param role - User role ('admin' | 'talent')
 * @param fullName - User full name
 */
export async function createUserRecord(
  userId: string,
  email: string,
  role: 'admin' | 'talent',
  fullName?: string
) {
  const { error } = await supabaseAdmin
    .from('users')
    .insert({
      id: userId,
      email: email,
      role: role,
      full_name: fullName || null,
    })

  if (error) {
    console.error('Error creating user record:', error)
    throw new Error('Failed to create user record')
  }

  return true
}

/**
 * USAGE EXAMPLE:
 *
 * // Check if user is admin (for middleware):
 * import { isAdmin } from '@/lib/supabase/admin'
 *
 * const userIsAdmin = await isAdmin(user.id)
 * if (!userIsAdmin) {
 *   return redirect('/')
 * }
 *
 * // Create user after signup:
 * import { createUserRecord } from '@/lib/supabase/admin'
 *
 * await createUserRecord(
 *   authUser.id,
 *   authUser.email,
 *   'talent',
 *   'John Doe'
 * )
 */
