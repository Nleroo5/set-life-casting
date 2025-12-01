import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Set Life Casting | Atlanta Extras Casting Agency",
  description:
    "Privacy policy for Set Life Casting. Learn how we protect your personal information when you work with our Atlanta extras casting agency. Last updated January 2025.",
  alternates: {
    canonical: "https://www.setlifecasting.com/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
