/**
 * Set Firebase Auth Custom Claims for Admin Users
 *
 * This script sets the `admin: true` custom claim on a user's Firebase Auth token.
 * This is required after implementing the professional fix for Firestore rules.
 *
 * Usage:
 *   npx tsx scripts/set-admin-claims.ts <user-email-or-uid>
 *
 * Example:
 *   npx tsx scripts/set-admin-claims.ts admin@setlifecasting.com
 *   npx tsx scripts/set-admin-claims.ts abc123xyz
 */

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "set-life-casting";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Try to initialize with service account file
  const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId,
    });
    console.log("✅ Initialized with firebase-service-account.json");
  } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    // Try to initialize with environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Initialized with environment variables");
  } else {
    console.error("\n❌ ERROR: Firebase Admin SDK credentials not found\n");
    console.error("You need to provide Firebase Admin credentials to run this script.\n");
    console.error("Option 1: Download service account key (Recommended)");
    console.error("  1. Go to Firebase Console → Project Settings → Service Accounts");
    console.error("  2. Click 'Generate New Private Key'");
    console.error("  3. Save the file as 'firebase-service-account.json' in project root\n");
    console.error("Option 2: Add credentials to .env.local");
    console.error("  Add these variables to .env.local:");
    console.error("    FIREBASE_CLIENT_EMAIL=...");
    console.error("    FIREBASE_PRIVATE_KEY=...\n");
    console.error("Then run this script again.\n");
    process.exit(1);
  }
}

async function setAdminClaim(emailOrUid: string) {
  try {
    console.log(`🔍 Looking up user: ${emailOrUid}...`);

    let user: admin.auth.UserRecord;

    // Check if input is email or UID
    if (emailOrUid.includes("@")) {
      user = await admin.auth().getUserByEmail(emailOrUid);
    } else {
      user = await admin.auth().getUser(emailOrUid);
    }

    console.log(`✅ Found user: ${user.email} (${user.uid})`);

    // Check if user already has admin claim
    const existingClaims = user.customClaims || {};
    if (existingClaims.admin === true) {
      console.log(`⚠️  User already has admin claim. Nothing to do.`);
      return;
    }

    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, {
      ...existingClaims,
      admin: true,
    });

    console.log(`✅ Successfully set admin claim for ${user.email}`);
    console.log(`\n⚠️  IMPORTANT: User must logout and login again to receive new token with admin claim.`);

    // Also update Firestore users collection for consistency
    const db = admin.firestore();
    await db.collection("users").doc(user.uid).set(
      {
        role: "admin",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`✅ Updated role in Firestore users collection`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error:`, error);
    process.exit(1);
  }
}

// Get email/UID from command line arguments
const emailOrUid = process.argv[2];

if (!emailOrUid) {
  console.error(`❌ Usage: npx tsx scripts/set-admin-claims.ts <email-or-uid>`);
  console.error(`   Example: npx tsx scripts/set-admin-claims.ts admin@setlifecasting.com`);
  process.exit(1);
}

setAdminClaim(emailOrUid);
