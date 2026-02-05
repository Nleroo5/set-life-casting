"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import Link from "next/link";
import Image from "next/image";
import { logger } from "@/lib/logger";
import { getAllSubmissions, updateSubmissionStatus, bulkUpdateSubmissionStatus } from "@/lib/supabase/submissions";
import { getProjects, getRoles } from "@/lib/supabase/casting";
import { getPhotosByProfileIds } from "@/lib/supabase/photos";

interface ProfileBasicInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  location?: string;
  city?: string;
  state?: string;
}

interface ProfileAppearance {
  gender?: string;
  dateOfBirth?: string;
  ethnicity?: string[];
  height?: string;
  weight?: number;
  hairColor?: string;
  hairLength?: string;
  eyeColor?: string;
}

interface ProfileSizes {
  shirtSize: string;
  pantsWaist: number;
  pantsInseam: number;
  dressSize?: string;
  suitSize?: string;
  shoeSize: string;
  shoeSizeGender: string;
}

interface ProfileDetails {
  visibleTattoos: boolean;
  tattoosDescription?: string;
  piercings?: boolean;
  piercingsDescription?: string;
  facialHair: string;
}

interface ProfilePhoto {
  url: string;
  type: string;
}

interface ProfilePhotos {
  photos: ProfilePhoto[];
}

interface ProfileData {
  basicInfo?: ProfileBasicInfo;
  appearance?: ProfileAppearance;
  sizes?: ProfileSizes;
  details?: ProfileDetails;
  photos?: ProfilePhotos;
}

interface Submission {
  id: string;
  userId: string;
  roleId: string;
  projectId: string;
  roleName: string;
  projectTitle: string;
  status: "pinned" | "booked" | "rejected" | null;
  submittedAt: Date;
  profileData: ProfileData;
}

interface Project {
  id: string;
  title: string;
  type: "film" | "tv" | "commercial" | "music-video" | "event";
  shootDateStart: string;
  shootDateEnd: string;
  status: "booking" | "booked" | "archived";
}

interface Role {
  id: string;
  projectId: string;
  name: string;
  requirements: string;
  rate: string;
  date: string;
  location: string;
  bookingStatus: "booking" | "booked";
}

interface RoleWithSubmissions {
  role: Role;
  submissions: Submission[];
}

