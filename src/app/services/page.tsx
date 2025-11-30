"use client";

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function ServicesPage() {
  const productionTypes = [
    {
      icon: "🎬",
      title: "Film & Television",
      description: "Background casting for feature films, TV series, streaming content, and pilots.",
    },
    {
      icon: "📣",
      title: "Commercial & Brand Work",
      description: "Casting for commercials, digital campaigns, social media content, and print advertising.",
    },
    {
      icon: "🎵",
      title: "Music Videos",
      description: "Talent for music videos across all genres and production scales.",
    },
    {
      icon: "🎤",
      title: "Live & Special Events",
      description: "Crowd, audience, and specialty talent for award shows, game shows, events, and live broadcasts.",
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
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg" style={{ fontFamily: 'var(--font-galindo)' }}>
              Trusted Background Casting for Productions in Georgia & the Southeast
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 drop-shadow-md" style={{ fontFamily: 'var(--font-outfit)' }}>
              With years of hands-on experience across film, television, commercials, and streaming, Set Life Casting is known for fast turnaround, clear communication, and dependable talent for every production.
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
              <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                Who We Work With
              </h2>
              <p className="text-lg md:text-lg text-secondary-light max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
                We partner with productions of all sizes — from small independent teams to major network shows
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
                      <div className="text-4xl">
                        {type.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-accent mb-2">
                        {type.title}
                      </h3>
                      <p className="text-base md:text-base text-secondary leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Do Section - Creative Roadmap Design */}
        <section className="py-12 md:py-16 lg:py-20 xl:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
              What We Do
            </h2>
            <p className="text-lg md:text-lg text-secondary-light max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
              Set Life Casting handles every step of the background casting process so your production runs smoothly from start to finish.
            </p>
          </div>

          {/* Process Steps - Roadmap Layout */}
          <div className="relative">
            {/* Curved Path SVG - Desktop */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none" style={{ top: '50px' }}>
              <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
                <path
                  d="M 100 100 Q 300 50, 400 150 T 700 100 Q 900 50, 1100 150"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeDasharray="10,5"
                  opacity="0.3"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Process Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 relative z-10">
              {[
                {
                  number: "01",
                  title: "Breakdowns & Talent Search",
                  icon: "🔍",
                },
                {
                  number: "02",
                  title: "Curating the Best Options",
                  icon: "⭐",
                },
                {
                  number: "03",
                  title: "Direct Talent Communication",
                  icon: "💬",
                },
                {
                  number: "04",
                  title: "On-Set Readiness",
                  icon: "🎬",
                },
                {
                  number: "05",
                  title: "Seamless Production Coordination",
                  icon: "🤝",
                },
                {
                  number: "06",
                  title: "Organized Skins Delivery",
                  icon: "📋",
                },
                {
                  number: "07",
                  title: "Professionalism From Start to Finish",
                  icon: "✨",
                },
              ].map((step, index) => (
                <div
                  key={step.number}
                  className="relative bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent/30 shadow-lg hover:shadow-2xl hover:border-accent transition-all duration-300 group"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {/* Number Badge */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-base md:text-lg font-bold text-accent text-center leading-tight">
                    {step.title}
                  </h3>

                  {/* Checkmark */}
                  <div className="mt-4 flex justify-center">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Productions Choose Set Life Casting Section */}
      <section className="py-12 md:py-16 lg:py-20 xl:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
              Why Productions Choose{" "}
              <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
                Set Life Casting
              </span>
            </h2>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-8 md:p-10 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300">
            <ul className="space-y-5">
              {[
                "Fast turnaround",
                "Clear communication",
                "Large, reliable talent pool",
                "10+ years experience in Atlanta's film industry",
                "Efficient systems to reduce production workload",
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <span className="ml-4 text-base md:text-base text-secondary leading-relaxed">
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
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6 animate-word" style={{ fontFamily: 'var(--font-galindo)' }}>
            Ready to Get <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">Started?</span>
          </h2>
          <p className="text-lg md:text-lg text-secondary-light mb-8" style={{ fontFamily: 'var(--font-outfit)' }}>
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
