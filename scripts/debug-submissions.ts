/**
 * Debug Script: Check Submission-Role Data Integrity
 *
 * Run this to identify mismatches between submissions and roles
 * Usage: npx tsx scripts/debug-submissions.ts
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

// Firebase config (from your .env.local)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Submission {
  id: string;
  userId: string;
  roleId: string;
  roleName: string;
  projectId: string;
  projectTitle: string;
  status: string;
  profileData: any;
}

interface Role {
  id: string;
  name: string;
  projectId: string;
  requirements: string;
  rate: string;
  date: string;
  location: string;
}

async function debugSubmissions() {
  console.log("🔍 Starting Data Integrity Check...\n");

  // Fetch all submissions
  const submissionsSnapshot = await getDocs(collection(db, "submissions"));
  const submissions: Submission[] = submissionsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Submission[];

  console.log(`📊 Found ${submissions.length} total submissions\n`);

  // Fetch all roles
  const rolesSnapshot = await getDocs(collection(db, "roles"));
  const roles: Role[] = rolesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Role[];

  console.log(`📊 Found ${roles.length} total roles\n`);

  // Check each submission for role reference integrity
  let orphanedCount = 0;
  let mismatchedCount = 0;

  for (const submission of submissions) {
    const firstName = submission.profileData?.basicInfo?.firstName || "Unknown";
    const lastName = submission.profileData?.basicInfo?.lastName || "Unknown";

    console.log(`\n👤 Checking: ${firstName} ${lastName}`);
    console.log(`   Submission ID: ${submission.id}`);
    console.log(`   Stored roleId: ${submission.roleId}`);
    console.log(`   Stored roleName: "${submission.roleName}"`);
    console.log(`   Status: ${submission.status}`);

    // Check if role exists
    const roleExists = roles.find((r) => r.id === submission.roleId);

    if (!roleExists) {
      console.log(`   ❌ ORPHANED: Role ${submission.roleId} doesn't exist!`);
      orphanedCount++;

      // Check if a role with matching name exists (but different ID)
      const matchingNameRole = roles.find(
        (r) =>
          r.name.toLowerCase() === submission.roleName.toLowerCase() &&
          r.projectId === submission.projectId
      );

      if (matchingNameRole) {
        console.log(
          `   ⚠️  MISMATCH: Found role "${matchingNameRole.name}" with different ID: ${matchingNameRole.id}`
        );
        console.log(`   💡 FIX: Update submission roleId from "${submission.roleId}" to "${matchingNameRole.id}"`);
        mismatchedCount++;
      } else {
        console.log(`   ⚠️  No matching role found for "${submission.roleName}"`);
      }
    } else {
      console.log(`   ✅ Role exists: "${roleExists.name}"`);
      console.log(`   Project: ${roleExists.projectId}`);
    }
  }

  // Summary
  console.log("\n\n" + "=".repeat(60));
  console.log("📋 SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Submissions: ${submissions.length}`);
  console.log(`Total Roles: ${roles.length}`);
  console.log(`✅ Valid References: ${submissions.length - orphanedCount}`);
  console.log(`❌ Orphaned Submissions: ${orphanedCount}`);
  console.log(`⚠️  Fixable Mismatches: ${mismatchedCount}`);

  if (mismatchedCount > 0) {
    console.log("\n💡 RECOMMENDATION:");
    console.log("Run the fix script to update mismatched roleIds automatically.");
  }

  // List all roles for reference
  console.log("\n\n" + "=".repeat(60));
  console.log("📋 ALL ROLES IN DATABASE");
  console.log("=".repeat(60));
  roles.forEach((role) => {
    console.log(`\nRole: "${role.name}"`);
    console.log(`  ID: ${role.id}`);
    console.log(`  Project ID: ${role.projectId}`);
    console.log(`  Date: ${role.date}`);
    console.log(`  Location: ${role.location}`);
  });
}

debugSubmissions()
  .then(() => {
    console.log("\n✅ Debug complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
