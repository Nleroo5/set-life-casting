"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import DatePicker from "@/components/ui/DatePicker";
import { useForm, Controller } from "react-hook-form";
import Link from "next/link";
import { archiveRole, restoreRole, getActiveBookingCount } from "@/lib/firebase/roles";
import { logger } from "@/lib/logger";

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
  bookingDates: string[]; // Array of ISO date strings for multiple booking dates
  location: string;
  bookingStatus: "booking" | "booked";
  additionalNotes?: string;
  referenceImageUrl?: string;
  archivedWithProject?: boolean;
  archivedIndividually?: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  archiveReason?: string;
}

interface RoleFormData {
  id?: string; // Include existing role ID for updates
  name: string;
  requirements: string;
  rate: string;
  bookingDates: string[]; // Array of ISO date strings for multiple booking dates
  location: string;
  bookingStatus: "booking" | "booked";
  additionalNotes?: string;
  referenceImageUrl?: string;
}

type ViewMode = "projects" | "new-project" | "edit-project";

export default function AdminCastingPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [archiveDialogRole, setArchiveDialogRole] = useState<Role | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [archivingRole, setArchivingRole] = useState(false);
  const [showArchivedRoles, setShowArchivedRoles] = useState<{[projectId: string]: boolean}>({});

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin/casting");
    } else if (user && isAdmin) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isAdmin]);

  async function fetchData() {
    try {
      // Fetch projects
      const projectsSnapshot = await getDocs(collection(db, "projects"));
      const projectsData: Project[] = [];
      projectsSnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projectsData);

      // Fetch roles
      const rolesSnapshot = await getDocs(collection(db, "roles"));
      const rolesData: Role[] = [];
      rolesSnapshot.forEach((doc) => {
        const roleData = doc.data() as any;

        // Migrate old single date to bookingDates array if needed
        if (roleData.date && !roleData.bookingDates) {
          const { date, ...restRole } = roleData;
          rolesData.push({
            id: doc.id,
            ...restRole,
            bookingDates: [date] // Convert single date to array
          } as Role);
        } else if (roleData.bookingDates && Array.isArray(roleData.bookingDates)) {
          rolesData.push({ id: doc.id, ...roleData } as Role);
        } else {
          // Fallback: ensure bookingDates exists
          rolesData.push({
            id: doc.id,
            ...roleData,
            bookingDates: roleData.date ? [roleData.date] : [""]
          } as Role);
        }
      });
      setRoles(rolesData);

      // DEBUG: Log roles to check archive flags
      logger.debug("🔍 DEBUG - Total roles loaded:", rolesData.length);
      logger.debug("🔍 DEBUG - Sample role:", rolesData[0]);

      // Bookings collection was removed in submission status simplification
    } catch (error) {
      logger.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleArchiveProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (!confirm(`Archive "${project.title}"?\n\nAll roles, bookings, and submissions will be preserved but marked as archived. This is the recommended way to close completed projects.`)) {
      return;
    }

    try {
      logger.debug(`🔍 Starting archive process for project: ${project.title}`);

      const batch = writeBatch(db);
      let rolesCount = 0;
      let bookingsCount = 0;
      let submissionsCount = 0;

      // Update project status to archived
      const projectRef = doc(db, "projects", projectId);
      batch.update(projectRef, {
        status: "archived",
        archivedAt: new Date(),
        archivedBy: user?.uid || "admin",
        updatedAt: new Date(),
      });

      // Mark all roles as archived
      const rolesQuery = query(collection(db, "roles"), where("projectId", "==", projectId));
      const rolesSnapshot = await getDocs(rolesQuery);
      rolesSnapshot.docs.forEach((roleDoc) => {
        batch.update(roleDoc.ref, {
          archivedWithProject: true,
          updatedAt: new Date(),
        });
        rolesCount++;
      });

      // Mark all bookings as archived and completed
      const bookingsQuery = query(collection(db, "bookings"), where("projectId", "==", projectId));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      bookingsSnapshot.docs.forEach((bookingDoc) => {
        batch.update(bookingDoc.ref, {
          status: "completed",
          archivedWithProject: true,
          updatedAt: new Date(),
        });
        bookingsCount++;
      });

      // Mark all submissions as archived
      const submissionsQuery = query(collection(db, "submissions"), where("projectId", "==", projectId));
      const submissionsSnapshot = await getDocs(submissionsQuery);
      submissionsSnapshot.docs.forEach((submissionDoc) => {
        batch.update(submissionDoc.ref, {
          status: "archived",
          archivedWithProject: true,
          updatedAt: new Date(),
        });
        submissionsCount++;
      });

      await batch.commit();

      logger.debug(`✅ Archived project: ${project.title}`);
      logger.debug(`  - ${rolesCount} roles archived`);
      logger.debug(`  - ${bookingsCount} bookings completed`);
      logger.debug(`  - ${submissionsCount} submissions archived`);

      alert(
        `Project "${project.title}" archived successfully!\n\n` +
        `• ${rolesCount} roles preserved\n` +
        `• ${bookingsCount} bookings marked complete\n` +
        `• ${submissionsCount} submissions archived\n\n` +
        `All data is safely preserved and can be viewed in the Archive section.`
      );

      await fetchData();
    } catch (error) {
      logger.error("Error archiving project:", error);
      alert("Failed to archive project. Please try again.");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Bookings collection removed - no longer checking for bookings

    if (!confirm(`Are you sure you want to delete "${project.title}"?\n\nThis will permanently delete all associated roles and submissions.\n\nNote: If this project has any bookings, you should archive it instead.`)) {
      return;
    }

    try {
      // Delete associated roles
      const rolesQuery = query(collection(db, "roles"), where("projectId", "==", projectId));
      const rolesSnapshot = await getDocs(rolesQuery);
      const deletePromises = rolesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete submissions
      const submissionsQuery = query(collection(db, "submissions"), where("projectId", "==", projectId));
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const deleteSubmissionsPromises = submissionsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deleteSubmissionsPromises);

      // Delete project
      await deleteDoc(doc(db, "projects", projectId));

      logger.debug(`✅ Deleted project: ${project.title}`);
      await fetchData();
    } catch (error) {
      logger.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  };

  const handleArchiveRoleClick = (role: Role) => {
    setArchiveDialogRole(role);
    setArchiveReason("");
  };

  const handleArchiveRoleConfirm = async () => {
    if (!archiveDialogRole || !user) return;

    try {
      setArchivingRole(true);

      // Check for active bookings
      const bookingCount = await getActiveBookingCount(archiveDialogRole.id);
      if (bookingCount > 0) {
        alert(
          `Cannot archive role "${archiveDialogRole.name}".\n\n` +
          `This role has ${bookingCount} active booking(s).\n\n` +
          `Please complete bookings or archive the entire project instead.`
        );
        setArchiveDialogRole(null);
        return;
      }

      await archiveRole(archiveDialogRole.id, user.uid, archiveReason);

      alert(
        `Role "${archiveDialogRole.name}" archived successfully!\n\n` +
        `The role and its submissions are now hidden from talent.`
      );

      setArchiveDialogRole(null);
      setArchiveReason("");
      await fetchData();
    } catch (error: unknown) {
      logger.error("Error archiving role:", error);
      const message = error instanceof Error ? error.message : "Failed to archive role. Please try again.";
      alert(message);
    } finally {
      setArchivingRole(false);
    }
  };

  const handleRestoreRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Restore role "${roleName}"?\n\nThis will make the role visible to talent again and restore all associated submissions.`)) {
      return;
    }

    try {
      await restoreRole(roleId);
      alert(`Role "${roleName}" restored successfully!`);
      await fetchData();
    } catch (error: unknown) {
      logger.error("Error restoring role:", error);
      const message = error instanceof Error ? error.message : "Failed to restore role. Please try again.";
      alert(message);
    }
  };

  const toggleArchivedRoles = (projectId: string) => {
    setShowArchivedRoles(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-accent hover:text-accent-dark text-sm mb-2 inline-block">
              ← Back to Admin
            </Link>
            <h1
              className="text-3xl md:text-4xl font-bold text-secondary mb-2"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              Casting{" "}
              <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            <p className="text-base text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
              Manage projects and roles
            </p>
          </div>
          {viewMode === "projects" && (
            <Button variant="primary" onClick={() => setViewMode("new-project")}>
              + New Project
            </Button>
          )}
        </div>

        {/* Projects View */}
        {viewMode === "projects" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-secondary" style={{ fontFamily: "var(--font-galindo)" }}>
                Projects ({projects.filter(p => showArchived ? p.status === "archived" : p.status !== "archived").length})
              </h2>
              <Button
                variant="outline"
                className="text-sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? "Show Active Projects" : "Show Archived Projects"}
              </Button>
            </div>

            <div className="space-y-6">
              {projects
                .filter(p => showArchived ? p.status === "archived" : p.status !== "archived")
                .map((project) => {
                const projectRoles = roles.filter((r) => r.projectId === project.id);
                const activeRoles = projectRoles.filter(r => !r.archivedWithProject && !r.archivedIndividually);

                // DEBUG: Log for each project
                logger.debug(`🔍 Project: "${project.title}" | Status: ${project.status} | Total Roles: ${projectRoles.length} | Active: ${activeRoles.length}`);
                if (projectRoles.length > 0) {
                  logger.debug("  First role:", projectRoles[0]);
                }

                return (
                  <div
                    key={project.id}
                    className="bg-linear-to-br from-white to-purple-50/30 rounded-xl p-6 border-2 border-accent/20 shadow-[0_0_20px_rgba(95,101,196,0.1)]"
                  >
                    {/* Project Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className="text-2xl font-bold text-secondary"
                            style={{ fontFamily: "var(--font-galindo)" }}
                          >
                            {project.title}
                          </h3>
                          <Badge variant={project.status === "booking" ? "success" : project.status === "booked" ? "warning" : "default"}>
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex gap-6 text-sm" style={{ fontFamily: "var(--font-outfit)" }}>
                          <p className="text-secondary-light">
                            Type: <span className="text-secondary font-medium">{project.type}</span>
                          </p>
                          <p className="text-secondary-light">
                            Dates: <span className="text-secondary font-medium">{project.shootDateStart} - {project.shootDateEnd}</span>
                          </p>
                          <p className="text-secondary-light">
                            Roles: <span className="text-secondary font-medium">{projectRoles.length}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="text-sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setViewMode("edit-project");
                          }}
                        >
                          Edit
                        </Button>
                        {project.status !== "archived" && (
                          <Button
                            variant="outline"
                            className="text-sm text-gray-600 hover:text-gray-800"
                            onClick={() => handleArchiveProject(project.id)}
                          >
                            📦 Archive
                          </Button>
                        )}
                        {project.status !== "archived" && (
                          <Button
                            variant="outline"
                            className="text-sm text-danger"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            Delete
                          </Button>
                        )}
                        {project.status === "archived" && (
                          <Badge variant="default" className="text-xs">
                            Archived
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Active Roles List */}
                    {projectRoles.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-accent/10">
                        <h4 className="text-sm font-semibold text-secondary mb-3" style={{ fontFamily: "var(--font-outfit)" }}>
                          Active Roles ({projectRoles.length}): {projectRoles.filter(r => r.archivedWithProject || r.archivedIndividually).length > 0 && <span className="text-red-500 text-xs">(Some roles have archive flags - check Firestore!)</span>}
                        </h4>
                        <div className="space-y-2">
                          {projectRoles.map((role) => {
                            const roleBookings: any[] = []; // Bookings collection removed
                            return (
                              <div
                                key={role.id}
                                className="bg-white/50 rounded-lg p-3"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-outfit)" }}>
                                        {role.name}
                                      </h5>
                                      <Badge variant={role.bookingStatus === "booking" ? "success" : "default"}>
                                        {role.bookingStatus === "booking" ? "Accepting Submissions" : "Closed"}
                                      </Badge>
                                      {roleBookings.length > 0 && (
                                        <Badge variant="info">
                                          {roleBookings.length} Booked
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex gap-4 text-xs text-secondary-light mb-2">
                                      <span>Dates: {role.bookingDates.join(", ")}</span>
                                      <span>•</span>
                                      <span>Location: {role.location}</span>
                                      <span>•</span>
                                      <span>Rate: {role.rate}</span>
                                      <span>•</span>
                                      <span>{role.requirements}</span>
                                    </div>
                                    {role.additionalNotes && (
                                      <div className="mt-2 pt-2 border-t border-accent/10">
                                        <p className="text-xs text-secondary-light">
                                          <span className="font-semibold text-secondary">Notes:</span> {role.additionalNotes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  {project.status !== "archived" && (
                                    <Button
                                      variant="outline"
                                      className="text-xs text-gray-600 hover:text-gray-800 ml-2"
                                      onClick={() => handleArchiveRoleClick(role)}
                                    >
                                      Archive Role
                                    </Button>
                                  )}
                                </div>

                                {/* Booked Talent */}
                                {roleBookings.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-accent/10">
                                    <p className="text-xs font-semibold text-accent mb-2">Booked Talent:</p>
                                    <div className="space-y-1">
                                      {roleBookings.map((booking) => (
                                        <div
                                          key={booking.id}
                                          className="flex items-center justify-between text-xs bg-green-50 rounded px-2 py-1"
                                        >
                                          <span className="font-medium text-secondary">
                                            {booking.talentProfile?.basicInfo?.firstName}{" "}
                                            {booking.talentProfile?.basicInfo?.lastName}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <Badge variant="success" className="text-[10px] px-2 py-0">
                                              {booking.status}
                                            </Badge>
                                            <span className="text-secondary-light">
                                              {booking.talentProfile?.basicInfo?.phone}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Archived Roles Section (Collapsible) */}
                    {projectRoles.filter(r => r.archivedIndividually && !r.archivedWithProject).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-accent/10">
                        <button
                          onClick={() => toggleArchivedRoles(project.id)}
                          className="flex items-center gap-2 text-sm font-semibold text-secondary-light hover:text-secondary mb-3"
                          style={{ fontFamily: "var(--font-outfit)" }}
                        >
                          <span>{showArchivedRoles[project.id] ? "▼" : "▶"}</span>
                          <span>Archived Roles ({projectRoles.filter(r => r.archivedIndividually && !r.archivedWithProject).length})</span>
                        </button>
                        {showArchivedRoles[project.id] && (
                          <div className="space-y-2">
                            {projectRoles.filter(r => r.archivedIndividually && !r.archivedWithProject).map((role) => (
                              <div
                                key={role.id}
                                className="bg-gray-50/50 rounded-lg p-3 border border-gray-200"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-semibold text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                                        {role.name}
                                      </h5>
                                      <Badge variant="default">Archived</Badge>
                                    </div>
                                    <div className="flex gap-4 text-xs text-secondary-light mb-2">
                                      <span>Dates: {role.bookingDates.join(", ")}</span>
                                      <span>•</span>
                                      <span>Location: {role.location}</span>
                                      <span>•</span>
                                      <span>Rate: {role.rate}</span>
                                    </div>
                                    {role.archiveReason && (
                                      <div className="mt-2 pt-2 border-t border-gray-200">
                                        <p className="text-xs text-secondary-light">
                                          <span className="font-semibold text-secondary">Archive Reason:</span> {role.archiveReason}
                                        </p>
                                      </div>
                                    )}
                                    {role.archivedAt && (
                                      <p className="text-xs text-secondary-light mt-1">
                                        Archived: {role.archivedAt instanceof Date ? role.archivedAt.toLocaleDateString() : "N/A"}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="outline"
                                    className="text-xs text-accent hover:text-accent-dark ml-2"
                                    onClick={() => handleRestoreRole(role.id, role.name)}
                                  >
                                    Restore
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* New/Edit Project Form */}
        {(viewMode === "new-project" || viewMode === "edit-project") && (
          <ProjectForm
            project={selectedProject}
            existingRoles={selectedProject ? roles.filter((r) => r.projectId === selectedProject.id) : []}
            onSave={async () => {
              await fetchData();
              setViewMode("projects");
              setSelectedProject(null);
            }}
            onCancel={() => {
              setViewMode("projects");
              setSelectedProject(null);
            }}
          />
        )}

        {/* Archive Role Confirmation Dialog */}
        {archiveDialogRole && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3
                className="text-xl font-bold text-secondary mb-4"
                style={{ fontFamily: "var(--font-galindo)" }}
              >
                Archive Role: {archiveDialogRole.name}
              </h3>
              <p className="text-sm text-secondary-light mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
                This will hide the role from talent and mark all submissions as archived.
                The role can be restored later if needed.
              </p>
              <Textarea
                label="Reason for Archiving (Optional)"
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                rows={3}
                placeholder="e.g., Role filled, No longer needed, Project delayed..."
              />
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setArchiveDialogRole(null);
                    setArchiveReason("");
                  }}
                  className="flex-1"
                  disabled={archivingRole}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleArchiveRoleConfirm}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                  disabled={archivingRole}
                >
                  {archivingRole ? "Archiving..." : "Archive Role"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Project Form Component with Inline Roles
function ProjectForm({
  project,
  existingRoles,
  onSave,
  onCancel,
}: {
  project: Project | null;
  existingRoles: Role[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: number]: boolean }>({});
  const [roles, setRoles] = useState<RoleFormData[]>(
    existingRoles.length > 0
      ? existingRoles.map((r) => ({
          id: r.id, // Preserve existing role ID
          name: r.name,
          requirements: r.requirements,
          rate: r.rate,
          bookingDates: r.bookingDates, // Already migrated by the fetch logic
          location: r.location,
          bookingStatus: r.bookingStatus,
          additionalNotes: r.additionalNotes || "",
          referenceImageUrl: r.referenceImageUrl || "",
        }))
      : [
          {
            name: "",
            requirements: "",
            rate: "",
            bookingDates: [""], // Start with one empty date
            location: "",
            bookingStatus: "booking" as const,
            additionalNotes: "",
            referenceImageUrl: "",
          },
        ]
  );

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: project || {
      status: "booking",
    },
  });

  const addRole = () => {
    setRoles([
      ...roles,
      {
        name: "",
        requirements: "",
        rate: "",
        bookingDates: [""], // Start with one empty date
        location: "",
        bookingStatus: "booking" as const,
        additionalNotes: "",
        referenceImageUrl: "",
      },
    ]);
  };

  const removeRole = (index: number) => {
    if (roles.length > 1) {
      setRoles(roles.filter((_, i) => i !== index));
    }
  };

  // Add a new booking date to a specific role
  const addBookingDate = (roleIndex: number) => {
    const updatedRoles = [...roles];
    updatedRoles[roleIndex].bookingDates.push("");
    setRoles(updatedRoles);
  };

  // Remove a specific booking date from a role
  const removeBookingDate = (roleIndex: number, dateIndex: number) => {
    const updatedRoles = [...roles];
    // Ensure at least one date field remains
    if (updatedRoles[roleIndex].bookingDates.length > 1) {
      updatedRoles[roleIndex].bookingDates.splice(dateIndex, 1);
      setRoles(updatedRoles);
    }
  };

  // Update a specific booking date
  const updateBookingDate = (roleIndex: number, dateIndex: number, value: string) => {
    const updatedRoles = [...roles];
    updatedRoles[roleIndex].bookingDates[dateIndex] = value;
    setRoles(updatedRoles);
  };

  const updateRole = (index: number, field: keyof RoleFormData, value: string | "booking" | "booked") => {
    const newRoles = [...roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    setRoles(newRoles);
  };

  const handleFileUpload = async (index: number, file: File) => {
    if (!file || !storage) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid file type (PNG, JPG, GIF, PDF)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      setUploadingFiles(prev => ({ ...prev, [index]: true }));

      // Create a unique filename
      const timestamp = Date.now();
      const filename = `role-references/${timestamp}_${file.name}`;
      const storageRef = ref(storage, filename);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update role with image URL
      updateRole(index, 'referenceImageUrl', downloadURL);

      logger.debug(`✅ File uploaded successfully for role ${index + 1}`);
    } catch (error) {
      logger.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [index]: false }));
    }
  };

  const onSubmit = async (data: Partial<Project>) => {
    // Validate roles
    const invalidRoles = roles.filter((r) => !r.name || !r.requirements || !r.rate || !r.bookingDates || r.bookingDates.length === 0 || r.bookingDates.some(d => !d) || !r.location);
    if (invalidRoles.length > 0) {
      alert("Please fill in all role fields (each role must have at least one booking date)");
      return;
    }

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);

      if (project) {
        // Update project
        const projectRef = doc(db, "projects", project.id);
        batch.update(projectRef, data);

        // Track existing role IDs to identify deletions
        const existingRoleIds = new Set(existingRoles.map((r) => r.id));
        const currentRoleIds = new Set(roles.filter((r) => r.id).map((r) => r.id!));

        // Delete roles that were removed from the form
        const rolesToDelete = Array.from(existingRoleIds).filter(
          (id) => !currentRoleIds.has(id)
        );
        rolesToDelete.forEach((roleId) => {
          batch.delete(doc(db, "roles", roleId));
        });

        // Update existing roles and create new ones
        roles.forEach((role) => {
          const roleData = {
            name: role.name,
            requirements: role.requirements,
            rate: role.rate,
            bookingDates: role.bookingDates,
            location: role.location,
            bookingStatus: role.bookingStatus,
            additionalNotes: role.additionalNotes || "",
            referenceImageUrl: role.referenceImageUrl || "",
            projectId: project.id,
          };

          if (role.id) {
            // Update existing role (preserves role ID)
            batch.update(doc(db, "roles", role.id), roleData);
          } else {
            // Create new role
            const newRoleRef = doc(collection(db, "roles"));
            batch.set(newRoleRef, roleData);
          }
        });

        await batch.commit();
      } else {
        // Create new project
        const projectRef = await addDoc(collection(db, "projects"), data);

        // Add roles
        const roleBatch = writeBatch(db);
        roles.forEach((role) => {
          const roleRef = doc(collection(db, "roles"));
          roleBatch.set(roleRef, {
            name: role.name,
            requirements: role.requirements,
            rate: role.rate,
            bookingDates: role.bookingDates,
            location: role.location,
            bookingStatus: role.bookingStatus,
            additionalNotes: role.additionalNotes || "",
            referenceImageUrl: role.referenceImageUrl || "",
            projectId: projectRef.id,
          });
        });
        await roleBatch.commit();
      }

      onSave();
    } catch (error) {
      logger.error("Error saving project:", error);
      alert("Failed to save project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-linear-to-br from-white to-purple-50/30 rounded-xl p-8 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
      <h2 className="text-2xl font-bold text-secondary mb-6" style={{ fontFamily: "var(--font-galindo)" }}>
        {project ? "Edit Project" : "New Project"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Project Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-secondary" style={{ fontFamily: "var(--font-outfit)" }}>
            Project Details
          </h3>

          <Input
            label="Project Title"
            {...register("title", { required: "Title is required" })}
            error={errors.title?.message as string}
            placeholder="e.g., Feature Film Title"
          />

          <Select
            label="Type"
            {...register("type", { required: "Type is required" })}
            options={[
              { value: "", label: "Select Type" },
              { value: "film", label: "Film" },
              { value: "tv", label: "TV" },
              { value: "commercial", label: "Commercial" },
              { value: "music-video", label: "Music Video" },
              { value: "event", label: "Event" },
            ]}
            error={errors.type?.message as string}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="shootDateStart"
              control={control}
              rules={{ required: "Start date is required" }}
              render={({ field }) => (
                <DatePicker
                  label="Shoot Start Date"
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  error={errors.shootDateStart?.message as string}
                  placeholder="Select start date"
                />
              )}
            />

            <Controller
              name="shootDateEnd"
              control={control}
              rules={{ required: "End date is required" }}
              render={({ field }) => (
                <DatePicker
                  label="Shoot End Date"
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  error={errors.shootDateEnd?.message as string}
                  placeholder="Select end date"
                />
              )}
            />
          </div>

          <Select
            label="Project Status"
            {...register("status", { required: "Status is required" })}
            options={[
              { value: "booking", label: "Booking" },
              { value: "booked", label: "Booked" },
              { value: "archived", label: "Archived" },
            ]}
            error={errors.status?.message as string}
          />
        </div>

        {/* Roles */}
        <div className="space-y-6 pt-6 border-t border-accent/20">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-secondary" style={{ fontFamily: "var(--font-outfit)" }}>
              Roles ({roles.length})
            </h3>
            <Button type="button" variant="outline" onClick={addRole}>
              + Add Role
            </Button>
          </div>

          {roles.map((role, index) => (
            <div
              key={index}
              className="bg-white/50 rounded-lg p-6 space-y-4 border border-accent/10"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-outfit)" }}>
                  Role {index + 1}
                </h4>
                {roles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRole(index)}
                    className="text-danger text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <Input
                label="Role Name"
                value={role.name}
                onChange={(e) => updateRole(index, "name", e.target.value)}
                placeholder="e.g., Club Patron, Lead Character"
              />

              <Textarea
                label="Requirements"
                value={role.requirements}
                onChange={(e) => updateRole(index, "requirements", e.target.value)}
                rows={3}
                placeholder="e.g., Ages 21-35, casual club attire"
              />

              <Textarea
                label="Additional Notes (Optional)"
                value={role.additionalNotes || ""}
                onChange={(e) => updateRole(index, "additionalNotes", e.target.value)}
                rows={3}
                placeholder="Any additional information about this role..."
              />

              {/* Reference Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-secondary">
                  Reference Image (Optional)
                </label>
                <p className="text-xs text-secondary-light mb-2">
                  Upload a reference image for this role (PNG, JPG, GIF, PDF). Max 10MB.
                </p>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(index, file);
                    }
                  }}
                  disabled={uploadingFiles[index]}
                  className="block w-full text-sm text-secondary-light
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-accent file:text-white
                    hover:file:bg-accent-dark
                    file:cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {uploadingFiles[index] && (
                  <p className="text-xs text-accent">Uploading...</p>
                )}
                {role.referenceImageUrl && !uploadingFiles[index] && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600 mb-2">✓ Reference image uploaded</p>
                    {role.referenceImageUrl.endsWith('.pdf') ? (
                      <a
                        href={role.referenceImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline"
                      >
                        View PDF
                      </a>
                    ) : (
                      <img
                        src={role.referenceImageUrl}
                        alt="Role reference"
                        className="w-32 h-32 object-cover rounded border border-accent/20"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => updateRole(index, 'referenceImageUrl', '')}
                      className="text-xs text-red-600 hover:underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Booking Dates - Multiple dates support */}
              <div>
                <label
                  className="block text-sm font-medium text-secondary mb-2"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Booking Dates *
                </label>

                <div className="space-y-3">
                  {role.bookingDates.map((date, dateIndex) => (
                    <div key={dateIndex} className="flex items-center gap-2">
                      <div className="flex-1">
                        <DatePicker
                          value={date}
                          onChange={(value) => updateBookingDate(index, dateIndex, value)}
                          name={`role-${index}-date-${dateIndex}`}
                          placeholder="Select booking date"
                        />
                      </div>

                      {/* Remove Date Button - Only show if more than 1 date */}
                      {role.bookingDates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBookingDate(index, dateIndex)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove this date"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add Booking Date Button */}
                  <button
                    type="button"
                    onClick={() => addBookingDate(index)}
                    className="w-full py-2 px-4 border-2 border-dashed border-accent/40 rounded-lg text-accent hover:bg-accent/5 transition-colors flex items-center justify-center gap-2"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Booking Date
                  </button>
                </div>
              </div>

              <div>
                <Input
                  label="Location"
                  value={role.location}
                  onChange={(e) => updateRole(index, "location", e.target.value)}
                  placeholder="e.g., Atlanta, GA"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Rate"
                  value={role.rate}
                  onChange={(e) => updateRole(index, "rate", e.target.value)}
                  placeholder="e.g., $120/8hr"
                />

                <Select
                  label="Booking Status"
                  value={role.bookingStatus}
                  onChange={(e) => updateRole(index, "bookingStatus", e.target.value as "booking" | "booked")}
                  options={[
                    { value: "booking", label: "Accepting Submissions" },
                    { value: "booked", label: "Closed" },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
