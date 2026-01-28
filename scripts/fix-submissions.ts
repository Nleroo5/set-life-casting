/**
 * Fix Script: Repair Submission-Role References
 *
 * This script finds submissions with mismatched roleIds and fixes them
 * Usage: npx tsx scripts/fix-submissions.ts
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

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

async function fixSubmissions() {
  console.log("🔧 Starting Submission Fix Process...\n");

  // Fetch all submissions
  const submissionsSnapshot = await getDocs(collection(db, "submissions"));
  const submissions: Submission[] = submissionsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Submission[];

  // Fetch all roles
  const rolesSnapshot = await getDocs(collection(db, "roles"));
  const roles: Role[] = rolesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Role[];

  const fixes: Array<{ submissionId: string; oldRoleId: string; newRoleId: string; roleName: string }> =
    [];

  // Find all mismatches
  for (const submission of submissions) {
    const roleExists = roles.find((r) => r.id === submission.roleId);

    if (!roleExists) {
      // Try to find matching role by name and project
      const matchingNameRole = roles.find(
        (r) =>
          r.name.toLowerCase() === submission.roleName.toLowerCase() &&
          r.projectId === submission.projectId
      );

      if (matchingNameRole) {
        fixes.push({
          submissionId: submission.id,
          oldRoleId: submission.roleId,
          newRoleId: matchingNameRole.id,
          roleName: submission.roleName,
        });
      }
    }
  }

  if (fixes.length === 0) {
    console.log("✅ No mismatches found! All submissions are correctly linked.");
    return;
  }

  console.log(`Found ${fixes.length} submissions to fix:\n`);

  fixes.forEach((fix, index) => {
    console.log(`${index + 1}. Submission ${fix.submissionId}`);
    console.log(`   Role: "${fix.roleName}"`);
    console.log(`   Old roleId: ${fix.oldRoleId}`);
    console.log(`   New roleId: ${fix.newRoleId}\n`);
  });

  // Ask for confirmation
  console.log("⚠️  This will update the roleId field in these submissions.");
  console.log("Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n");

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("🔄 Applying fixes...\n");

  // Use batched writes for better performance
  const batch = writeBatch(db);
  let batchCount = 0;
  const batches: any[] = [batch];

  for (const fix of fixes) {
    if (batchCount >= 500) {
      // Firestore batch limit is 500 operations
      batches.push(writeBatch(db));
      batchCount = 0;
    }

    const submissionRef = doc(db, "submissions", fix.submissionId);
    batches[batches.length - 1].update(submissionRef, {
      roleId: fix.newRoleId,
    });

    batchCount++;
  }

  // Commit all batches
  for (let i = 0; i < batches.length; i++) {
    await batches[i].commit();
    console.log(`✅ Committed batch ${i + 1}/${batches.length}`);
  }

  console.log(`\n✅ Successfully fixed ${fixes.length} submissions!`);
  console.log("\n💡 Run the debug script again to verify all fixes.");
}

fixSubmissions()
  .then(() => {
    console.log("\n✅ Fix complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
