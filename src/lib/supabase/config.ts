/**
 * Supabase Browser Client Configuration
 *
 * PURPOSE: Client-side Supabase initialization for React components
 * USAGE: Import and call createClient() in client components
 *
 * IMPORTANT: This is for BROWSER/CLIENT components only
 * For server components/middleware, use server.ts instead
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * USAGE EXAMPLE:
 *
 * 'use client'
 * import { createClient } from '@/lib/supabase/config'
 *
 * export default function MyComponent() {
 *   const supabase = createClient()
 *
 *   async function handleLogin() {
 *     const { data, error } = await supabase.auth.signInWithPassword({
 *       email: 'user@example.com',
 *       password: 'password123'
 *     })
 *   }
 * }
 */
