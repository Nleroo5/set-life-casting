import { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Services | Set Life Casting",
  description:
    "Professional extras casting services for film, TV, commercials, and music videos in Atlanta and throughout the Southeast.",
};

export default function ServicesPage() {
  const services = [
    {
      title: "Film & Television Casting",
      description:
        "From major studio productions to independent films and streaming series, we provide reliable background talent for projects of all sizes.",
      features: [
        "Feature films",
        "Television series",
        "Streaming content",
        "Independent productions",
        "Period pieces",
        "Contemporary settings",
      ],
      icon: "🎬",
    },
    {
      title: "Commercial Casting",
      description:
        "Fast-turnaround casting for commercial productions with diverse talent options to match your brand and message.",
      features: [
        "National commercials",
        "Regional spots",
        "Social media content",
        "Brand campaigns",
        "Product launches",
        "Quick turnaround",
      ],
      icon: "📺",
    },
    {
      title: "Music Video Production",
      description:
        "Energetic and enthusiastic background performers for music videos across all genres and styles.",
      features: [
        "All music genres",
        "Crowd scenes",
        "Dance backgrounds",
        "Atmosphere extras",
        "Party scenes",
        "Performance crowds",
      ],
      icon: "🎵",
    },
    {
      title: "Special Event Casting",
      description:
        "Background talent for special events, promotional shoots, and unique production needs.",
      features: [
        "Corporate events",
        "Promotional shoots",
        "Live events",
        "Trade shows",
        "Product demonstrations",
        "Special projects",
      ],
      icon: "⭐",
    },
  ];

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-light to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-secondary mb-6">
              Our Services
            </h1>
            <p className="text-xl text-secondary-light leading-relaxed">
              Comprehensive background casting solutions for every type of
              production
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-gradient-to-br from-primary-light to-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-5xl mb-4">{service.icon}</div>
                <h2 className="text-2xl font-bold text-secondary mb-4">
                  {service.title}
                </h2>
                <p className="text-secondary-light mb-6">
                  {service.description}
                </p>
                <div className="space-y-2">
                  <h3 className="font-semibold text-secondary text-sm uppercase tracking-wide">
                    What We Provide:
                  </h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center text-sm text-secondary-light"
                      >
                        <svg
                          className="w-4 h-4 text-accent mr-2 flex-shrink-0"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-primary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              How We Work
            </h2>
            <p className="text-xl text-secondary-light">
              Our streamlined process ensures quality results
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Submit Requirements",
                description:
                  "Share your production details, dates, and talent needs with us.",
              },
              {
                step: "2",
                title: "Talent Selection",
                description:
                  "We carefully curate and present qualified background actors.",
              },
              {
                step: "3",
                title: "Confirmation",
                description:
                  "Review and approve talent. We handle all coordination and communication.",
              },
              {
                step: "4",
                title: "Production Day",
                description:
                  "Professional, prepared talent arrives on time and ready to work.",
              },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">
                  {step.title}
                </h3>
                <p className="text-secondary-light">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-secondary mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-secondary-light mb-8">
            Contact us today to discuss your casting needs
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
