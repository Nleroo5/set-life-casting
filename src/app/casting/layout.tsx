import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casting Calls - Set Life Casting",
  description:
    "Browse current casting opportunities and submit for background actor roles in Atlanta. Film, TV, commercial, and music video casting calls available.",
  keywords: [
    "casting calls atlanta",
    "background actor opportunities",
    "extras casting submit",
    "atlanta film jobs",
    "tv casting atlanta",
  ],
  openGraph: {
    title: "Casting Calls - Set Life Casting",
    description:
      "Browse current casting opportunities and submit for background actor roles in Atlanta.",
    url: "https://www.setlifecasting.com/casting",
    siteName: "Set Life Casting",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://www.setlifecasting.com/casting",
  },
};

export default function CastingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
