import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Background Actor Resources | Atlanta Extras Guide | Set Life Casting",
  description:
    "Complete guide for background actors in Atlanta. Photo guidelines, set etiquette, payment info & tips for success as an extra in Georgia's film industry.",
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
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Become a Background Actor in Atlanta",
    "description": "Complete guide on how casting works for background actors and extras in Atlanta's film industry, including submission process, photo guidelines, and on-set expectations.",
    "image": "https://www.setlifecasting.com/images/how-to-become-background-actor-atlanta.jpg",
    "totalTime": "PT30M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "step": [
      {
        "@type": "HowToStep",
        "name": "See a Casting Call",
        "text": "Follow our Facebook for all current casting needs. When you see a role that fits, submit following the instructions on the casting call.",
        "url": "https://www.setlifecasting.com/resources#photos",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Submit Your Photos & Info",
        "text": "Give us clear, current photos and accurate details so we know you match what production needs. Use natural lighting, choose a plain neutral background, show your face clearly, include a full-body shot, make sure photos are recent (within 6 months), use high-resolution images that aren't blurry, and read the casting call carefully.",
        "url": "https://www.setlifecasting.com/resources#photos",
        "image": "https://www.setlifecasting.com/images/atlanta-extras-headshot-front-example.jpg",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Bookings Are Sent by Text",
        "text": "If selected, you'll hear directly from us with instructions, wardrobe notes, and call time details. If you receive a confirmation, you are booked for the role.",
        "url": "https://www.setlifecasting.com/resources#etiquette",
        "position": 3
      }
    ]
  };

  const imageGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": "Background Actor Photo Submission Examples",
    "description": "Real submission examples from background actors showing proper headshots and full-body photos for casting calls",
    "image": [
      {
        "@type": "ImageObject",
        "contentUrl": "https://www.setlifecasting.com/images/atlanta-extras-headshot-front-example.jpg",
        "caption": "Atlanta extras casting headshot front view example",
        "description": "Professional headshot example showing clear front view with natural lighting and plain background",
        "creator": {
          "@type": "Organization",
          "name": "Set Life Casting"
        }
      },
      {
        "@type": "ImageObject",
        "contentUrl": "https://www.setlifecasting.com/images/atlanta-extras-headshot-side-profile-example.jpg",
        "caption": "Atlanta extras casting headshot side profile example",
        "description": "Professional headshot example showing side profile view for casting submissions",
        "creator": {
          "@type": "Organization",
          "name": "Set Life Casting"
        }
      },
      {
        "@type": "ImageObject",
        "contentUrl": "https://www.setlifecasting.com/images/atlanta-background-actor-full-body-front-v2.jpeg",
        "caption": "Atlanta background actor full body front view casting photo",
        "description": "Full body photo example showing proper stance and lighting for background actor submissions",
        "creator": {
          "@type": "Organization",
          "name": "Set Life Casting"
        }
      },
      {
        "@type": "ImageObject",
        "contentUrl": "https://www.setlifecasting.com/images/atlanta-background-actor-full-body-side.jpg",
        "caption": "Atlanta background actor full body side view casting photo",
        "description": "Full body side view photo example for extras casting submissions",
        "creator": {
          "@type": "Organization",
          "name": "Set Life Casting"
        }
      },
      {
        "@type": "ImageObject",
        "contentUrl": "https://www.setlifecasting.com/images/film-casting-headshot-submission-example.jpg",
        "caption": "Film casting headshot submission example for extras",
        "description": "Professional headshot example for film and TV background casting submissions",
        "creator": {
          "@type": "Organization",
          "name": "Set Life Casting"
        }
      },
      {
        "@type": "ImageObject",
        "contentUrl": "https://www.setlifecasting.com/images/tv-extras-casting-photo-submission-guide.jpg",
        "caption": "TV extras casting photo submission guide example",
        "description": "Example photo demonstrating proper submission guidelines for TV extras casting",
        "creator": {
          "@type": "Organization",
          "name": "Set Life Casting"
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGallerySchema) }}
      />
      {children}
    </>
  );
}
