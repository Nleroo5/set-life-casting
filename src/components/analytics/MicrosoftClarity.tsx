"use client";

import Script from "next/script";

/**
 * Microsoft Clarity Analytics Component
 *
 * Implements Microsoft Clarity for session recording and heatmaps.
 * Uses Next.js Script component with afterInteractive strategy for optimal performance.
 *
 * Best Practices:
 * - Separate client component to preserve SSR for rest of app
 * - Uses afterInteractive strategy to load after page becomes interactive
 * - Project ID stored in environment variable for security
 * - Avoids id="clarity" to prevent conflicts with Clarity's own elements
 *
 * @see https://clarity.microsoft.com/
 */
export default function MicrosoftClarity() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  // Don't render if project ID is not configured
  if (!clarityId) {
    return null;
  }

  return (
    <Script
      id="microsoft-clarity-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarityId}");
        `,
      }}
    />
  );
}
