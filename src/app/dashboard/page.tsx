"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, query, where, getDocs, orderBy, doc, getDoc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase/auth";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import EmailVerificationBanner from "@/components/ui/EmailVerificationBanner";
import { logger } from "@/lib/logger";

interface Submission {
  id: string;
  roleName: string;
  projectTitle: string;
  status: "pending" | "reviewed" | "selected" | "rejected";
  submittedAt: Date;
}

interface UserProfile {
  basicInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
  };
  appearance?: {
    height?: string;
    weight?: number;
    hairColor?: string;
    eyeColor?: string;
  };
  photos?: {
    photos?: Array<{ url: string; type: string }>;
  } | Array<{ url: string; type: string }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/dashboard");
    } else if (!authLoading && user && isAdmin) {
      // Redirect admins to admin dashboard
      router.push("/admin");
    } else if (user && !isAdmin && !authLoading && !hasFetched) {
      fetchUserData();
      fetchPastBookings();
    }
  }, [authLoading, user, isAdmin, hasFetched]);

  async function fetchUserData() {
    if (!user || hasFetched) return;
    setHasFetched(true);

    try {
      // Fetch submissions
      const submissionsRef = collection(db, "submissions");
      const q = query(
        submissionsRef,
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);

      const submissionsData: Submission[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Only show submissions for active roles (not archived with project or individually)
        if (!data.archivedWithProject && !data.archivedIndividually) {
          submissionsData.push({
            id: doc.id,
            roleName: data.roleName,
            projectTitle: data.projectTitle,
            status: data.status,
            submittedAt: data.submittedAt.toDate(),
          });
        }
      });
      setSubmissions(submissionsData);

      // Fetch profile
      const profileDoc = await getDoc(doc(db, "profiles", user.uid));
      if (profileDoc.exists()) {
        const profileData = profileDoc.data() as UserProfile;
        setProfile(profileData);
      } else {
        // No profile found - redirect to create profile
        router.push("/profile/create");
        return;
      }
    } catch (error) {
      logger.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPastBookings() {
    if (!user) return;

    try {
      const bookingsRef = collection(db, "bookings");
      const q = query(
        bookingsRef,
        where("userId", "==", user.uid),
        where("archivedWithProject", "==", true),
        orderBy("updatedAt", "desc"),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const bookings: Array<{
        id: string;
        roleName: string;
        projectTitle: string;
        updatedAt: Date | undefined;
      }> = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          roleName: data.roleName,
          projectTitle: data.projectTitle,
          updatedAt: data.updatedAt?.toDate(),
        });
      });

      setPastBookings(bookings);
    } catch (error) {
      logger.error("Error fetching past bookings:", error);
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      logger.error("Sign out error:", error);
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "success" | "warning" | "danger" => {
    switch (status) {
      case "selected":
        return "success";
      default:
        return "default"; // Show all non-selected as default (pending style)
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "selected":
        return "Selected";
      default:
        return "Pending Review"; // Show all non-selected as pending
    }
  };

  if (authLoading || loading) {
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-100 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold text-secondary mb-2"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              Welcome Back,{" "}
              <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {profile?.basicInfo?.firstName || user.displayName || "Talent"}
              </span>
            </h1>
            <p
              className="text-base text-secondary-light"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Manage your profile and track your submissions
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
              <h2
                className="text-xl font-bold text-secondary mb-4"
                style={{ fontFamily: "var(--font-galindo)" }}
              >
                Your Profile
              </h2>

              {profile ? (
                <div className="space-y-4">
                  {/* Profile Photo - Headshot */}
                  {(() => {
                    // Handle both nested and direct array structure
                    const photoArray = Array.isArray(profile.photos)
                      ? profile.photos
                      : profile.photos?.photos;

                    if (photoArray && photoArray.length > 0) {
                      const headshotPhoto = photoArray.find((photo) => photo.type === "headshot");
                      const photoUrl = headshotPhoto?.url || photoArray[0]?.url;

                      return (
                        <div className="flex justify-center mb-6">
                          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-accent shadow-lg">
                            <Image
                              src={photoUrl}
                              alt="Headshot"
                              fill
                              sizes="160px"
                              className="object-cover"
                              priority
                            />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Profile Info */}
                  <div className="space-y-2 text-sm" style={{ fontFamily: "var(--font-outfit)" }}>
                    {profile.basicInfo?.email && (
                      <div>
                        <span className="text-secondary-light">Email:</span>
                        <p className="text-secondary font-medium">{profile.basicInfo.email}</p>
                      </div>
                    )}
                    {profile.basicInfo?.phone && (
                      <div>
                        <span className="text-secondary-light">Phone:</span>
                        <p className="text-secondary font-medium">{profile.basicInfo.phone}</p>
                      </div>
                    )}
                    {profile.basicInfo?.city && profile.basicInfo?.state && (
                      <div>
                        <span className="text-secondary-light">Location:</span>
                        <p className="text-secondary font-medium">
                          {profile.basicInfo.city}, {profile.basicInfo.state}
                        </p>
                      </div>
                    )}
                    {profile.appearance?.height && (
                      <div>
                        <span className="text-secondary-light">Height:</span>
                        <p className="text-secondary font-medium">{profile.appearance.height}</p>
                      </div>
                    )}
                    {profile.appearance?.hairColor && (
                      <div>
                        <span className="text-secondary-light">Hair:</span>
                        <p className="text-secondary font-medium">{profile.appearance.hairColor}</p>
                      </div>
                    )}
                    {profile.appearance?.eyeColor && (
                      <div>
                        <span className="text-secondary-light">Eyes:</span>
                        <p className="text-secondary font-medium">{profile.appearance.eyeColor}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Link href="/profile/create" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Edit Profile
                      </Button>
                    </Link>
                    <Link href="/casting" className="flex-1">
                      <Button variant="primary" className="w-full">
                        Browse Roles
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-secondary-light mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
                    You haven&apos;t completed your profile yet
                  </p>
                  <Link href="/casting">
                    <Button variant="primary">
                      Complete Your Profile
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Submissions List */}
          <div className="lg:col-span-2">
            <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
              <h2
                className="text-xl font-bold text-secondary mb-6"
                style={{ fontFamily: "var(--font-galindo)" }}
              >
                Your Submissions
              </h2>

              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-secondary-light/30"
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
                  <p
                    className="text-secondary-light mb-4"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    You haven&apos;t submitted for any roles yet
                  </p>
                  <Link href="/casting">
                    <Button variant="primary">
                      Browse Available Roles
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="bg-white border-2 border-accent/20 rounded-xl p-5 hover:border-accent/40 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <h3
                            className="text-lg font-semibold text-secondary mb-1"
                            style={{ fontFamily: "var(--font-galindo)" }}
                          >
                            {submission.roleName}
                          </h3>
                          <p
                            className="text-sm text-secondary-light mb-2"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            {submission.projectTitle}
                          </p>
                          <p
                            className="text-xs text-secondary-light"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            Submitted: {submission.submittedAt.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <Badge variant={getStatusBadgeVariant(submission.status)}>
                            {getStatusLabel(submission.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Past Work Section */}
        <div className="mt-6">
          <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
            <h2
              className="text-xl font-bold text-secondary mb-6"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              Past Work
            </h2>

            {pastBookings.length === 0 ? (
              <div className="text-center py-8">
                <p
                  className="text-secondary-light"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  No past work yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white border-2 border-accent/20 rounded-xl p-4"
                  >
                    <h3
                      className="text-lg font-semibold text-secondary mb-1"
                      style={{ fontFamily: "var(--font-galindo)" }}
                    >
                      {booking.roleName}
                    </h3>
                    <p
                      className="text-base text-secondary-light mb-1"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      {booking.projectTitle}
                    </p>
                    <p
                      className="text-sm text-secondary-light"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      {booking.updatedAt?.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short"
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
