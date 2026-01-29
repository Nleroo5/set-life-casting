/**
 * Firebase Native Password Reset API
 *
 * Uses Firebase's built-in sendPasswordResetEmail - no Admin SDK required!
 * More secure and simpler than custom token implementation.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if Firebase Auth is initialized
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication not initialized" },
        { status: 500 }
      );
    }

    // Send password reset email using Firebase's built-in function
    // This handles everything: email validation, template, security, etc.
    await sendPasswordResetEmail(auth, email.toLowerCase(), {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      handleCodeInApp: false,
    });

    // For security, always return success (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error: unknown) {
    logger.error("Password reset error:", error);

    // For security, don't expose specific error details
    // Always return generic success message
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  }
}
