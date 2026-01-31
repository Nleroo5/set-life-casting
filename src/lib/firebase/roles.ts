/**
 * Role Archive Management Functions
 *
 * Handles individual role archiving separate from project-level archiving.
 * Maintains data integrity and audit trails for compliance.
 */

import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { logger } from "@/lib/logger";

/**
 * Archives a single role without affecting the parent project
 *
 * @param roleId - The role document ID to archive
 * @param userId - The admin user ID performing the archive
 * @param reason - Optional reason for archiving
 * @returns Promise that resolves when archive is complete
 * @throws Error if role has active bookings or archive fails
 */
export async function archiveRole(
  roleId: string,
  userId: string,
  reason?: string
): Promise<void> {
  try {
    // Check for active bookings
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("roleId", "==", roleId),
      where("archivedWithProject", "==", false)
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);

    if (bookingsSnapshot.size > 0) {
      throw new Error(
        `Cannot archive role with ${bookingsSnapshot.size} active booking(s). ` +
        `Please complete or archive the project first.`
      );
    }

    // Update role with archive flags
    const roleRef = doc(db, "roles", roleId);
    await updateDoc(roleRef, {
      archivedIndividually: true,
      archivedAt: Timestamp.now(),
      archivedBy: userId,
      archiveReason: reason || "",
      updatedAt: Timestamp.now(),
    });

    // Archive associated submissions
    const submissionsQuery = query(
      collection(db, "submissions"),
      where("roleId", "==", roleId),
      where("archivedWithProject", "==", false)
    );
    const submissionsSnapshot = await getDocs(submissionsQuery);

    // Update submissions to archived status
    const submissionUpdates = submissionsSnapshot.docs.map((submissionDoc) => {
      return updateDoc(submissionDoc.ref, {
        status: "archived",
        archivedIndividually: true,
        updatedAt: Timestamp.now(),
      });
    });

    await Promise.all(submissionUpdates);

    logger.info(`✅ Archived role ${roleId} and ${submissionsSnapshot.size} submissions`);
  } catch (error) {
    logger.error("Error archiving role:", error);
    throw error;
  }
}

/**
 * Restores an individually archived role
 *
 * @param roleId - The role document ID to restore
 * @returns Promise that resolves when restore is complete
 * @throws Error if role is archived with project or restore fails
 */
export async function restoreRole(roleId: string): Promise<void> {
  try {
    // Get role document
    const roleRef = doc(db, "roles", roleId);

    // Check if role is archived with project
    const roleDoc = await getDocs(
      query(collection(db, "roles"), where("__name__", "==", roleId))
    );

    if (roleDoc.docs.length === 0) {
      throw new Error("Role not found");
    }

    const roleData = roleDoc.docs[0].data();

    if (roleData.archivedWithProject === true) {
      throw new Error(
        "Cannot restore individually. This role is archived with its project. " +
        "Please restore the entire project from the Archive page."
      );
    }

    // Restore role
    await updateDoc(roleRef, {
      archivedIndividually: false,
      archiveReason: "",
      updatedAt: Timestamp.now(),
      // Keep archivedAt and archivedBy for audit trail
    });

    // Restore associated submissions back to pending
    const submissionsQuery = query(
      collection(db, "submissions"),
      where("roleId", "==", roleId),
      where("archivedIndividually", "==", true)
    );
    const submissionsSnapshot = await getDocs(submissionsQuery);

    const submissionUpdates = submissionsSnapshot.docs.map((submissionDoc) => {
      return updateDoc(submissionDoc.ref, {
        status: null,
        archivedIndividually: false,
        updatedAt: Timestamp.now(),
      });
    });

    await Promise.all(submissionUpdates);

    logger.info(`✅ Restored role ${roleId} and ${submissionsSnapshot.size} submissions`);
  } catch (error) {
    logger.error("Error restoring role:", error);
    throw error;
  }
}

/**
 * Gets count of active bookings for a role
 *
 * @param roleId - The role document ID
 * @returns Number of active (non-archived) bookings
 */
export async function getActiveBookingCount(roleId: string): Promise<number> {
  try {
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("roleId", "==", roleId),
      where("archivedWithProject", "==", false)
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);
    return bookingsSnapshot.size;
  } catch (error) {
    logger.error("Error getting booking count:", error);
    return 0;
  }
}
