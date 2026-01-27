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
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import DatePicker from "@/components/ui/DatePicker";
import { useForm, Controller } from "react-hook-form";
import Link from "next/link";

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

interface RoleFormData {
  name: string;
  requirements: string;
  rate: string;
  date: string;
  location: string;
  bookingStatus: "booking" | "booked";
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

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin/casting");
    } else if (user && isAdmin) {
      fetchData();
    }
  }, [authLoading, user, isAdmin, router]);

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
        rolesData.push({ id: doc.id, ...doc.data() } as Role);
      });
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This will also delete all associated roles.")) {
      return;
    }

    try {
      // Delete associated roles
      const rolesQuery = query(collection(db, "roles"), where("projectId", "==", projectId));
      const rolesSnapshot = await getDocs(rolesQuery);
      const deletePromises = rolesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete project
      await deleteDoc(doc(db, "projects", projectId));
      await fetchData();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
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
            <h2 className="text-2xl font-bold text-secondary mb-6" style={{ fontFamily: "var(--font-galindo)" }}>
              Projects ({projects.length})
            </h2>

            <div className="space-y-6">
              {projects.map((project) => {
                const projectRoles = roles.filter((r) => r.projectId === project.id);
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
                        <Button
                          variant="outline"
                          className="text-sm text-danger"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Roles List */}
                    {projectRoles.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-accent/10">
                        <h4 className="text-sm font-semibold text-secondary mb-3" style={{ fontFamily: "var(--font-outfit)" }}>
                          Roles:
                        </h4>
                        <div className="space-y-2">
                          {projectRoles.map((role) => (
                            <div
                              key={role.id}
                              className="bg-white/50 rounded-lg p-3 flex justify-between items-start"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-semibold text-secondary" style={{ fontFamily: "var(--font-outfit)" }}>
                                    {role.name}
                                  </h5>
                                  <Badge variant={role.bookingStatus === "booking" ? "success" : "default"}>
                                    {role.bookingStatus}
                                  </Badge>
                                </div>
                                <div className="flex gap-4 text-xs text-secondary-light">
                                  <span>Date: {role.date}</span>
                                  <span>•</span>
                                  <span>Location: {role.location}</span>
                                  <span>•</span>
                                  <span>Rate: {role.rate}</span>
                                  <span>•</span>
                                  <span>{role.requirements}</span>
                                </div>
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
  const [roles, setRoles] = useState<RoleFormData[]>(
    existingRoles.length > 0
      ? existingRoles.map((r) => ({
          name: r.name,
          requirements: r.requirements,
          rate: r.rate,
          date: r.date,
          location: r.location,
          bookingStatus: r.bookingStatus,
        }))
      : [
          {
            name: "",
            requirements: "",
            rate: "",
            date: "",
            location: "",
            bookingStatus: "booking" as const,
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
        date: "",
        location: "",
        bookingStatus: "booking" as const,
      },
    ]);
  };

  const removeRole = (index: number) => {
    if (roles.length > 1) {
      setRoles(roles.filter((_, i) => i !== index));
    }
  };

  const updateRole = (index: number, field: keyof RoleFormData, value: any) => {
    const newRoles = [...roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    setRoles(newRoles);
  };

  const onSubmit = async (data: any) => {
    // Validate roles
    const invalidRoles = roles.filter((r) => !r.name || !r.requirements || !r.rate || !r.date || !r.location);
    if (invalidRoles.length > 0) {
      alert("Please fill in all role fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);

      if (project) {
        // Update project
        const projectRef = doc(db, "projects", project.id);
        batch.update(projectRef, data);

        // Delete old roles
        const oldRolesQuery = query(collection(db, "roles"), where("projectId", "==", project.id));
        const oldRolesSnapshot = await getDocs(oldRolesQuery);
        oldRolesSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        // Add new roles
        roles.forEach((role) => {
          const roleRef = doc(collection(db, "roles"));
          batch.set(roleRef, {
            ...role,
            projectId: project.id,
          });
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
            ...role,
            projectId: projectRef.id,
          });
        });
        await roleBatch.commit();
      }

      onSave();
    } catch (error) {
      console.error("Error saving project:", error);
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

              <div className="grid grid-cols-2 gap-4">
                <DatePicker
                  label="Date"
                  value={role.date}
                  onChange={(value) => updateRole(index, "date", value)}
                  name={`role-${index}-date`}
                  placeholder="Select date"
                />

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
                    { value: "booking", label: "Booking" },
                    { value: "booked", label: "Booked" },
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
