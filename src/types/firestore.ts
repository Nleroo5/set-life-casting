/**
 * TypeScript Type Definitions for Firestore Documents
 *
 * These types ensure type safety when reading/writing Firestore documents.
 * Use these instead of `any` to catch bugs at compile time.
 *
 * Usage:
 *   const projectData = doc.data() as Project;
 *   const roleData = doc.data() as Role;
 */

import { Timestamp } from "firebase/firestore";

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  role: "admin" | "talent";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: "admin" | "talent";
}

// ============================================================================
// PROJECTS
// ============================================================================

export type ProjectType = "film" | "tv" | "commercial" | "music-video" | "event";
export type ProjectStatus = "booking" | "booked" | "archived";

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  description?: string;
  shootDateStart: string;
  shootDateEnd: string;
  location?: string;
  status: ProjectStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Archive tracking
  archivedAt?: Timestamp;
  archivedBy?: string;
  archiveReason?: string;
}

// ============================================================================
// ROLES
// ============================================================================

export type RoleBookingStatus = "booking" | "booked";

export interface Role {
  id: string;
  projectId: string;
  name: string;
  requirements: string;
  rate: string;
  bookingDates: string[]; // Array of ISO date strings
  location: string;
  bookingStatus: RoleBookingStatus;
  additionalNotes?: string;
  referenceImageUrl?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;

  // Archive tracking
  archivedWithProject?: boolean;
  archivedIndividually?: boolean;
  archivedAt?: Timestamp;
  archivedBy?: string;
  archiveReason?: string;
}

export interface RoleWithProject extends Role {
  project: Project;
}

// ============================================================================
// PROFILES (Talent Information)
// ============================================================================

export interface BasicInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
}

export interface Appearance {
  gender: string;
  dateOfBirth: string;
  ethnicity: string[];
  height: string;
  weight: number;
  hairColor: string;
  hairLength: string;
  eyeColor: string;
}

export interface Sizes {
  gender: string;
  // Male sizes
  shirtSize?: string;
  pantWaist?: number;
  pantInseam?: number;
  // Female sizes
  dressSize?: string;
  womensPantSize?: string;
  // Universal
  shoeSize: string;
  // Optional measurements
  bust?: number;
  waist?: number;
  hips?: number;
  neck?: number;
  sleeve?: number;
  jacketSize?: string;
}

export interface Details {
  gender?: string;
  visibleTattoos: boolean;
  tattoosDescription?: string;
  facialHair?: string;
}

export interface Photo {
  url: string;
  type: "headshot" | "fullbody" | "additional";
}

export interface Photos {
  photos: Photo[];
}

export interface Physical {
  // From appearance
  gender: string | null;
  ethnicity: string[] | null;
  height: string | null;
  weight: number | null;
  hairColor: string | null;
  hairLength: string | null;
  eyeColor: string | null;
  dateOfBirth: string | null;
  // From sizes
  shirtSize: string | null;
  pantWaist: number | null;
  pantInseam: number | null;
  dressSize: string | null;
  womensPantSize: string | null;
  shoeSize: string | null;
  bust: number | null;
  waist: number | null;
  hips: number | null;
  neck: number | null;
  sleeve: number | null;
  jacketSize: string | null;
  // From details
  visibleTattoos: boolean;
  tattoosDescription: string | null;
  facialHair: string | null;
}

export interface TalentProfile {
  userId: string;
  email: string | null;
  displayName: string | null;
  basicInfo: BasicInfo;
  appearance: Appearance;
  sizes: Sizes;
  details: Details;
  photos: Photos;
  physical: Physical; // Consolidated searchable field
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// SUBMISSIONS
// ============================================================================

export type SubmissionStatus = "pending" | "reviewed" | "selected" | "rejected" | "archived";

export interface Submission {
  id: string;
  userId: string;
  roleId: string;
  projectId: string;
  roleName: string;
  projectTitle: string;
  status: SubmissionStatus;
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;

  // Archive tracking
  archivedWithProject?: boolean;
  archivedIndividually?: boolean;

  // Full talent profile snapshot
  talentProfile: TalentProfile;
}

// ============================================================================
// BOOKINGS
// ============================================================================

export type BookingStatus = "pending" | "confirmed" | "tentative" | "cancelled" | "completed";

export interface Booking {
  id: string;
  userId: string;
  roleId: string;
  projectId: string;
  submissionId: string;
  roleName: string;
  projectTitle: string;
  status: BookingStatus;
  confirmedAt: Timestamp;
  confirmedBy: string; // Admin user ID who confirmed the booking
  updatedAt?: Timestamp;

  // Archive tracking
  archivedWithProject?: boolean;

  // Performance tracking (admin only)
  rating?: number; // 1-5 stars
  wouldRehire?: boolean;
  completionNotes?: string;

  // Full talent profile snapshot
  talentProfile: TalentProfile;
}

// ============================================================================
// PASSWORD RESET TOKENS
// ============================================================================

export interface PasswordResetToken {
  email: string;
  token: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  used: boolean;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isProject(data: unknown): data is Project {
  return (
    typeof data === "object" &&
    data !== null &&
    "title" in data &&
    "status" in data
  );
}

export function isRole(data: unknown): data is Role {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    "projectId" in data
  );
}

export function isTalentProfile(data: unknown): data is TalentProfile {
  return (
    typeof data === "object" &&
    data !== null &&
    "userId" in data &&
    "basicInfo" in data
  );
}

export function isSubmission(data: unknown): data is Submission {
  return (
    typeof data === "object" &&
    data !== null &&
    "userId" in data &&
    "roleId" in data &&
    "status" in data
  );
}

export function isBooking(data: unknown): data is Booking {
  return (
    typeof data === "object" &&
    data !== null &&
    "userId" in data &&
    "roleId" in data &&
    "confirmedBy" in data
  );
}