type FilterStatus = "all" | "new" | "pinned" | "booked" | "rejected";

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin/submissions");
    } else if (user && isAdmin) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isAdmin]);

  async function fetchData() {
    try {
      setLoading(true);

      // ✅ FIX: Fetch projects and roles ONCE (not N times inside loop)
      const { data: projectsData, error: projectsError } = await getProjects();
      if (projectsError) {
        logger.error("Error fetching projects:", projectsError);
        setProjects([]);
      } else if (projectsData) {
        setProjects(projectsData.map((p: any) => ({
          id: p.id,
          title: p.title,
          type: p.type,
          shootDateStart: p.shoot_date_start || '',
          shootDateEnd: p.shoot_date_end || '',
          status: p.status,
        })) as Project[]);
      }

      const { data: rolesData, error: rolesError } = await getRoles();
      if (rolesError) {
        logger.error("Error fetching roles:", rolesError);
        setRoles([]);
      } else if (rolesData) {
        setRoles(rolesData.map((r: any) => ({
          id: r.id,
          projectId: r.project_id,
          name: r.title,
          requirements: r.requirements || '',
          rate: r.rate || '',
          date: r.shoot_date || '',
          location: r.location || '',
          bookingStatus: r.booking_status || 'booking',
        })) as Role[]);
      }

      // ✅ FIX: Fetch all submissions with profile data (single query with JOIN)
      const { data: submissionsData, error: submissionsError } = await getAllSubmissions({
        orderBy: 'submitted_at',
        order: 'desc',
      });

      if (submissionsError) {
        logger.error("Error fetching submissions:", submissionsError);
        setSubmissions([]);
      } else if (submissionsData && submissionsData.length > 0) {
        // ✅ FIX: Batch fetch photos for ALL profiles (1 query instead of N)
        const profileIds = submissionsData
          .map((sub: any) => sub.profile_id)
          .filter(Boolean);

        const { data: photosMap } = await getPhotosByProfileIds(profileIds);

        // ✅ FIX: Map data in-memory (no more database queries)
        const mapped = submissionsData
          .filter((sub: any) => sub.profiles && sub.profiles.first_name) // Skip invalid profiles
          .map((sub: any) => {
            // Find role and project from already-fetched data
            const role = rolesData?.find((r: any) => r.id === sub.role_id);
            const project = projectsData?.find((p: any) => p.id === sub.project_id);

            // Get photos for this profile from batch-fetched map
            const photos = photosMap?.[sub.profile_id] || [];

            return {
              id: sub.id,
              userId: sub.user_id,
              roleId: sub.role_id,
              projectId: sub.project_id,
              roleName: role?.title || 'Unknown Role',
              projectTitle: project?.title || 'Unknown Project',
              status: sub.status,
              submittedAt: new Date(sub.submitted_at),
              profileData: {
                basicInfo: {
                  firstName: sub.profiles.first_name || '',
                  lastName: sub.profiles.last_name || '',
                  email: sub.profiles.email || '',
                  phone: sub.profiles.phone || '',
                  city: sub.profiles.city || '',
                  state: sub.profiles.state || '',
                },
                appearance: {
                  gender: sub.profiles.gender || '',
                  dateOfBirth: sub.profiles.date_of_birth || '',
                  ethnicity: sub.profiles.ethnicity ? [sub.profiles.ethnicity] : [],
                  height: sub.profiles.height_feet && sub.profiles.height_inches
                    ? `${sub.profiles.height_feet}'${sub.profiles.height_inches}"`
                    : '',
                  weight: sub.profiles.weight || 0,
                  hairColor: sub.profiles.hair_color || '',
                  hairLength: '',
                  eyeColor: sub.profiles.eye_color || '',
                },
                sizes: {
                  shirtSize: '',
                  pantsWaist: 0,
                  pantsInseam: 0,
                  shoeSize: '',
                  shoeSizeGender: '',
                },
                details: {
                  visibleTattoos: false,
                  facialHair: '',
                },
                photos: {
                  photos: photos.map(photo => ({
                    url: photo.url,
                    type: photo.type,
                  })),
                },
              },
            } as Submission;
          });

        setSubmissions(mapped);
        logger.debug(`✅ Loaded ${mapped.length} submissions with optimized queries`);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      logger.error("Error fetching data:", error);
      setSubmissions([]);
      setProjects([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string | undefined): number | null => {
    if (!dateOfBirth) return null;
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  // Filter submissions based on selected project, status, and search query
  const filteredSubmissions = submissions
    .filter((submission) => {
      const projectMatch = selectedProjectId === "all" || submission.projectId === selectedProjectId;

      // Status filter logic
      let statusMatch = true;
      if (filterStatus === "new") {
        statusMatch = submission.status === null;
      } else if (filterStatus !== "all") {
        statusMatch = submission.status === filterStatus;
      }

      // Search filter: search by name, email, location
      let searchMatch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const firstName = submission.profileData.basicInfo?.firstName?.toLowerCase() || '';
        const lastName = submission.profileData.basicInfo?.lastName?.toLowerCase() || '';
        const email = submission.profileData.basicInfo?.email?.toLowerCase() || '';
        const city = submission.profileData.basicInfo?.city?.toLowerCase() || '';
        const state = submission.profileData.basicInfo?.state?.toLowerCase() || '';
        const location = `${city} ${state}`.trim();

        searchMatch =
          firstName.includes(query) ||
          lastName.includes(query) ||
          `${firstName} ${lastName}`.includes(query) ||
          email.includes(query) ||
          location.includes(query);
      }

      return projectMatch && statusMatch && searchMatch;
    })
    // Sort by submission date (newest first)
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

  // Get projects that have submissions
  const projectsWithSubmissions = projects.filter((project) =>
    submissions.some((sub) => sub.projectId === project.id)
  );

  // Get roles for the selected project and organize submissions by role
  const rolesForSelectedProject = selectedProjectId === "all"
    ? []
    : roles.filter((role) => role.projectId === selectedProjectId);

  const rolesWithSubmissions: RoleWithSubmissions[] = rolesForSelectedProject.map((role) => ({
    role,
    submissions: filteredSubmissions.filter((sub) => sub.roleId === role.id),
  }));

  const handleUpdateStatus = async (submissionId: string, newStatus: string) => {
    try {
      const { error } = await updateSubmissionStatus(
        submissionId,
        newStatus as "pinned" | "booked" | "rejected" | null
      );

      if (error) {
        throw error;
      }

      await fetchData();
    } catch (error) {
      logger.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };


  const toggleRole = (roleId: string) => {
    setExpandedRoles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const getStatusBadgeVariant = (status: string | null): "default" | "success" | "warning" | "danger" => {
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


  // Toggle checkbox selection for a submission
  const handleToggleSelection = (submissionId: string) => {
    setSelectedSubmissionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
      }
      return newSet;
    });
  };

  // Select all filtered submissions
  const handleSelectAll = () => {
    const allIds = new Set(filteredSubmissions.map((s) => s.id));
    setSelectedSubmissionIds(allIds);
  };

  // Deselect all submissions
  const handleDeselectAll = () => {
    setSelectedSubmissionIds(new Set());
  };

  // Bulk update status for selected submissions
  const handleBulkUpdateStatus = async (newStatus: string) => {
    if (selectedSubmissionIds.size === 0) {
      alert("Please select submissions first");
      return;
    }

    if (!confirm(`Update ${selectedSubmissionIds.size} submission(s) to ${getStatusLabel(newStatus)}?`)) {
      return;
    }

    try {
      const { error } = await bulkUpdateSubmissionStatus(
        Array.from(selectedSubmissionIds),
        newStatus as "pinned" | "booked" | "rejected" | null
      );

      if (error) {
        throw error;
      }

      await fetchData();
      setSelectedSubmissionIds(new Set()); // Clear selection after bulk update
      alert(`Successfully updated ${selectedSubmissionIds.size} submission(s)`);
    } catch (error) {
      logger.error("Error bulk updating status:", error);
      alert("Failed to update submissions");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
          <p className="mt-4 text-lg text-secondary" style={{ fontFamily: "var(--font-outfit)" }}>
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
        <div className="mb-8">
          <Link href="/admin" className="text-accent hover:text-accent-dark text-sm mb-2 inline-block">
            ← Back to Admin
          </Link>
          <h1
            className="text-3xl md:text-4xl font-bold text-secondary mb-2"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Review{" "}
            <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Submissions
            </span>
          </h1>
          <p className="text-base text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
            {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Filters */}
            <div className="bg-linear-to-br from-white to-purple-50/30 rounded-xl p-4 border-2 border-accent/20">
              {/* Search Box */}
              <div className="mb-4">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-secondary mb-2"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name, email, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  style={{ fontFamily: "var(--font-outfit)" }}
                />
                {searchQuery && (
                  <p className="mt-1 text-xs text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                    Showing {filteredSubmissions.length} of {submissions.length} submissions
                  </p>
                )}
              </div>

              {/* Project and Status Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Filter by Project"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  options={[
                    { value: "all", label: `All Projects (${submissions.length})` },
                    ...projectsWithSubmissions.map((project) => ({
                      value: project.id,
                      label: `${project.title} (${submissions.filter((s) => s.projectId === project.id).length})`,
                    })),
                  ]}
                />
                <Select
                  label="Filter by Status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  options={[
                    { value: "all", label: `All Status (${submissions.length})` },
                    {
                      value: "new",
                      label: `New (${submissions.filter((s) => s.status === null).length})`,
                    },
                    {
                      value: "pinned",
                      label: `Pinned (${submissions.filter((s) => s.status === "pinned").length})`,
                    },
                    {
                      value: "booked",
                      label: `Booked (${submissions.filter((s) => s.status === "booked").length})`,
                    },
                    {
                      value: "rejected",
                      label: `Rejected (${submissions.filter((s) => s.status === "rejected").length})`,
                    },
                  ]}
                />
              </div>

            </div>

            {/* Bulk Action Bar */}
            {selectedSubmissionIds.size > 0 && (
              <div className="bg-accent text-white rounded-xl p-4 border-2 border-accent shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                      {selectedSubmissionIds.size} selected
                    </span>
                    <button
                      onClick={handleDeselectAll}
                      className="text-sm hover:underline"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      Deselect All
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm mr-2" style={{ fontFamily: "var(--font-outfit)" }}>
                      Bulk Actions:
                    </span>
                    <Button
                      variant="outline"
                      className="text-xs px-3 py-1 bg-white text-accent hover:bg-purple-50"
                      onClick={() => handleBulkUpdateStatus("pinned")}
                    >
                      Pin Selected
                    </Button>
                    <Button
                      variant="outline"
                      className="text-xs px-3 py-1 bg-white text-accent hover:bg-purple-50"
                      onClick={() => handleBulkUpdateStatus("booked")}
                    >
                      Book Selected
                    </Button>
                    <Button
                      variant="outline"
                      className="text-xs px-3 py-1 bg-white text-accent hover:bg-purple-50"
                      onClick={() => handleBulkUpdateStatus("rejected")}
                    >
                      Reject Selected
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Select All Button */}
            {filteredSubmissions.length > 0 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={selectedSubmissionIds.size === filteredSubmissions.length ? handleDeselectAll : handleSelectAll}
                  className="text-sm text-accent hover:text-accent-dark hover:underline transition-colors"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {selectedSubmissionIds.size === filteredSubmissions.length ? "☑ Deselect All" : "☐ Select All"}
                </button>
                <p className="text-xs text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                  {selectedSubmissionIds.size} of {filteredSubmissions.length} selected
                </p>
              </div>
            )}

            {/* Submissions - Show by role if a project is selected, otherwise show all */}
            {selectedProjectId === "all" ? (
              // Show all submissions (no project selected)
              filteredSubmissions.length === 0 ? (
                <div className="bg-linear-to-br from-white to-purple-50/30 rounded-xl p-12 border-2 border-accent/20 text-center">
                  <p className="text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                    No submissions found
                  </p>
                </div>
              ) : (
                filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`bg-linear-to-br from-white to-purple-50/30 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedSubmission?.id === submission.id
                        ? "border-accent shadow-[0_0_30px_rgba(95,101,196,0.3)]"
                        : "border-accent/20 hover:border-accent/40"
                    }`}
                  >
                    <div className="flex items-stretch h-[240px]">
                      {/* Checkbox - Absolute positioned */}
                      <div className="absolute top-4 left-4 z-10">
                        <input
                          type="checkbox"
                          checked={selectedSubmissionIds.has(submission.id)}
                          onChange={() => handleToggleSelection(submission.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 text-accent border-accent/30 rounded focus:ring-2 focus:ring-accent cursor-pointer bg-white shadow-sm"
                        />
                      </div>

                      {/* Photo - Left Side (40% width) */}
                      <div
                        onClick={() => setSelectedSubmission(submission)}
                        className="w-[240px] shrink-0 cursor-pointer relative group"
                      >
                        {submission.profileData.photos?.photos?.[0] ? (
                          <>
                            <Image
                              src={submission.profileData.photos.photos[0].url}
                              alt={`${submission.profileData.basicInfo?.firstName} ${submission.profileData.basicInfo?.lastName}`}
                              width={240}
                              height={240}
                              className="w-full h-full object-cover"
                            />
                            {/* Status Badge Overlay */}
                            <div className="absolute top-2 right-2">
                              <Badge variant={getStatusBadgeVariant(submission.status)}>
                                {getStatusLabel(submission.status)}
                              </Badge>
                            </div>
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-accent/10 to-purple-100 flex items-center justify-center">
                            <span className="text-4xl text-accent/40">📷</span>
                          </div>
                        )}
                      </div>

                      {/* Info - Right Side (60% width) */}
                      <div
                        className="flex-1 p-6 cursor-pointer flex flex-col justify-between"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        {/* Top Section - Name and Details */}
                        <div>
                          <h3
                            className="text-xl font-bold text-secondary mb-2 leading-tight"
                            style={{ fontFamily: "var(--font-galindo)" }}
                          >
                            {submission.profileData.basicInfo?.firstName}{" "}
                            {submission.profileData.basicInfo?.lastName}
                          </h3>

                          {/* Role and Project */}
                          <p className="text-sm text-accent font-medium mb-3" style={{ fontFamily: "var(--font-outfit)" }}>
                            {submission.roleName} • {submission.projectTitle}
                          </p>

                          {/* Key Casting Criteria */}
                          <div className="space-y-1">
                            <div className="text-sm text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                              <span className="font-semibold text-secondary">
                                {submission.profileData.appearance?.gender || 'N/A'}
                                {(() => {
                                  const age = calculateAge(submission.profileData.appearance?.dateOfBirth);
                                  return age !== null ? `, ${age}` : '';
                                })()}
                              </span>
                              {submission.profileData.appearance?.height && (
                                <> • {submission.profileData.appearance.height}</>
                              )}
                              {submission.profileData.appearance?.weight && (
                                <> • {submission.profileData.appearance.weight} lbs</>
                              )}
                            </div>

                            {/* Ethnicity and Hair */}
                            {(submission.profileData.appearance?.ethnicity?.length || submission.profileData.appearance?.hairColor) && (
                              <div className="text-sm text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                                {submission.profileData.appearance?.ethnicity?.join(", ")}
                                {submission.profileData.appearance?.ethnicity?.length && submission.profileData.appearance?.hairColor ? ' • ' : ''}
                                {submission.profileData.appearance?.hairColor && `${submission.profileData.appearance.hairColor} Hair`}
                              </div>
                            )}

                            {/* Location */}
                            {(submission.profileData.basicInfo?.city || submission.profileData.basicInfo?.state) && (
                              <div className="text-sm text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                                📍 {submission.profileData.basicInfo?.city}{submission.profileData.basicInfo?.city && submission.profileData.basicInfo?.state ? ', ' : ''}{submission.profileData.basicInfo?.state}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Section - Quick Actions */}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-accent/10">
                          <p className="text-xs text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                            📅 {submission.submittedAt.toLocaleDateString()}
                          </p>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(submission.id, "pinned");
                              }}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                submission.status === "pinned"
                                  ? "bg-yellow-100 text-yellow-700 font-semibold"
                                  : "bg-gray-100 text-gray-600 hover:bg-yellow-50"
                              }`}
                            >
                              Pin
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(submission.id, "booked");
                              }}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                submission.status === "booked"
                                  ? "bg-green-100 text-green-700 font-semibold"
                                  : "bg-gray-100 text-gray-600 hover:bg-green-50"
                              }`}
                            >
                              Book
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(submission.id, "rejected");
                              }}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                submission.status === "rejected"
                                  ? "bg-red-100 text-red-700 font-semibold"
                                  : "bg-gray-100 text-gray-600 hover:bg-red-50"
                              }`}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              // Show submissions organized by role (project selected)
              rolesWithSubmissions.length === 0 ? (
                <div className="bg-linear-to-br from-white to-purple-50/30 rounded-xl p-12 border-2 border-accent/20 text-center">
                  <p className="text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                    No roles found for this project
                  </p>
                </div>
              ) : (
                rolesWithSubmissions.map((roleWithSubs) => {
                  const isRoleExpanded = expandedRoles.has(roleWithSubs.role.id);

                  return (
                    <div
                      key={roleWithSubs.role.id}
                      className="bg-linear-to-br from-white to-purple-50/30 rounded-xl border-2 border-accent/20 overflow-hidden"
                    >
                      {/* Role Header */}
                      <div
                        className="p-6 cursor-pointer hover:bg-purple-50/50 transition-colors"
                        onClick={() => toggleRole(roleWithSubs.role.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3
                              className="text-xl font-bold text-secondary mb-2"
                              style={{ fontFamily: "var(--font-galindo)" }}
                            >
                              {roleWithSubs.role.name}
                            </h3>
                            <div className="flex flex-wrap gap-3 text-sm text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                              <span>📍 {roleWithSubs.role.location}</span>
                              <span>📅 {roleWithSubs.role.date}</span>
                              <span>💰 {roleWithSubs.role.rate}</span>
                              <span>👥 {roleWithSubs.submissions.length} submission{roleWithSubs.submissions.length !== 1 ? "s" : ""}</span>
                            </div>
                            {roleWithSubs.role.requirements && (
                              <p className="mt-2 text-sm text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                                <span className="font-semibold text-accent">Requirements:</span> {roleWithSubs.role.requirements}
                              </p>
                            )}
                          </div>
                          <button className="text-accent hover:text-accent-dark transition-colors">
                            <svg
                              className={`w-6 h-6 transition-transform ${isRoleExpanded ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Submissions (shown when role is expanded) */}
                      {isRoleExpanded && (
                        <div className="px-6 pb-6 space-y-3">
                          {roleWithSubs.submissions.length === 0 ? (
                            <div className="text-center py-6 text-secondary-light text-sm" style={{ fontFamily: "var(--font-outfit)" }}>
                              No submissions for this role yet
                            </div>
                          ) : (
                            roleWithSubs.submissions.map((submission) => (
                              <div
                                key={submission.id}
                                className={`bg-white rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedSubmission?.id === submission.id
                                    ? "border-accent shadow-[0_0_20px_rgba(95,101,196,0.3)]"
                                    : "border-accent/20 hover:border-accent/40"
                                }`}
                              >
                                <div className="flex items-stretch h-[200px]">
                                  {/* Checkbox - Absolute positioned */}
                                  <div className="absolute top-3 left-3 z-10">
                                    <input
                                      type="checkbox"
                                      checked={selectedSubmissionIds.has(submission.id)}
                                      onChange={() => handleToggleSelection(submission.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-5 h-5 text-accent border-accent/30 rounded focus:ring-2 focus:ring-accent cursor-pointer bg-white shadow-sm"
                                    />
                                  </div>

                                  {/* Photo - Left Side */}
                                  <div
                                    onClick={() => setSelectedSubmission(submission)}
                                    className="w-[200px] shrink-0 cursor-pointer relative group"
                                  >
                                    {submission.profileData.photos?.photos?.[0] ? (
                                      <>
                                        <Image
                                          src={submission.profileData.photos.photos[0].url}
                                          alt={`${submission.profileData.basicInfo?.firstName} ${submission.profileData.basicInfo?.lastName}`}
                                          width={200}
                                          height={200}
                                          className="w-full h-full object-cover"
                                        />
                                        {/* Status Badge Overlay */}
                                        <div className="absolute top-2 right-2">
                                          <Badge variant={getStatusBadgeVariant(submission.status)}>
                                            {getStatusLabel(submission.status)}
                                          </Badge>
                                        </div>
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                      </>
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-accent/10 to-purple-100 flex items-center justify-center">
                                        <span className="text-3xl text-accent/40">📷</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Info - Right Side */}
                                  <div
                                    className="flex-1 p-4 cursor-pointer flex flex-col justify-between"
                                    onClick={() => setSelectedSubmission(submission)}
                                  >
                                    <div>
                                      <h4
                                        className="text-lg font-bold text-secondary mb-1 leading-tight"
                                        style={{ fontFamily: "var(--font-galindo)" }}
                                      >
                                        {submission.profileData.basicInfo?.firstName}{" "}
                                        {submission.profileData.basicInfo?.lastName}
                                      </h4>

                                      {/* Key Casting Criteria */}
                                      <div className="space-y-1">
                                        <div className="text-sm text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                                          <span className="font-semibold text-secondary">
                                            {submission.profileData.appearance?.gender || 'N/A'}
                                            {(() => {
                                              const age = calculateAge(submission.profileData.appearance?.dateOfBirth);
                                              return age !== null ? `, ${age}` : '';
                                            })()}
                                          </span>
                                          {submission.profileData.appearance?.height && (
                                            <> • {submission.profileData.appearance.height}</>
                                          )}
                                        </div>

                                        {/* Ethnicity */}
                                        {submission.profileData.appearance?.ethnicity?.length && submission.profileData.appearance.ethnicity.length > 0 && (
                                          <div className="text-sm text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                                            {submission.profileData.appearance?.ethnicity?.join(", ")}
                                          </div>
                                        )}

                                        {/* Location */}
                                        {(submission.profileData.basicInfo?.city || submission.profileData.basicInfo?.state) && (
                                          <div className="text-xs text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                                            📍 {submission.profileData.basicInfo?.city}{submission.profileData.basicInfo?.city && submission.profileData.basicInfo?.state ? ', ' : ''}{submission.profileData.basicInfo?.state}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Bottom Section - Quick Actions */}
                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-accent/10">
                                      <p className="text-xs text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                                        📅 {submission.submittedAt.toLocaleDateString()}
                                      </p>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateStatus(submission.id, "pinned");
                                          }}
                                          className={`px-2 py-1 text-xs rounded transition-colors ${
                                            submission.status === "pinned"
                                              ? "bg-yellow-100 text-yellow-700 font-semibold"
                                              : "bg-gray-100 text-gray-600 hover:bg-yellow-50"
                                          }`}
                                        >
                                          Pin
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateStatus(submission.id, "booked");
                                          }}
                                          className={`px-2 py-1 text-xs rounded transition-colors ${
                                            submission.status === "booked"
                                              ? "bg-green-100 text-green-700 font-semibold"
                                              : "bg-gray-100 text-gray-600 hover:bg-green-50"
                                          }`}
                                        >
                                          Book
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateStatus(submission.id, "rejected");
                                          }}
                                          className={`px-2 py-1 text-xs rounded transition-colors ${
                                            submission.status === "rejected"
                                              ? "bg-red-100 text-red-700 font-semibold"
                                              : "bg-gray-100 text-gray-600 hover:bg-red-50"
                                          }`}
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedSubmission ? (
              <div className="bg-linear-to-br from-white to-purple-50/30 rounded-xl p-6 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] sticky top-6">
                <h2
                  className="text-xl font-bold text-secondary mb-4"
                  style={{ fontFamily: "var(--font-galindo)" }}
                >
                  Submission Details
                </h2>

                {/* Photos */}
                {selectedSubmission.profileData.photos?.photos && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-secondary mb-3">Photos</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedSubmission.profileData.photos.photos.map((photo, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden border-2 border-accent/30">
                          <Image
                            src={photo.url}
                            alt={`Photo ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Basic Info */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-secondary mb-2">Contact</h3>
                  <div className="space-y-1 text-sm" style={{ fontFamily: "var(--font-outfit)" }}>
                    <p className="text-secondary-light">
                      Email: <span className="text-secondary">{selectedSubmission.profileData.basicInfo?.email}</span>
                    </p>
                    <p className="text-secondary-light">
                      Phone: <span className="text-secondary">{selectedSubmission.profileData.basicInfo?.phone}</span>
                    </p>
                    {(selectedSubmission.profileData.basicInfo?.city || selectedSubmission.profileData.basicInfo?.state) && (
                      <p className="text-secondary-light">
                        Location:{" "}
                        <span className="text-secondary">
                          {selectedSubmission.profileData.basicInfo?.city}{selectedSubmission.profileData.basicInfo?.city && selectedSubmission.profileData.basicInfo?.state ? ', ' : ''}{selectedSubmission.profileData.basicInfo?.state}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Appearance */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-secondary mb-2">Appearance</h3>
                  <div className="space-y-1 text-sm" style={{ fontFamily: "var(--font-outfit)" }}>
                    <p className="text-secondary-light">
                      Gender: <span className="text-secondary">{selectedSubmission.profileData.appearance?.gender}</span>
                    </p>
                    <p className="text-secondary-light">
                      Height: <span className="text-secondary">{selectedSubmission.profileData.appearance?.height}</span>
                    </p>
                    <p className="text-secondary-light">
                      Weight: <span className="text-secondary">{selectedSubmission.profileData.appearance?.weight} lbs</span>
                    </p>
                    <p className="text-secondary-light">
                      Hair: <span className="text-secondary">{selectedSubmission.profileData.appearance?.hairColor}</span>
                    </p>
                    <p className="text-secondary-light">
                      Eyes: <span className="text-secondary">{selectedSubmission.profileData.appearance?.eyeColor}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-accent/20">
                  <h3 className="text-sm font-semibold text-secondary mb-3">Actions</h3>

                  <div className="space-y-3">
                    <Link href={`/admin/talent/${selectedSubmission.userId}`}>
                      <Button variant="outline" className="text-sm w-full">
                        👤 View Full Profile
                      </Button>
                    </Link>

                    <div className="border-t border-accent/20 pt-3">
                      <p className="text-xs text-secondary-light mb-2">Update Status:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={selectedSubmission.status === "pinned" ? "primary" : "outline"}
                          className="text-xs px-2 py-1"
                          onClick={() => handleUpdateStatus(selectedSubmission.id, "pinned")}
                        >
                          Pin
                        </Button>
                        <Button
                          variant={selectedSubmission.status === "booked" ? "primary" : "outline"}
                          className="text-xs px-2 py-1"
                          onClick={() => handleUpdateStatus(selectedSubmission.id, "booked")}
                        >
                          Book
                        </Button>
                        <Button
                          variant={selectedSubmission.status === "rejected" ? "primary" : "outline"}
                          className="text-xs px-2 py-1"
                          onClick={() => handleUpdateStatus(selectedSubmission.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-linear-to-br from-white to-purple-50/30 rounded-xl p-12 border-2 border-accent/20 text-center">
                <p className="text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                  Select a submission to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
