/**
 * Bookings Firebase Operations
 *
 * Utility functions for managing bookings in Firestore
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import { logger } from "@/lib/logger";
import type {
  Booking,
  Submission,
  BookingFormData,
  BookingStatus,
  COLLECTIONS,
} from "@/types/booking";

const BOOKINGS_COLLECTION = "bookings";

// ============================================================================
// CREATE BOOKING
// ============================================================================

/**
 * Create a booking from a submission
 * This confirms that a talent has been selected for a role
 */
export async function createBooking(
  submission: Submission,
  adminUserId: string,
  additionalData?: {
    specialInstructions?: string;
    internalNotes?: string;
    status?: BookingStatus;
  }
): Promise<string> {
  try {
    // DUPLICATE PREVENTION: Check if submission is already booked
    const existingBooking = await isSubmissionBooked(submission.id);
    if (existingBooking) {
      throw new Error("This submission has already been booked");
    }

    // DUPLICATE PREVENTION: Check if this user is already booked for this role
    const userAlreadyBookedForRole = await isUserBookedForRole(submission.userId, submission.roleId);
    if (userAlreadyBookedForRole) {
      throw new Error("This talent is already booked for this role");
    }

    const bookingData: Omit<Booking, "id"> = {
      // References
      submissionId: submission.id,
      userId: submission.userId,
      roleId: submission.roleId,
      projectId: submission.projectId,

      // Metadata
      roleName: submission.roleName,
      projectTitle: submission.projectTitle,

      // Booking Details
      status: additionalData?.status || "pending",
      confirmedAt: new Date(),
      confirmedBy: adminUserId,

      // Talent Information
      talentProfile: submission.profileData,

      // Communication & Notes
      specialInstructions: additionalData?.specialInstructions || "",
      internalNotes: additionalData?.internalNotes || "",

      // Confirmation Tracking
      talentNotified: false,
      talentConfirmed: false,

      // Audit Trail
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), bookingData);

    // Update submission status to "selected"
    await updateDoc(doc(db, "submissions", submission.id), {
      status: "selected",
      updatedAt: new Date(),
    });

    return docRef.id;
  } catch (error) {
    logger.error("Error creating booking:", error);
    throw error; // Re-throw to preserve error message
  }
}

/**
 * Create multiple bookings in a batch
 * Useful when selecting multiple talents at once
 */
export async function createBookingsBatch(
  submissions: Submission[],
  adminUserId: string,
  additionalData?: {
    specialInstructions?: string;
    internalNotes?: string;
    status?: BookingStatus;
  }
): Promise<string[]> {
  try {
    // DUPLICATE PREVENTION: Check all submissions first
    const duplicateChecks = await Promise.all(
      submissions.map(async (submission) => {
        const alreadyBooked = await isSubmissionBooked(submission.id);
        const userBookedForRole = await isUserBookedForRole(submission.userId, submission.roleId);
        return {
          submission,
          alreadyBooked,
          userBookedForRole,
        };
      })
    );

    // Filter out duplicates and collect error messages
    const duplicates: string[] = [];
    const validSubmissions = duplicateChecks.filter((check) => {
      if (check.alreadyBooked) {
        const name = `${check.submission.profileData.basicInfo?.firstName} ${check.submission.profileData.basicInfo?.lastName}`;
        duplicates.push(`${name} (submission already booked)`);
        return false;
      }
      if (check.userBookedForRole) {
        const name = `${check.submission.profileData.basicInfo?.firstName} ${check.submission.profileData.basicInfo?.lastName}`;
        duplicates.push(`${name} (already booked for this role)`);
        return false;
      }
      return true;
    });

    // If there are duplicates, warn but continue with valid ones
    if (duplicates.length > 0) {
      logger.warn("Skipped duplicate bookings:", duplicates);
    }

    if (validSubmissions.length === 0) {
      throw new Error("All submissions are already booked");
    }

    const batch = writeBatch(db);
    const bookingIds: string[] = [];

    for (const check of validSubmissions) {
      const submission = check.submission;
      const bookingRef = doc(collection(db, BOOKINGS_COLLECTION));
      bookingIds.push(bookingRef.id);

      const bookingData: Omit<Booking, "id"> = {
        submissionId: submission.id,
        userId: submission.userId,
        roleId: submission.roleId,
        projectId: submission.projectId,
        roleName: submission.roleName,
        projectTitle: submission.projectTitle,
        status: additionalData?.status || "pending",
        confirmedAt: new Date(),
        confirmedBy: adminUserId,
        talentProfile: submission.profileData,
        specialInstructions: additionalData?.specialInstructions || "",
        internalNotes: additionalData?.internalNotes || "",
        talentNotified: false,
        talentConfirmed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      batch.set(bookingRef, bookingData);

      // Update submission status
      const submissionRef = doc(db, "submissions", submission.id);
      batch.update(submissionRef, {
        status: "selected",
        updatedAt: new Date(),
      });
    }

    await batch.commit();
    return bookingIds;
  } catch (error) {
    logger.error("Error creating bookings batch:", error);
    throw error; // Re-throw to preserve error message
  }
}

// ============================================================================
// READ BOOKINGS
// ============================================================================

/**
 * Get all bookings for a project
 */
export async function getBookingsByProject(projectId: string): Promise<Booking[]> {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("confirmedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      confirmedAt: doc.data().confirmedAt?.toDate?.() || doc.data().confirmedAt,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      talentNotifiedAt: doc.data().talentNotifiedAt?.toDate?.() || doc.data().talentNotifiedAt,
      talentConfirmedAt: doc.data().talentConfirmedAt?.toDate?.() || doc.data().talentConfirmedAt,
    })) as Booking[];
  } catch (error) {
    logger.error("Error fetching bookings by project:", error);
    throw new Error("Failed to fetch bookings");
  }
}

