/**
 * Supabase Password Reset API
 *
 * Uses Supabase's built-in resetPasswordForEmail.
 * Sends password reset email with redirect to reset page.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/config";
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

    // Send password reset email using Supabase's built-in function
    // This handles everything: email validation, template, security, etc.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${appUrl}/auth/reset-password`,
    });

    // Log any errors but don't expose them to the user
    if (error) {
      logger.error("Supabase password reset error:", error);
    }

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
