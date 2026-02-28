/**
 * Booking System Types
 *
 * Following industry-standard casting workflow:
 * - Submissions: Track who applied for roles
 * - Bookings: Track who got the job (confirmed talent)
 *
 * Based on Casting Networks and Breakdown Services workflow patterns
 */

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface Project {
  id: string;
  title: string;
  type: "film" | "tv" | "commercial" | "music-video" | "event";
  shootDateStart: string;
  shootDateEnd: string;
  status: "booking" | "booked" | "archived";

  // Archive tracking
  archivedAt?: Date;        // When project was archived
  archivedBy?: string;      // Admin user ID who archived it
  completionNotes?: string; // Production wrap notes

  createdAt?: Date;
  updatedAt?: Date;
}

export interface Role {
  id: string;
  projectId: string;
  name: string;
  requirements: string;
  rate: string;
  bookingDates: string[]; // Array of ISO date strings for multiple booking dates
  location: string;
  bookingStatus: "booking" | "booked";
  additionalNotes?: string;
  referenceImageUrl?: string; // Reference image for the role (png, jpg, pdf, screenshot, etc.)

  // Archive tracking
  archivedWithProject?: boolean; // True when project is archived (prevents orphaning)

  createdAt?: Date;
  updatedAt?: Date;
}

export interface Submission {
  id: string;
  userId: string;
  roleId: string;
  roleName: string;
  projectId: string;
  projectTitle: string;
  status: "pinned" | "booked" | "rejected" | null;
  profileData: TalentProfile;
  submittedAt: Date;
  updatedAt?: Date;

  // Archive tracking
  archivedWithProject?: boolean; // True when project is archived
}

// ============================================================================
// BOOKINGS (NEW)
// ============================================================================

/**
 * Booking: Represents a confirmed talent selection
 *
 * Created when admin selects talent from submissions for a role.
 * Separate from submissions to maintain clear workflow:
 * - Submission = "I want to apply"
 * - Booking = "You got the job"
 */
export interface Booking {
  id: string;

  // References
  submissionId: string;        // Original submission that led to this booking
  userId: string;              // Talent user ID
  roleId: string;              // Role they're booked for
  projectId: string;           // Project they're booked on

  // Metadata (denormalized for efficient queries)
  roleName: string;
  projectTitle: string;

  // Booking Details
  status: BookingStatus;
  confirmedAt: Date;           // When admin confirmed the booking
  confirmedBy: string;         // Admin user ID who confirmed

  // Talent Information (snapshot from submission)
  talentProfile: TalentProfile;

  // Communication & Notes
  specialInstructions?: string; // Special instructions for this talent
  internalNotes?: string;       // Internal casting director notes

  // Confirmation Tracking
  talentNotified: boolean;      // Whether talent has been notified
  talentNotifiedAt?: Date;      // When notification was sent
  talentConfirmed: boolean;     // Whether talent confirmed acceptance
  talentConfirmedAt?: Date;     // When talent confirmed

  // Archive & Performance Tracking
  archivedWithProject?: boolean;  // True when project is archived
  completionNotes?: string;       // How did the talent perform?
  rating?: 1 | 2 | 3 | 4 | 5;    // Performance rating (optional)
  wouldRehire?: boolean;          // Would you book them again?

  // Audit Trail
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus =
  | "pending"      // Booked but not yet notified
  | "confirmed"    // Talent confirmed they can do it
  | "tentative"    // Penciled in, not yet confirmed
  | "cancelled"    // Booking was cancelled
  | "completed";   // Job completed

// ============================================================================
// TALENT PROFILE
// ============================================================================

export interface TalentProfile {
  // Basic Info
  basicInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    location: string;
  };

  // Physical Characteristics
  physical: {
    gender: string;
    ethnicity: string[];
    height: string;
    weight: string;
    hairColor: string;
    eyeColor: string;
    tattoos: boolean;
  };

  // Wardrobe (Gender-Conditional Sizing)
  wardrobe?: {
    gender: string;

    // Male sizes
    shirtSize?: string;
    pantWaist?: number;
    pantInseam?: number;

    // Female sizes
    dressSize?: string;
    womensPantSize?: string;

    // Universal
    shoeSize?: string;

    // Optional measurements
    bust?: number;
    waist?: number;
    hips?: number;
    neck?: number;
    sleeve?: number;
    jacketSize?: string;
  };

  // Experience & Skills
  experience?: {
    actingExperience: boolean;
    comfortable: string[];
    specialSkills: string[];
  };

  // Media
  media?: {
    profilePhotoUrl?: string;
    additionalPhotos?: string[];
  };

  // Availability
  availability?: {
    availableDates?: string[];
    conflicts?: string;
  };
}

// ============================================================================
// FORM DATA INTERFACES
// ============================================================================

export interface RoleFormData {
  id?: string; // Include existing role ID for updates
  name: string;
  requirements: string;
  rate: string;
  bookingDates: string[]; // Array of ISO date strings for multiple booking dates
  location: string;
  bookingStatus: "booking" | "booked";
  additionalNotes?: string;
  referenceImageUrl?: string; // Reference image URL
}

export interface BookingFormData {
  submissionId: string;
  roleId: string;
  projectId: string;
  specialInstructions?: string;
  internalNotes?: string;
  status: BookingStatus;
}

// ============================================================================
// VIEW MODELS & UI STATE
// ============================================================================

/**
 * Role Group: For displaying submissions grouped by role
 * Used in skins export and submissions review pages
 */
export interface RoleGroup {
  roleId: string;
  roleName: string;
  roleData: Role;
  submissions: Submission[];
  bookings: Booking[];          // Add bookings to role groups
  selectedSubmissionIds: Set<string>;
  isExpanded: boolean;
}

/**
 * Skins Export Data: For generating talent rosters
 */
export interface SkinsExportData {
  project: Project;
  roles: Array<{
    role: Role;
    talent: Array<{
      booking: Booking;
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      gender: string;
      ethnicity: string;
      height: string;
      weight: string;
      hairColor: string;
      eyeColor: string;
      // Editable fields
      callTime?: string;
      notes?: string;
    }>;
  }>;
  exportedAt: Date;
  exportedBy: string;
}

// ============================================================================
// TABLE NAMES
// ============================================================================

export const TABLES = {
  PROJECTS: "projects",
  ROLES: "roles",
  SUBMISSIONS: "submissions",
  USERS: "users",
} as const;

// ============================================================================
// HELPER TYPES
// ============================================================================

export type ProjectStatus = Project["status"];
export type RoleBookingStatus = Role["bookingStatus"];
export type SubmissionStatus = Submission["status"];
