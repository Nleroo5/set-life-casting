/**
 * Migration Script: Add Consolidated "physical" Field to All Bookings
 *
 * This script updates all existing bookings in Firestore to include the consolidated
 * "physical" field in their talentProfile snapshots.
 * This ensures gender and ethnicity appear correctly in skins exports.
 *
 * Run this script after migrate-profiles-physical-field.ts
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

async function migrateBookings() {
  console.log("🚀 Starting booking migration...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Get all bookings
    const bookingsSnapshot = await db.collection("bookings").get();
    console.log(`📋 Found ${bookingsSnapshot.size} bookings to migrate`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each booking
    for (const bookingDoc of bookingsSnapshot.docs) {
      const bookingId = bookingDoc.id;
      const bookingData = bookingDoc.data();

      try {
        // Skip if physical field already exists in talentProfile
        if (bookingData.talentProfile?.physical?.gender && bookingData.talentProfile?.physical?.ethnicity) {
          console.log(`  ⏭️  Skipping booking ${bookingId} - already has physical data`);
          skippedCount++;
          continue;
        }

        // Get fresh profile data
        const userId = bookingData.userId;
        if (!userId) {
          console.warn(`  ⚠️  Skipping booking ${bookingId} - no userId`);
          skippedCount++;
          continue;
        }

        const profileDoc = await db.collection("profiles").doc(userId).get();
        if (!profileDoc.exists) {
          console.warn(`  ⚠️  Skipping booking ${bookingId} - profile not found for user ${userId}`);
          skippedCount++;
          continue;
        }

        const freshProfile = profileDoc.data();

        // Sanitize profile to replace undefined with null
        const sanitizeProfileData = (profile: any): any => {
          if (!profile) return null;

          const sanitized = JSON.parse(JSON.stringify(profile, (key, value) => {
            return value === undefined ? null : value;
          }));

          // Ensure critical nested objects exist
          if (!sanitized.physical) {
            sanitized.physical = {
              gender: sanitized.appearance?.gender || null,
              ethnicity: sanitized.appearance?.ethnicity || null,
              height: sanitized.appearance?.height || null,
              weight: sanitized.appearance?.weight || null,
              hairColor: sanitized.appearance?.hairColor || null,
              hairLength: sanitized.appearance?.hairLength || null,
              eyeColor: sanitized.appearance?.eyeColor || null,
              dateOfBirth: sanitized.appearance?.dateOfBirth || null,
              shirtSize: sanitized.sizes?.shirtSize || null,
              pantsWaist: sanitized.sizes?.pantsWaist || null,
              pantsInseam: sanitized.sizes?.pantsInseam || null,
              dressSize: sanitized.sizes?.dressSize || null,
              suitSize: sanitized.sizes?.suitSize || null,
              shoeSize: sanitized.sizes?.shoeSize || null,
              shoeSizeGender: sanitized.sizes?.shoeSizeGender || null,
              visibleTattoos: sanitized.details?.visibleTattoos || false,
              tattoosDescription: sanitized.details?.tattoosDescription || null,
              piercings: sanitized.details?.piercings || false,
              piercingsDescription: sanitized.details?.piercingsDescription || null,
              facialHair: sanitized.details?.facialHair || null,
            };
          }

          if (!sanitized.basicInfo) {
            sanitized.basicInfo = {
              firstName: null,
              lastName: null,
              email: null,
              phone: null,
            };
          }

          return sanitized;
        };

        const sanitizedProfile = sanitizeProfileData(freshProfile);

        // Update booking with sanitized profile
        await db.collection("bookings").doc(bookingId).update({
          talentProfile: sanitizedProfile,
          updatedAt: new Date(),
        });

        const name = `${sanitizedProfile?.basicInfo?.firstName} ${sanitizedProfile?.basicInfo?.lastName}`;
        console.log(`  ✅ Updated booking ${bookingId} for ${name}`);
        console.log(`     Gender: ${sanitizedProfile?.physical?.gender}, Ethnicity: ${JSON.stringify(sanitizedProfile?.physical?.ethnicity)}`);
        updatedCount++;
      } catch (error) {
        console.error(`  ❌ Error updating booking ${bookingId}:`, error);
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
migrateBookings()
  .then(() => {
    console.log("🎉 Migration finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  });
