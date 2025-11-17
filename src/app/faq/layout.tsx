import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Background Actor Questions Answered | Set Life Casting Atlanta",
  description:
    "Frequently asked questions about working as a background actor in Atlanta. Get answers about applying, pay rates, set etiquette, and casting requirements from Set Life Casting's expert team.",
  keywords: [
    "background actor faq",
    "extras casting questions",
    "atlanta casting faq",
    "how to be an extra",
    "background actor pay atlanta",
    "casting requirements atlanta",
    "film extra questions",
    "set life casting faq",
  ],
  openGraph: {
    title: "FAQ | Background Actor Questions Answered | Set Life Casting",
    description:
      "Get answers to common questions about background acting in Atlanta. Application process, pay, requirements, and more.",
    url: "https://www.setlifecasting.com/faq",
    siteName: "Set Life Casting",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.setlifecasting.com/images/atlanta-casting-agency-questions-answers.jpg",
        width: 1200,
        height: 630,
        alt: "Atlanta casting agency frequently asked questions - Set Life Casting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Background Actor FAQ | Set Life Casting Atlanta",
    description:
      "Common questions about background acting in Atlanta answered by experts.",
    images: ["https://www.setlifecasting.com/images/atlanta-casting-agency-questions-answers.jpg"],
  },
  alternates: {
    canonical: "https://www.setlifecasting.com/faq",
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

export default function FAQLayout({
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
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I apply to be a background actor?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Follow our Facebook page where we post all casting calls. When you see a role that fits, follow the submission instructions in the post. Make sure to include recent photos and your contact information."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need acting experience?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No prior acting experience is necessary for background work! We welcome enthusiastic individuals of all experience levels. However, professionalism and the ability to follow directions are essential."
                }
              },
              {
                "@type": "Question",
                "name": "How much do background actors get paid?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Pay rates vary depending on the production, your role, and the hours worked. We'll always communicate the pay rate upfront before you commit to a project. Rates are competitive with industry standards."
                }
              },
              {
                "@type": "Question",
                "name": "What should I wear to a casting?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "This depends on the specific role. We'll provide wardrobe guidelines in each casting call. Generally, bring neutral, solid-colored clothing and any specific items requested."
                }
              },
              {
                "@type": "Question",
                "name": "Can I bring a friend to set?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, you cannot bring guests to set. Only booked talent and essential crew are allowed on production sets for security and insurance reasons."
                }
              },
              {
                "@type": "Question",
                "name": "How often will I be called for work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "This varies based on production schedules and how well you fit current casting needs. Stay active on our Facebook page and respond promptly to casting calls to increase your opportunities."
                }
              },
              {
                "@type": "Question",
                "name": "What types of productions do you work with?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We work with all types of productions including feature films, TV series, commercials, music videos, and special events. Whether you're a major studio or independent production, we can help."
                }
              },
              {
                "@type": "Question",
                "name": "How far in advance should I book background talent?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We recommend booking as early as possible, ideally 1-2 weeks in advance for larger needs. However, we can often accommodate last-minute requests within 24-48 hours depending on availability."
                }
              },
              {
                "@type": "Question",
                "name": "Do you provide union and non-union talent?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We primarily work with non-union background actors. If you need union talent, please contact us to discuss your specific needs."
                }
              },
              {
                "@type": "Question",
                "name": "What geographic area do you serve?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We're based in Atlanta and serve productions throughout Georgia and the Southeast region. Our talent network extends across the area."
                }
              },
              {
                "@type": "Question",
                "name": "What information do you need to cast a project?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We need production dates, location, number of background actors needed, any specific requirements (age, ethnicity, wardrobe, special skills), pay rate, and call times."
                }
              },
              {
                "@type": "Question",
                "name": "Do you handle payroll?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Payment arrangements vary by production. We can discuss the best approach for your specific project needs when you contact us."
                }
              },
              {
                "@type": "Question",
                "name": "How do I stay updated on casting calls?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Follow our Facebook page and turn on notifications to be alerted when we post new casting opportunities. You can also subscribe to our newsletter on our homepage."
                }
              },
              {
                "@type": "Question",
                "name": "What makes Set Life Casting different from other Atlanta casting agencies?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We've been casting background actors in Atlanta for over a decade, working on everything from independent films to blockbuster productions. What sets us apart is our hands-on approach—we're known for being easy to work with, highly responsive, and committed to finding the perfect fit for every role, no matter how specific or unique."
                }
              },
              {
                "@type": "Question",
                "name": "Are your background actors reliable?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! We only work with professional, vetted talent. We maintain high standards and only recommend background actors who have proven to be reliable, punctual, and professional."
                }
              },
              {
                "@type": "Question",
                "name": "Can I work with you if I'm under 18?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, but minors must have parental consent and may need work permits depending on state requirements. Parents/guardians must be present on set for all minor talent."
                }
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
}
