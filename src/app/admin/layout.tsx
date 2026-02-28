"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  // Once confirmed admin, remember it to prevent false redirects
  // during token refresh (where isAdmin momentarily flips to false)
  const wasAdmin = useRef(false);

  useEffect(() => {
    if (isAdmin) {
      wasAdmin.current = true;
    }
  }, [isAdmin]);

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (loading) return;

    // If admin was previously confirmed and user still exists,
    // don't redirect on transient auth state changes (token refresh)
    if (wasAdmin.current && user) return;

    // Not authenticated
    if (!user) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    // Authenticated but not admin
    if (!isAdmin) {
      router.push("/");
      return;
    }
  }, [loading, user, isAdmin, router]);

  // Show loading spinner until auth is fully resolved
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
