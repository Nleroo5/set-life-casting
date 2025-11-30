"use client";

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { useInView } from "framer-motion";
import React, { useRef } from "react";
import Button from "@/components/ui/Button";

function AnimatedStar({ index }: { index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex-shrink-0 mt-1">
      <svg
        className="w-6 h-6 text-yellow-500"
        fill="currentColor"
        viewBox="0 0 24 24"
        style={{
          opacity: isInView ? 1 : 0,
          transform: isInView ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
          transition: `all 0.5s ease-out ${index * 0.1}s`,
        }}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
      <section className="relative py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden">
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
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg" style={{ fontFamily: 'var(--font-galindo)' }}>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.1s" }}
              >
                Full-Service{" "}
              </span>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.3s" }}
              >
                Casting{" "}
              </span>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.5s" }}
              >
                for{" "}
              </span>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.7s" }}
              >
                Film,{" "}
              </span>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.9s" }}
              >
                Television{" "}
              </span>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "1.1s" }}
              >
                &{" "}
              </span>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "1.3s" }}
              >
                Commercials{" "}
              </span>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "1.5s" }}
              >
                in{" "}
              </span>
              <span
                className="animate-word bg-gradient-to-r from-accent-light via-purple-400 to-purple-500 bg-clip-text text-transparent [text-shadow:_0_0_10px_rgb(139_92_246_/_80%),_0_0_20px_rgb(139_92_246_/_60%),_0_0_40px_rgb(139_92_246_/_40%),_0_0_80px_rgb(139_92_246_/_20%)]"
                style={{ display: "inline-block", animationDelay: "1.7s" }}
              >
                Atlanta
              </span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed mb-8 drop-shadow-md" style={{ fontFamily: 'var(--font-outfit)' }}>
              <span className="inline-block bg-gradient-to-r from-white via-purple-300 to-white bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer font-semibold">
                Set Life Casting provides professional background casting services
              </span>
              {" "}
              for productions filming throughout Georgia and the Southeast. With years of hands-on experience in Atlanta&apos;s booming film industry, we understand what it takes to deliver the right talent on time, every time.
            </p>
          </div>
        </div>
      </section>

      {/* Unified Background Section */}
      <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

        {/* Production Types */}
        <section className="py-12 md:py-16 lg:py-20 xl:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                <span
                  className="animate-word"
                  style={{ display: "inline-block", animationDelay: "0.1s" }}
                >
                  Productions{" "}
                </span>
                <span
                  className="animate-word"
                  style={{ display: "inline-block", animationDelay: "0.3s" }}
                >
                  We{" "}
                </span>
                <span
                  className="animate-word bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent"
                  style={{ display: "inline-block", animationDelay: "0.5s" }}
                >
                  Work{" "}
                </span>
                <span
                  className="animate-word bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent"
                  style={{ display: "inline-block", animationDelay: "0.7s" }}
                >
                  With
                </span>
              </h2>
              <p className="text-xl text-secondary-light max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
                We provide professional background talent for all types of productions, from major studio films to independent projects.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {productionTypes.map((type) => (
                <div
                  key={type.title}
                  className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-8 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-accent mb-2">
                        {type.title}
                      </h3>
                      <p className="text-secondary leading-relaxed">
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
        <section className="py-12 md:py-16 lg:py-20 xl:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.1s" }}
              >
                How{" "}
              </span>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.3s" }}
              >
                We{" "}
              </span>
              <span
                className="animate-word bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent"
                style={{ display: "inline-block", animationDelay: "0.5s" }}
              >
                Work
              </span>
            </h2>
            <p className="text-xl text-secondary-light max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
              When you hire Set Life Casting, we take care of every step of the casting process to ensure your production runs smoothly:
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-10 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300">
            <ul className="space-y-6">
              {[
                "Finding & booking talent that matches your project's exact needs",
                "Ensuring talent receives location details, call time, wardrobe notes, & all essential information",
                "Coordinating with production teams for seamless communication",
                "Sending skins to production",
                "Maintaining professionalism, adaptability, & a stress-free experience",
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <AnimatedStar index={index} />
                  <span className="ml-4 text-lg text-secondary leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 lg:py-20 xl:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-secondary mb-6" style={{ fontFamily: 'var(--font-galindo)' }}>
            <span
              className="animate-word"
              style={{ display: "inline-block", animationDelay: "0.1s" }}
            >
              Ready{" "}
            </span>
            <span
              className="animate-word"
              style={{ display: "inline-block", animationDelay: "0.3s" }}
            >
              to{" "}
            </span>
            <span
              className="animate-word"
              style={{ display: "inline-block", animationDelay: "0.5s" }}
            >
              Get{" "}
            </span>
            <span
              className="animate-word bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent"
              style={{ display: "inline-block", animationDelay: "0.7s" }}
            >
              Started?
            </span>
          </h2>
          <p className="text-xl text-secondary-light mb-8" style={{ fontFamily: 'var(--font-outfit)' }}>
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
    </div>
  );
}
