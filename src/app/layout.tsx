import type { Metadata, Viewport } from "next";
import { Fredoka, Outfit } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const galindo = localFont({
  src: "../../font/Galindo-Regular.ttf",
  variable: "--font-galindo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Set Life Casting | Atlanta Extras Casting Company | Background Actors Georgia",
  description:
    "Atlanta's premier extras casting company specializing in background talent for film, TV, commercials, and music videos across Georgia and the Southeast. 10+ years experience, 100,000+ talent cast.",
  keywords: [
    "extras casting atlanta",
    "casting companies atlanta",
    "background casting atlanta",
    "atlanta casting companies extras",
    "film extras atlanta",
    "tv background actors",
    "georgia casting agency",
    "atlanta talent agency",
    "background actors atlanta ga",
    "extras agency atlanta",
  ],
  authors: [{ name: "Drive Lead Media", url: "https://www.driveleadmedia.com" }],
  creator: "Drive Lead Media",
  publisher: "Set Life Casting LLC",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Set Life Casting | Atlanta Extras Casting Company",
    description:
      "Atlanta's premier extras casting company specializing in background talent for film, TV, commercials, and music videos.",
    url: "https://www.setlifecasting.com",
    siteName: "Set Life Casting",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Set Life Casting | Atlanta Extras Casting Company",
    description:
      "Atlanta's premier extras casting company specializing in background talent.",
    creator: "@driveleadmedia",
  },
  alternates: {
    canonical: "https://www.setlifecasting.com",
  },
  other: {
    "designer": "Drive Lead Media",
    "developer": "Drive Lead Media",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Link to humans.txt */}
        <link rel="author" type="text/plain" href="/humans.txt" />

        {/* Structured Data for Drive Lead Media Attribution */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Set Life Casting",
              "url": "https://www.setlifecasting.com",
              "description": "Atlanta's premier extras casting company for film, TV, commercials, and music videos",
              "creator": {
                "@type": "Organization",
                "name": "Drive Lead Media",
                "url": "https://www.driveleadmedia.com",
                "description": "Digital Marketing & Web Design Agency"
              },
              "provider": {
                "@type": "Organization",
                "name": "Drive Lead Media",
                "url": "https://www.driveleadmedia.com"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://www.setlifecasting.com/#organization",
              "name": "Set Life Casting",
              "legalName": "Set Life Casting LLC",
              "url": "https://www.setlifecasting.com",
              "logo": "https://firebasestorage.googleapis.com/v0/b/drive-lead-media-crm.firebasestorage.app/o/websiteQuotes%2Fquote_1760395151657_f05s8xyu2%2Flogo%2FScreen%20Shot%202024-01-27%20at%203.54.57%20PM-fotor-2024012904710.jpg?alt=media&token=be6f763a-80f6-47d1-ad5e-b2fd483b339d",
              "image": "https://www.setlifecasting.com/images/set-life-casting-atlanta-production-set.jpg",
              "description": "Atlanta's premier extras casting company specializing in background talent for film, TV, commercials, and music videos across Georgia and the Southeast. 10+ years experience with 100,000+ talent cast.",
              "telephone": "+1-770-502-5460",
              "email": "ChazlynYu@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Atlanta",
                "addressRegion": "GA",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "33.7490",
                "longitude": "-84.3880"
              },
              "areaServed": [
                {
                  "@type": "State",
                  "name": "Georgia"
                },
                {
                  "@type": "City",
                  "name": "Atlanta"
                },
                {
                  "@type": "Place",
                  "name": "Southeast United States"
                }
              ],
              "priceRange": "$$",
              "sameAs": [
                "https://www.facebook.com/SetLifeCastingATL/",
                "https://www.instagram.com/setlifecastingatl/"
              ],
              "founder": {
                "@type": "Organization",
                "name": "Drive Lead Media",
                "url": "https://www.driveleadmedia.com"
              },
              "foundingDate": "2015",
              "slogan": "Your Next Opportunity Starts Here",
              "knowsAbout": [
                "Extras Casting",
                "Background Actor Casting",
                "Film Production",
                "Television Production",
                "Commercial Production",
                "Music Video Production"
              ],
              "memberOf": {
                "@type": "Organization",
                "name": "Atlanta Film Industry"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoObject",
              "name": "Set Life Casting Atlanta - Extras Casting Agency",
              "description": "Atlanta's premier extras casting company for film, TV, commercials, and music videos. Professional background talent across Georgia and the Southeast.",
              "thumbnailUrl": "https://www.setlifecasting.com/images/set-life-casting-atlanta-production-set.jpg",
              "uploadDate": "2025-01-01",
              "contentUrl": "https://www.setlifecasting.com/videos/atlanta-casting-video.mp4",
              "embedUrl": "https://www.setlifecasting.com/",
              "publisher": {
                "@type": "Organization",
                "name": "Set Life Casting",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://firebasestorage.googleapis.com/v0/b/drive-lead-media-crm.firebasestorage.app/o/websiteQuotes%2Fquote_1760395151657_f05s8xyu2%2Flogo%2FScreen%20Shot%202024-01-27%20at%203.54.57%20PM-fotor-2024012904710.jpg?alt=media&token=be6f763a-80f6-47d1-ad5e-b2fd483b339d"
                }
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://www.setlifecasting.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Website Credits",
                  "item": "https://www.setlifecasting.com/credits",
                  "description": "Website designed by Drive Lead Media"
                }
              ]
            })
          }}
        />
      </head>
      <body
        className={`${fredoka.variable} ${outfit.variable} ${galindo.variable} antialiased`}
      >
        {/* Website designed and developed by Drive Lead Media - https://www.driveleadmedia.com */}
        {/* Digital Marketing | Web Design | SEO Services | Atlanta, GA */}
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
