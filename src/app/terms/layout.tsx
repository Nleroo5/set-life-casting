import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Set Life Casting | Atlanta Extras Casting Agency",
  description:
    "Terms of service for Set Life Casting. Review the guidelines for working with our Atlanta extras casting agency for productions and background talent. Updated January 2025.",
  alternates: {
    canonical: "https://www.setlifecasting.com/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