/**
 * Get all bookings for a specific role
 */
export async function getBookingsByRole(roleId: string): Promise<Booking[]> {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("roleId", "==", roleId),
      orderBy("confirmedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      confirmedAt: doc.data().confirmedAt?.toDate?.() || doc.data().confirmedAt,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      talentNotifiedAt: doc.data().talentNotifiedAt?.toDate?.() || doc.data().talentNotifiedAt,
      talentConfirmedAt: doc.data().talentConfirmedAt?.toDate?.() || doc.data().talentConfirmedAt,
    })) as Booking[];
  } catch (error) {
    logger.error("Error fetching bookings by role:", error);
    throw new Error("Failed to fetch bookings");
  }
}

/**
 * Get bookings for multiple roles (used in skins export)
 */
export async function getBookingsByRoles(roleIds: string[]): Promise<Booking[]> {
  try {
    logger.debug("🔍 getBookingsByRoles called with roleIds:", roleIds);

    if (roleIds.length === 0) {
      logger.debug("⚠️ No roleIds provided, returning empty array");
      return [];
    }

    // DEBUG: First, let's fetch ALL bookings to see what's in the database
    logger.debug("🔬 DEBUG: Fetching ALL bookings to compare roleIds...");
    const allBookingsSnapshot = await getDocs(collection(db, BOOKINGS_COLLECTION));
    logger.debug(`🔬 DEBUG: Found ${allBookingsSnapshot.docs.length} total bookings in database`);

    allBookingsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      logger.debug(`🔬 DEBUG: Booking ${doc.id}:`, {
        roleId: data.roleId,
        roleIdType: typeof data.roleId,
        roleIdValue: JSON.stringify(data.roleId),
        userId: data.userId,
        talentName: `${data.talentProfile?.basicInfo?.firstName} ${data.talentProfile?.basicInfo?.lastName}`,
      });
    });

    logger.debug("🔬 DEBUG: Looking for roleIds:", roleIds.map((id) => `"${id}" (type: ${typeof id})`));

    // Firestore 'in' queries are limited to 10 items
    // For more than 10 roles, we need to batch the queries
    const bookings: Booking[] = [];

    for (let i = 0; i < roleIds.length; i += 10) {
      const batch = roleIds.slice(i, i + 10);
      logger.debug(`🔎 Querying batch ${i / 10 + 1}: roleIds =`, batch);

      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where("roleId", "in", batch)
        // Note: orderBy removed to avoid composite index requirement
        // Results are sorted by last name in the skins export UI anyway
      );

      const snapshot = await getDocs(q);
      logger.debug(`📦 Found ${snapshot.docs.length} documents in batch ${i / 10 + 1}`);

      // Log raw data for debugging
      snapshot.docs.forEach((doc) => {
        logger.debug(`  - Document ${doc.id}:`, {
          roleId: doc.data().roleId,
          userId: doc.data().userId,
          talentName: `${doc.data().talentProfile?.basicInfo?.firstName} ${doc.data().talentProfile?.basicInfo?.lastName}`,
        });
      });

      const batchBookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        confirmedAt: doc.data().confirmedAt?.toDate?.() || doc.data().confirmedAt,
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
        talentNotifiedAt: doc.data().talentNotifiedAt?.toDate?.() || doc.data().talentNotifiedAt,
        talentConfirmedAt: doc.data().talentConfirmedAt?.toDate?.() || doc.data().talentConfirmedAt,
      })) as Booking[];

      bookings.push(...batchBookings);
    }

    logger.debug(`✅ Total bookings found: ${bookings.length}`);
    return bookings;
  } catch (error) {
    logger.error("❌ Error fetching bookings by roles:", error);
    throw new Error("Failed to fetch bookings");
  }
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(bookingId: string): Promise<Booking | null> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      confirmedAt: data.confirmedAt?.toDate?.() || data.confirmedAt,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      talentNotifiedAt: data.talentNotifiedAt?.toDate?.() || data.talentNotifiedAt,
      talentConfirmedAt: data.talentConfirmedAt?.toDate?.() || data.talentConfirmedAt,
    } as Booking;
  } catch (error) {
    logger.error("Error fetching booking:", error);
    throw new Error("Failed to fetch booking");
  }
}

