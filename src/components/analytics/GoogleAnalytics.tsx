"use client";

import { useEffect } from "react";

/**
 * Google Analytics Component - Client-Side Only
 *
 * IMPORTANT: This component initializes GA with new Date() in useEffect
 * to prevent hydration errors. The date must be calculated client-side
 * to avoid server/client timestamp mismatches.
 */
export default function GoogleAnalytics() {
  useEffect(() => {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }

    // ✅ FIX: new Date() called in useEffect (client-side only)
    // This prevents hydration mismatch between server and client
    gtag('js', new Date());
    gtag('config', 'G-152PSRW9DD');
  }, []);

  return null; // This component doesn't render anything
}

// TypeScript declaration for window.dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}
