"use client";

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Button from "@/components/ui/Button";

function AnimatedCheckmark({ index }: { index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex-shrink-0 mt-1">
      <svg
        className="w-6 h-6 text-accent"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
        style={{
          strokeDasharray: 20,
          strokeDashoffset: isInView ? 0 : 20,
          animation: isInView ? `checkmarkDraw 0.5s ease-out ${index * 0.1}s forwards` : 'none',
        }}
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

export default function ServicesPage() {
  const productionTypes = [
    {
      title: "Feature Films & Television Series",
      description: "From major studio productions to independent films and streaming series.",
    },
    {
      title: "Commercials & Brand Content",
      description: "National and regional commercials, social media content, and brand campaigns.",
    },
    {
      title: "Music Videos",
      description: "Background talent for music videos across all genres and production scales.",
    },
    {
      title: "Special Events & Live Productions",
      description: "Awards shows, sporting events, and live broadcasts.",
    },
  ];

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/set-life-casting-atlanta-production-set.jpg"
            alt="Set Life Casting Atlanta production set"
            fill
            className="object-cover"
            priority
          />
          {/* Translucent charcoal overlay */}
          <div className="absolute inset-0 bg-gray-900/85"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
              Full-Service Casting for Film, Television & Commercials in <span className="bg-gradient-to-r from-accent-light via-purple-400 to-purple-500 bg-clip-text text-transparent [text-shadow:_0_0_30px_rgb(139_92_246_/_50%)]">Atlanta</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed mb-8 drop-shadow-md">
              Set Life Casting provides professional background casting services for productions
              filming throughout Georgia and the Southeast. With years of hands-on experience
              in Atlanta&apos;s booming film industry, we understand what it takes to deliver the
              right talent on time, every time.
            </p>
          </div>
        </div>
      </section>

      {/* Production Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              Productions We Work With
            </h2>
            <p className="text-xl text-secondary-light max-w-3xl mx-auto">
              We provide professional background talent for all types of productions, from major studio films to independent projects.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {productionTypes.map((type) => (
              <div
                key={type.title}
                className="bg-gradient-to-br from-primary-light to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-accent/20"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-accent"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-secondary mb-2">
                      {type.title}
                    </h3>
                    <p className="text-secondary-light leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="py-20 bg-primary-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              How We Work
            </h2>
            <p className="text-xl text-secondary-light max-w-3xl mx-auto">
              When you hire Set Life Casting, we take care of every step of the casting process to ensure your production runs smoothly:
            </p>
          </div>

          <div className="bg-white rounded-2xl p-10 shadow-lg">
            <ul className="space-y-6">
              {[
                "Finding & booking talent that matches your project's exact needs",
                "Ensuring talent receives location details, call time, wardrobe notes, & all essential information",
                "Coordinating with production teams for seamless communication",
                "Sending skins to production",
                "Maintaining professionalism, adaptability, & a stress-free experience",
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <AnimatedCheckmark index={index} />
                  <span className="ml-4 text-lg text-secondary-light leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
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
