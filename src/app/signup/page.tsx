"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/config";
import { useAuth } from "@/contexts/AuthContext";
import { validateRedirectUrl } from "@/lib/utils/redirect";
import { logger } from "@/lib/logger";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = validateRedirectUrl(searchParams.get("redirect"), "/dashboard");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo);
    }
  }, [authLoading, user, redirectTo, router]);

  const onSubmit = async (data: SignupFormData) => {
    setError("");
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Sign up user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: "talent", // Default role for signup
          },
        },
      });

      if (signUpError) {
        logger.error("Signup error:", signUpError);
        setError(signUpError.message);
        setIsSubmitting(false);
        return;
      }

      if (!authData.user) {
        setError("Failed to create account. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Create user record in public.users table
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          role: "talent",
          full_name: data.fullName,
        });

      if (insertError) {
        logger.error("Error creating user record:", insertError);
        setError("Failed to create user profile. Please contact support.");
        setIsSubmitting(false);
        return;
      }

      // Success - show message and redirect to login
      alert("Account created successfully! Please check your email to verify your account before logging in.");
      router.push("/login");
    } catch (err: unknown) {
      logger.error("Unexpected signup error:", err);
      setError("Failed to create account. Please try again.");
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
              Create Your{" "}
              <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Account
              </span>
            </h1>
            <p
              className="text-base text-secondary-light"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Join Set Life Casting today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border-2 border-danger/30 rounded-lg">
              <p className="text-danger text-sm text-center">{error}</p>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              {...register("fullName")}
              error={errors.fullName?.message}
              placeholder="John Doe"
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="your@email.com"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-accent/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className="px-4 bg-white text-secondary-light"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link
              href={`/login${redirectTo !== "/dashboard" ? `?redirect=${redirectTo}` : ""}`}
              className="text-accent hover:text-accent-dark font-semibold transition-colors"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Sign in instead →
            </Link>
          </div>

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

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
