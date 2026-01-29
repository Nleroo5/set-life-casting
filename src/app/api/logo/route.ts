import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * API route to proxy the Set Life Casting logo
 * Bypasses CORS restrictions when fetching from Firebase Storage
 */
export async function GET(request: NextRequest) {
  try {
    const logoUrl =
      "https://firebasestorage.googleapis.com/v0/b/drive-lead-media-crm.firebasestorage.app/o/websiteQuotes%2Fquote_1760395151657_f05s8xyu2%2Flogo%2FScreen%20Shot%202024-01-27%20at%203.54.57%20PM-fotor-2024012904710.jpg?alt=media&token=be6f763a-80f6-47d1-ad5e-b2fd483b339d";

    const response = await fetch(logoUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch logo: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (error) {
    logger.error("Error proxying logo:", error);
    return NextResponse.json({ error: "Failed to load logo" }, { status: 500 });
  }
}
