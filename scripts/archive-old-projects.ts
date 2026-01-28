/**
 * Migration Script: Archive Old Projects
 *
 * This script automatically archives projects that:
 * - Have a shoot date that ended more than 30 days ago
 * - Are still in "booked" status (not yet archived)
 *
 * Usage:
 *   npx tsx scripts/archive-old-projects.ts
 *
 * Options:
 *   --dry-run    Preview changes without applying them
 *   --days=N     Archive projects older than N days (default: 30)
 *
 * Example:
 *   npx tsx scripts/archive-old-projects.ts --dry-run
 *   npx tsx scripts/archive-old-projects.ts --days=60
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, WriteBatch } from "firebase-admin/firestore";

// Initialize Firebase Admin (requires serviceAccountKey.json)
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json";

try {
  const serviceAccount = require(serviceAccountPath);
  initializeApp({
    credential: cert(serviceAccount),
  });
} catch (error) {
  console.error("❌ Error: Could not load serviceAccountKey.json");
  console.error("   Place your Firebase Admin SDK key at:", serviceAccountPath);
  console.error("   Download from: Firebase Console > Project Settings > Service Accounts");
  process.exit(1);
}

const db = getFirestore();

interface MigrationOptions {
  dryRun: boolean;
  daysThreshold: number;
}

/**
 * Parse command line arguments
 */
function parseArgs(): MigrationOptions {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
    dryRun: false,
    daysThreshold: 30,
  };

  args.forEach(arg => {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--days=")) {
      const days = parseInt(arg.split("=")[1]);
      if (!isNaN(days) && days > 0) {
        options.daysThreshold = days;
      }
    }
  });

  return options;
}

/**
 * Get date threshold for archiving
 */
function getThresholdDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

/**
 * Archive projects that are past their shoot date
 */
async function archiveOldProjects(options: MigrationOptions) {
  console.log("═══════════════════════════════════════════════════");
  console.log("  📦 Archive Old Projects - Migration Script");
  console.log("═══════════════════════════════════════════════════\n");

  if (options.dryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n");
  }

  const thresholdDate = getThresholdDate(options.daysThreshold);
  const thresholdStr = thresholdDate.toISOString().split('T')[0];

  console.log(`📅 Threshold: Projects with shoot dates ending before ${thresholdStr}`);
  console.log(`   (${options.daysThreshold} days ago)\n`);

  try {
    // Find projects that should be archived
    const projectsSnapshot = await db.collection("projects")
      .where("status", "in", ["booking", "booked"])
      .get();

    const projectsToArchive: any[] = [];

    projectsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const shootDateEnd = data.shootDateEnd;

      if (shootDateEnd && shootDateEnd < thresholdStr) {
        projectsToArchive.push({
          id: doc.id,
          title: data.title,
          status: data.status,
          shootDateEnd: shootDateEnd,
        });
      }
    });

    if (projectsToArchive.length === 0) {
      console.log("✅ No projects found that need archiving.\n");
      return;
    }

    console.log(`⚠️  Found ${projectsToArchive.length} project(s) to archive:\n`);

    for (const project of projectsToArchive) {
      console.log(`   • "${project.title}"`);
      console.log(`     Shoot Date Ended: ${project.shootDateEnd}`);
      console.log(`     Current Status: ${project.status}\n`);
    }

    if (options.dryRun) {
      console.log("🔍 DRY RUN - Would have archived these projects");
      console.log("   Run without --dry-run to apply changes\n");
      return;
    }

    // Confirm before proceeding
    console.log("⚠️  This will archive all listed projects and mark their bookings as completed.\n");

    // In automated environments, you might want to skip confirmation
    // For safety, we'll require confirmation by default
    if (!process.env.AUTO_CONFIRM) {
      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const confirmed = await new Promise<boolean>((resolve) => {
        rl.question("Proceed with archiving? (yes/no): ", (answer: string) => {
          rl.close();
          resolve(answer.toLowerCase() === "yes");
        });
      });

      if (!confirmed) {
        console.log("\n❌ Operation cancelled.\n");
        return;
      }
    }

    console.log("\n🚀 Starting archive process...\n");

    // Archive each project
    let totalArchived = 0;
    let totalRoles = 0;
    let totalBookings = 0;
    let totalSubmissions = 0;

    for (const project of projectsToArchive) {
      console.log(`📦 Archiving: ${project.title}`);

      const batch = db.batch();
      const projectRef = db.collection("projects").doc(project.id);

      // Update project status
      batch.update(projectRef, {
        status: "archived",
        archivedAt: new Date(),
        archivedBy: "migration-script",
        updatedAt: new Date(),
      });

      // Archive roles
      const rolesSnapshot = await db.collection("roles")
        .where("projectId", "==", project.id)
        .get();

      rolesSnapshot.docs.forEach(roleDoc => {
        batch.update(roleDoc.ref, {
          archivedWithProject: true,
          updatedAt: new Date(),
        });
      });
      totalRoles += rolesSnapshot.size;

      // Archive bookings
      const bookingsSnapshot = await db.collection("bookings")
        .where("projectId", "==", project.id)
        .get();

      bookingsSnapshot.docs.forEach(bookingDoc => {
        batch.update(bookingDoc.ref, {
          status: "completed",
          archivedWithProject: true,
          updatedAt: new Date(),
        });
      });
      totalBookings += bookingsSnapshot.size;

      // Archive submissions
      const submissionsSnapshot = await db.collection("submissions")
        .where("projectId", "==", project.id)
        .get();

      submissionsSnapshot.docs.forEach(submissionDoc => {
        batch.update(submissionDoc.ref, {
          status: "archived",
          archivedWithProject: true,
          updatedAt: new Date(),
        });
      });
      totalSubmissions += submissionsSnapshot.size;

      await batch.commit();

      console.log(`   ✅ ${rolesSnapshot.size} roles`);
      console.log(`   ✅ ${bookingsSnapshot.size} bookings`);
      console.log(`   ✅ ${submissionsSnapshot.size} submissions\n`);

      totalArchived++;
    }

    console.log("═══════════════════════════════════════════════════");
    console.log("  ✅ Migration Complete!");
    console.log("═══════════════════════════════════════════════════\n");
    console.log(`📊 Summary:`);
    console.log(`   • ${totalArchived} projects archived`);
    console.log(`   • ${totalRoles} roles preserved`);
    console.log(`   • ${totalBookings} bookings completed`);
    console.log(`   • ${totalSubmissions} submissions archived\n`);
    console.log(`All data is safely preserved in the archive.\n`);

  } catch (error) {
    console.error("\n❌ Error during migration:", error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();
  await archiveOldProjects(options);
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

export { archiveOldProjects };
