"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/config";
import { logger } from "@/lib/logger";

/**
 * Password Reset Page
 *
 * Uses Supabase's auth.updateUser for password reset.
 * Supabase automatically creates a session when user clicks reset link.
 */
function ResetPasswordForm() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Verify that user has a valid session (from clicking reset link)
    verifySession();
  }, []);

  const verifySession = async () => {
    try {
      setVerifying(true);
      setError("");

      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Invalid or expired reset link. Please request a new password reset.");
        setVerifying(false);
        return;
      }

      // Store user email for display
      setUserEmail(user.email || "");
      setVerifying(false);
    } catch (err: unknown) {
      logger.error("Password reset session verification error:", err);
      setError("Invalid or expired reset link. Please request a new password reset.");
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Password was successfully updated
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 3000);
    } catch (err: unknown) {
      logger.error("Password reset error:", err);

      if (err && typeof err === "object" && "message" in err) {
        const errorMessage = (err as { message: string }).message.toLowerCase();
        if (errorMessage.includes("session") || errorMessage.includes("expired")) {
          setError("Reset link has expired. Please request a new one.");
        } else if (errorMessage.includes("weak") || errorMessage.includes("password")) {
          setError("Password is too weak. Please use a stronger password.");
        } else {
          setError("Failed to reset password. Please try again.");
        }
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-100 via-pink-50 to-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent mb-4"></div>
            <p className="text-lg text-secondary" style={{ fontFamily: "var(--font-outfit)" }}>
              Verifying your reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-100 via-pink-50 to-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2
              className="text-2xl font-bold text-secondary mb-4"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              Password Reset Successful
            </h2>
            <p className="text-base text-secondary-light mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <p className="text-sm text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-100 via-pink-50 to-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-secondary mb-2"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Reset Your Password
          </h1>
          <p className="text-base text-secondary-light" style={{ fontFamily: "var(--font-outfit)" }}>
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            required
            minLength={6}
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            required
            minLength={6}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm text-accent hover:text-accent-dark transition-colors"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-100 via-pink-50 to-blue-50">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
