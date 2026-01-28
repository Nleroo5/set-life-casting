import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/config";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    // Validate input
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if Firebase is initialized
    if (!db || !auth) {
      return NextResponse.json(
        { error: "Firebase not initialized" },
        { status: 500 }
      );
    }

    // Find the reset token
    const resetTokensRef = collection(db, "passwordResetTokens");
    const q = query(
      resetTokensRef,
      where("token", "==", token),
      where("used", "==", false)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const tokenDoc = querySnapshot.docs[0];
    const tokenData = tokenDoc.data();

    // Check if token has expired
    const now = Timestamp.now();
    if (tokenData.expiresAt.toMillis() < now.toMillis()) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      );
    }

    // Mark token as used
    await updateDoc(doc(db, "passwordResetTokens", tokenDoc.id), {
      used: true,
      usedAt: now,
    });

    // Return success with email so frontend can update password
    return NextResponse.json({
      success: true,
      email: tokenData.email,
      message: "Token verified successfully",
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "An error occurred while verifying the token" },
      { status: 500 }
    );
  }
}
