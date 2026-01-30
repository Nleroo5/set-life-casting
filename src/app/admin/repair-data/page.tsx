"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { logger } from "@/lib/logger";

interface OrphanedDocument {
  id: string;
  type: "booking" | "submission";
  roleId: string;
  roleName?: string;
  talentName?: string;
  userId: string;
  projectId: string;
}

interface RoleMapping {
  oldRoleId: string;
  newRoleId: string;
  roleName: string;
}

export default function DataRepairPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [orphanedDocs, setOrphanedDocs] = useState<OrphanedDocument[]>([]);
  const [currentRoles, setCurrentRoles] = useState<any[]>([]);
  const [mappings, setMappings] = useState<RoleMapping[]>([]);
  const [scanComplete, setScanComplete] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin/repair-data");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isAdmin]);

  const scanForOrphans = async () => {
    setScanning(true);
    setScanComplete(false);
    setOrphanedDocs([]);
    setMappings([]);

    try {
      logger.debug("🔍 Scanning for orphaned documents...");

      // Get all active roles
      const rolesSnapshot = await getDocs(collection(db, "roles"));
      const activeRoleIds = new Set(rolesSnapshot.docs.map((doc) => doc.id));
      const rolesData = rolesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        projectId: doc.data().projectId,
      }));

      setCurrentRoles(rolesData);
      logger.debug(`✅ Found ${activeRoleIds.size} active roles`);

      const orphaned: OrphanedDocument[] = [];

      // Check bookings
      const bookingsSnapshot = await getDocs(collection(db, "bookings"));
      logger.debug(`📦 Checking ${bookingsSnapshot.docs.length} bookings...`);

      bookingsSnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (!activeRoleIds.has(data.roleId)) {
          orphaned.push({
            id: docSnap.id,
            type: "booking",
            roleId: data.roleId,
            userId: data.userId,
            projectId: data.projectId,
            talentName: `${data.talentProfile?.basicInfo?.firstName} ${data.talentProfile?.basicInfo?.lastName}`,
          });
        }
      });

      // Check submissions
      const submissionsSnapshot = await getDocs(collection(db, "submissions"));
      logger.debug(`📦 Checking ${submissionsSnapshot.docs.length} submissions...`);

      submissionsSnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (!activeRoleIds.has(data.roleId)) {
          orphaned.push({
            id: docSnap.id,
            type: "submission",
            roleId: data.roleId,
            roleName: data.roleName,
            userId: data.userId,
            projectId: data.projectId,
          });
        }
      });

      logger.debug(`⚠️  Found ${orphaned.length} orphaned documents`);
      setOrphanedDocs(orphaned);
      setScanComplete(true);

      // Auto-detect mappings based on role names
      const uniqueOrphans = Array.from(
        new Set(orphaned.map((o) => JSON.stringify({ roleId: o.roleId, roleName: o.roleName })))
      ).map((str) => JSON.parse(str));

      const autoMappings: RoleMapping[] = [];
      uniqueOrphans.forEach((orphan) => {
        if (orphan.roleName) {
          const matchingRole = rolesData.find(
            (r) => r.name.toLowerCase() === orphan.roleName.toLowerCase()
          );
          if (matchingRole) {
            autoMappings.push({
              oldRoleId: orphan.roleId,
              newRoleId: matchingRole.id,
              roleName: orphan.roleName,
            });
            logger.debug(
              `🔗 Auto-mapped: "${orphan.roleName}" ${orphan.roleId} → ${matchingRole.id}`
            );
          }
        }
      });

      setMappings(autoMappings);
    } catch (error) {
      logger.error("Error scanning:", error);
      alert("Failed to scan database");
    } finally {
      setScanning(false);
    }
  };

  const updateMapping = (oldRoleId: string, newRoleId: string) => {
    setMappings((prev) => {
      const existing = prev.find((m) => m.oldRoleId === oldRoleId);
      if (existing) {
        return prev.map((m) =>
          m.oldRoleId === oldRoleId ? { ...m, newRoleId } : m
        );
      } else {
        const orphan = orphanedDocs.find((o) => o.roleId === oldRoleId);
        return [
          ...prev,
          {
            oldRoleId,
            newRoleId,
            roleName: orphan?.roleName || "Unknown",
          },
        ];
      }
    });
  };

  const repairData = async () => {
    if (mappings.length === 0) {
      alert("No mappings configured. Please select new role IDs first.");
      return;
    }

    if (
      !confirm(
        `This will update ${orphanedDocs.length} documents. Are you sure you want to proceed?`
      )
    ) {
      return;
    }

    setRepairing(true);

    try {
      logger.debug("🚀 Starting data repair...");

      const batch = writeBatch(db);
      let bookingsUpdated = 0;
      let submissionsUpdated = 0;

      for (const mapping of mappings) {
        logger.debug(`\n🔧 Applying mapping: ${mapping.oldRoleId} → ${mapping.newRoleId}`);

        // Update bookings
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));
        bookingsSnapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.roleId === mapping.oldRoleId) {
            batch.update(docSnap.ref, {
              roleId: mapping.newRoleId,
              updatedAt: new Date(),
            });
            bookingsUpdated++;
            logger.debug(`  ✅ Queued booking update: ${docSnap.id}`);
          }
        });

        // Update submissions
        const submissionsSnapshot = await getDocs(collection(db, "submissions"));
        submissionsSnapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.roleId === mapping.oldRoleId) {
            batch.update(docSnap.ref, {
              roleId: mapping.newRoleId,
              updatedAt: new Date(),
            });
            submissionsUpdated++;
            logger.debug(`  ✅ Queued submission update: ${docSnap.id}`);
          }
        });
      }

      await batch.commit();

      logger.debug(`\n✅ Updated ${bookingsUpdated} bookings`);
      logger.debug(`✅ Updated ${submissionsUpdated} submissions`);

      alert(
        `Data repair complete!\n\n` +
          `• Updated ${bookingsUpdated} bookings\n` +
          `• Updated ${submissionsUpdated} submissions\n\n` +
          `The skins export should now work correctly.`
      );

      // Reset state
      setOrphanedDocs([]);
      setMappings([]);
      setScanComplete(false);
    } catch (error) {
      logger.error("Error repairing data:", error);
      alert("Failed to repair data. Check console for details.");
    } finally {
      setRepairing(false);
    }
  };

  if (authLoading) {
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

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-100 via-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-secondary mb-4"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            🔧 Data{" "}
            <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Repair Tool
            </span>
          </h1>
          <p
            className="text-base text-secondary-light mb-4"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Fix orphaned bookings and submissions after role deletion/recreation
          </p>
          <Button variant="outline" onClick={() => router.push("/admin")}>
            ← Back to Dashboard
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-linear-to-br from-white to-blue-50/30 rounded-2xl p-6 border-2 border-blue-300 mb-6">
          <h2
            className="text-lg font-bold text-secondary mb-3"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            ℹ️ How to Use
          </h2>
          <ol
            className="text-sm text-secondary space-y-2 list-decimal list-inside"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            <li>
              Click <strong>"Scan Database"</strong> to find bookings and submissions with invalid
              role IDs
            </li>
            <li>Review the orphaned documents and verify the auto-detected mappings</li>
            <li>
              Adjust mappings if needed by selecting the correct new role ID for each old role
            </li>
            <li>
              Click <strong>"Repair Data"</strong> to update all affected documents
            </li>
          </ol>
        </div>

        {/* Scan Section */}
        <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent mb-6">
          <h2
            className="text-xl font-bold text-secondary mb-4"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Step 1: Scan for Orphaned Documents
          </h2>
          <Button variant="primary" onClick={scanForOrphans} disabled={scanning}>
            {scanning ? "Scanning..." : "🔍 Scan Database"}
          </Button>
        </div>

        {/* Results Section */}
        {scanComplete && (
          <>
            {orphanedDocs.length === 0 ? (
              <div className="bg-linear-to-br from-white to-green-50/30 rounded-2xl p-8 border-2 border-green-300 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2
                  className="text-2xl font-bold text-secondary mb-2"
                  style={{ fontFamily: "var(--font-galindo)" }}
                >
                  Database is Healthy!
                </h2>
                <p
                  className="text-secondary-light"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  No orphaned documents found. All bookings and submissions reference valid roles.
                </p>
              </div>
            ) : (
              <>
                {/* Orphaned Documents */}
                <div className="bg-linear-to-br from-white to-red-50/30 rounded-2xl p-6 border-2 border-red-300 mb-6">
                  <h2
                    className="text-xl font-bold text-secondary mb-4"
                    style={{ fontFamily: "var(--font-galindo)" }}
                  >
                    ⚠️ Found {orphanedDocs.length} Orphaned Document
                    {orphanedDocs.length !== 1 ? "s" : ""}
                  </h2>

                  <div className="space-y-2 mb-4">
                    {Array.from(new Set(orphanedDocs.map((o) => o.roleId))).map((roleId) => {
                      const docs = orphanedDocs.filter((o) => o.roleId === roleId);
                      const bookings = docs.filter((d) => d.type === "booking");
                      const submissions = docs.filter((d) => d.type === "submission");
                      const roleName = docs.find((d) => d.roleName)?.roleName || "Unknown Role";

                      return (
                        <div
                          key={roleId}
                          className="bg-white/70 rounded-lg p-4 border border-red-200"
                        >
                          <div className="font-semibold text-secondary mb-2">
                            🔴 Role: "{roleName}"
                          </div>
                          <div className="text-sm text-secondary-light mb-2">
                            Old Role ID: <code className="bg-gray-100 px-2 py-1 rounded">{roleId}</code>
                          </div>
                          <div className="text-sm text-secondary">
                            • {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
                            {bookings.length > 0 &&
                              ": " +
                                bookings
                                  .map((b) => b.talentName)
                                  .filter(Boolean)
                                  .join(", ")}
                          </div>
                          <div className="text-sm text-secondary">
                            • {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mapping Configuration */}
                <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent mb-6">
                  <h2
                    className="text-xl font-bold text-secondary mb-4"
                    style={{ fontFamily: "var(--font-galindo)" }}
                  >
                    Step 2: Configure Role Mappings
                  </h2>

                  {mappings.length > 0 && (
                    <div className="bg-green-50 border border-green-300 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-green-800 text-sm">
                        <span>✅</span>
                        <span>
                          Auto-detected {mappings.length} mapping{mappings.length !== 1 ? "s" : ""}{" "}
                          based on role names
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {Array.from(new Set(orphanedDocs.map((o) => o.roleId))).map((oldRoleId) => {
                      const orphan = orphanedDocs.find((o) => o.roleId === oldRoleId);
                      const mapping = mappings.find((m) => m.oldRoleId === oldRoleId);

                      return (
                        <div key={oldRoleId} className="bg-white/70 rounded-lg p-4 border border-accent/30">
                          <div className="mb-3">
                            <label className="block text-sm font-semibold text-secondary mb-1">
                              Old Role: "{orphan?.roleName || "Unknown"}"
                            </label>
                            <div className="text-xs text-secondary-light mb-2">
                              Old ID: {oldRoleId}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-secondary mb-2">
                              Map to New Role:
                            </label>
                            <select
                              className="w-full px-4 py-2 border-2 border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                              value={mapping?.newRoleId || ""}
                              onChange={(e) => updateMapping(oldRoleId, e.target.value)}
                              style={{ fontFamily: "var(--font-outfit)" }}
                            >
                              <option value="">-- Select New Role --</option>
                              {currentRoles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name} ({role.id})
                                </option>
                              ))}
                            </select>
                          </div>

                          {mapping && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                              <span>→</span>
                              <span>
                                Will update to: <strong>{mapping.newRoleId}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Repair Button */}
                <div className="bg-linear-to-br from-white to-green-50/30 rounded-2xl p-6 border-2 border-green-300">
                  <h2
                    className="text-xl font-bold text-secondary mb-4"
                    style={{ fontFamily: "var(--font-galindo)" }}
                  >
                    Step 3: Repair Data
                  </h2>
                  <Button
                    variant="primary"
                    onClick={repairData}
                    disabled={repairing || mappings.length === 0}
                    className="w-full"
                  >
                    {repairing
                      ? "Repairing..."
                      : `🔧 Repair ${orphanedDocs.length} Document${orphanedDocs.length !== 1 ? "s" : ""}`}
                  </Button>

                  {mappings.length === 0 && (
                    <p className="text-sm text-red-600 mt-3 text-center">
                      Please configure role mappings above before repairing
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
