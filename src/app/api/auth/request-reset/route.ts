import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import { collection, query, where, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { nanoid } from "nanoid";

// Initialize Resend (will use API key from environment)
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Check if Firebase is initialized
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Check if user exists in Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // For security, don't reveal if email exists or not
      // Return success but don't actually send email
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Generate secure reset token (32 characters)
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token in Firestore
    const resetTokensRef = collection(db, "passwordResetTokens");
    await addDoc(resetTokensRef, {
      email: email.toLowerCase(),
      token,
      expiresAt: Timestamp.fromDate(expiresAt),
      used: false,
      createdAt: Timestamp.now(),
    });

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
    const requestTime = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Set Life Casting <noreply@setlifecasting.com>",
      replyTo: "SetLifeCasting@gmail.com",
      to: [email],
      subject: "Reset Your Password - Set Life Casting",
      react: PasswordResetEmail({
        resetLink,
        userEmail: email,
        requestTime,
      }),
    });

    if (error) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
