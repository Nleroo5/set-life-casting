/**
 * Supabase Password Reset API
 *
 * Uses Supabase's built-in resetPasswordForEmail.
 * Sends password reset email with redirect to reset page.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
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
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${appUrl}/auth/callback?next=/auth/reset-password`,
    });

    // Supabase already answers success for unknown addresses, so an error here
    // means the email was not sent (rate limit or mailer failure). Say so,
    // instead of telling the user to check an inbox that will stay empty.
    if (error) {
      logger.error("Supabase password reset error:", error);
      const rateLimited = error.status === 429;
      return NextResponse.json(
        {
          error: rateLimited
            ? "Too many reset requests. Please wait a few minutes and try again."
            : "We couldn't send the reset email right now. Please try again later.",
        },
        { status: rateLimited ? 429 : 503 }
      );
    }

    // Unknown addresses also land here, so this does not reveal whether an account exists
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
