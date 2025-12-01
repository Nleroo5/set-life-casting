import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atlanta Casting Services | Film, TV & Commercial Extras | Set Life Casting",
  description:
    "Professional background casting for film, TV, commercials & music videos in Atlanta. 10+ years experience serving productions across Georgia and the Southeast.",
  keywords: [
    "atlanta casting services",
    "film casting atlanta",
    "tv casting services",
    "commercial casting atlanta",
    "music video extras",
    "background talent services",
    "production casting atlanta",
    "extras casting agency",
    "atlanta casting company services",
  ],
  openGraph: {
    title: "Casting Services | Film, TV & Commercial Extras in Atlanta",
    description:
      "Full-service background casting for all production types. Film, TV, commercials, and music videos across Georgia.",
    url: "https://www.setlifecasting.com/services",
    siteName: "Set Life Casting",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.setlifecasting.com/images/set-life-casting-atlanta-production-set.jpg",
        width: 1200,
        height: 630,
        alt: "Set Life Casting professional casting services on Atlanta production set",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlanta Casting Services | Film, TV & Commercial Extras",
    description:
      "Full-service background casting for all production types in Atlanta and Georgia.",
    images: ["https://www.setlifecasting.com/images/set-life-casting-atlanta-production-set.jpg"],
  },
  alternates: {
    canonical: "https://www.setlifecasting.com/services",
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

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Background Actor Casting Services",
            "provider": {
              "@id": "https://www.setlifecasting.com/#organization"
            },
            "areaServed": {
              "@type": "State",
              "name": "Georgia"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Casting Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Film & TV Extras Casting",
                    "description": "Professional background talent for feature films, television series, and streaming productions"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Commercial Casting",
                    "description": "Background actors and on-camera talent for commercials and brand campaigns"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Music Video Casting",
                    "description": "Featured extras and performers for music videos across all genres"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Print & Digital Casting",
                    "description": "Models and talent for print work, digital marketing, and social media content"
                  }
                }
              ]
            }
          })
        }}
      />
      {children}
    </>
  );
}
