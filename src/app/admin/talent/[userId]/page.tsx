"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Image from "next/image";
import { logger } from "@/lib/logger";
import { getProfile, type ProfileData } from "@/lib/supabase/profiles";
import { getUserSubmissions } from "@/lib/supabase/submissions";
import { getRole } from "@/lib/supabase/casting";
import { createClient } from "@/lib/supabase/config";
import { getPhotosByUserId } from "@/lib/supabase/photos";

interface TalentProfile extends ProfileData {
  id: string;
  photos: { photos: Array<{ url: string; type: string }> };
  status?: "active" | "archived";
  adminTag?: "green" | "yellow" | "red" | null;
  adminNotes?: string;
  createdAt: Date;
}

interface Submission {
  id: string;
  roleId: string;
  roleName: string;
  projectId: string;
  projectTitle: string;
  status: "pinned" | "booked" | "rejected" | null;
  submittedAt: Date;
}

export default function TalentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const { user, userData, isAdmin, loading: authLoading } = useAuth();
  const [talent, setTalent] = useState<TalentProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isSavingTag, setIsSavingTag] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState("");
  // ✅ FIX: Calculate age on client-side only to prevent hydration error
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    // DIRECT CONSOLE LOG - BYPASS LOGGER
    console.log("🔍 TALENT PAGE - Auth flow triggered", {
      authLoading,
      hasUser: !!user,
      userId: user?.id,
      hasUserData: !!userData,
      userRole: userData?.role,
      isAdmin,
      talentProfileId: userId,
    });

    logger.debug("TalentDetailPage: Auth flow triggered", {
      authLoading,
      hasUser: !!user,
      userId: user?.id,
      hasUserData: !!userData,
      userRole: userData?.role,
      isAdmin,
      talentProfileId: userId,
    });

    // Don't do anything while auth is loading
    if (authLoading) {
      logger.debug("TalentDetailPage: Auth still loading, waiting...");
      return;
    }

    // Redirect if not authenticated
    if (!user) {
      logger.warn("TalentDetailPage: No authenticated user, redirecting to login", {
        redirectUrl: `/login?redirect=/admin/talent/${userId}`,
      });
      router.push(`/login?redirect=/admin/talent/${userId}`);
      return;
    }

    // Wait for userData to load before checking isAdmin
    // This prevents false negative when userData is still being fetched
    if (!userData) {
      logger.debug("TalentDetailPage: User authenticated but userData not loaded yet, waiting for Supabase...", {
        userId: user.id,
        email: user.email,
      });
      // userData is still loading from Supabase, wait
      return;
    }

    // Redirect if not admin (now safe to check since userData exists)
    if (!isAdmin) {
      console.warn("⚠️ TALENT PAGE - NOT ADMIN! Redirecting to /admin", {
        userId: user.id,
        userRole: userData.role,
        redirectUrl: "/admin",
      });
      logger.warn("TalentDetailPage: User is not admin, redirecting to /admin", {
        userId: user.id,
        userRole: userData.role,
        redirectUrl: "/admin",
      });
      router.push("/admin");
      return;
    }

    // Fetch data
    logger.debug("TalentDetailPage: Auth complete, fetching talent data", {
      userId: user.id,
      isAdmin: true,
      talentProfileId: userId,
    });
    fetchTalentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, userData, isAdmin, userId]);

  // ✅ FIX: Calculate age on client-side only to prevent hydration mismatch
  // This useEffect runs AFTER hydration, ensuring server/client HTML match
  useEffect(() => {
    if (talent?.appearance?.dateOfBirth) {
      const calculatedAge = calculateAge(talent.appearance.dateOfBirth);
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  }, [talent]); // Recalculate when talent data changes

  async function fetchTalentData() {
    try {
      logger.debug("TalentDetailPage: Starting talent data fetch", { userId });
      setLoading(true);

      // Fetch talent profile from Supabase
      const { data: profileData, error: profileError } = await getProfile(userId);

      if (profileError) {
        logger.error("TalentDetailPage: Error fetching profile", {
          userId,
          error: profileError,
        });
        setTalent(null);
      } else if (profileData) {
        logger.debug("TalentDetailPage: Profile found", {
          userId,
          hasBasicInfo: !!profileData.basicInfo,
          hasAppearance: !!profileData.appearance,
        });

        // Validate critical data before setting talent
        if (!profileData.basicInfo || !profileData.appearance) {
          logger.error("TalentDetailPage: Profile missing critical data", {
            userId,
            hasBasicInfo: !!profileData.basicInfo,
            hasAppearance: !!profileData.appearance,
          });
          setTalent(null);
        } else {
          logger.debug("TalentDetailPage: Profile data validated successfully", {
            userId,
            name: `${profileData.basicInfo.firstName} ${profileData.basicInfo.lastName}`,
          });

          // Get admin-specific fields from profiles table (admin RLS policy allows this)
          const supabase = createClient();
          const { data: adminData } = await supabase
            .from('profiles')
            .select('status, admin_tag, admin_notes, created_at')
            .eq('user_id', userId)
            .single();

          // Fetch photos for this talent
          const { data: photosData } = await getPhotosByUserId(userId);

          setTalent({
            id: userId,
            ...profileData,
            photos: {
              photos: (photosData || []).map(p => ({ url: p.url, type: p.type }))
            },
            createdAt: adminData?.created_at ? new Date(adminData.created_at) : new Date(),
            status: (adminData?.status as "active" | "archived") || "active",
            adminTag: adminData?.admin_tag as "green" | "yellow" | "red" | null,
            adminNotes: adminData?.admin_notes || undefined,
          } as TalentProfile);
        }
      } else {
        logger.warn("TalentDetailPage: Profile not found in Supabase", {
          userId,
        });
        setTalent(null);
      }

      // Fetch submissions from Supabase
      const { data: submissionsData, error: submissionsError } = await getUserSubmissions(userId);

      if (submissionsError) {
        logger.error("TalentDetailPage: Error fetching submissions", {
          userId,
          error: submissionsError,
        });
        setSubmissions([]);
      } else if (submissionsData) {
        // Map submissions data to match the Submission interface
        const mappedSubmissions: Submission[] = await Promise.all(
          submissionsData.map(async (submission: any) => {
            // Fetch role data to get roleName and projectTitle
            const { data: roleData } = await getRole(submission.role_id, true);

            return {
              id: submission.id,
              roleId: submission.role_id,
              projectId: submission.project_id,
              roleName: roleData?.title || 'Unknown Role',
              projectTitle: (roleData as any)?.projects?.title || 'Unknown Project',
              status: submission.status,
              submittedAt: new Date(submission.submitted_at),
            };
          })
        );

        logger.debug("TalentDetailPage: Submissions fetched", {
          userId,
          submissionCount: mappedSubmissions.length,
        });
        setSubmissions(mappedSubmissions);
      }
    } catch (error) {
      logger.error("TalentDetailPage: Error fetching talent data", {
        userId,
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      setTalent(null);
    } finally {
      setLoading(false);
      logger.debug("TalentDetailPage: Data fetch complete", { userId });
    }
  }

  async function handleArchiveToggle() {
    if (!talent) return;

    const newStatus = talent.status === "active" ? "archived" : "active";
    const confirmMessage =
      newStatus === "archived"
        ? "Are you sure you want to archive this profile? It will be hidden from the active talent list."
        : "Are you sure you want to unarchive this profile? It will be visible in the active talent list.";

    if (!confirm(confirmMessage)) return;

    setIsArchiving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      setTalent({
        ...talent,
        status: newStatus,
      });

      alert(
        newStatus === "archived"
          ? "Profile archived successfully"
          : "Profile unarchived successfully"
      );
    } catch (error) {
      logger.error("Error updating profile status:", error);
      alert("Failed to update profile status. Please try again.");
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleTagUpdate(tag: "green" | "yellow" | "red" | null) {
    if (!talent) return;

    setIsSavingTag(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ admin_tag: tag })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      setTalent({
        ...talent,
        adminTag: tag,
      });
    } catch (error) {
      logger.error("Error updating tag:", error);
      alert("Failed to update tag. Please try again.");
    } finally {
      setIsSavingTag(false);
    }
  }

  async function handleNotesUpdate() {
    if (!talent) return;

    setIsSavingTag(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ admin_notes: tempNotes })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      setTalent({
        ...talent,
        adminNotes: tempNotes,
      });

      setEditingNotes(false);
    } catch (error) {
      logger.error("Error updating notes:", error);
      alert("Failed to update notes. Please try again.");
    } finally {
      setIsSavingTag(false);
    }
  }

  function startEditingNotes() {
    setTempNotes(talent?.adminNotes || "");
    setEditingNotes(true);
  }

  function cancelEditingNotes() {
    setTempNotes("");
    setEditingNotes(false);
  }

  function calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const getStatusBadgeVariant = (
    status: string | null
  ): "default" | "success" | "warning" | "danger" => {
    switch (status) {
      case "booked":
        return "success";
      case "pinned":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string | null): string => {
    switch (status) {
      case "pinned":
        return "Pinned";
      case "booked":
        return "Booked";
      case "rejected":
        return "Rejected";
      default:
        return "New";
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
            Loading talent profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !userData || !isAdmin || !talent) {
    console.warn("🚫 RENDER GUARD - Showing not found screen", {
      hasUser: !!user,
      hasUserData: !!userData,
      isAdmin,
      hasTalent: !!talent,
      reason: !user
        ? "no_user"
        : !userData
        ? "no_userData"
        : !isAdmin
        ? "not_admin"
        : "no_talent",
    });
    logger.warn("TalentDetailPage: Render guard triggered - showing 'not found' screen", {
      hasUser: !!user,
      hasUserData: !!userData,
      isAdmin,
      hasTalent: !!talent,
      reason: !user
        ? "no_user"
        : !userData
        ? "no_userData"
        : !isAdmin
        ? "not_admin"
        : "no_talent",
    });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p
            className="text-lg text-secondary-light"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Talent profile not found
          </p>
          <Link href="/admin/talent" className="mt-4 inline-block">
            <Button variant="primary">Back to Talent Database</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Age is now calculated client-side in useEffect above (line ~153)
  // This prevents hydration mismatch errors from new Date()

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
              {talent.basicInfo?.firstName || 'Unknown'}{" "}
              <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {talent.basicInfo?.lastName || ''}
              </span>
            </h1>
            <p
              className="text-base text-secondary-light"
              style={{ fontFamily: "var(--font-outfit)" }}
              suppressHydrationWarning={true}
            >
              {talent.appearance?.gender || 'N/A'} {age !== null && `• ${age} years old`} •{" "}
              {talent.basicInfo?.city || 'Unknown'}, {talent.basicInfo?.state || ''}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={talent.status === "active" ? "outline" : "primary"}
              onClick={handleArchiveToggle}
              disabled={isArchiving}
            >
              {isArchiving
                ? "Processing..."
                : talent.status === "active"
                ? "Archive Profile"
                : "Unarchive Profile"}
            </Button>
            <Link href="/admin/talent">
              <Button variant="outline">Back to Database</Button>
            </Link>
          </div>
        </div>

        {/* Status Badge */}
        {talent.status === "archived" && (
          <div className="mb-6">
            <Badge variant="danger">Archived Profile</Badge>
          </div>
        )}

        {/* Admin Tags & Notes */}
        <div className="mb-6 bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
          <h2
            className="text-xl font-bold text-secondary mb-4"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Admin Tags & Notes
            <span className="text-sm font-normal text-secondary-light ml-2">
              (Only visible to admins)
            </span>
          </h2>

          {/* Tag Buttons */}
          <div className="mb-4">
            <p
              className="text-sm font-medium text-secondary-light mb-2"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Profile Tag:
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleTagUpdate("green")}
                disabled={isSavingTag}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  talent.adminTag === "green"
                    ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Green
              </button>
              <button
                onClick={() => handleTagUpdate("yellow")}
                disabled={isSavingTag}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  talent.adminTag === "yellow"
                    ? "bg-yellow-500 text-white shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                }`}
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Yellow
              </button>
              <button
                onClick={() => handleTagUpdate("red")}
                disabled={isSavingTag}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  talent.adminTag === "red"
                    ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Red
              </button>
              {talent.adminTag && (
                <button
                  onClick={() => handleTagUpdate(null)}
                  disabled={isSavingTag}
                  className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Clear Tag
                </button>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-sm font-medium text-secondary-light"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Admin Notes:
              </p>
              {!editingNotes && (
                <button
                  onClick={startEditingNotes}
                  className="text-sm text-accent hover:text-accent/80 font-medium"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {talent.adminNotes ? "Edit Notes" : "Add Notes"}
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="Add notes about this talent profile (e.g., preferred for action roles, great communication, etc.)"
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-accent/30 rounded-lg focus:outline-none focus:border-accent transition-colors resize-none"
                  style={{ fontFamily: "var(--font-outfit)" }}
                />
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleNotesUpdate}
                    disabled={isSavingTag}
                  >
                    {isSavingTag ? "Saving..." : "Save Notes"}
                  </Button>
                  <Button variant="outline" onClick={cancelEditingNotes}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-purple-50/50 rounded-lg p-4 min-h-[60px]">
                {talent.adminNotes ? (
                  <p
                    className="text-sm text-secondary whitespace-pre-wrap"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {talent.adminNotes}
                  </p>
                ) : (
                  <p
                    className="text-sm text-secondary-light italic"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    No notes added yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photos */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photos */}
            <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
              <h2
                className="text-xl font-bold text-secondary mb-4"
                style={{ fontFamily: "var(--font-galindo)" }}
              >
                Photos
              </h2>
              <div className="space-y-4">
                {(() => {
                  // Handle both nested and direct array structure
                  const photoArray = Array.isArray(talent.photos)
                    ? talent.photos
                    : (talent.photos as { photos: Array<{ url: string; type: string }> })?.photos;

                  return photoArray && photoArray.length > 0 ? (
                    photoArray.map((photo, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-accent/30"
                    >
                      <Image
                        src={photo.url}
                        alt={`${photo.type} photo`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-accent/90 px-2 py-1">
                        <p
                          className="text-xs text-white text-center capitalize"
                          style={{ fontFamily: "var(--font-outfit)" }}
                        >
                          {photo.type === "fullbody" ? "Full Body" : photo.type}
                        </p>
                      </div>
                    </div>
                    ))
                  ) : (
                    <p
                      className="text-secondary-light text-sm"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      No photos available
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
              <h2
                className="text-xl font-bold text-secondary mb-4"
                style={{ fontFamily: "var(--font-galindo)" }}
              >
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <DetailItem label="Email" value={talent.basicInfo?.email || 'N/A'} />
                <DetailItem label="Phone" value={talent.basicInfo?.phone || 'N/A'} />
                <DetailItem
                  label="Location"
                  value={`${talent.basicInfo?.city || 'Unknown'}, ${talent.basicInfo?.state || ''}`}
                />
                <DetailItem
                  label="Profile Created"
                  value={talent.createdAt?.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) || 'N/A'}
                />
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
              <h2
                className="text-xl font-bold text-secondary mb-4"
                style={{ fontFamily: "var(--font-galindo)" }}
              >
                Appearance
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <DetailItem label="Gender" value={talent.appearance?.gender || 'N/A'} />
                {age !== null && <DetailItem label="Age" value={`${age} years`} />}
                {talent.appearance?.dateOfBirth && (
                  <DetailItem
                    label="Date of Birth"
                    value={new Date(talent.appearance.dateOfBirth).toLocaleDateString()}
                  />
                )}
                <DetailItem
                  label="Ethnicity"
                  value={talent.appearance?.ethnicity?.join(", ") || 'N/A'}
                />
                <DetailItem label="Height" value={talent.appearance?.height || 'N/A'} />
                <DetailItem label="Weight" value={talent.appearance?.weight ? `${talent.appearance.weight} lbs` : 'N/A'} />
                <DetailItem
                  label="Hair"
                  value={talent.appearance?.hairColor && talent.appearance?.hairLength ? `${talent.appearance.hairColor} (${talent.appearance.hairLength})` : 'N/A'}
                />
                <DetailItem label="Eyes" value={talent.appearance?.eyeColor || 'N/A'} />
              </div>
            </div>

            {/* Sizes */}
            <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
              <h2
                className="text-xl font-bold text-secondary mb-4"
                style={{ fontFamily: "var(--font-galindo)" }}
              >
                Sizes
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <DetailItem label="Shirt Size" value={talent.sizes?.shirtSize || 'N/A'} />
                {(talent.sizes?.pantWaist || talent.sizes?.pantInseam) && (
                  <DetailItem
                    label="Pants"
                    value={`Waist: ${talent.sizes?.pantWaist || 'N/A'}" / Inseam: ${talent.sizes?.pantInseam || 'N/A'}"`}
                  />
                )}
                {talent.sizes?.dressSize && (
                  <DetailItem label="Dress Size" value={talent.sizes.dressSize} />
                )}
                {talent.sizes?.jacketSize && (
                  <DetailItem label="Jacket Size" value={talent.sizes.jacketSize} />
                )}
                {talent.sizes?.shoeSize && (
                  <DetailItem
                    label="Shoe Size"
                    value={talent.sizes?.shoeSize || 'N/A'}
                  />
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
              <h2
                className="text-xl font-bold text-secondary mb-4"
                style={{ fontFamily: "var(--font-galindo)" }}
              >
                Additional Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <DetailItem
                  label="Visible Tattoos"
                  value={talent.details?.visibleTattoos ? "Yes" : "No"}
                />
                {talent.details?.visibleTattoos &&
                  talent.details?.tattoosDescription && (
                    <DetailItem
                      label="Tattoos Description"
                      value={talent.details.tattoosDescription}
                    />
                  )}
                {/* Piercings field not currently in schema */}
                <DetailItem label="Facial Hair" value={talent.details?.facialHair || 'N/A'} />
              </div>
            </div>

            {/* Submission History */}
            <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
              <h2
                className="text-xl font-bold text-secondary mb-4"
                style={{ fontFamily: "var(--font-galindo)" }}
              >
                Submission History ({submissions.length})
              </h2>

              {submissions.length === 0 ? (
                <p
                  className="text-secondary-light"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  No submissions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="bg-white border-2 border-accent/20 rounded-xl p-4 hover:border-accent/40 transition-all"
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
                            Submitted:{" "}
                            {submission.submittedAt.toLocaleDateString("en-US", {
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
      </div>
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <dt
        className="text-sm font-medium text-secondary-light mb-1"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {label}:
      </dt>
      <dd
        className="text-base text-secondary"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {value}
      </dd>
    </div>
  );
}
