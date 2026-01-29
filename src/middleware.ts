import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect admin routes and API endpoints
 *
 * SECURITY: This middleware provides server-side protection for admin routes.
 * It verifies authentication and authorization before allowing access.
 *
 * Note: Firebase Admin SDK doesn't work in Edge Runtime, so we use an
 * API route for token verification. For production, consider moving to
 * Node.js runtime or using session cookies with server-side validation.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Get Firebase ID token from cookie or Authorization header
    const firebaseToken =
      request.cookies.get('firebase-token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    // If no token, redirect to login
    if (!firebaseToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token and admin role via API endpoint
      // This runs in Node.js runtime where Firebase Admin SDK works
      const verifyUrl = new URL('/api/auth/verify-admin', request.url);
      const verifyResponse = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: firebaseToken }),
      });

      const { isValid, isAdmin } = await verifyResponse.json();

      // If not valid or not admin, return 403
      if (!isValid || !isAdmin) {
        return new NextResponse(
          JSON.stringify({
            error: 'Forbidden',
            message: 'You do not have permission to access this resource.',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // User is authenticated and authorized - allow access
      const response = NextResponse.next();

      // Add security headers
      response.headers.set('X-Frame-Options', 'SAMEORIGIN');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
      response.headers.set('X-Admin-Verified', 'true');

      return response;
    } catch (error) {
      console.error('Admin verification error:', error);

      // On error, redirect to login for safety
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'auth-failed');
      return NextResponse.redirect(loginUrl);
    }
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
