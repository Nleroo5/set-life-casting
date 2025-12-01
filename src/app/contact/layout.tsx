import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Set Life Casting | Atlanta Extras Casting Agency | Book Talent",
  description:
    "Contact Set Life Casting for background talent in Atlanta. Production: 770-502-5460. Talent: 470-693-8314. Serving Georgia and the Southeast region.",
  keywords: [
    "contact set life casting",
    "atlanta casting agency contact",
    "book background actors atlanta",
    "hire extras atlanta",
    "atlanta casting services",
    "production casting atlanta",
    "background talent booking",
    "extras agency atlanta contact",
  ],
  openGraph: {
    title: "Contact Set Life Casting | Atlanta Extras Casting Agency",
    description:
      "Get in touch with Atlanta's premier extras casting agency. Production and talent inquiries welcome.",
    url: "https://www.setlifecasting.com/contact",
    siteName: "Set Life Casting",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.setlifecasting.com/images/atlanta-background-actor-casting-services.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Set Life Casting - Atlanta background actor casting services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Set Life Casting | Atlanta Extras Casting",
    description:
      "Get in touch with Atlanta's premier extras casting agency.",
    images: ["https://www.setlifecasting.com/images/atlanta-background-actor-casting-services.jpg"],
  },
  alternates: {
    canonical: "https://www.setlifecasting.com/contact",
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

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
