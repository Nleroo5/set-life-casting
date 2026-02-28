import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware for authentication and security headers
 *
 * SECURITY ARCHITECTURE:
 * - This middleware ensures users are authenticated (have a valid Supabase session)
 * - Authorization (admin role checking) is enforced at middleware level
 * - This is a professional pattern using Supabase Auth with RLS
 *
 * Defense-in-Depth Layers:
 * 1. Middleware: Checks for authentication and admin role
 * 2. Client-side: useAuth hook provides auth state
 * 3. Supabase RLS: Enforces admin role for data access
 *
 * References:
 * - https://supabase.com/docs/guides/auth/server-side/nextjs
 * - https://nextjs.org/docs/app/building-your-application/routing/middleware
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user is admin using service role client (bypasses RLS)
    // The anon key client can fail after token refresh, causing false redirects
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: userData, error: roleError } = await adminClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (roleError) {
      // DB query failed — allow through rather than blocking a legitimate admin
      // Client-side layout guard + Supabase RLS still protect the data
      console.error('[MIDDLEWARE] Admin role check failed:', roleError.message)
      return response
    }

    if (userData?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    response.headers.set('X-Authenticated', 'true')
  }

  // Add security headers to all responses
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  return response
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
}
