"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import Link from "next/link";
import Image from "next/image";
import {
  createBooking,
  deleteBooking,
  isSubmissionBooked,
  getBookingsByProject,
} from "@/lib/firebase/bookings";
import type { Booking } from "@/types/booking";
import { logger } from "@/lib/logger";

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
  status: "pending" | "reviewed" | "selected" | "rejected";
  submittedAt: Date;
  profileData: ProfileData;
  pinned?: boolean;
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

type FilterStatus = "all" | "pending" | "reviewed" | "selected" | "rejected";

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<Set<string>>(new Set());
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

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
      // Fetch all submissions
      const submissionsQuery = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissionsData: Submission[] = [];
      submissionsSnapshot.forEach((doc) => {
        const data = doc.data();

        // Skip submissions with missing or invalid profile data
        if (!data.profileData || !data.profileData.basicInfo) {
          logger.warn(`Skipping submission ${doc.id} with invalid profile data`);
          return;
        }

        submissionsData.push({
          id: doc.id,
          userId: data.userId,
          roleId: data.roleId,
          projectId: data.projectId,
          roleName: data.roleName,
          projectTitle: data.projectTitle,
          status: data.status,
          submittedAt: data.submittedAt.toDate(),
          profileData: data.profileData,
          pinned: data.pinned || false,
        });
      });

      // Fetch all projects
      const projectsSnapshot = await getDocs(collection(db, "projects"));
      const projectsData: Project[] = [];
      projectsSnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });

      // Fetch all roles
      const rolesSnapshot = await getDocs(collection(db, "roles"));
      const rolesData: Role[] = [];
      rolesSnapshot.forEach((doc) => {
        rolesData.push({ id: doc.id, ...doc.data() } as Role);
      });

      // Fetch all bookings
      const bookingsSnapshot = await getDocs(collection(db, "bookings"));
      const bookingsData: Booking[] = [];
      bookingsSnapshot.forEach((doc) => {
        const data = doc.data();
        bookingsData.push({
          id: doc.id,
          ...data,
          confirmedAt: data.confirmedAt?.toDate?.() || data.confirmedAt,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as Booking);
      });

      setSubmissions(submissionsData);
      setProjects(projectsData);
      setRoles(rolesData);
      setBookings(bookingsData);
    } catch (error) {
      logger.error("Error fetching data:", error);
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

  // Filter submissions based on selected project, status, search query, and pin status
  const filteredSubmissions = submissions
    .filter((submission) => {
      const projectMatch = selectedProjectId === "all" || submission.projectId === selectedProjectId;
      const statusMatch = filterStatus === "all" || submission.status === filterStatus;

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

      // Pin filter: if showPinnedOnly is true, only show pinned submissions
      const pinnedMatch = !showPinnedOnly || submission.pinned === true;

      return projectMatch && statusMatch && searchMatch && pinnedMatch;
    })
    // Sort: pinned submissions float to top
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

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
      await updateDoc(doc(db, "submissions", submissionId), {
        status: newStatus,
      });
      await fetchData();
    } catch (error) {
      logger.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleBookTalent = async (submission: Submission) => {
    if (!user) return;

    setBookingInProgress(true);
    try {
      // Transform submission to match the Booking type's expected TalentProfile structure
      const transformedSubmission = {
        ...submission,
        profileData: {
          basicInfo: {
            firstName: submission.profileData.basicInfo?.firstName || '',
            lastName: submission.profileData.basicInfo?.lastName || '',
            email: submission.profileData.basicInfo?.email || '',
            phone: submission.profileData.basicInfo?.phone || '',
            dateOfBirth: submission.profileData.appearance?.dateOfBirth || submission.profileData.basicInfo?.dateOfBirth || '',
            location: submission.profileData.basicInfo?.location ||
                     `${submission.profileData.basicInfo?.city || ''}, ${submission.profileData.basicInfo?.state || ''}`.trim(),
          },
          physical: {
            gender: submission.profileData.appearance?.gender || '',
            ethnicity: submission.profileData.appearance?.ethnicity || [],
            height: submission.profileData.appearance?.height || '',
            weight: String(submission.profileData.appearance?.weight || 0),
            hairColor: submission.profileData.appearance?.hairColor || '',
            eyeColor: submission.profileData.appearance?.eyeColor || '',
            tattoos: submission.profileData.details?.visibleTattoos || false,
            piercings: submission.profileData.details?.piercings || false,
          },
        },
      };

      await createBooking(transformedSubmission as import("@/types/booking").Submission, user.uid, {
        status: "confirmed",
      });
      await fetchData();
      alert(`Successfully booked ${submission.profileData.basicInfo?.firstName} ${submission.profileData.basicInfo?.lastName}`);
    } catch (error) {
      logger.error("Error booking talent:", error);
      alert("Failed to book talent");
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleUnbookTalent = async (submission: Submission) => {
    const booking = bookings.find((b) => b.submissionId === submission.id);
    if (!booking) return;

    if (!confirm(`Are you sure you want to unbook ${submission.profileData.basicInfo?.firstName} ${submission.profileData.basicInfo?.lastName}?`)) {
      return;
    }

    setBookingInProgress(true);
    try {
      await deleteBooking(booking.id);
      await fetchData();
    } catch (error) {
      logger.error("Error unbooking talent:", error);
      alert("Failed to unbook talent");
    } finally {
      setBookingInProgress(false);
    }
  };

  const getBookingForSubmission = (submissionId: string): Booking | undefined => {
    return bookings.find((b) => b.submissionId === submissionId);
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

  const getStatusBadgeVariant = (status: string): "default" | "success" | "warning" | "danger" => {
    switch (status) {
      case "selected":
        return "success";
      case "reviewed":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "pending":
        return "To Review";
      case "reviewed":
        return "Reviewed";
      case "selected":
        return "Shortlisted";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  // Toggle pin status for a submission
  const handleTogglePin = async (submissionId: string) => {
    try {
      const submission = submissions.find((s) => s.id === submissionId);
      if (!submission) return;

      const newPinnedState = !submission.pinned;
      await updateDoc(doc(db, "submissions", submissionId), {
        pinned: newPinnedState,
      });
      await fetchData();
    } catch (error) {
      logger.error("Error toggling pin:", error);
      alert("Failed to update pin status");
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
      const updatePromises = Array.from(selectedSubmissionIds).map((id) =>
        updateDoc(doc(db, "submissions", id), { status: newStatus })
      );
      await Promise.all(updatePromises);
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
                      value: "pending",
                      label: `To Review (${submissions.filter((s) => s.status === "pending").length})`,
                    },
                    {
                      value: "reviewed",
                      label: `Reviewed (${submissions.filter((s) => s.status === "reviewed").length})`,
                    },
                    {
                      value: "selected",
                      label: `Shortlisted (${submissions.filter((s) => s.status === "selected").length})`,
                    },
                    {
                      value: "rejected",
                      label: `Rejected (${submissions.filter((s) => s.status === "rejected").length})`,
                    },
                  ]}
                />
              </div>

              {/* Pin Filter */}
              <div className="mt-4 flex items-center gap-2">
                <input
                  id="showPinnedOnly"
                  type="checkbox"
                  checked={showPinnedOnly}
                  onChange={(e) => setShowPinnedOnly(e.target.checked)}
                  className="w-4 h-4 text-accent border-accent/30 rounded focus:ring-2 focus:ring-accent cursor-pointer"
                />
                <label
                  htmlFor="showPinnedOnly"
                  className="text-sm text-secondary cursor-pointer select-none"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  ⭐ Show Pinned Only ({submissions.filter((s) => s.pinned).length})
                </label>
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
                      onClick={() => handleBulkUpdateStatus("pending")}
                    >
                      Mark as To Review
                    </Button>
                    <Button
                      variant="outline"
                      className="text-xs px-3 py-1 bg-white text-accent hover:bg-purple-50"
                      onClick={() => handleBulkUpdateStatus("reviewed")}
                    >
                      Mark as Reviewed
                    </Button>
                    <Button
                      variant="outline"
                      className="text-xs px-3 py-1 bg-white text-accent hover:bg-purple-50"
                      onClick={() => handleBulkUpdateStatus("selected")}
                    >
                      Mark as Shortlisted
                    </Button>
                    <Button
                      variant="outline"
                      className="text-xs px-3 py-1 bg-white text-accent hover:bg-purple-50"
                      onClick={() => handleBulkUpdateStatus("rejected")}
                    >
                      Mark as Rejected
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
                    className={`bg-linear-to-br from-white to-purple-50/30 rounded-xl p-6 border-2 transition-all ${
                      selectedSubmission?.id === submission.id
                        ? "border-accent shadow-[0_0_30px_rgba(95,101,196,0.3)]"
                        : "border-accent/20 hover:border-accent/40"
                    } ${submission.pinned ? "ring-2 ring-yellow-400" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="flex items-start pt-1">
                        <input
                          type="checkbox"
                          checked={selectedSubmissionIds.has(submission.id)}
                          onChange={() => handleToggleSelection(submission.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 text-accent border-accent/30 rounded focus:ring-2 focus:ring-accent cursor-pointer"
                        />
                      </div>

                      {/* Photo */}
                      <div
                        onClick={() => setSelectedSubmission(submission)}
                        className="cursor-pointer"
                      >
                        {submission.profileData.photos?.photos?.[0] && (
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent/30 shrink-0">
                            <Image
                              src={submission.profileData.photos.photos[0].url}
                              alt="Profile"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3
                            className="text-lg font-bold text-secondary truncate"
                            style={{ fontFamily: "var(--font-galindo)" }}
                          >
                            {submission.profileData.basicInfo?.firstName}{" "}
                            {submission.profileData.basicInfo?.lastName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(submission.status)}>
                              {getStatusLabel(submission.status)}
                            </Badge>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePin(submission.id);
                              }}
                              className={`text-2xl hover:scale-110 transition-transform ${
                                submission.pinned ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
                              }`}
                              title={submission.pinned ? "Unpin submission" : "Pin submission"}
                            >
                              {submission.pinned ? "⭐" : "☆"}
                            </button>
                          </div>
                        </div>

                        {/* Role and Project */}
                        <p className="text-sm text-secondary font-medium mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
                          {submission.roleName} • {submission.projectTitle}
                        </p>

                        {/* Key Casting Criteria */}
                        <div className="text-sm text-secondary-light mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
                          {submission.profileData.appearance?.gender || 'N/A'}
                          {(() => {
                            const age = calculateAge(submission.profileData.appearance?.dateOfBirth);
                            return age !== null ? `, ${age}` : '';
                          })()}
                          {submission.profileData.appearance?.height ? ` • ${submission.profileData.appearance.height}` : ''}
                          {(submission.profileData.basicInfo?.city || submission.profileData.basicInfo?.state) && (
                            <> • {submission.profileData.basicInfo?.city}{submission.profileData.basicInfo?.city && submission.profileData.basicInfo?.state ? ', ' : ''}{submission.profileData.basicInfo?.state}</>
                          )}
                        </div>

                        {/* Ethnicity and Hair */}
                        {(submission.profileData.appearance?.ethnicity?.length || submission.profileData.appearance?.hairColor) && (
                          <div className="text-sm text-secondary-light mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
                            {submission.profileData.appearance?.ethnicity?.join(", ")}
                            {submission.profileData.appearance?.ethnicity?.length && submission.profileData.appearance?.hairColor ? ' • ' : ''}
                            {submission.profileData.appearance?.hairColor ? `${submission.profileData.appearance.hairColor} Hair` : ''}
                          </div>
                        )}

                        {/* Submission Details */}
                        <p className="text-xs text-secondary-light mt-2" style={{ fontFamily: "var(--font-outfit)" }}>
                          📷 {submission.profileData.photos?.photos?.length || 0} photos • 📅 Submitted {submission.submittedAt.toLocaleDateString()}
                        </p>
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
                                className={`bg-white rounded-lg p-5 border-2 transition-all ${
                                  selectedSubmission?.id === submission.id
                                    ? "border-accent shadow-[0_0_20px_rgba(95,101,196,0.3)]"
                                    : "border-accent/20 hover:border-accent/40"
                                } ${submission.pinned ? "ring-2 ring-yellow-400" : ""}`}
                              >
                                <div className="flex items-start gap-4">
                                  {/* Checkbox */}
                                  <div className="flex items-start pt-1">
                                    <input
                                      type="checkbox"
                                      checked={selectedSubmissionIds.has(submission.id)}
                                      onChange={() => handleToggleSelection(submission.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-5 h-5 text-accent border-accent/30 rounded focus:ring-2 focus:ring-accent cursor-pointer"
                                    />
                                  </div>

                                  {/* Photo */}
                                  <div
                                    onClick={() => setSelectedSubmission(submission)}
                                    className="cursor-pointer"
                                  >
                                    {submission.profileData.photos?.photos?.[0] && (
                                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent/30 shrink-0">
                                        <Image
                                          src={submission.profileData.photos.photos[0].url}
                                          alt="Profile"
                                          width={64}
                                          height={64}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Info */}
                                  <div
                                    className="flex-1 min-w-0 cursor-pointer"
                                    onClick={() => setSelectedSubmission(submission)}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <h4
                                        className="text-lg font-bold text-secondary truncate"
                                        style={{ fontFamily: "var(--font-galindo)" }}
                                      >
                                        {submission.profileData.basicInfo?.firstName}{" "}
                                        {submission.profileData.basicInfo?.lastName}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={getStatusBadgeVariant(submission.status)}>
                                          {getStatusLabel(submission.status)}
                                        </Badge>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleTogglePin(submission.id);
                                          }}
                                          className={`text-2xl hover:scale-110 transition-transform ${
                                            submission.pinned ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
                                          }`}
                                          title={submission.pinned ? "Unpin submission" : "Pin submission"}
                                        >
                                          {submission.pinned ? "⭐" : "☆"}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Key Casting Criteria */}
                                    <div className="text-sm text-secondary-light mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
                                      {submission.profileData.appearance?.gender || 'N/A'}
                                      {(() => {
                                        const age = calculateAge(submission.profileData.appearance?.dateOfBirth);
                                        return age !== null ? `, ${age}` : '';
                                      })()}
                                      {submission.profileData.appearance?.height ? ` • ${submission.profileData.appearance.height}` : ''}
                                      {(submission.profileData.basicInfo?.city || submission.profileData.basicInfo?.state) && (
                                        <> • {submission.profileData.basicInfo?.city}{submission.profileData.basicInfo?.city && submission.profileData.basicInfo?.state ? ', ' : ''}{submission.profileData.basicInfo?.state}</>
                                      )}
                                    </div>

                                    {/* Ethnicity and Hair */}
                                    {(submission.profileData.appearance?.ethnicity?.length || submission.profileData.appearance?.hairColor) && (
                                      <div className="text-sm text-secondary-light mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
                                        {submission.profileData.appearance?.ethnicity?.join(", ")}
                                        {submission.profileData.appearance?.ethnicity?.length && submission.profileData.appearance?.hairColor ? ' • ' : ''}
                                        {submission.profileData.appearance?.hairColor ? `${submission.profileData.appearance.hairColor} Hair` : ''}
                                      </div>
                                    )}

                                    {/* Submission Details */}
                                    <p className="text-xs text-secondary-light mt-2" style={{ fontFamily: "var(--font-outfit)" }}>
                                      📷 {submission.profileData.photos?.photos?.length || 0} photos • 📅 Submitted {submission.submittedAt.toLocaleDateString()}
                                    </p>
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

                {/* Booking Actions */}
                <div className="pt-4 border-t border-accent/20">
                  <h3 className="text-sm font-semibold text-secondary mb-3">Actions</h3>

                  {selectedSubmission.status === "selected" ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-2xl">✓</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-800">Talent Booked</p>
                          <p className="text-xs text-green-600">This talent has been confirmed for the role</p>
                        </div>
                      </div>
                      <Link href={`/admin/talent/${selectedSubmission.userId}`}>
                        <Button
                          variant="outline"
                          className="text-sm w-full"
                        >
                          👤 View Full Profile
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="text-sm w-full text-danger"
                        onClick={() => handleUnbookTalent(selectedSubmission)}
                        disabled={bookingInProgress}
                      >
                        {bookingInProgress ? "Unbooking..." : "Unbook Talent"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        className="text-sm w-full"
                        onClick={() => handleBookTalent(selectedSubmission)}
                        disabled={bookingInProgress || selectedSubmission.status === "rejected"}
                      >
                        {bookingInProgress ? "Booking..." : "📋 Book Talent"}
                      </Button>

                      <Link href={`/admin/talent/${selectedSubmission.userId}`}>
                        <Button
                          variant="outline"
                          className="text-sm w-full"
                        >
                          👤 View Full Profile
                        </Button>
                      </Link>

                      <div className="border-t border-accent/20 pt-3">
                        <p className="text-xs text-secondary-light mb-2">Review Status:</p>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant={selectedSubmission.status === "pending" ? "primary" : "outline"}
                            className="text-xs px-2 py-1"
                            onClick={() => handleUpdateStatus(selectedSubmission.id, "pending")}
                          >
                            To Review
                          </Button>
                          <Button
                            variant={selectedSubmission.status === "reviewed" ? "primary" : "outline"}
                            className="text-xs px-2 py-1"
                            onClick={() => handleUpdateStatus(selectedSubmission.id, "reviewed")}
                          >
                            Reviewed
                          </Button>
                          <Button
                            variant={selectedSubmission.status === "rejected" ? "primary" : "outline"}
                            className="text-xs px-2 py-1"
                            onClick={() => handleUpdateStatus(selectedSubmission.id, "rejected")}
                          >
                            Rejected
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
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
