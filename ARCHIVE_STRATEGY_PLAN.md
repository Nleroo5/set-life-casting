# Set Life Casting - Archive Strategy & Long-Term Data Management Plan

## Executive Summary

Based on research of industry-leading casting and production management software (Casting Networks, Breakdown Services, StudioBinder, Entertainment Partners), this document outlines a comprehensive strategy to replace deletion with archiving for Set Life Casting.

**Key Industry Finding:** Professional casting and production software **never permanently delete projects** with cast/crew history. Instead, they archive completed projects for compliance, audits, historical reference, and future re-booking.

---

## Research Findings: Industry Best Practices

### What Leading Casting Software Does

#### Casting Networks
- **Archive functionality** for completed projects
- Projects can be **searched in archived state**
- **Restore capability** - archived projects can be un-archived
- Talent can archive completed alerts for organization
- Source: [Casting Networks Support](https://support.castingnetworks.com/)

#### Entertainment Partners (SmartHub)
- **SmartHub Vault** for secure document archiving
- Archive production documents for **compliance and audits**
- Quick search and access across multiple productions
- Documents remain accessible years later
- Source: [Entertainment Partners](https://www.ep.com/production-management/)

#### StudioBinder
- Cast and crew contacts **transferable from project to project**
- Historical data maintained for **future productions**
- Contacts remain linked and accessible
- Source: [StudioBinder](https://www.studiobinder.com/)

#### General Production Management Standards (2026)
- Teams maintain archives for **updating content years later**
- Organized project folders allow editors to **open projects months later**
- **Version history** kept for reference and comparison
- **20-30% reduction** in admin overhead through proper archiving
- Source: [Lucidchart Blog](https://www.lucidchart.com/blog/how-to-develop-a-video-production-workflow)

### Why Industry NEVER Deletes Cast/Crew Data

1. **Legal Compliance** - Labor laws require maintaining employment records (typically 3-7 years)
2. **Audits & Insurance** - Production insurance and union audits require historical records
3. **Tax Documentation** - IRS requires contractor payment records (7 years minimum)
4. **Re-booking Efficiency** - Casting directors re-hire talent from past productions
5. **Portfolio & Credits** - Talent need verified work history for resumes/portfolios
6. **Reputation Management** - Track which talent are reliable vs problematic
7. **GDPR Compliance** - Right to data access means you must be able to retrieve historical data

---

## Recommended Architecture: Archive-First System

### Core Principle
**"Archive, Don't Delete"** - Nothing with bookings/submissions ever gets permanently deleted.

### Status Lifecycle

```
ACTIVE PROJECTS
├── "booking" - Currently casting roles
├── "booked" - Roles filled, production upcoming
│
↓ (Archive when production completes)
│
ARCHIVED PROJECTS
├── "archived" - Completed productions
│   - All data preserved
│   - Read-only mode
│   - Searchable
│   - Restorable
│
↓ (Optional: Admin-only hard delete after 7+ years)
│
PERMANENTLY DELETED
└── Only after legal retention period
    └── Requires special admin permission + confirmation
```

---

## Implementation Plan

### Phase 1: Add Archive Status (Week 1)

#### 1.1 Update Type Definitions
**File:** `src/types/booking.ts`

```typescript
export interface Project {
  id: string;
  title: string;
  type: "film" | "tv" | "commercial" | "music-video" | "event";
  shootDateStart: string;
  shootDateEnd: string;
  status: "booking" | "booked" | "archived"; // ✅ Already has archived!
  archivedAt?: Date;        // NEW - Track when archived
  archivedBy?: string;      // NEW - Track who archived it
  completionNotes?: string; // NEW - Production wrap notes
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Role {
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
  archivedWithProject?: boolean; // NEW - Prevent orphaning
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Booking {
  id: string;
  submissionId: string;
  userId: string;
  roleId: string;
  projectId: string;
  roleName: string;
  projectTitle: string;
  status: BookingStatus;
  confirmedAt: Date;
  confirmedBy: string;
  talentProfile: TalentProfile;
  specialInstructions?: string;
  internalNotes?: string;
  talentNotified: boolean;
  talentNotifiedAt?: Date;
  talentConfirmed: boolean;
  talentConfirmedAt?: Date;

  // NEW: Archive tracking
  archivedWithProject?: boolean;
  completionNotes?: string;    // How did the talent perform?
  rating?: 1 | 2 | 3 | 4 | 5;  // Performance rating (optional)
  wouldRehire?: boolean;       // Would you book them again?

  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus =
  | "pending"      // Booked but not yet notified
  | "confirmed"    // Talent confirmed they can do it
  | "tentative"    // Penciled in, not yet confirmed
  | "cancelled"    // Booking was cancelled
  | "completed";   // Job completed ✅

export interface Submission {
  id: string;
  userId: string;
  roleId: string;
  roleName: string;
  projectId: string;
  projectTitle: string;
  status: "pending" | "reviewed" | "accepted" | "rejected" | "archived"; // NEW: archived status
  profileData: TalentProfile;
  submittedAt: Date;
  updatedAt?: Date;
  archivedWithProject?: boolean; // NEW
}
```

#### 1.2 Update Firestore Security Rules
**File:** Firebase Console > Firestore > Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isAuthenticated() {
      return request.auth != null;
    }

    // Projects - Admins can archive, not delete (unless super admin)
    match /projects/{projectId} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin();
      // Only allow delete if project has ZERO bookings/submissions
      allow delete: if isAdmin() && !exists(/databases/$(database)/documents/bookings/{bookingId})
                    && resource.data.status != 'archived'; // Can't delete archived projects
    }

    // Roles - Can only be deleted if no bookings exist
    match /roles/{roleId} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin();
      allow delete: if isAdmin() && resource.data.archivedWithProject != true;
    }

    // Bookings - Never delete, only archive
    match /bookings/{bookingId} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin();
      allow delete: if false; // ❌ NEVER allow deletion
    }

    // Submissions - Can be archived but not deleted
    match /submissions/{submissionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if request.auth.uid == resource.data.userId || isAdmin();
      allow delete: if resource.data.status != 'archived' &&
                       (request.auth.uid == resource.data.userId || isAdmin());
    }
  }
}
```

---

### Phase 2: Archive UI & Workflow (Week 2)

#### 2.1 Casting Management: Archive Project Button

**File:** `src/app/admin/casting/page.tsx`

Add "Archive Project" button next to "Delete Project":

```typescript
const handleArchiveProject = async (projectId: string) => {
  if (!confirm("Archive this project? All roles, bookings, and submissions will be preserved but marked as archived.")) {
    return;
  }

  try {
    const batch = writeBatch(db);

    // Update project status
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
    });

    await batch.commit();

    console.log(`✅ Archived project: ${projectId}`);
    console.log(`  - ${rolesSnapshot.size} roles archived`);
    console.log(`  - ${bookingsSnapshot.size} bookings completed`);
    console.log(`  - ${submissionsSnapshot.size} submissions archived`);

    alert(
      `Project archived successfully!\n\n` +
      `• ${rolesSnapshot.size} roles preserved\n` +
      `• ${bookingsSnapshot.size} bookings marked complete\n` +
      `• ${submissionsSnapshot.size} submissions archived\n\n` +
      `All data is safely preserved and can be viewed in Archive.`
    );

    await fetchData();
  } catch (error) {
    console.error("Error archiving project:", error);
    alert("Failed to archive project");
  }
};
```

UI Changes:
```tsx
{/* Replace Delete button with Archive button for booked projects */}
{selectedProject.status === "booked" && (
  <Button
    variant="secondary"
    onClick={() => handleArchiveProject(selectedProject.id)}
  >
    📦 Archive Project
  </Button>
)}

