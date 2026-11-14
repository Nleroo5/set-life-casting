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

    // gtag.js only acts on the `arguments` object itself. An Array pushed to
    // dataLayer is ignored, so `config` never ran and no page view was sent.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function gtag(..._args: unknown[]) {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
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
