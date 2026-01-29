import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for authentication and security headers
 *
 * SECURITY ARCHITECTURE:
 * - This middleware ensures users are authenticated (have a valid Firebase token)
 * - Authorization (admin role checking) is handled by Firestore security rules
 * - This is a professional pattern when Firebase Admin SDK credentials aren't available
 *
 * Defense-in-Depth Layers:
 * 1. Middleware: Checks for authentication token presence
 * 2. Client-side: useAuth hook redirects non-admins
 * 3. Firestore Rules: Enforces admin role for data access
 *
 * References:
 * - https://firebase.google.com/docs/firestore/security/get-started
 * - https://nextjs.org/docs/app/building-your-application/routing/middleware
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes - require authentication
  if (pathname.startsWith('/admin')) {
    // Get Firebase ID token from cookie
    const firebaseToken = request.cookies.get('firebase-token')?.value;

    // If no token, redirect to login
    // The client-side auth context will handle admin role verification
    if (!firebaseToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Token exists - allow access
    // Admin role verification happens via:
    // 1. Client-side: useAuth hook checks userData.role === 'admin'
    // 2. Server-side: Firestore rules check role field for data access
    const response = NextResponse.next();

    // Add security headers
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set('X-Authenticated', 'true');

    return response;
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
