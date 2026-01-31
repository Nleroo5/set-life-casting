"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { logger } from "@/lib/logger";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    logger.debug("AdminPage: Auth check triggered", {
      loading,
      hasUser: !!user,
      isAdmin,
      userId: user?.uid,
    });

    if (!loading && (!user || !isAdmin)) {
      logger.warn("AdminPage: User not authorized, redirecting to login", {
        hasUser: !!user,
        isAdmin,
        redirectUrl: "/login?redirect=/admin",
      });
      router.push("/login?redirect=/admin");
    } else if (!loading && user && isAdmin) {
      logger.debug("AdminPage: User authorized, showing admin dashboard", {
        userId: user.uid,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, isAdmin]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } catch (error) {
      logger.error("Logout error:", error);
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

          {/* Export Skins Card */}
          <Link href="/admin/skins">
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold text-secondary"
                  style={{ fontFamily: "var(--font-galindo)" }}
                >
                  Export Skins
                </h2>
              </div>
              <p
                className="text-secondary-light mb-4"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Generate formatted skins for production with selected talent
              </p>
              <div className="flex items-center text-accent font-semibold group-hover:translate-x-2 transition-transform">
                Export Skins →
              </div>
            </div>
          </Link>

          {/* Archive Card */}
          <Link href="/admin/archive">
            <div className="bg-linear-to-br from-white to-gray-50/30 rounded-2xl p-8 border-2 border-gray-300 shadow-[0_0_30px_rgba(100,100,100,0.15)] hover:shadow-[0_0_50px_rgba(100,100,100,0.3)] hover:border-gray-400 transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors">
                  <svg
                    className="w-8 h-8 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold text-secondary"
                  style={{ fontFamily: "var(--font-galindo)" }}
                >
                  Archive
                </h2>
              </div>
              <p
                className="text-secondary-light mb-4"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                View completed projects and historical casting data
              </p>
              <div className="flex items-center text-gray-600 font-semibold group-hover:translate-x-2 transition-transform">
                View Archive →
              </div>
            </div>
          </Link>

          {/* Data Repair Tool Card */}
          <Link href="/admin/repair-data">
            <div className="bg-linear-to-br from-white to-red-50/30 rounded-2xl p-8 border-2 border-red-300 shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:shadow-[0_0_50px_rgba(239,68,68,0.3)] hover:border-red-400 transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold text-secondary"
                  style={{ fontFamily: "var(--font-galindo)" }}
                >
                  Data Repair
                </h2>
              </div>
              <p
                className="text-secondary-light mb-4"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Fix orphaned bookings and submissions after role changes
              </p>
              <div className="flex items-center text-red-600 font-semibold group-hover:translate-x-2 transition-transform">
                Repair Data →
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent/30 shadow-[0_0_20px_rgba(95,101,196,0.1)]">
          <h3
            className="text-lg font-bold text-secondary mb-4"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
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
            <Link
              href="/admin/skins"
              className="p-4 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors text-center"
            >
              <p className="text-accent font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                Export Skins
              </p>
            </Link>
            <Link
              href="/admin/repair-data"
              className="p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors text-center"
            >
              <p className="text-red-600 font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                🔧 Repair Data
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
