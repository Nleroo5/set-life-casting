export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "serviceType": "Film & TV Casting",
        "provider": {
          "@type": "LocalBusiness",
          "name": "Set Life Casting LLC",
          "url": "https://www.setlifecasting.com"
        },
        "areaServed": {
          "@type": "State",
          "name": "Georgia"
        },
        "description": "Specializing in extras casting for feature films, television series, and streaming productions. We provide professional background talent that brings authenticity and energy to every scene."
      },
      {
        "@type": "Service",
        "serviceType": "Commercial & Print Casting",
        "provider": {
          "@type": "LocalBusiness",
          "name": "Set Life Casting LLC",
          "url": "https://www.setlifecasting.com"
        },
        "areaServed": {
          "@type": "State",
          "name": "Georgia"
        },
        "description": "Providing models and on-camera talent for advertising campaigns, brand endorsements, print work, and digital marketing. From lifestyle brands to major corporations, we match the right faces to your message."
      },
      {
        "@type": "Service",
        "serviceType": "Music Video Casting",
        "provider": {
          "@type": "LocalBusiness",
          "name": "Set Life Casting LLC",
          "url": "https://www.setlifecasting.com"
        },
        "areaServed": {
          "@type": "State",
          "name": "Georgia"
        },
        "description": "Supplying featured extras and performers for music videos across all genres. Whether you need dancers, crowd members, or specific character types, we deliver talent that elevates your artistic vision."
      },
      {
        "@type": "Service",
        "serviceType": "Social Media & Influencer Casting",
        "provider": {
          "@type": "LocalBusiness",
          "name": "Set Life Casting LLC",
          "url": "https://www.setlifecasting.com"
        },
        "areaServed": {
          "@type": "State",
          "name": "Georgia"
        },
        "description": "Connecting brands with UGC creators, real people, and influencers for digital marketing campaigns, social media content, and viral marketing initiatives. We understand the modern content landscape."
      },
      {
        "@type": "Service",
        "serviceType": "AI & Digital Double Casting",
        "provider": {
          "@type": "LocalBusiness",
          "name": "Set Life Casting LLC",
          "url": "https://www.setlifecasting.com"
        },
        "areaServed": {
          "@type": "State",
          "name": "Georgia"
        },
        "description": "Sourcing actors for motion capture, AI-generated content, virtual productions, and emerging media technologies. We stay ahead of industry trends to serve next-generation production needs."
      },
      {
        "@type": "Service",
        "serviceType": "Background Extras Casting",
        "provider": {
          "@type": "LocalBusiness",
          "name": "Set Life Casting LLC",
          "url": "https://www.setlifecasting.com"
        },
        "areaServed": {
          "@type": "State",
          "name": "Georgia"
        },
        "description": "Comprehensive casting solutions for all production types. Our versatile team adapts to unique casting challenges across all types of productions. No project is too big or too small."
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {children}
    </>
  );
}
