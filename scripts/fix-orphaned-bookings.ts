/**
 * Data Repair Script: Fix Orphaned Bookings and Submissions
 *
 * This script fixes referential integrity issues when roles are deleted and recreated.
 * It updates bookings and submissions that reference old (deleted) role IDs to point
 * to the new role IDs.
 *
 * Usage:
 *   npx tsx scripts/fix-orphaned-bookings.ts
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as readline from "readline";

// Initialize Firebase Admin (you'll need to set GOOGLE_APPLICATION_CREDENTIALS)
initializeApp({
  credential: cert(require("../serviceAccountKey.json")),
});

const db = getFirestore();

interface RoleMapping {
  oldRoleId: string;
  newRoleId: string;
  roleName: string;
}

/**
 * Find all bookings and submissions with orphaned role IDs
 */
async function findOrphanedDocuments() {
  console.log("\n🔍 Scanning for orphaned bookings and submissions...\n");

  // Get all active role IDs
  const rolesSnapshot = await db.collection("roles").get();
  const activeRoleIds = new Set(rolesSnapshot.docs.map((doc) => doc.id));

  console.log(`✅ Found ${activeRoleIds.size} active roles`);

  // Check bookings
  const bookingsSnapshot = await db.collection("bookings").get();
  const orphanedBookings: any[] = [];

  bookingsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (!activeRoleIds.has(data.roleId)) {
      orphanedBookings.push({
        id: doc.id,
        roleId: data.roleId,
        userId: data.userId,
        projectId: data.projectId,
        talentName: `${data.talentProfile?.basicInfo?.firstName} ${data.talentProfile?.basicInfo?.lastName}`,
      });
    }
  });

  // Check submissions
  const submissionsSnapshot = await db.collection("submissions").get();
  const orphanedSubmissions: any[] = [];

  submissionsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (!activeRoleIds.has(data.roleId)) {
      orphanedSubmissions.push({
        id: doc.id,
        roleId: data.roleId,
        userId: data.userId,
        projectId: data.projectId,
        roleName: data.roleName,
      });
    }
  });

  console.log(`\n⚠️  Found ${orphanedBookings.length} orphaned bookings`);
  console.log(`⚠️  Found ${orphanedSubmissions.length} orphaned submissions\n`);

  if (orphanedBookings.length > 0) {
    console.log("📋 Orphaned Bookings:");
    orphanedBookings.forEach((booking) => {
      console.log(`  - ${booking.talentName} (roleId: ${booking.roleId})`);
    });
    console.log("");
  }

  if (orphanedSubmissions.length > 0) {
    console.log("📋 Orphaned Submissions:");
    orphanedSubmissions.forEach((submission) => {
      console.log(`  - Role "${submission.roleName}" (roleId: ${submission.roleId})`);
    });
    console.log("");
  }

  return { orphanedBookings, orphanedSubmissions, activeRoleIds };
}

/**
 * Interactive mapping of old role IDs to new role IDs
 */
async function createRoleMapping(
  orphanedBookings: any[],
  orphanedSubmissions: any[]
): Promise<RoleMapping[]> {
  console.log("\n🔧 Let's map the old role IDs to new role IDs\n");

  // Get unique old role IDs
  const oldRoleIds = new Set<string>();
  orphanedBookings.forEach((b) => oldRoleIds.add(b.roleId));
  orphanedSubmissions.forEach((s) => oldRoleIds.add(s.roleId));

  // Get all current roles for reference
  const rolesSnapshot = await db.collection("roles").get();
  const currentRoles = rolesSnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    projectId: doc.data().projectId,
  }));

  console.log("Current roles in database:");
  currentRoles.forEach((role) => {
    console.log(`  - ${role.name} (ID: ${role.id})`);
  });
  console.log("");

  const mappings: RoleMapping[] = [];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  for (const oldRoleId of Array.from(oldRoleIds)) {
    // Find role name from submissions
    const submission = orphanedSubmissions.find((s) => s.roleId === oldRoleId);
    const roleName = submission?.roleName || "Unknown Role";

    console.log(`\n🔗 Old Role: "${roleName}" (ID: ${oldRoleId})`);
    const newRoleId = await question("Enter the new role ID (or 'skip' to ignore): ");

    if (newRoleId && newRoleId !== "skip") {
      mappings.push({
        oldRoleId,
        newRoleId: newRoleId.trim(),
        roleName,
      });
    }
  }

  rl.close();
  return mappings;
}

