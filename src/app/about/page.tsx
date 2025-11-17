import { Metadata } from "next";
import { motion } from "framer-motion";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Set Life Casting | Atlanta's Premier Extras Casting Agency Since 2015",
  description:
    "Learn about Set Life Casting, Atlanta's premier extras casting company with 10+ years experience connecting background talent with film, TV, and commercial productions across Georgia and the Southeast.",
  keywords: [
    "about set life casting",
    "atlanta casting agency",
    "extras casting company atlanta",
    "background talent agency",
    "atlanta film industry",
    "georgia casting services",
    "professional extras agency",
  ],
  openGraph: {
    title: "About Set Life Casting | Atlanta Extras Casting Agency",
    description:
      "10+ years connecting background talent with film, TV, and commercial productions across Georgia and the Southeast.",
    url: "https://www.setlifecasting.com/about",
    siteName: "Set Life Casting",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Set Life Casting | Atlanta Extras Casting",
    description:
      "10+ years connecting background talent with productions across Georgia and the Southeast.",
  },
  alternates: {
    canonical: "https://www.setlifecasting.com/about",
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

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-secondary mb-6">
              About Set Life Casting
            </h1>
            <p className="text-xl text-secondary-light leading-relaxed">
              We&apos;re more than just a casting company—we&apos;re your partner
              in bringing productions to life with exceptional background talent.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-secondary mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-secondary-light">
                <p>
                  Set Life Casting was founded with a simple mission: to connect
                  talented background actors with exciting opportunities in the
                  entertainment industry while providing productions with
                  reliable, professional extras.
                </p>
                <p>
                  Based in Atlanta, we&apos;ve spent the past 3-5 years building
                  strong relationships with both talent and production companies
                  throughout Georgia and the Southeast.
                </p>
                <p>
                  What sets us apart is our hands-on approach. We don&apos;t just
                  fill roles—we carefully curate our talent selections to match
                  each production&apos;s unique needs, ensuring the best possible
                  outcome for everyone involved.
                </p>
              </div>
            </div>
            <div className="relative h-96 bg-gradient-to-br from-accent/20 to-accent-dark/20 rounded-2xl">
              {/* Placeholder for team photo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-secondary font-semibold">
                    Team Photo Coming Soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 bg-gradient-to-br from-secondary to-secondary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Comprehensive casting solutions for all your production needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Film & TV Casting",
                description:
                  "Specializing in extras casting for feature films, television series, and streaming productions. We provide professional background talent that brings authenticity and energy to every scene.",
              },
              {
                icon: (
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                ),
                title: "Commercial & Print Casting",
                description:
                  "Providing models and on-camera talent for advertising campaigns, brand endorsements, print work, and digital marketing. From lifestyle brands to major corporations, we match the right faces to your message.",
              },
              {
                icon: (
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                ),
                title: "Music Video Casting",
                description:
                  "Supplying featured extras and performers for music videos across all genres. Whether you need dancers, crowd members, or specific character types, we deliver talent that elevates your artistic vision.",
              },
              {
                icon: (
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Social Media & Influencer Casting",
                description:
                  "Connecting brands with UGC creators, real people, and influencers for digital marketing campaigns, social media content, and viral marketing initiatives. We understand the modern content landscape.",
              },
              {
                icon: (
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: "AI & Digital Double Casting",
                description:
                  "Sourcing actors for motion capture, AI-generated content, virtual productions, and emerging media technologies. We stay ahead of industry trends to serve next-generation production needs.",
              },
              {
                icon: (
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "& More!",
                description:
                  "Tell us what you need and we will get the job done! Our versatile team adapts to unique casting challenges across all types of productions. No project is too big or too small.",
              },
            ].map((service, index) => (
              <div
                key={service.title}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center text-accent mb-6">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-white/90 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-primary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              Our Values
            </h2>
            <p className="text-xl text-secondary-light">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🤝",
                title: "Reliability",
                description:
                  "We pride ourselves on being dependable for both talent and productions. When you work with us, you can count on professionalism and punctuality.",
              },
              {
                icon: "💪",
                title: "Quality",
                description:
                  "Every background actor we provide is vetted and briefed. We maintain high standards to ensure smooth productions and positive experiences.",
              },
              {
                icon: "❤️",
                title: "Passion",
                description:
                  "We love what we do! Our enthusiasm for the entertainment industry drives us to go above and beyond for our talent and clients.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-2xl p-8 text-center shadow-sm"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-secondary mb-3">
                  {value.title}
                </h3>
                <p className="text-secondary-light">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-secondary mb-6">
              Serving the Southeast
            </h2>
            <p className="text-lg text-secondary-light mb-8">
              While based in Atlanta, we proudly serve productions throughout
              Georgia and the Southeast region. Our extensive talent network
              allows us to provide quality background actors wherever your
              production takes you.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-accent font-semibold">
              <span className="px-4 py-2 bg-accent/10 rounded-full">
                Atlanta
              </span>
              <span className="px-4 py-2 bg-accent/10 rounded-full">
                Georgia
              </span>
              <span className="px-4 py-2 bg-accent/10 rounded-full">
                Southeast Region
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
