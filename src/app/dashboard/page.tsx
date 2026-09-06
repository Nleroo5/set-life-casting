"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getProfile } from "@/lib/supabase/profiles";
import { getUserSubmissions } from "@/lib/supabase/submissions";
import { getPhotosByUserId } from "@/lib/supabase/photos";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import EmailVerificationBanner from "@/components/ui/EmailVerificationBanner";
import { logger } from "@/lib/logger";

interface Submission {
  id: string;
  roleId: string;
  roleName: string;
  projectId: string;
  projectTitle: string;
  status: "pinned" | "booked" | "rejected" | null;
  submittedAt: any;
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
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  // Set before logout() so the redirect effect below doesn't fire a second
  // navigation to /login once user becomes null.
  const signingOut = useRef(false);

  useEffect(() => {
    if (signingOut.current) return;
    if (!authLoading && !user) {
      router.push("/login?redirect=/dashboard");
    } else if (!authLoading && user && isAdmin) {
      // Redirect admins to admin dashboard
      router.push("/admin");
    } else if (user && !isAdmin && !authLoading && !hasFetched) {
      fetchUserData();
    }
  }, [authLoading, user, isAdmin, hasFetched]);

  async function fetchUserData() {
    if (!user || hasFetched) return;
    setHasFetched(true);
    // Stays true when we hand off to /profile/create so the empty dashboard
    // never paints before the navigation lands.
    let redirecting = false;

    try {
      // Fetch profile from Supabase
      const { data: profileData, error: profileError } = await getProfile(user.id);

      if (profileError) {
        logger.error("Error fetching profile:", profileError);
      }

      if (!profileData || !profileData.basicInfo) {
        // No profile found - redirect to create profile
        redirecting = true;
        router.push("/profile/create");
        return;
      }

      // Fetch photos from photos table
      const { data: photosData, error: photosError } = await getPhotosByUserId(user.id);

      if (photosError) {
        logger.error("Error fetching photos:", photosError);
      }

      // Convert Supabase profile structure to dashboard UserProfile interface
      setProfile({
        basicInfo: profileData.basicInfo,
        appearance: {
          height: profileData.appearance?.height,
          weight: profileData.appearance?.weight,
          hairColor: profileData.appearance?.hairColor,
          eyeColor: profileData.appearance?.eyeColor,
        },
        photos: {
          photos: photosData?.map(photo => ({
            url: photo.url,
            type: photo.type
          })) || []
        }
      });

      // Fetch submissions from Supabase
      const { data: submissionsData, error: submissionsError } = await getUserSubmissions(user.id);

      if (submissionsError) {
        logger.error("Error fetching submissions:", submissionsError);
        setSubmissions([]);
      } else if (submissionsData) {
        // getUserSubmissions already joins roles(title) and projects(title)
        const mappedSubmissions: Submission[] = submissionsData.map((submission: any) => ({
          id: submission.id,
          roleId: submission.role_id,
          projectId: submission.project_id,
          roleName: submission.roles?.title || 'Unknown Role',
          projectTitle: submission.projects?.title || 'Unknown Project',
          status: submission.status,
          submittedAt: new Date(submission.submitted_at),
        }));

        setSubmissions(mappedSubmissions);

        // Past work = submissions the admin marked as booked
        setPastBookings(
          submissionsData
            .filter((s) => s.status === "booked")
            .map((s) => ({
              id: s.id,
              roleName: s.roles?.title || "Unknown Role",
              projectTitle: s.projects?.title || "Unknown Project",
              updatedAt: new Date(s.booked_at || s.updated_at || s.submitted_at),
            }))
        );
      }
    } catch (error) {
      logger.error("Error fetching user data:", error);
    } finally {
      if (!redirecting) setLoading(false);
    }
  }

  const handleSignOut = async () => {
    signingOut.current = true;
    try {
      await logout();
      router.push("/");
    } catch (error) {
      signingOut.current = false;
      logger.error("Sign out error:", error);
    }
  };

  const getStatusBadgeVariant = (status: string | null): "default" | "success" => {
    return status === "booked" ? "success" : "default";
  };

  const getStatusLabel = (status: string | null): string => {
    switch (status) {
      case "booked":
        return "Booked";
      case "rejected":
        return "Not Selected";
      default:
        return "Under Review"; // For pinned, new, or any other status
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
                {profile?.basicInfo?.firstName || user.user_metadata?.full_name || "Talent"}
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
                  <Link href="/profile/create">
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
