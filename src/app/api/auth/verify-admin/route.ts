/**
 * API Route: Verify Admin Token
 *
 * This endpoint verifies Firebase ID tokens and checks admin role.
 * Used by middleware to protect admin routes server-side.
 *
 * Security:
 * - Verifies token signature with Firebase Admin SDK
 * - Checks user role in Firestore
 * - Returns verification result (does NOT return sensitive data)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token required", isValid: false, isAdmin: false },
        { status: 400 }
      );
    }

    // Verify token and check admin role
    const result = await verifyAdminToken(token);

    // Return verification result
    return NextResponse.json({
      isValid: result.isValid,
      isAdmin: result.isAdmin,
      // DO NOT return uid or email to prevent information disclosure
    });
  } catch (error) {
    console.error("Token verification error:", error);

    return NextResponse.json(
      {
        error: "Verification failed",
        isValid: false,
        isAdmin: false,
      },
      { status: 500 }
    );
  }
}

// Disable caching for security
export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Use Node.js runtime for Firebase Admin SDK
