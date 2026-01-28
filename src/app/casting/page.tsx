"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

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
  additionalNotes?: string;
  referenceImageUrl?: string;
}

interface RoleWithProject extends Role {
  project: Project;
}

export default function CastingPage() {
  const { isAdmin } = useAuth();
  const [roles, setRoles] = useState<RoleWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchRoles() {
    try {
      setLoading(true);

      // Fetch booking projects (not booked or archived)
      const projectsRef = collection(db, "projects");
      const projectsQuery = query(projectsRef, where("status", "==", "booking"));
      const projectsSnapshot = await getDocs(projectsQuery);

      const projects: Record<string, Project> = {};
      projectsSnapshot.forEach((doc) => {
        projects[doc.id] = { id: doc.id, ...doc.data() } as Project;
      });

      // Fetch all roles
      const rolesRef = collection(db, "roles");
      const rolesSnapshot = await getDocs(rolesRef);

      const rolesData: RoleWithProject[] = [];
      rolesSnapshot.forEach((doc) => {
        const roleData = { id: doc.id, ...doc.data() } as Role;
        const project = projects[roleData.projectId];

        if (project) {
          rolesData.push({
            ...roleData,
            project,
          });
        }
      });

      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter roles
  const filteredRoles = roles.filter((role) => {
    const statusMatch =
      statusFilter === "all" || role.bookingStatus === statusFilter;
    return statusMatch;
  });

  const openImageModal = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setCurrentImage(null);
  };

  const bookingStatusOptions = [
    { value: "all", label: "All Status" },
    { value: "booking", label: "Accepting Submissions" },
    { value: "booked", label: "Closed" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 md:pb-16 lg:pb-20 xl:pb-24 overflow-hidden bg-gradient-to-br from-secondary via-secondary-dark to-secondary">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight px-2 drop-shadow-lg animate-word"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              Current{" "}
              <span className="bg-gradient-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent glow-text">
                Casting Calls
              </span>
            </h1>
            <p
              className="text-lg md:text-xl text-white/90 leading-relaxed drop-shadow-md"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Browse available roles and submit your profile for background
              actor opportunities in Atlanta and the Southeast.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

        <section className="py-12 md:py-16 lg:py-20 xl:py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <div className="mb-8 max-w-md">
              <Select
                label="Booking Status"
                options={bookingStatusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
                <p
                  className="mt-4 text-lg text-secondary"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Loading casting calls...
                </p>
              </div>
            )}

            {/* No Roles Found */}
            {!loading && filteredRoles.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
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
                <h3
                  className="text-xl font-bold text-secondary mb-2"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  No casting calls available
                </h3>
                <p
                  className="text-base text-secondary-light"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Check back soon for new opportunities, or follow us on social
                  media for updates.
                </p>
              </div>
            )}

            {/* Roles Grid */}
            {!loading && filteredRoles.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredRoles.map((role, index) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-6 md:p-8 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300"
                  >
                    {/* Role Info */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className="text-xl md:text-2xl font-bold text-secondary"
                          style={{ fontFamily: "var(--font-galindo)" }}
                        >
                          {role.name}
                        </h3>
                        <Badge
                          variant={
                            role.bookingStatus === "booking"
                              ? "success"
                              : "danger"
                          }
                        >
                          {role.bookingStatus === "booking"
                            ? "Accepting Submissions"
                            : "Closed"}
                        </Badge>
                      </div>

                      {/* Role Details */}
                      <div className="flex flex-wrap gap-3 text-sm text-secondary-light mb-3">
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {role.date}
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {role.location}
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {role.rate}
                        </span>
                      </div>

                      {role.requirements && (
                        <div className="bg-purple-50/50 rounded-lg p-3 mb-4">
                          <p
                            className="text-sm font-medium text-secondary-light"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            <span className="font-bold text-accent">
                              Requirements:
                            </span>{" "}
                            {role.requirements}
                          </p>
                        </div>
                      )}

                      {role.additionalNotes && (
                        <div className="bg-blue-50/50 rounded-lg p-3 mb-4">
                          <p
                            className="text-sm font-medium text-secondary-light"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            <span className="font-bold text-accent">
                              Additional Notes:
                            </span>{" "}
                            {role.additionalNotes}
                          </p>
                        </div>
                      )}

                      {role.referenceImageUrl && (
                        <div className="mb-4">
                          <button
                            onClick={() => openImageModal(role.referenceImageUrl!)}
                            className="text-sm text-accent hover:text-purple-600 underline transition-colors"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            View Example
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    {isAdmin ? (
                      <Link href="/admin/casting">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full"
                        >
                          Manage in Admin Panel
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/casting/submit/${role.id}`}>
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full"
                          disabled={role.bookingStatus === "booked"}
                        >
                          {role.bookingStatus === "booking"
                            ? "Submit for This Role"
                            : "Submissions Closed"}
                        </Button>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Image Modal - Full Screen */}
      {imageModalOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={closeImageModal}
        >
          {/* Close Button */}
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-secondary"
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

          {/* Full Screen Image */}
          <img
            src={currentImage}
            alt="Reference example"
            className="w-full h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
