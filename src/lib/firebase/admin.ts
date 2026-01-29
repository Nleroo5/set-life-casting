/**
 * Firebase Admin SDK Configuration
 *
 * This module initializes the Firebase Admin SDK for server-side operations.
 * Used for:
 * - Verifying user roles (admin vs talent)
 * - Server-side authentication verification
 * - Admin-only database operations
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App;

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 */
function initializeAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Check if running in development with emulators
  if (process.env.NODE_ENV === "development" && process.env.FIRESTORE_EMULATOR_HOST) {
    // For local development with emulators
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    // For production: Use service account credentials
    // Option 1: Service account JSON file path
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      adminApp = initializeApp({
        credential: cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
    // Option 2: Service account key as environment variables
    else if (
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    }
    // Option 3: Default application credentials (for Cloud Run, Cloud Functions)
    else {
      console.warn(
        "⚠️ No Firebase Admin credentials found. Using application default credentials."
      );
      adminApp = initializeApp();
    }
  }

  return adminApp;
}

// Initialize on module load
const app = initializeAdminApp();

// Export admin services
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

/**
 * Verify if a user has admin role
 * @param uid - Firebase user ID
 * @returns true if user is admin, false otherwise
 */
export async function verifyAdminRole(uid: string): Promise<boolean> {
  try {
    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return false;
    }

    const userData = userDoc.data();
    return userData?.role === "admin";
  } catch (error) {
    console.error("Error verifying admin role:", error);
    return false;
  }
}

/**
 * Verify ID token and check if user is admin
 * @param idToken - Firebase ID token from client
 * @returns Object with verification result and user data
 */
export async function verifyAdminToken(idToken: string): Promise<{
  isValid: boolean;
  isAdmin: boolean;
  uid?: string;
  email?: string;
}> {
  try {
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check admin role in Firestore
    const isAdmin = await verifyAdminRole(uid);

    return {
      isValid: true,
      isAdmin,
      uid,
      email: decodedToken.email,
    };
  } catch (error) {
    console.error("Error verifying admin token:", error);
    return {
      isValid: false,
      isAdmin: false,
    };
  }
}
