"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { logger } from "@/lib/logger";
import { getProjects, getRoles, updateProject, updateRole, type ProjectRow, type RoleRow } from "@/lib/supabase/casting";
import { restoreRole } from "@/lib/supabase/roles";
import { createClient } from "@/lib/supabase/config";

interface ArchivedProject {
  id: string;
  title: string;
  type: "film" | "tv" | "commercial" | "theater" | "web" | "vertical short" | "other";
  shootDateStart: string;
  shootDateEnd: string;
  status: "archived";
  archivedAt?: Date;
  archivedBy?: string;
  completionNotes?: string;
  roleCount: number;
  submissionCount: number;
}

interface ArchivedRole {
  id: string;
  projectId: string;
  projectTitle: string;
  projectStatus: "booking" | "booked" | "archived";
  name: string;
  requirements: string;
  rate: string;
  date: string;
  location: string;
  archivedAt?: Date;
  archivedBy?: string;
  archiveReason?: string;
  submissionCount: number;
}

// Schema adapter functions
function mapProjectType(type: string | null | undefined): "film" | "tv" | "commercial" | "theater" | "web" | "vertical short" | "other" {
  switch (type) {
    case "film": return "film";
    case "tv": return "tv";
    case "commercial": return "commercial";
    case "theater": return "theater";
    case "web": return "web";
    case "vertical short": return "vertical short";
    case "other": return "other";
    default: return "film";
  }
}

function mapProjectStatus(status: string): "booking" | "booked" | "archived" {
  switch (status) {
    case "active": return "booking";
    case "closed": return "booked";
    case "archived": return "archived";
    default: return "booking";
  }
}

function mapProjectStatusToSupabase(status: string | undefined): "active" | "closed" | "archived" {
  switch (status) {
    case "booking": return "active";
    case "booked": return "closed";
    case "archived": return "archived";
    default: return "active";
  }
}

