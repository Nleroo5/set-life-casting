"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (loading) return;

    // Not authenticated
    if (!user) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    // Wait for userData to load before checking admin status
    if (!userData) return;

    // Authenticated but not admin
    if (!isAdmin) {
      router.push("/");
      return;
    }
  }, [loading, user, userData, isAdmin, router]);

  // Show loading spinner until auth is fully resolved
  if (loading || !user || !userData || !isAdmin) {
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