// ============================================================================
// UPDATE BOOKING
// ============================================================================

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      status,
      updatedAt: new Date(),
    });
  } catch (error) {
    logger.error("Error updating booking status:", error);
    throw new Error("Failed to update booking status");
  }
}

/**
 * Update booking details
 */
export async function updateBooking(
  bookingId: string,
  updates: Partial<Booking>
): Promise<void> {
  try {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    logger.error("Error updating booking:", error);
    throw new Error("Failed to update booking");
  }
}

/**
 * Mark booking as talent notified
 */
export async function markTalentNotified(bookingId: string): Promise<void> {
  try {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      talentNotified: true,
      talentNotifiedAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    logger.error("Error marking talent as notified:", error);
    throw new Error("Failed to mark talent as notified");
  }
}

/**
 * Mark booking as talent confirmed
 */
export async function markTalentConfirmed(bookingId: string): Promise<void> {
  try {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      talentConfirmed: true,
      talentConfirmedAt: new Date(),
      status: "confirmed",
      updatedAt: new Date(),
    });
  } catch (error) {
    logger.error("Error marking talent as confirmed:", error);
    throw new Error("Failed to mark talent as confirmed");
  }
}

// ============================================================================
// DELETE BOOKING
// ============================================================================

/**
 * Delete a booking (unbook talent)
 * This reverts the submission status back to "reviewed"
 */
export async function deleteBooking(bookingId: string): Promise<void> {
  try {
    const booking = await getBookingById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const batch = writeBatch(db);

    // Delete booking
    batch.delete(doc(db, BOOKINGS_COLLECTION, bookingId));

    // Revert submission status
    batch.update(doc(db, "submissions", booking.submissionId), {
      status: "reviewed",
      updatedAt: new Date(),
    });

    await batch.commit();
  } catch (error) {
    logger.error("Error deleting booking:", error);
    throw new Error("Failed to delete booking");
  }
}

/**
 * Delete all bookings for a role
 * Useful when a role is cancelled
 */
export async function deleteBookingsByRole(roleId: string): Promise<void> {
  try {
    const bookings = await getBookingsByRole(roleId);
    const batch = writeBatch(db);

    for (const booking of bookings) {
      batch.delete(doc(db, BOOKINGS_COLLECTION, booking.id));
      batch.update(doc(db, "submissions", booking.submissionId), {
        status: "reviewed",
        updatedAt: new Date(),
      });
    }

    await batch.commit();
  } catch (error) {
    logger.error("Error deleting bookings by role:", error);
    throw new Error("Failed to delete bookings");
  }
}

// ============================================================================
// VALIDATION & HELPERS
// ============================================================================

/**
 * Check if a submission is already booked
 */
export async function isSubmissionBooked(submissionId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("submissionId", "==", submissionId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    logger.error("Error checking if submission is booked:", error);
    return false;
  }
}

/**
 * Check if a user is already booked for a specific role
 * Prevents duplicate bookings of the same person for the same role
 */
export async function isUserBookedForRole(userId: string, roleId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("userId", "==", userId),
      where("roleId", "==", roleId)
      // Note: Filter cancelled bookings in code to avoid composite index requirement
    );

    const snapshot = await getDocs(q);

    // Check if any non-cancelled bookings exist
    const hasActiveBooking = snapshot.docs.some((doc) => {
      const booking = doc.data();
      return booking.status !== "cancelled";
    });

    return hasActiveBooking;
  } catch (error) {
    logger.error("Error checking if user is booked for role:", error);
    return false;
  }
}

/**
 * Get booking count for a role
 */
export async function getBookingCountForRole(roleId: string): Promise<number> {
  try {
    const bookings = await getBookingsByRole(roleId);
    return bookings.filter((b) => b.status !== "cancelled").length;
  } catch (error) {
    logger.error("Error getting booking count:", error);
    return 0;
  }
}
