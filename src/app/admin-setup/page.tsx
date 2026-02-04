"use client";

import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Button from "@/components/ui/Button";

/**
 * One-time admin setup page
 * Navigate to /admin-setup and enter the user UID to make them an admin
 * After setting up, delete this file for security
 */
export default function AdminSetupPage() {
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("chazlynyu@gmail.com");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Update user document to set admin role
      await setDoc(
        doc(db, "users", uid),
        {
          email,
          role: "admin",
          isGuest: false,
          createdAt: new Date(),
        },
        { merge: true }
      );

      setMessage(`✅ Successfully set admin role for UID: ${uid}`);
      console.log("Admin setup complete!");
    } catch (error) {
      console.error("Error setting up admin:", error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-100 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
        <h1
          className="text-2xl font-bold text-secondary mb-2"
          style={{ fontFamily: "var(--font-galindo)" }}
        >
          Admin Setup
        </h1>
        <p
          className="text-sm text-secondary-light mb-6"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          One-time setup to create an admin user
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800" style={{ fontFamily: "var(--font-outfit)" }}>
            <strong>⚠️ Security Note:</strong> Delete this file after setup!
          </p>
        </div>

        <form onSubmit={handleSetupAdmin} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-secondary mb-1"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              User Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-secondary mb-1"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              User UID (from Firebase Console)
            </label>
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="Enter Firebase user UID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
            <p className="text-xs text-secondary-light mt-1">
              Find this in Firebase Console → Authentication → Users
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Setting up..." : "Make Admin"}
          </Button>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.startsWith("✅")
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <p className="text-sm" style={{ fontFamily: "var(--font-outfit)" }}>
                {message}
              </p>
            </div>
          )}
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
            <strong>Steps:</strong>
            <br />
            1. Create account with {email}
            <br />
            2. Go to Firebase Console → Authentication
            <br />
            3. Copy the UID for {email}
            <br />
            4. Paste it above and click "Make Admin"
            <br />
            5. Delete this file: src/app/admin-setup/page.tsx
          </p>
        </div>
      </div>
    </div>
  );
}
