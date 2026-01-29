"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { signInWithEmail } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { validateRedirectUrl } from "@/lib/utils/redirect";
import { logger } from "@/lib/logger";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const redirectTo = validateRedirectUrl(searchParams.get("redirect"), "/dashboard");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      // Redirect admins directly to admin dashboard
      // Regular users go to their intended destination
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push(redirectTo);
      }
    }
  }, [authLoading, user, isAdmin, redirectTo, router]);

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setIsSubmitting(true);

    try {
      await signInWithEmail(data.email, data.password);
      // Don't redirect here - let the useEffect handle it
      // This prevents race conditions with the isAdmin flag
    } catch (err: unknown) {
      logger.error("Login error:", err);
      if (err && typeof err === "object" && "code" in err) {
        const errorCode = (err as { code: string }).code;
        if (errorCode === "auth/invalid-credential") {
          setError("Invalid email or password");
        } else if (errorCode === "auth/user-not-found") {
          setError("No account found with this email");
        } else if (errorCode === "auth/wrong-password") {
          setError("Incorrect password");
        } else {
          setError("Failed to sign in. Please try again.");
        }
      } else {
        setError("Failed to sign in. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setResetSuccess(true);
      setResetEmail("");
    } catch (err: unknown) {
      logger.error("Password reset error:", err);
      const message = err instanceof Error ? err.message : "Failed to send reset email. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
          <p
            className="mt-4 text-lg text-secondary"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-100 via-pink-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-8 md:p-10 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold text-secondary mb-2"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              Welcome{" "}
              <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Back
              </span>
            </h1>
            <p
              className="text-base text-secondary-light"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Sign in to your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border-2 border-danger/30 rounded-lg">
              <p className="text-danger text-sm text-center">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {resetSuccess && (
            <div className="mb-6 p-4 bg-success/10 border-2 border-success/30 rounded-lg">
              <p className="text-success text-sm text-center">
                Password reset email sent! Check your inbox.
              </p>
            </div>
          )}

          {/* Login Form or Forgot Password Form */}
          {!showForgotPassword ? (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Email"
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                  placeholder="your@email.com"
                  autoComplete="email"
                />

                <div>
                  <Input
                    label="Password"
                    type="password"
                    {...register("password")}
                    error={errors.password?.message}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setError("");
                        setResetSuccess(false);
                      }}
                      className="text-sm text-accent hover:text-accent-dark transition-colors"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label
                    htmlFor="resetEmail"
                    className="block text-sm font-medium text-secondary mb-2"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    Email
                  </label>
                  <input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 border-2 border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Email"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError("");
                    setResetSuccess(false);
                  }}
                  className="w-full text-sm text-secondary-light hover:text-accent transition-colors"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  ← Back to sign in
                </button>
              </form>
            </>
          )}

          {/* Divider - Only show on login form */}
          {!showForgotPassword && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-accent/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className="px-4 bg-white text-secondary-light"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    Don&apos;t have an account?
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <Link
                  href={`/signup${redirectTo !== "/dashboard" ? `?redirect=${redirectTo}` : ""}`}
                  className="text-accent hover:text-accent-dark font-semibold transition-colors"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Create an account →
                </Link>
              </div>
            </>
          )}

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-secondary-light hover:text-accent transition-colors"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
