"use client";

import { useAuth } from "@/contexts/AuthContext";

/**
 * Admin Layout - Initial Loading Gate Only
 *
 * Authentication and authorization are handled entirely by middleware.ts
 * which runs server-side on every request to /admin/* routes.
 *
 * This layout ONLY gates on the initial `loading` state from AuthContext.
 * Once auth has resolved (loading=false), children always render.
 *
 * WHY WE DON'T GATE ON !user OR !isAdmin:
 * Supabase's onAuthStateChange can fire TOKEN_REFRESHED events during
 * client-side navigation. If loadUserData() fails during that re-fetch
 * (RLS timing, network blip), userData gets set to null, isAdmin becomes
 * false, and the layout would show a permanent spinner. The middleware
 * already validates admin role server-side, so the client doesn't need to.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  // Only gate on initial auth loading - middleware handles authorization
  if (loading) {
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
