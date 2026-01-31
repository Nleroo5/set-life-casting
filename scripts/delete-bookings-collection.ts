import { adminDb } from "../src/lib/firebase/admin";

/**
 * DANGEROUS: Deletes the entire "bookings" collection
 * Only run this after confirming the new status system works
 */

async function deleteBookingsCollection() {
  console.log("⚠️  WARNING: This will permanently delete all bookings!");
  console.log("Press Ctrl+C within 10 seconds to cancel...\n");

  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log("Starting deletion...\n");

  try {
    const bookingsRef = adminDb.collection("bookings");
    const snapshot = await bookingsRef.get();

    console.log(`Found ${snapshot.size} bookings to delete\n`);

    const batchSize = 500;
    let deletedCount = 0;

    while (true) {
      const batch = adminDb.batch();
      const docs = await bookingsRef.limit(batchSize).get();

      if (docs.empty) break;

      docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      deletedCount += docs.size;
      console.log(`Deleted ${deletedCount} / ${snapshot.size} bookings...`);
    }

    console.log("\n✓ Bookings collection deleted successfully");

  } catch (error) {
    console.error("Deletion failed:", error);
    process.exit(1);
  }
}

deleteBookingsCollection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
