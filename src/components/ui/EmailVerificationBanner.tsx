"use client";

import React, { useState } from "react";
import { resendVerificationEmail } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import Button from "./Button";
import { logger } from "@/lib/logger";

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Don't show banner if user is verified or not logged in
  if (!user || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    if (!user) return;

    setSending(true);
    setMessage("");

    try {
      await resendVerificationEmail(user);
      setMessage("Verification email sent! Please check your inbox.");
    } catch (error) {
      logger.error("Error sending verification email:", error);
      setMessage("Failed to send email. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3
            className="text-sm font-semibold text-yellow-900 mb-1"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Email Verification Required
          </h3>
          <p
            className="text-sm text-yellow-800 mb-3"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Please verify your email address to submit for roles. Check your inbox for the
            verification link.
          </p>
          {message && (
            <p
              className="text-sm text-yellow-900 mb-3 font-medium"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {message}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={sending}
              className="text-sm"
            >
              {sending ? "Sending..." : "Resend Email"}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="text-sm"
            >
              I've Verified - Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
