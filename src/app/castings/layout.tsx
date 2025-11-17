import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atlanta Casting Calls | Background Actor Jobs | Set Life Casting",
  description:
    "Find current casting calls for background actors and extras in Atlanta, Georgia. Apply now for film, TV, and commercial roles. Professional extras casting opportunities updated daily.",
  keywords: [
    "atlanta casting calls",
    "background actor jobs atlanta",
    "extras casting opportunities",
    "atlanta film jobs",
    "georgia casting calls",
    "atlanta extras work",
    "background actor atlanta ga",
    "casting calls near me atlanta",
    "paid extra work atlanta",
    "atlanta tv extras",
  ],
  openGraph: {
    title: "Current Casting Calls - Atlanta Background Actors | Set Life Casting",
    description:
      "Apply for current background actor roles in Atlanta. Film, TV, and commercial opportunities updated daily.",
    url: "https://www.setlifecasting.com/castings",
    siteName: "Set Life Casting",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.setlifecasting.com/images/atlanta-casting-calls-background-actors.jpg",
        width: 1200,
        height: 630,
        alt: "Atlanta casting calls for background actors and extras",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Current Casting Calls - Atlanta Background Actors",
    description:
      "Apply for current background actor roles in Atlanta. Updated daily.",
    images: ["https://www.setlifecasting.com/images/atlanta-casting-calls-background-actors.jpg"],
  },
  alternates: {
    canonical: "https://www.setlifecasting.com/castings",
  },
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
};

export default function CastingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
