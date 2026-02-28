import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Auth Callback Route
 *
 * Handles the PKCE code exchange for Supabase auth flows:
 * - Email verification after signup
 * - Password reset links
 *
 * Supabase redirects here with a `code` query parameter.
 * We exchange it for a session, then redirect to the intended page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to the intended destination
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If no code or exchange failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
