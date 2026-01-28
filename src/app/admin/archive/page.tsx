"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";

interface ArchivedProject {
  id: string;
  title: string;
  type: "film" | "tv" | "commercial" | "music-video" | "event";
  shootDateStart: string;
  shootDateEnd: string;
  status: "archived";
  archivedAt?: Date;
  archivedBy?: string;
  completionNotes?: string;
  bookingCount: number;
  roleCount: number;
  submissionCount: number;
}

export default function ArchivePage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [archivedProjects, setArchivedProjects] = useState<ArchivedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin/archive");
      return;
    }
    if (user && isAdmin) {
      fetchArchivedProjects();
    }
  }, [authLoading, user, isAdmin, router]);

  const fetchArchivedProjects = async () => {
    try {
      setLoading(true);

      // Fetch archived projects
      const projectsQuery = query(
        collection(db, "projects"),
        where("status", "==", "archived")
      );
      const projectsSnapshot = await getDocs(projectsQuery);

      const projects = await Promise.all(
        projectsSnapshot.docs.map(async (projectDoc) => {
          const projectData = projectDoc.data();

          // Count bookings
          const bookingsQuery = query(
            collection(db, "bookings"),
            where("projectId", "==", projectDoc.id)
          );
          const bookingsSnapshot = await getDocs(bookingsQuery);

          // Count roles
          const rolesQuery = query(
            collection(db, "roles"),
            where("projectId", "==", projectDoc.id)
          );
          const rolesSnapshot = await getDocs(rolesQuery);

          // Count submissions
          const submissionsQuery = query(
            collection(db, "submissions"),
            where("projectId", "==", projectDoc.id)
          );
          const submissionsSnapshot = await getDocs(submissionsQuery);

          return {
            id: projectDoc.id,
            ...projectData,
            archivedAt: projectData.archivedAt?.toDate?.() || projectData.archivedAt,
            bookingCount: bookingsSnapshot.size,
            roleCount: rolesSnapshot.size,
            submissionCount: submissionsSnapshot.size,
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
    } catch (error) {
      console.error("Error fetching archived projects:", error);
      alert("Failed to load archived projects");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreProject = async (projectId: string) => {
    const project = archivedProjects.find(p => p.id === projectId);
    if (!project) return;

    if (!confirm(
      `Restore "${project.title}"?\n\n` +
      `This will restore the project and all associated roles, bookings, and submissions to active status.\n\n` +
      `• ${project.roleCount} roles will be restored\n` +
      `• ${project.bookingCount} bookings will be reactivated\n` +
      `• ${project.submissionCount} submissions will be restored\n\n` +
      `Continue?`
    )) {
      return;
    }

    try {
      setRestoring(projectId);
      console.log(`🔄 Starting restore process for project: ${project.title}`);

      const batch = writeBatch(db);

      // Update project status back to "booked"
      const projectRef = doc(db, "projects", projectId);
      batch.update(projectRef, {
        status: "booked",
        updatedAt: new Date(),
        // Keep archivedAt and archivedBy for historical record
      });

      // Restore all roles
      const rolesQuery = query(
        collection(db, "roles"),
        where("projectId", "==", projectId)
      );
      const rolesSnapshot = await getDocs(rolesQuery);
      rolesSnapshot.docs.forEach((roleDoc) => {
        batch.update(roleDoc.ref, {
          archivedWithProject: false,
          updatedAt: new Date(),
        });
      });

      // Restore all bookings (back to "confirmed" status)
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("projectId", "==", projectId)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      bookingsSnapshot.docs.forEach((bookingDoc) => {
        batch.update(bookingDoc.ref, {
          status: "confirmed",
          archivedWithProject: false,
          updatedAt: new Date(),
        });
      });

      // Restore all submissions (back to "accepted" status)
      const submissionsQuery = query(
        collection(db, "submissions"),
        where("projectId", "==", projectId)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      submissionsSnapshot.docs.forEach((submissionDoc) => {
        batch.update(submissionDoc.ref, {
          status: "selected",
          archivedWithProject: false,
          updatedAt: new Date(),
        });
      });

      await batch.commit();

      console.log(`✅ Restored project: ${project.title}`);
      console.log(`  - ${rolesSnapshot.size} roles restored`);
      console.log(`  - ${bookingsSnapshot.size} bookings reactivated`);
      console.log(`  - ${submissionsSnapshot.size} submissions restored`);

      alert(
        `Project "${project.title}" restored successfully!\n\n` +
        `• ${rolesSnapshot.size} roles restored\n` +
        `• ${bookingsSnapshot.size} bookings reactivated\n` +
        `• ${submissionsSnapshot.size} submissions restored\n\n` +
        `The project is now active again.`
      );

      await fetchArchivedProjects();
    } catch (error) {
      console.error("Error restoring project:", error);
      alert("Failed to restore project. Please try again.");
    } finally {
      setRestoring(null);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50">
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
            📦 Archived{" "}
            <span className="bg-gradient-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Projects
            </span>
          </h1>
          <p
            className="text-secondary-light max-w-2xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            View completed projects and historical casting data. All booking records are preserved for compliance and future reference.
          </p>
        </div>

        {/* Archived Projects List */}
        {archivedProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2
              className="text-2xl font-bold text-secondary mb-2"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              No Archived Projects
            </h2>
            <p
              className="text-secondary-light mb-6"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              When you archive completed projects, they'll appear here.
            </p>
            <Link href="/admin/casting">
              <Button variant="primary">Go to Casting Management</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {archivedProjects.map((project) => (
              <div
                key={project.id}
                className="bg-gradient-to-br from-white to-gray-50/30 rounded-xl p-6 border-2 border-gray-300 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2
                        className="text-2xl font-bold text-secondary"
                        style={{ fontFamily: "var(--font-galindo)" }}
                      >
                        {project.title}
                      </h2>
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
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent" style={{ fontFamily: "var(--font-galindo)" }}>
                      {project.roleCount}
                    </p>
                    <p className="text-xs text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                      Roles
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600" style={{ fontFamily: "var(--font-galindo)" }}>
                      {project.bookingCount}
                    </p>
                    <p className="text-xs text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
                      Bookings
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

        {/* Info Box */}
        {archivedProjects.length > 0 && (
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3
              className="text-lg font-bold text-secondary mb-2"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              ℹ️ About Archived Projects
            </h3>
            <ul className="text-sm text-secondary-light space-y-2" style={{ fontFamily: "var(--font-outfit)" }}>
              <li>• Archived projects preserve all booking records for 7+ years (IRS compliance)</li>
              <li>• All talent information, roles, and submissions remain accessible</li>
              <li>• You can restore projects if they need to be reactivated</li>
              <li>• Archived data helps with future casting by tracking talent performance history</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
