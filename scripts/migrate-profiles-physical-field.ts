/**
 * Migration Script: Add Consolidated "physical" Field to All Profiles
 *
 * This script updates all existing profiles in Firestore to include a consolidated
 * "physical" field that combines data from appearance, sizes, and details.
 * This makes searching for talent by any physical attribute easy and efficient.
 *
 * Run this script once to backfill existing profiles.
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin (only once)
if (getApps().length === 0) {
  // You'll need to download your service account key from Firebase Console
  // and place it in the project root as "firebase-service-account.json"
  initializeApp({
    credential: cert(require("../firebase-service-account.json")),
  });
}

const db = getFirestore();

async function migrateProfiles() {
  console.log("🚀 Starting profile migration...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Get all profiles
    const profilesSnapshot = await db.collection("profiles").get();
    console.log(`📋 Found ${profilesSnapshot.size} profiles to migrate`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each profile
    for (const profileDoc of profilesSnapshot.docs) {
      const profileId = profileDoc.id;
      const profileData = profileDoc.data();

      try {
        // Skip if physical field already exists and is complete
        if (profileData.physical?.gender && profileData.physical?.ethnicity) {
          console.log(`  ⏭️  Skipping ${profileData.basicInfo?.firstName} ${profileData.basicInfo?.lastName} - already has physical data`);
          skippedCount++;
          continue;
        }

        // Build consolidated physical field
        const physical = {
          // From appearance
          gender: profileData.appearance?.gender || null,
          ethnicity: profileData.appearance?.ethnicity || null,
          height: profileData.appearance?.height || null,
          weight: profileData.appearance?.weight || null,
          hairColor: profileData.appearance?.hairColor || null,
          hairLength: profileData.appearance?.hairLength || null,
          eyeColor: profileData.appearance?.eyeColor || null,
          dateOfBirth: profileData.appearance?.dateOfBirth || null,
          // From sizes
          shirtSize: profileData.sizes?.shirtSize || null,
          pantsWaist: profileData.sizes?.pantsWaist || null,
          pantsInseam: profileData.sizes?.pantsInseam || null,
          dressSize: profileData.sizes?.dressSize || null,
          suitSize: profileData.sizes?.suitSize || null,
          shoeSize: profileData.sizes?.shoeSize || null,
          shoeSizeGender: profileData.sizes?.shoeSizeGender || null,
          // From details
          visibleTattoos: profileData.details?.visibleTattoos || false,
          tattoosDescription: profileData.details?.tattoosDescription || null,
          piercings: profileData.details?.piercings || false,
          piercingsDescription: profileData.details?.piercingsDescription || null,
          facialHair: profileData.details?.facialHair || null,
        };

        // Update profile with physical field
        await db.collection("profiles").doc(profileId).update({
          physical: physical,
          updatedAt: new Date(),
        });

        console.log(`  ✅ Updated ${profileData.basicInfo?.firstName} ${profileData.basicInfo?.lastName}`);
        console.log(`     Gender: ${physical.gender}, Ethnicity: ${JSON.stringify(physical.ethnicity)}`);
        updatedCount++;
      } catch (error) {
        console.error(`  ❌ Error updating profile ${profileId}:`, error);
        errorCount++;
      }
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Migration complete!");
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Errors: ${errorCount}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration
migrateProfiles()
  .then(() => {
    console.log("🎉 Migration finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  });
