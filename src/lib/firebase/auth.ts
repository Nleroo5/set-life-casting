import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";

export interface UserData {
  email: string | null;
  displayName: string | null;
  role: "talent" | "admin";
  isGuest: boolean;
  createdAt: Date;
}

/**
 * Create a new user with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  if (!auth || !db) {
    throw new Error("Firebase is not initialized");
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  // Update profile with display name
  await updateProfile(user, { displayName });

  // Create user document in Firestore
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    displayName,
    role: "talent",
    isGuest: false,
    createdAt: new Date(),
  });

  return user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  if (!auth) {
    throw new Error("Firebase is not initialized");
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Sign in anonymously (guest mode)
 */
export async function signInAsGuest(): Promise<User> {
  if (!auth || !db) {
    throw new Error("Firebase is not initialized");
  }

  const userCredential = await signInAnonymously(auth);
  const user = userCredential.user;

  // Create user document for guest
  await setDoc(doc(db, "users", user.uid), {
    email: null,
    displayName: "Guest User",
    role: "talent",
    isGuest: true,
    createdAt: new Date(),
  });

  return user;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  if (!auth) {
    throw new Error("Firebase is not initialized");
  }

  await firebaseSignOut(auth);
}

/**
 * Get user data from Firestore
 */
export async function getUserData(uid: string): Promise<UserData | null> {
  if (!db) {
    return null;
  }

  const userDoc = await getDoc(doc(db, "users", uid));
  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  return {
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    isGuest: data.isGuest,
    createdAt: data.createdAt.toDate(),
  };
}

/**
 * Check if user is admin
 */
export async function isAdmin(uid: string): Promise<boolean> {
  const userData = await getUserData(uid);
  return userData?.role === "admin";
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  if (!auth) {
    throw new Error("Firebase is not initialized");
  }

  await sendPasswordResetEmail(auth, email);
}
