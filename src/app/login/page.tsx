"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Turnstile, { turnstileEnabled } from "@/components/ui/Turnstile";
import { createClient } from "@/lib/supabase/config";
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
  // /auth/callback sends ?error=auth_callback_failed when a verification or
  // reset link can't be exchanged for a session.
  const [error, setError] = useState(() => {
    if (searchParams.get("error") === "auth_callback_failed") {
      return 'That link is invalid or has expired. Sign in below to get a new verification email, or use "Forgot password?" for a new reset link.';
    }
    if (searchParams.get("notice") === "reset_other_browser") {
      return 'Reset links only work in the browser you requested them from. Use "Forgot password?" below and open the new link on this device.';
    }
    return "";
  });
  // /auth/callback sends ?notice=email_verified when a verification link was
  // good but opened in a different browser, so no session could be created.
  const [notice, setNotice] = useState(
    searchParams.get("notice") === "email_verified"
      ? "Your email is verified. Sign in to continue."
      : ""
  );
  // Set when sign-in is refused because the email is not verified yet
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resending, setResending] = useState(false);
  // One Turnstile widget serves sign-in, resend and password reset. Each call
  // spends the token, so the widget is reset after every one.
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  // A Turnstile token can be used once: drop it and ask the widget for another
  const renewCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaReset((n) => n + 1);
  };
  const captchaPending = turnstileEnabled && !captchaToken;
  const CAPTCHA_WAIT = "Please wait for the verification check below to finish, then try again.";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const redirectTo = validateRedirectUrl(searchParams.get("redirect"), "/dashboard");

  // A verification email sent by "Resend" is not a PKCE link: Supabase returns
  // from it with the session in the URL fragment, which /auth/callback (a
  // server route) never sees, so the visitor arrives here with
  // ?error=auth_callback_failed even though the email was just verified.
  // Recognise that case, say so, and take the tokens out of the address bar.
  useEffect(() => {
    if (!window.location.hash.includes("access_token=")) return;
    window.history.replaceState(null, "", "/login");
    setError("");
    setNotice("Your email is verified. Sign in to continue.");
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in AND email-verified.
  // Gating on email_confirmed_at prevents a race with onSubmit's unverified
  // sign-out: without it, the session set by signInWithPassword triggers this
  // redirect to /dashboard before the manual verification check can sign the
  // user back out, causing a redirect flip-flop.
  useEffect(() => {
    if (!authLoading && user && user.email_confirmed_at) {
      // Redirect all users (including admins) to their intended destination
      // This ensures deep links work correctly even after cookie expiration
      router.push(redirectTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isAdmin, redirectTo]);

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setNotice("");
    setUnverifiedEmail("");

    if (captchaPending) {
      setError(CAPTCHA_WAIT);
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
        ...(captchaToken ? { options: { captchaToken } } : {}),
      });
      renewCaptcha();

      if (authError) {
        logger.error("Login error:", authError);
        const friendly: Record<string, string> = {
          "Email not confirmed": "Please verify your email before logging in. Check your inbox for the verification link.",
          "Invalid login credentials": "Incorrect email or password.",
        };
        setError(
          /captcha/i.test(authError.message)
            ? "The verification check failed. Please try again."
            : friendly[authError.message] ?? authError.message
        );
        if (authError.message === "Email not confirmed") {
          setUnverifiedEmail(data.email);
        }
        setIsSubmitting(false);
        return;
      }

      // Check if email is verified
      if (!authData.user?.email_confirmed_at) {
        setError("Please verify your email before logging in. Check your inbox for the verification link.");
        setUnverifiedEmail(data.email);
        await supabase.auth.signOut();
        setIsSubmitting(false);
        return;
      }

      // Don't redirect here - let the useEffect handle it
      // This prevents race conditions with the isAdmin flag
      logger.debug("Login successful", { userId: authData.user.id });
    } catch (err: unknown) {
      logger.error("Unexpected login error:", err);
      setError("Failed to sign in. Please try again.");
      setIsSubmitting(false);
    }
  };

  // An unverified user cannot sign in, so this is the only place they can ask
  // for the verification email again.
  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    if (captchaPending) {
      setError(CAPTCHA_WAIT);
      return;
    }
    setResending(true);
    setError("");

    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: unverifiedEmail,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          ...(captchaToken ? { captchaToken } : {}),
        },
      });
      renewCaptcha();

      if (resendError) {
        logger.error("Resend verification error:", resendError);
        setError(
          /rate limit|security purposes/i.test(resendError.message)
            ? "We just sent you an email. Please wait a minute before asking for another."
            : "We couldn't send the verification email right now. Please try again in a few minutes."
        );
        return;
      }

      setUnverifiedEmail("");
      setNotice("Verification email sent. Check your inbox and spam folder, and open the link on this device.");
    } catch (err: unknown) {
      logger.error("Unexpected resend error:", err);
      setError("We couldn't send the verification email right now. Please try again in a few minutes.");
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setUnverifiedEmail("");

    if (captchaPending) {
      setError(CAPTCHA_WAIT);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail, ...(captchaToken ? { captchaToken } : {}) }),
      });
      renewCaptcha();

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
              {unverifiedEmail && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="text-sm font-semibold text-accent hover:text-accent-dark underline disabled:opacity-50"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {resending ? "Sending..." : "Resend verification email"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notice (email verified, verification email sent) */}
          {notice && (
            <div className="mb-6 p-4 bg-success/10 border-2 border-success/30 rounded-lg">
              <p className="text-success text-sm text-center">{notice}</p>
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

          {turnstileEnabled && (
            <div className="mt-6">
              <Turnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
            </div>
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
