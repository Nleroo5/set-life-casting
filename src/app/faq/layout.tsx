import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Set Life Casting | Background Actor & Production Questions",
  description:
    "Answers to background acting questions about casting calls, payment, set etiquette & production services. Atlanta casting agency support for talent & filmmakers.",
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
    title: "FAQ - Set Life Casting | Background Actor & Production Questions",
    description:
      "Find answers to common questions about background acting work, casting calls, payment, and production services. Expert Atlanta casting agency support for talent and filmmakers.",
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
    title: "FAQ - Set Life Casting | Background Actor & Production Questions",
    description:
      "Find answers to common questions about background acting work, casting calls, payment, and production services. Expert Atlanta casting agency support.",
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
                "name": "How do I know if I'm booked?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You'll receive a confirmation message (usually by text or email) with all the details you need — call time, location, wardrobe notes, and any other instructions. If you don't receive a confirmation, you are not booked for the role."
                }
              },
              {
                "@type": "Question",
                "name": "What types of photos should I submit?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Keep it simple and natural! Your submission photos should be: Clear and well-lit, taken within the last 6 months, no filters, heavy makeup, hats, or sunglasses, one clear face photo + one full-body shot, and a plain background if possible. These help production see your real, current look, which is exactly what they need."
                }
              },
              {
                "@type": "Question",
                "name": "What is a voucher?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A voucher is your timecard for the day. You'll fill it out on set — either on paper or digitally — and it's what the payroll company uses to pay you. Make sure your name, times, and signature are correct before you leave set. If you ever have questions about payment, the payroll company listed on your voucher or the person who booked you can help."
                }
              },
              {
                "@type": "Question",
                "name": "What do I do if I need to cancel?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Life happens! If you need to cancel, contact the booking person immediately so we can replace you quickly. The more notice you give, the better — reliability helps you get booked again in the future."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need to bring anything special to set?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Plan to bring: Your ID, the requested wardrobe, snacks, water, and a phone charger, and any personal comfort items (jacket, book, etc.). Extras can have long wait times, so being prepared makes the day easier."
                }
              },
              {
                "@type": "Question",
                "name": "Can I work with you if I'm under 18?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, but minors must have parental consent and may need work permits depending on state requirements. Parents/guardians must be present on set for all minor talent."
                }
              },
              {
                "@type": "Question",
                "name": "Are your background actors reliable?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes — though occasional last-minute cancellations are normal in extras casting, we keep them minimal with clear communication and confirmation steps. If someone does drop out, we act fast to replace them so your production stays on schedule."
                }
              },
              {
                "@type": "Question",
                "name": "How quickly can you source talent?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Very quickly! We regularly assist productions with same-day and next-day casting needs. For large or specialty requests, more lead time is helpful — but we're built for fast turnarounds when needed."
                }
              },
              {
                "@type": "Question",
                "name": "Can you help with specialty casting?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes — absolutely. We can find: Photo doubles, stand-ins, niche skills (dancers, athletes, musicians, etc.), unique looks, and specialty requests of any kind. If you need it, we'll find it."
                }
              },
              {
                "@type": "Question",
                "name": "Do you offer on-set support?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most projects run smoothly with remote support, but if your production requires on-set management, we can provide that or coordinate with your team as needed. Just let us know the level of support you prefer."
                }
              },
              {
                "@type": "Question",
                "name": "How many extras can you book at once?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We handle everything from small, intimate scenes to large crowd days. Whether you need 5 people or 500, we scale our process to match your production's needs."
                }
              },
              {
                "@type": "Question",
                "name": "Do you provide casting for minors?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes — we handle casting minors as well. We are very familiar with Georgia state guidelines, parent communication, and permit requirements. We'll walk you through anything your production needs to stay compliant and safe."
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
