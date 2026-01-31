/**
 * Firebase Native Password Reset API
 *
 * Uses Firebase's built-in sendPasswordResetEmail - no Admin SDK required!
 * More secure and simpler than custom token implementation.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "firebase/auth";
import { z } from "zod";
import { auth } from "@/lib/firebase/config";
import { logger } from "@/lib/logger";

// Email validation schema
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate email with Zod
    const validation = emailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Check if Firebase Auth is initialized
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication not initialized" },
        { status: 500 }
      );
    }

    // Send password reset email using Firebase's built-in function
    // This handles everything: email validation, template, security, etc.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
    await sendPasswordResetEmail(auth, email.toLowerCase(), {
      url: `${appUrl}/login`,
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
