import { adminDb } from "../src/lib/firebase/admin";

/**
 * Migration: Convert old 4-status system to new 3-status system
 *
 * Mapping:
 * - "pending" → null (new submission)
 * - "reviewed" → "pinned" (under review)
 * - "selected" → "booked" (confirmed)
 * - "rejected" → "rejected" (unchanged)
 *
 * Also removes the "pinned" boolean field
 */

async function migrateSubmissionStatuses() {
  console.log("Starting submission status migration...\n");

  try {
    const submissionsRef = adminDb.collection("submissions");
    const snapshot = await submissionsRef.get();

    console.log(`Found ${snapshot.size} submissions to migrate\n`);

    const statusMapping: Record<string, string | null> = {
      pending: null,
      reviewed: "pinned",
      selected: "booked",
      rejected: "rejected",
    };

    let updatedCount = 0;
    let unchangedCount = 0;
    let errorCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const oldStatus = data.status;
      const newStatus = statusMapping[oldStatus] !== undefined
        ? statusMapping[oldStatus]
        : oldStatus;

      try {
        const updates: any = {};

        // Update status if it changed
        if (newStatus !== oldStatus) {
          updates.status = newStatus;
          console.log(`  ${doc.id}: "${oldStatus}" → "${newStatus}"`);
        }

        // Remove pinned field if it exists
        if (data.pinned !== undefined) {
          updates.pinned = adminDb.FieldValue.delete();

          // If was pinned=true and status is being set to null, set to "pinned" instead
          if (data.pinned === true && newStatus === null) {
            updates.status = "pinned";
            console.log(`  ${doc.id}: Was pinned, setting status to "pinned"`);
          }
        }

        if (Object.keys(updates).length > 0) {
          await doc.ref.update(updates);
          updatedCount++;
        } else {
          unchangedCount++;
        }

      } catch (error) {
        console.error(`  ✗ Error updating ${doc.id}:`, error);
        errorCount++;
      }
    }

    console.log("\n=== Migration Complete ===");
    console.log(`Updated: ${updatedCount}`);
    console.log(`Unchanged: ${unchangedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total: ${snapshot.size}`);

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateSubmissionStatuses()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
