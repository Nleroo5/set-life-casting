import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware to protect admin routes
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes - redirect to login if not authenticated
  // Note: This is basic protection. Full authorization happens client-side
  // because we're using Firebase Auth which is client-based.
  // For true server-side protection, you'd need Firebase Admin SDK
  if (pathname.startsWith('/admin')) {
    // Check if user has a session cookie (you'd set this on login)
    const sessionCookie = request.cookies.get('session');

    // For now, we rely on client-side auth checks in each admin page
    // This middleware primarily adds security headers
    const response = NextResponse.next();

    // Add security headers
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    return response;
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
