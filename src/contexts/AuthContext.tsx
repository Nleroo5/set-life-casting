"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/config";
import { logger } from "@/lib/logger";

interface UserData {
  id: string;
  email: string;
  role: "admin" | "talent";
  full_name?: string;
}

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
  const supabase = createClient();

  // Mirror userData in a ref so the long-lived onAuthStateChange/getSession
  // callbacks (registered once in the mount effect) can read the CURRENT value
  // instead of the stale render-0 closure value. Without this, `!userData` in
  // loadUserData was always true, so a failed TOKEN_REFRESHED re-fetch always
  // wiped userData and flipped isAdmin to false.
  const userDataRef = useRef<UserData | null>(null);
  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.debug("Auth initial session", {
        hasSession: !!session,
        hasUser: !!session?.user,
        uid: session?.user?.id,
      });

      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      logger.debug("Auth state changed", {
        event: _event,
        hasSession: !!session,
        hasUser: !!session?.user,
        uid: session?.user?.id,
      });

      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      logger.debug("Auth cleanup - unsubscribing");
      subscription.unsubscribe();
    };
  }, []);

  async function loadUserData(userId: string) {
    try {
      logger.debug("Loading user data for", userId);

      const { data, error } = await supabase
        .from("users")
        .select("id, email, role, full_name")
        .eq("id", userId)
        .single();

      if (error) {
        logger.error("Error loading user data:", error);
        // Only clear userData on initial load (when it's null).
        // On re-fetches (TOKEN_REFRESHED), preserve the existing userData
        // to prevent isAdmin from flipping to false during token refresh.
        if (!userDataRef.current) setUserData(null);
      } else if (data) {
        logger.debug("User data loaded", {
          hasData: !!data,
          role: data.role,
        });
        setUserData(data as UserData);
      }
    } catch (error) {
      logger.error("Error in loadUserData:", error);
      if (!userDataRef.current) setUserData(null);
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    try {
      logger.debug("Signing out");
      await supabase.auth.signOut();
      setUser(null);
      setUserData(null);
      logger.debug("Sign out complete");
    } catch (error) {
      logger.error("Error signing out:", error);
      throw error;
    }
  };

  const isAdmin = userData?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
