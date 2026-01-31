"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { signUpWithEmail, signInWithEmail, signInAsGuest } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

interface AccountStepProps {
  onNext: () => void;
}

export default function AccountStep({ onNext }: AccountStepProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<"select" | "signup" | "signin">("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already authenticated, skip to next step
  React.useEffect(() => {
    if (user) {
      onNext();
    }
  }, [user, onNext]);

  const handleGuestSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signInAsGuest();
      onNext();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to continue as guest";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signUpWithEmail(email, password, displayName);
      onNext();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmail(email, password);
      onNext();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "select") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-secondary mb-4"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Get Started
          </h2>
          <p
            className="text-base text-secondary-light"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Choose how you'd like to submit your profile
          </p>
        </div>

        <div className="space-y-4">
          <div
            className="bg-linear-to-br from-white to-purple-50/30 rounded-xl p-6 border-2 border-accent cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => setMode("signup")}
          >
            <h3
              className="text-xl font-bold text-accent mb-2"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Create an Account
            </h3>
            <p
              className="text-base text-secondary"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Save your profile, track submissions, and get notified about new
              opportunities
            </p>
          </div>

          <div
            className="bg-linear-to-br from-white to-blue-50/30 rounded-xl p-6 border-2 border-gray-300 cursor-pointer hover:border-accent hover:shadow-lg transition-all duration-300"
            onClick={handleGuestSignIn}
          >
            <h3
              className="text-xl font-bold text-secondary mb-2"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Continue as Guest
            </h3>
            <p
              className="text-base text-secondary-light"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Submit quickly without creating an account (one-time submission)
            </p>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => setMode("signin")}
              className="text-accent hover:text-accent-dark underline text-base"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center mt-6">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-base text-red-600" style={{ fontFamily: "var(--font-outfit)" }}>
              {error}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (mode === "signup") {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-secondary mb-4"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Create Account
          </h2>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="John Doe"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="At least 6 characters"
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-base text-red-600" style={{ fontFamily: "var(--font-outfit)" }}>
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode("select")}
              disabled={loading}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (mode === "signin") {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-secondary mb-4"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Sign In
          </h2>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Your password"
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-base text-red-600" style={{ fontFamily: "var(--font-outfit)" }}>
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode("select")}
              disabled={loading}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex-1">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return null;
}