{/* Only show Delete if project has no bookings */}
{selectedProject.status !== "archived" && bookingCount === 0 && (
  <Button
    variant="danger"
    onClick={() => handleDeleteProject(selectedProject.id)}
  >
    🗑️ Delete Project
  </Button>
)}
```

#### 2.2 Archive View Page

**File:** `src/app/admin/archive/page.tsx` (NEW)

Create dedicated archive view:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function ArchivePage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/login?redirect=/admin/archive");
      return;
    }
    fetchArchivedProjects();
  }, [isAdmin]);

  const fetchArchivedProjects = async () => {
    try {
      const projectsQuery = query(
        collection(db, "projects"),
        where("status", "==", "archived")
      );
      const snapshot = await getDocs(projectsQuery);

      const projects = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const projectData = doc.data();

          // Count bookings
          const bookingsQuery = query(
            collection(db, "bookings"),
            where("projectId", "==", doc.id)
          );
          const bookingsSnapshot = await getDocs(bookingsQuery);

          return {
            id: doc.id,
            ...projectData,
            bookingCount: bookingsSnapshot.size,
          };
        })
      );

      setArchivedProjects(projects);
    } catch (error) {
      console.error("Error fetching archived projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (projectId: string) => {
    if (!confirm("Restore this project to active status?")) return;

    // Implementation: Update project status back to "booking" or "booked"
    // Update all associated roles, bookings, submissions
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-secondary mb-8">
          📦 Archived Projects
        </h1>

        {loading ? (
          <div>Loading...</div>
        ) : archivedProjects.length === 0 ? (
          <div className="text-center text-secondary-light">
            No archived projects yet.
          </div>
        ) : (
          <div className="space-y-4">
            {archivedProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl p-6 shadow">
                <h2 className="text-2xl font-bold text-secondary mb-2">
                  {project.title}
                </h2>
                <p className="text-secondary-light mb-4">
                  Archived: {new Date(project.archivedAt?.toDate()).toLocaleDateString()}
                </p>
                <p className="text-secondary mb-4">
                  {project.bookingCount} bookings preserved
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push(`/admin/archive/${project.id}`)}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleRestore(project.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Restore Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 2.3 Update Admin Dashboard

**File:** `src/app/admin/page.tsx`

Add "Archive" card:

```tsx
{/* Archive Card */}
<Link href="/admin/archive">
  <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-2xl p-8 border-2 border-gray-300 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-4 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors">
        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-secondary" style={{ fontFamily: "var(--font-galindo)" }}>
        Archive
      </h2>
    </div>
    <p className="text-secondary-light mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
      View completed projects and historical casting data
    </p>
    <div className="flex items-center text-gray-600 font-semibold group-hover:translate-x-2 transition-transform">
      View Archive →
    </div>
  </div>