/**
 * Update bookings and submissions with new role IDs
 */
async function updateDocuments(mappings: RoleMapping[]) {
  if (mappings.length === 0) {
    console.log("\n❌ No mappings provided. Exiting.");
    return;
  }

  console.log("\n📝 Mappings to apply:");
  mappings.forEach((m) => {
    console.log(`  - "${m.roleName}": ${m.oldRoleId} → ${m.newRoleId}`);
  });
  console.log("");

  // Confirm before proceeding
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const confirm = await new Promise<string>((resolve) => {
    rl.question("⚠️  Proceed with updates? (yes/no): ", resolve);
  });

  rl.close();

  if (confirm.toLowerCase() !== "yes") {
    console.log("\n❌ Operation cancelled.");
    return;
  }

  console.log("\n🚀 Updating documents...\n");

  const batch = db.batch();
  let bookingsUpdated = 0;
  let submissionsUpdated = 0;

  // Update bookings
  for (const mapping of mappings) {
    const bookingsSnapshot = await db
      .collection("bookings")
      .where("roleId", "==", mapping.oldRoleId)
      .get();

    bookingsSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        roleId: mapping.newRoleId,
        updatedAt: new Date(),
      });
      bookingsUpdated++;
    });
  }

  // Update submissions
  for (const mapping of mappings) {
    const submissionsSnapshot = await db
      .collection("submissions")
      .where("roleId", "==", mapping.oldRoleId)
      .get();

    submissionsSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        roleId: mapping.newRoleId,
        updatedAt: new Date(),
      });
      submissionsUpdated++;
    });
  }

  await batch.commit();

  console.log(`✅ Updated ${bookingsUpdated} bookings`);
  console.log(`✅ Updated ${submissionsUpdated} submissions`);
  console.log("\n🎉 Migration complete!\n");
}

/**
 * Quick fix for known role mapping (use this if you already know the IDs)
 */
async function quickFix(oldRoleId: string, newRoleId: string) {
  console.log(`\n🚀 Quick fix: ${oldRoleId} → ${newRoleId}\n`);

  const batch = db.batch();
  let bookingsUpdated = 0;
  let submissionsUpdated = 0;

  // Update bookings
  const bookingsSnapshot = await db
    .collection("bookings")
    .where("roleId", "==", oldRoleId)
    .get();

  bookingsSnapshot.docs.forEach((doc) => {
    console.log(`  Updating booking ${doc.id}...`);
    batch.update(doc.ref, {
      roleId: newRoleId,
      updatedAt: new Date(),
    });
    bookingsUpdated++;
  });

  // Update submissions
  const submissionsSnapshot = await db
    .collection("submissions")
    .where("roleId", "==", oldRoleId)
    .get();

  submissionsSnapshot.docs.forEach((doc) => {
    console.log(`  Updating submission ${doc.id}...`);
    batch.update(doc.ref, {
      roleId: newRoleId,
      updatedAt: new Date(),
    });
    submissionsUpdated++;
  });

  await batch.commit();

  console.log(`\n✅ Updated ${bookingsUpdated} bookings`);
  console.log(`✅ Updated ${submissionsUpdated} submissions`);
  console.log("\n🎉 Quick fix complete!\n");
}

/**
 * Main execution
 */
async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  🔧 Firestore Data Repair Tool");
  console.log("  Fix Orphaned Bookings & Submissions");
  console.log("═══════════════════════════════════════════════════");

  // Check if quick fix mode
  const args = process.argv.slice(2);
  if (args.length === 2 && args[0] === "--quick") {
    const [oldId, newId] = args[1].split(":");
    await quickFix(oldId, newId);
    process.exit(0);
  }

  // Interactive mode
  const { orphanedBookings, orphanedSubmissions } = await findOrphanedDocuments();

  if (orphanedBookings.length === 0 && orphanedSubmissions.length === 0) {
    console.log("✅ No orphaned documents found. Database is healthy!\n");
    process.exit(0);
  }

  const mappings = await createRoleMapping(orphanedBookings, orphanedSubmissions);
  await updateDocuments(mappings);

  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
}

export { findOrphanedDocuments, quickFix };
