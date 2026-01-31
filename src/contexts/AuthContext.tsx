"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserData, UserData } from "@/lib/firebase/auth";
import { logger } from "@/lib/logger";

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip if Firebase auth is not initialized (e.g., during SSR)
    if (!auth) {
      setLoading(false);
      return;
    }

    let tokenRefreshInterval: NodeJS.Timeout | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      logger.debug("Auth state changed", {
        hasUser: !!firebaseUser,
        uid: firebaseUser?.uid,
      });

      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // ✅ FIX: Fetch user data first before marking as loaded
          logger.debug("Fetching user data for", firebaseUser.uid);
          const data = await getUserData(firebaseUser.uid);
          logger.debug("User data fetched", {
            hasData: !!data,
            role: data?.role,
          });
          setUserData(data);

          // Get Firebase ID token and store in cookie for server-side verification
          const token = await firebaseUser.getIdToken();
          // Store token in cookie with Secure flag (httpOnly would be better but requires server-side API route)
          // Secure flag ensures cookie is only sent over HTTPS
          document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict; Secure`;
          logger.debug("Token stored in cookie");

          // Clear any existing interval before setting a new one
          if (tokenRefreshInterval) {
            clearInterval(tokenRefreshInterval);
          }

          // Refresh token every 50 minutes (tokens expire after 1 hour)
          tokenRefreshInterval = setInterval(async () => {
            // ✅ FIX: Prevent race condition - check if user still exists
            if (!firebaseUser) {
              if (tokenRefreshInterval) {
                clearInterval(tokenRefreshInterval);
                tokenRefreshInterval = null;
              }
              return;
            }

            try {
              const newToken = await firebaseUser.getIdToken(true); // Force refresh
              document.cookie = `firebase-token=${newToken}; path=/; max-age=3600; SameSite=Strict; Secure`;
            } catch (error) {
              logger.error("Error refreshing token:", error);
              if (tokenRefreshInterval) {
                clearInterval(tokenRefreshInterval);
                tokenRefreshInterval = null;
              }
            }
          }, 50 * 60 * 1000); // 50 minutes
        } catch (error) {
          logger.error("Error setting up user session:", error);
          setUserData(null);
        }
      } else {
        logger.debug("No user, clearing data");
        setUserData(null);
        // Clear token cookie on logout (Secure flag required for consistency)
        document.cookie = "firebase-token=; path=/; max-age=0; Secure";

        // Clear token refresh interval on logout
        if (tokenRefreshInterval) {
          clearInterval(tokenRefreshInterval);
          tokenRefreshInterval = null;
        }
      }

      // ✅ FIX: Set loading to false AFTER all async operations complete
      logger.debug("Auth loading complete");
      setLoading(false);
    });

    // Cleanup function
    return () => {
      unsubscribe();
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, []);

  const isAdmin = userData?.role === "admin";

  const logout = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    try {
      await signOut(auth);
    } catch (error) {
      logger.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
