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

interface Submission {
  id: string;
  userId: string;
  roleId: string;
  projectId: string;
  roleName: string;
  projectTitle: string;
  status: "pending" | "reviewed" | "selected" | "rejected";
  submittedAt: Date;
  profileData: {
    basicInfo: any;
    appearance: any;
    sizes: any;
    details: any;
    photos: any;
  };
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
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin/submissions");
    } else if (user && isAdmin) {
      fetchData();
    }
  }, [authLoading, user, isAdmin, router]);

  async function fetchData() {
    try {
      // Fetch all submissions
      const submissionsQuery = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissionsData: Submission[] = [];
      submissionsSnapshot.forEach((doc) => {
        const data = doc.data();
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

      setSubmissions(submissionsData);
      setProjects(projectsData);
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter submissions based on selected project and status
  const filteredSubmissions = submissions.filter((submission) => {
    const projectMatch = selectedProjectId === "all" || submission.projectId === selectedProjectId;
    const statusMatch = filterStatus === "all" || submission.status === filterStatus;
    return projectMatch && statusMatch;
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
      console.error("Error updating status:", error);
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
        return "Pending";
      case "reviewed":
        return "Reviewed";
      case "selected":
        return "Selected";
      case "rejected":
        return "Rejected";
      default:
        return status;
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
            {/* Filters */}
            <div className="bg-linear-to-br from-white to-purple-50/30 rounded-xl p-4 border-2 border-accent/20">
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
                      label: `Pending (${submissions.filter((s) => s.status === "pending").length})`,
                    },
                    {
                      value: "reviewed",
                      label: `Reviewed (${submissions.filter((s) => s.status === "reviewed").length})`,
                    },
                    {
                      value: "selected",
                      label: `Selected (${submissions.filter((s) => s.status === "selected").length})`,
                    },
                    {
                      value: "rejected",
                      label: `Rejected (${submissions.filter((s) => s.status === "rejected").length})`,
                    },
                  ]}
                />
              </div>
            </div>

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
                    className={`bg-linear-to-br from-white to-purple-50/30 rounded-xl p-6 border-2 transition-all cursor-pointer ${
                      selectedSubmission?.id === submission.id
                        ? "border-accent shadow-[0_0_30px_rgba(95,101,196,0.3)]"
                        : "border-accent/20 hover:border-accent/40"
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Photo */}
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

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3
                            className="text-lg font-bold text-secondary truncate"
                            style={{ fontFamily: "var(--font-galindo)" }}
                          >
                            {submission.profileData.basicInfo?.firstName}{" "}
                            {submission.profileData.basicInfo?.lastName}
                          </h3>
                          <Badge variant={getStatusBadgeVariant(submission.status)}>
                            {getStatusLabel(submission.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-secondary-light mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
                          Role: <span className="text-secondary font-medium">{submission.roleName}</span>
                        </p>
                        <p className="text-sm text-secondary-light mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
                          Project: {submission.projectTitle}
                        </p>
                        <p className="text-xs text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                          Submitted: {submission.submittedAt.toLocaleDateString()}
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
                                className={`bg-white rounded-lg p-5 border-2 transition-all cursor-pointer ${
                                  selectedSubmission?.id === submission.id
                                    ? "border-accent shadow-[0_0_20px_rgba(95,101,196,0.3)]"
                                    : "border-accent/20 hover:border-accent/40"
                                }`}
                                onClick={() => setSelectedSubmission(submission)}
                              >
                                <div className="flex items-start gap-4">
                                  {/* Photo */}
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

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <h4
                                        className="text-lg font-bold text-secondary truncate"
                                        style={{ fontFamily: "var(--font-galindo)" }}
                                      >
                                        {submission.profileData.basicInfo?.firstName}{" "}
                                        {submission.profileData.basicInfo?.lastName}
                                      </h4>
                                      <Badge variant={getStatusBadgeVariant(submission.status)}>
                                        {getStatusLabel(submission.status)}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                                      Submitted: {submission.submittedAt.toLocaleDateString()}
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
                      {selectedSubmission.profileData.photos.photos.map((photo: any, index: number) => (
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
                    <p className="text-secondary-light">
                      Location:{" "}
                      <span className="text-secondary">
                        {selectedSubmission.profileData.basicInfo?.city}, {selectedSubmission.profileData.basicInfo?.state}
                      </span>
                    </p>
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

                {/* Status Actions */}
                <div className="pt-4 border-t border-accent/20">
                  <h3 className="text-sm font-semibold text-secondary mb-3">Update Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedSubmission.status === "reviewed" ? "primary" : "outline"}
                      className="text-sm"
                      onClick={() => handleUpdateStatus(selectedSubmission.id, "reviewed")}
                    >
                      Reviewed
                    </Button>
                    <Button
                      variant={selectedSubmission.status === "selected" ? "primary" : "outline"}
                      className="text-sm"
                      onClick={() => handleUpdateStatus(selectedSubmission.id, "selected")}
                    >
                      Selected
                    </Button>
                    <Button
                      variant={selectedSubmission.status === "rejected" ? "primary" : "outline"}
                      className="text-sm"
                      onClick={() => handleUpdateStatus(selectedSubmission.id, "rejected")}
                    >
                      Rejected
                    </Button>
                    <Button
                      variant={selectedSubmission.status === "pending" ? "primary" : "outline"}
                      className="text-sm"
                      onClick={() => handleUpdateStatus(selectedSubmission.id, "pending")}
                    >
                      Pending
                    </Button>
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
