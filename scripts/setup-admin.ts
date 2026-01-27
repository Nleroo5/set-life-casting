/**
 * Script to set admin role for a user
 * Run with: npx ts-node scripts/setup-admin.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// and place it in the project root as 'serviceAccountKey.json'
const serviceAccount = require('../serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

const ADMIN_EMAIL = 'chazlynyu@gmail.com';

async function setupAdmin() {
  try {
    // Get user by email
    const userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
    console.log(`Found user: ${userRecord.uid}`);

    // Update user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: ADMIN_EMAIL,
      displayName: userRecord.displayName || 'Admin',
      role: 'admin',
      isGuest: false,
      createdAt: new Date(),
    }, { merge: true });

    console.log(`✅ Successfully set admin role for ${ADMIN_EMAIL}`);
    console.log(`User ID: ${userRecord.uid}`);

    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();