</Link>
```

---

### Phase 3: Talent Re-Booking System (Week 3)

#### 3.1 "Book Again" Feature

When viewing archived bookings, admins can quickly re-book talent for new projects:

**File:** `src/app/admin/archive/[projectId]/page.tsx`

```typescript
const handleBookAgain = async (booking: Booking) => {
  // Show modal to select new project/role
  // Pre-fill talent information from archived booking
  // Create new submission or booking for new project

  router.push(`/admin/submissions?prefilledUserId=${booking.userId}&talent=${booking.talentProfile.basicInfo.firstName}_${booking.talentProfile.basicInfo.lastName}`);
};
```

#### 3.2 Talent Performance History

Track talent performance across projects:

```typescript
interface TalentPerformanceHistory {
  userId: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageRating: number;
  projectsWorkedOn: Array<{
    projectId: string;
    projectTitle: string;
    roleName: string;
    date: string;
    rating?: number;
    wouldRehire: boolean;
    notes?: string;
  }>;
}
```

**UI:** Show this history when reviewing submissions or bookings

---

### Phase 4: Data Retention & Compliance (Week 4)

#### 4.1 Automatic Archiving

**File:** `src/lib/firebase/maintenance.ts` (NEW)

Create scheduled function to auto-archive completed projects:

```typescript
export async function autoArchiveCompletedProjects() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Find projects where shoot date ended > 30 days ago and status is still "booked"
  const projectsQuery = query(
    collection(db, "projects"),
    where("status", "==", "booked"),
    where("shootDateEnd", "<", thirtyDaysAgo.toISOString().split('T')[0])
  );

  const snapshot = await getDocs(projectsQuery);

  console.log(`🔍 Found ${snapshot.size} projects ready for auto-archiving`);

  for (const doc of snapshot.docs) {
    console.log(`📦 Auto-archiving project: ${doc.data().title}`);
    // Call handleArchiveProject logic
  }
}
```

**Run this:**
- Via cron job (Vercel Cron or GitHub Actions)
- Or: Admin dashboard "Maintenance" button

#### 4.2 Data Retention Policy

**File:** `DATA_RETENTION_POLICY.md` (NEW)

```markdown
# Set Life Casting - Data Retention Policy

