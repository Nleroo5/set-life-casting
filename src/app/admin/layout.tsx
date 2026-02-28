"use client";

import { useAuth } from "@/contexts/AuthContext";

/**
 * Admin Layout - Loading Gate Only
 *
 * Authentication and authorization are handled entirely by middleware.ts
 * which runs server-side on every request to /admin/* routes.
 *
 * This layout ONLY shows a loading spinner while the client-side
 * AuthContext resolves, preventing a flash of unauthenticated content.
 *
 * WHY NO CLIENT-SIDE REDIRECTS:
 * Next.js remounts all client components (including layouts) when
 * navigating between dynamic segments (e.g., /admin/talent → /admin/talent/[userId]).
 * This resets all useRef values and re-fires all useEffect hooks, causing
 * race conditions with auth state that trigger false redirects.
 * See: https://github.com/vercel/next.js/issues/49553
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();

  // Show loading spinner until auth context has resolved
  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
          <p
            className="mt-4 text-lg text-secondary"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