export default function ArchivePage() {
  const [archivedProjects, setArchivedProjects] = useState<ArchivedProject[]>([]);
  const [archivedRoles, setArchivedRoles] = useState<ArchivedRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [restoringRole, setRestoringRole] = useState<string | null>(null);

  useEffect(() => {
    fetchArchivedProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchArchivedProjects = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch archived projects
      const { data: projectsData, error: projectsError } = await getProjects({ status: "archived" });

      if (projectsError) {
        throw projectsError;
      }

      const projects = await Promise.all(
        (projectsData || []).map(async (projectRow) => {
          // Count roles
          const { data: rolesData } = await getRoles({ projectId: projectRow.id });
          const roleCount = rolesData?.length || 0;

          // Count submissions
          const { count: submissionCount } = await supabase
            .from("submissions")
            .select("*", { count: "exact", head: true })
            .eq("project_id", projectRow.id);

          return {
            id: projectRow.id,
            title: projectRow.title,
            type: mapProjectType(projectRow.project_type),
            shootDateStart: projectRow.start_date || "",
            shootDateEnd: projectRow.end_date || "",
            status: "archived" as const,
            archivedAt: projectRow.updated_at ? new Date(projectRow.updated_at) : undefined,
            archivedBy: undefined, // Not stored in current schema
            completionNotes: undefined, // Not stored in current schema
            roleCount: roleCount,
            submissionCount: submissionCount || 0,
          } as ArchivedProject;
        })
      );

      // Sort by archived date (newest first)
      projects.sort((a, b) => {
        const dateA = a.archivedAt instanceof Date ? a.archivedAt.getTime() : 0;
        const dateB = b.archivedAt instanceof Date ? b.archivedAt.getTime() : 0;
        return dateB - dateA;
      });

      setArchivedProjects(projects);

      // Fetch individually archived roles (roles with status 'archived' but project not archived)
      const { data: allRolesData } = await getRoles({ status: "archived" });

      const roles = await Promise.all(
        (allRolesData || []).map(async (roleRow) => {
          // Get project info
          const { data: projectData } = await supabase
            .from("projects")
            .select("*")
            .eq("id", roleRow.project_id)
            .single();

          // Only include if project is NOT archived (individually archived roles)
          if (projectData?.status === "archived") {
            return null;
          }

          // Count submissions
          const { count: submissionCount } = await supabase
            .from("submissions")
            .select("*", { count: "exact", head: true })
            .eq("role_id", roleRow.id);

          return {
            id: roleRow.id,
            projectId: roleRow.project_id,
            projectTitle: projectData?.title || "Unknown Project",
            projectStatus: mapProjectStatus(projectData?.status || "active"),
            name: roleRow.title,
            requirements: roleRow.description || "",
            rate: roleRow.pay_rate || "",
            date: roleRow.shoot_dates || "",
            location: roleRow.shoot_location || "",
            archivedAt: roleRow.updated_at ? new Date(roleRow.updated_at) : undefined,
            archivedBy: undefined, // Not stored in current schema
            archiveReason: undefined, // Not stored in current schema
            submissionCount: submissionCount || 0,
          } as ArchivedRole;
        })
      );

      // Filter out null entries (roles archived with project)
      const individuallyArchivedRoles = roles.filter((r): r is ArchivedRole => r !== null);

      // Sort by archived date (newest first)
      individuallyArchivedRoles.sort((a, b) => {
        const dateA = a.archivedAt instanceof Date ? a.archivedAt.getTime() : 0;
        const dateB = b.archivedAt instanceof Date ? b.archivedAt.getTime() : 0;
        return dateB - dateA;
      });

      setArchivedRoles(individuallyArchivedRoles);
    } catch (error) {
      logger.error("Error fetching archived data:", error);
      alert("Failed to load archived data");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreProject = async (projectId: string) => {
    const project = archivedProjects.find(p => p.id === projectId);
    if (!project) return;

    if (!confirm(
      `Restore "${project.title}"?\n\n` +
      `This will restore the project and all associated roles and submissions to active status.\n\n` +
      `• ${project.roleCount} roles will be restored\n` +
      `• ${project.submissionCount} submissions will be restored\n\n` +
      `Continue?`
    )) {
      return;
    }

    try {
      setRestoring(projectId);
      logger.debug(`🔄 Starting restore process for project: ${project.title}`);

      const supabase = createClient();

      // Update project status back to "closed" (booked)
      const { error: projectError } = await updateProject(projectId, {
        status: "closed", // "booked" in UI terms
      });

      if (projectError) {
        throw projectError;
      }

      // Restore all roles
      const { data: rolesData } = await getRoles({ projectId });

      if (rolesData) {
        for (const role of rolesData) {
          await updateRole(role.id, {
            status: "open", // Restore to open status
          });
        }
      }

      // Restore all submissions (back to null status)
      const { data: submissionsData } = await supabase
        .from("submissions")
        .select("id")
        .eq("project_id", projectId);

      if (submissionsData) {
        for (const submission of submissionsData) {
          await supabase
            .from("submissions")
            .update({
              status: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", submission.id);
        }
      }

      const roleCount = rolesData?.length || 0;
      const submissionCount = submissionsData?.length || 0;

      logger.debug(`✅ Restored project: ${project.title}`);
      logger.debug(`  - ${roleCount} roles restored`);
      logger.debug(`  - ${submissionCount} submissions restored`);

      alert(
        `Project "${project.title}" restored successfully!\n\n` +
        `• ${roleCount} roles restored\n` +
        `• ${submissionCount} submissions restored\n\n` +
        `The project is now active again.`
      );

      await fetchArchivedProjects();
    } catch (error) {
      logger.error("Error restoring project:", error);
      alert("Failed to restore project. Please try again.");
    } finally {
      setRestoring(null);
    }
  };

  const handleRestoreIndividualRole = async (role: ArchivedRole) => {
    if (!confirm(
      `Restore role "${role.name}"?\n\n` +
      `This will make the role visible to talent again and restore ${role.submissionCount} submission(s).\n\n` +
      `Project: ${role.projectTitle} (${role.projectStatus === "archived" ? "Archived" : "Active"})\n\n` +
      `Continue?`
    )) {
      return;
    }

    try {
      setRestoringRole(role.id);
      logger.debug(`🔄 Restoring individually archived role: ${role.name}`);

      await restoreRole(role.id);

      logger.debug(`✅ Restored role: ${role.name}`);
      alert(
        `Role "${role.name}" restored successfully!\n\n` +
        `• ${role.submissionCount} submissions restored\n\n` +
        `The role is now visible to talent.`
      );

      await fetchArchivedProjects();
    } catch (error: unknown) {
      logger.error("Error restoring role:", error);
      const message = error instanceof Error ? error.message : "Failed to restore role. Please try again.";
      alert(message);
    } finally {
      setRestoringRole(null);
    }
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-100 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-accent hover:text-accent-dark text-sm mb-2 inline-block">
            ← Back to Admin
          </Link>
          <h1
            className="text-3xl md:text-4xl font-bold text-secondary mb-4"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            📦 Archive{" "}
            <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Center
            </span>
          </h1>
          <p
            className="text-secondary-light max-w-2xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            View archived projects and individually archived roles. All data is preserved for compliance and future reference.
          </p>
        </div>

        {/* Archived Projects Section */}
        <div className="mb-12">
          <h2
            className="text-2xl font-bold text-secondary mb-6"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Archived Projects ({archivedProjects.length})
          </h2>
          {archivedProjects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
              <div className="text-5xl mb-4">📦</div>
              <p
                className="text-secondary-light mb-4"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                No archived projects yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {archivedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-linear-to-br from-white to-gray-50/30 rounded-xl p-6 border-2 border-gray-300 shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className="text-2xl font-bold text-secondary"
                          style={{ fontFamily: "var(--font-galindo)" }}
                        >
                          {project.title}
                        </h3>
                        <Badge variant="default">Archived</Badge>
                        <Badge variant="purple">{project.type}</Badge>
                      </div>
                      <p className="text-sm text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                        Archived: {project.archivedAt instanceof Date ? project.archivedAt.toLocaleDateString() : "N/A"}
                      </p>
                      {project.completionNotes && (
                        <p className="text-sm text-secondary mt-2" style={{ fontFamily: "var(--font-outfit)" }}>
                          Notes: {project.completionNotes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      className="text-sm"
                      onClick={() => handleRestoreProject(project.id)}
                      disabled={restoring === project.id}
                    >
                      {restoring === project.id ? "Restoring..." : "🔄 Restore Project"}
                    </Button>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent" style={{ fontFamily: "var(--font-galindo)" }}>
                        {project.roleCount}
                      </p>
                      <p className="text-xs text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                        Roles
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600" style={{ fontFamily: "var(--font-galindo)" }}>
                        {project.submissionCount}
                      </p>
                      <p className="text-xs text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                        Submissions
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                        <strong>Shoot Dates:</strong><br />
                        {project.shootDateStart} to {project.shootDateEnd}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
                    <Link href={`/admin/casting?project=${project.id}`}>
                      <Button variant="outline" className="text-sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Individually Archived Roles Section */}
        <div className="mb-12">
          <h2
            className="text-2xl font-bold text-secondary mb-6"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Individually Archived Roles ({archivedRoles.length})
          </h2>
          {archivedRoles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
              <div className="text-5xl mb-4">🎬</div>
              <p
                className="text-secondary-light mb-4"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                No individually archived roles yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {archivedRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-linear-to-br from-white to-blue-50/30 rounded-xl p-6 border-2 border-blue-200 shadow-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className="text-xl font-bold text-secondary"
                          style={{ fontFamily: "var(--font-galindo)" }}
                        >
                          {role.name}
                        </h3>
                        <Badge variant="default">Archived</Badge>
                        {role.projectStatus === "archived" ? (
                          <Badge variant="warning">Project Archived</Badge>
                        ) : (
                          <Badge variant="success">Project Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-secondary-light mb-3" style={{ fontFamily: "var(--font-outfit)" }}>
                        <strong>Project:</strong> {role.projectTitle}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                            <strong>Date:</strong> {role.date}
                          </p>
                          <p className="text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                            <strong>Location:</strong> {role.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                            <strong>Rate:</strong> {role.rate}
                          </p>
                          <p className="text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                            <strong>Submissions:</strong> {role.submissionCount}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-secondary-light mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
                        <strong>Requirements:</strong> {role.requirements}
                      </p>
                      {role.archiveReason && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-sm text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                            <strong>Archive Reason:</strong> {role.archiveReason}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-secondary-light mt-2" style={{ fontFamily: "var(--font-outfit)" }}>
                        Archived: {role.archivedAt instanceof Date ? role.archivedAt.toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      className="text-sm ml-4"
                      onClick={() => handleRestoreIndividualRole(role)}
                      disabled={restoringRole === role.id}
                    >
                      {restoringRole === role.id ? "Restoring..." : "🔄 Restore"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        {(archivedProjects.length > 0 || archivedRoles.length > 0) && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3
              className="text-lg font-bold text-secondary mb-4"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              ℹ️ About the Archive System
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-secondary mb-2" style={{ fontFamily: "var(--font-galindo)" }}>
                  Archived Projects:
                </h4>
                <ul className="text-sm text-secondary-light space-y-1" style={{ fontFamily: "var(--font-outfit)" }}>
                  <li>• Archives entire project with all roles and bookings</li>
                  <li>• Preserves all data for 7+ years (IRS compliance)</li>
                  <li>• Can be restored if project needs to be reactivated</li>
                  <li>• Tracks talent performance history</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-secondary mb-2" style={{ fontFamily: "var(--font-galindo)" }}>
                  Individual Archived Roles:
                </h4>
                <ul className="text-sm text-secondary-light space-y-1" style={{ fontFamily: "var(--font-outfit)" }}>
                  <li>• Archives single role without affecting project</li>
                  <li>• Hides role from talent while keeping project active</li>
                  <li>• Preserves all submissions for the role</li>
                  <li>• Can be restored independently</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