## Retention Periods

| Data Type | Retention Period | Reason |
|-----------|-----------------|--------|
| Active Projects | Indefinite | Current operations |
| Archived Projects | 7 years minimum | Tax/legal compliance |
| Bookings (Completed) | 7 years minimum | Tax/contractor records |
| Submissions (Archived) | 3 years | Reference for future casting |
| User Profiles (Active) | Until account deletion | Active talent pool |
| User Profiles (Inactive) | 2 years | GDPR compliance |

## Legal Basis

- **IRS Requirements**: 7 years for contractor payment records (1099 forms)
- **Labor Laws**: 3-7 years for employment/contractor records
- **GDPR**: Right to deletion after account closure + 30 days
- **Production Insurance**: 5 years for claims/audits

## Deletion Workflow

1. User requests account deletion → Flag account as "deletion requested"
2. Admin reviews for active bookings → If none, approve deletion
3. 30-day grace period → User can undo deletion request
4. After 30 days → Personal data anonymized, work history preserved
5. Financial records → Remain for 7 years (anonymized after 30 days)

## Anonymization vs Deletion

**Anonymized (keep structure, remove identity):**
- Booking records → Keep role, rate, dates. Remove name, email, phone
- Financial records → Keep amounts, dates. Remove SSN, address

**Fully Deleted:**
- Profile photos
- Contact information
- Personal notes
```

---

### Phase 5: Reporting & Analytics (Week 5)

#### 5.1 Historical Reports

**File:** `src/app/admin/reports/page.tsx` (NEW)

Generate reports from archived data:

```typescript
- Total talent booked per year
- Top re-booked talent (loyalty report)
- Average time from submission to booking
- Project completion rates
- Budget tracking (total rates paid per project)
- Diversity metrics (ethnicity, gender representation over time)
```

#### 5.2 Export Options

```typescript
// Export archived project as PDF
// Export all bookings for a year (tax purposes)
// Export talent work history (for reference letters)
```

---

## Benefits of Archive-First System

### 1. **Compliance & Legal Protection**
- ✅ Meet IRS 7-year record retention requirements
- ✅ Maintain contractor payment records for audits
- ✅ Provide data for unemployment or labor disputes
- ✅ GDPR-compliant data retention

### 2. **Business Intelligence**
- ✅ Track talent performance over time
- ✅ Identify top talent for re-booking
- ✅ Analyze project costs and profitability
- ✅ Generate historical reports for investors/stakeholders

### 3. **Operational Efficiency**
- ✅ Quickly re-book reliable talent from past projects
- ✅ Reference past project details for similar future castings
- ✅ Avoid re-hiring problematic talent (track "would not rebook")
- ✅ Build talent portfolios with verified work history

### 4. **User Experience**
- ✅ Talent can view their verified work history
- ✅ Casting directors can search past projects
- ✅ Production teams can reference historical skins/rosters
- ✅ No accidental data loss from deletion

### 5. **Risk Mitigation**
- ✅ No orphaned bookings/submissions (data integrity maintained)
- ✅ Audit trail for all actions (who archived what, when)
- ✅ Restore capability if project incorrectly archived
- ✅ Insurance claims supported with historical records

---

## Migration Path: Existing Data

### Step 1: Identify At-Risk Projects
```sql
-- Projects that ended > 30 days ago but still "booked"
SELECT * FROM projects
WHERE status = 'booked'
AND shootDateEnd < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### Step 2: Bulk Archive
Create admin tool to:
1. List all completed projects (shootDateEnd < today - 30 days)
2. Show booking counts
3. Batch archive with one click

