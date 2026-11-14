import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { validateRedirectUrl } from '@/lib/utils/redirect'

/**
 * Auth Callback Route
 *
 * Handles the PKCE code exchange for Supabase auth flows:
 * - Email verification after signup
 * - Password reset links
 *
 * Two link styles are accepted:
 *   - `token_hash` + `type` (email templates using {{ .TokenHash }}): verified
 *     server-side, works on any device.
 *   - `code` (PKCE): only works in the browser that started the flow, because
 *     the code verifier lives in that browser's cookie.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  // Email verification links carry no `next`; send those to the dashboard,
  // which forwards a new talent on to profile creation.
  const next = validateRedirectUrl(searchParams.get('next'), '/dashboard')

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  } else if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to the intended destination
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Supabase only issues a code after it has checked the emailed link, so
    // the link was valid (and for a signup link the email is now verified).
    // The exchange fails when the link is opened in a different browser or
    // device from the one that started the flow, because the PKCE verifier
    // lives in that browser's cookie. Say that, rather than "invalid link".
    const notice = next === '/auth/reset-password' ? 'reset_other_browser' : 'email_verified'
    return NextResponse.redirect(`${origin}/login?notice=${notice}`)
  }

  // No usable code or token (expired, already used, or malformed link)
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
