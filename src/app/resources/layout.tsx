import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Background Actor Resources | Atlanta Extras Guide | Set Life Casting",
  description:
    "Everything you need to know about being a background actor in Atlanta. Photo submission guidelines, set etiquette, payment info, and tips for success as an extra in Georgia's film industry.",
  keywords: [
    "background actor guide atlanta",
    "how to be an extra atlanta",
    "atlanta extras resources",
    "background acting tips",
    "film extra guidelines",
    "casting photo requirements",
    "set etiquette atlanta",
    "background actor payment",
    "atlanta film industry guide",
    "extras casting tips georgia",
  ],
  openGraph: {
    title: "Background Actor Resources | Atlanta Extras Guide | Set Life Casting",
    description:
      "Complete guide for background actors in Atlanta. Learn photo requirements, set etiquette, and how to succeed as an extra.",
    url: "https://www.setlifecasting.com/resources",
    siteName: "Set Life Casting",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.setlifecasting.com/images/how-to-become-background-actor-atlanta.jpg",
        width: 1200,
        height: 630,
        alt: "How to become a background actor in Atlanta - Set Life Casting resources",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Background Actor Resources | Atlanta Extras Guide",
    description:
      "Complete guide for background actors in Atlanta. Photo requirements, set etiquette, and success tips.",
    images: ["https://www.setlifecasting.com/images/how-to-become-background-actor-atlanta.jpg"],
  },
  alternates: {
    canonical: "https://www.setlifecasting.com/resources",
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

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