### Step 3: Clean Up Orphans
- Run Data Repair tool one final time
- After archiving implemented, orphans should not occur

---

## Implementation Timeline

| Week | Deliverables | Effort |
|------|-------------|--------|
| **Week 1** | Type definitions, Firestore rules, basic archive logic | 12 hours |
| **Week 2** | Archive UI, admin dashboard updates, archive view page | 16 hours |
| **Week 3** | Re-booking system, talent performance history | 12 hours |
| **Week 4** | Auto-archiving, data retention policy, compliance docs | 8 hours |
| **Week 5** | Reporting, analytics, export features | 12 hours |

**Total Effort:** ~60 hours (1.5 weeks full-time)

---

## Post-Implementation: Deprecate Data Repair Tool

Once archiving is implemented:

1. ✅ **Keep tool temporarily** (6 months) for legacy cleanup
2. ✅ Add warning banner: "Archive system now prevents orphans. This tool is for legacy data only."
3. ✅ After 6 months of no orphans: Remove tool entirely
4. ✅ Firestore rules prevent deletion of bookings → Tool becomes unnecessary

**Result:** Data integrity maintained automatically, no manual repairs needed.

---

## Comparison: Before vs After

| Scenario | Current System | Archive System |
|----------|---------------|----------------|
| Project ends | Status stays "booked" forever | Auto-archive after 30 days |
| Delete project | Orphans bookings/submissions | Can't delete, must archive |
| Data repair needed | Manual tool required | Never needed |
| Re-booking talent | Search all projects manually | Filter by past bookings |
| Tax audit | No historical records | 7 years of records |
| Insurance claim | No production records | Full archive available |
| Talent portfolio | No verified history | Verified work history |

---

## Sources & Research

This plan is based on research of industry-leading platforms:

- [Casting Networks Support](https://support.castingnetworks.com/hc/en-us/articles/360051795152-Release-Notes) - Archive functionality for projects
- [Entertainment Partners](https://www.ep.com/production-management/) - SmartHub Vault for compliance archiving
- [StudioBinder](https://www.studiobinder.com/) - Cast/crew management and project continuity
- [Lucidchart Production Workflow](https://www.lucidchart.com/blog/how-to-develop-a-video-production-workflow) - Archive best practices
- [Wrapbook Post-Production Guide](https://www.wrapbook.com/blog/post-production-workflow-guide) - Data retention standards
- [Casting42 Compliance](https://casting42.com/casting-management-software) - GDPR-compliant talent management

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Approve architecture** changes (types, Firestore rules)
3. **Phase 1 implementation** - Basic archive functionality
4. **Test with sample project** - Archive one completed project
5. **Roll out to all admins** - Train on new workflow
6. **Monitor for 1 month** - Ensure no issues
7. **Implement remaining phases** - Re-booking, reporting, etc.

---

## Questions for Approval

1. **Data Retention Period**: Comfortable with 7 years for bookings? (IRS standard)
2. **Auto-Archive Timing**: 30 days after shoot date? Or different period?
3. **Restore Permissions**: Should archived projects be restorable by any admin, or require approval?
4. **Performance Ratings**: Want to rate talent performance (1-5 stars)? Optional or required?
5. **Hard Delete**: Should super admins be able to permanently delete after 7 years? Or never?

---

**Document Version:** 1.0
**Date:** 2026-01-28
**Author:** Claude (Set Life Casting Technical Architect)
**Status:** Pending Approval
