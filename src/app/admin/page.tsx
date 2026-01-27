"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin");
    }
  }, [loading, user, isAdmin, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

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

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-100 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </Button>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold text-secondary mb-4"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Admin{" "}
            <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p
            className="text-base text-secondary-light"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Manage casting projects and review submissions
          </p>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Casting Management Card */}
          <Link href="/admin/casting">
            <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-8 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold text-secondary"
                  style={{ fontFamily: "var(--font-galindo)" }}
                >
                  Casting Management
                </h2>
              </div>
              <p
                className="text-secondary-light mb-4"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Create and manage casting projects, roles, and booking status
              </p>
              <div className="flex items-center text-accent font-semibold group-hover:translate-x-2 transition-transform">
                Manage Projects →
              </div>
            </div>
          </Link>

          {/* Submissions Review Card */}
          <Link href="/admin/submissions">
            <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-8 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold text-secondary"
                  style={{ fontFamily: "var(--font-galindo)" }}
                >
                  Review Submissions
                </h2>
              </div>
              <p
                className="text-secondary-light mb-4"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Review talent submissions, view profiles, and update status
              </p>
              <div className="flex items-center text-accent font-semibold group-hover:translate-x-2 transition-transform">
                Review Submissions →
              </div>
            </div>
          </Link>

          {/* Talent Database Card */}
          <Link href="/admin/talent">
            <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-8 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold text-secondary"
                  style={{ fontFamily: "var(--font-galindo)" }}
                >
                  Talent Database
                </h2>
              </div>
              <p
                className="text-secondary-light mb-4"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Search and filter all talent profiles with advanced criteria
              </p>
              <div className="flex items-center text-accent font-semibold group-hover:translate-x-2 transition-transform">
                View All Talent →
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats (Optional - can add later) */}
        <div className="mt-8 bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent/30 shadow-[0_0_20px_rgba(95,101,196,0.1)]">
          <h3
            className="text-lg font-bold text-secondary mb-4"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/casting?action=new-project"
              className="p-4 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors text-center"
            >
              <p className="text-accent font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                + New Project
              </p>
            </Link>
            <Link
              href="/admin/casting?action=new-role"
              className="p-4 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors text-center"
            >
              <p className="text-accent font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                + New Role
              </p>
            </Link>
            <Link
              href="/admin/submissions?filter=pending"
              className="p-4 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors text-center"
            >
              <p className="text-accent font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                View Pending
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
