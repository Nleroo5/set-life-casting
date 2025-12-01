"use client";

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function ServicesPage() {
  const productionTypes = [
    {
      title: "Film & Television",
      description: "Background casting for feature films, TV series, streaming content, and pilots.",
    },
    {
      title: "Commercial & Brand Work",
      description: "Casting for commercials, digital campaigns, social media content, and print advertising.",
    },
    {
      title: "Music Videos",
      description: "Talent for music videos across all genres and production scales.",
    },
    {
      title: "Live & Special Events",
      description: "Crowd, audience, and specialty talent for award shows, game shows, events, and live broadcasts.",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-12 md:pb-16 lg:pb-20 xl:pb-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/set-life-casting-atlanta-production-set.jpg"
            alt="Set Life Casting Atlanta production set"
            fill
            className="object-cover object-[center_30%]"
            priority
          />
          {/* Translucent charcoal overlay */}
          <div className="absolute inset-0 bg-gray-900/85"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight px-2 drop-shadow-lg animate-word" style={{ fontFamily: 'var(--font-galindo)' }}>
              <span className="bg-gradient-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent glow-text">Trusted</span> Background Casting for Productions in Georgia & the Southeast
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 drop-shadow-md" style={{ fontFamily: 'var(--font-outfit)' }}>
              Set Life Casting is known for fast turnaround, clear communication, and dependable talent for every production.
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
              <h2 className="text-2xl md:text-3xl font-bold mb-4 heading-shimmer" style={{ fontFamily: 'var(--font-galindo)' }}>
                Who We Work With
              </h2>
              <p className="text-lg md:text-lg text-secondary-light max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
                We partner with productions of all sizes from small independent teams to major network shows
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {productionTypes.map((type) => (
                <div
                  key={type.title}
                  className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-8 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300 text-center"
                >
                  <h3 className="text-lg md:text-xl font-bold text-accent mb-2">
                    {type.title}
                  </h3>
                  <p className="text-base md:text-base text-secondary leading-relaxed">
                    {type.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="py-12 md:py-16 lg:py-20 xl:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 heading-shimmer" style={{ fontFamily: 'var(--font-galindo)' }}>
                What We Do
              </h2>
              <p className="text-lg md:text-lg text-secondary-light max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
                Set Life Casting handles every step of the background casting process so your production runs smoothly from start to finish.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-8 md:p-10 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300">
              <ul className="space-y-6">
                <li className="flex items-start checkmark-item-1">
                  <div className="flex-shrink-0 mt-1">
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
                  <div className="ml-4">
                    <h3 className="text-base md:text-lg font-bold text-accent mb-1">Breakdowns & Talent Search</h3>
                    <p className="text-base md:text-base text-secondary leading-relaxed">
                      We write and release detailed casting calls, filter submissions, and identify the right talent for your exact needs.
                    </p>
                  </div>
                </li>
                <li className="flex items-start checkmark-item-2">
                  <div className="flex-shrink-0 mt-1">
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
                  <div className="ml-4">
                    <h3 className="text-base md:text-lg font-bold text-accent mb-1">Curating the Best Options</h3>
                    <p className="text-base md:text-base text-secondary leading-relaxed">
                      We review every submission, match talent to specs, and present reliable, production-ready candidates.
                    </p>
                  </div>
                </li>
                <li className="flex items-start checkmark-item-3">
                  <div className="flex-shrink-0 mt-1">
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
                  <div className="ml-4">
                    <h3 className="text-base md:text-lg font-bold text-accent mb-1">Direct Talent Communication</h3>
                    <p className="text-base md:text-base text-secondary leading-relaxed">
                      We contact talent with location details, call times, wardrobe notes, and all essential information, no gaps, no confusion.
                    </p>
                  </div>
                </li>
                <li className="flex items-start checkmark-item-4">
                  <div className="flex-shrink-0 mt-1">
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
                  <div className="ml-4">
                    <h3 className="text-base md:text-lg font-bold text-accent mb-1">On-Set Readiness</h3>
                    <p className="text-base md:text-base text-secondary leading-relaxed">
                      We confirm talent the night before, ensuring EVERY person knows where to be, when to be there, and what to bring.
                    </p>
                  </div>
                </li>
                <li className="flex items-start checkmark-item-5">
                  <div className="flex-shrink-0 mt-1">
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
                  <div className="ml-4">
                    <h3 className="text-base md:text-lg font-bold text-accent mb-1">Seamless Production Coordination</h3>
                    <p className="text-base md:text-base text-secondary leading-relaxed">
                      We work directly with production teams for quick adjustments, specialty needs, and schedule changes.
                    </p>
                  </div>
                </li>
                <li className="flex items-start checkmark-item-6">
                  <div className="flex-shrink-0 mt-1">
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
                  <div className="ml-4">
                    <h3 className="text-base md:text-lg font-bold text-accent mb-1">Organized Skins Delivery</h3>
                    <p className="text-base md:text-base text-secondary leading-relaxed">
                      We send complete, accurate skins to production, formatted, verified, and ready for set.
                    </p>
                  </div>
                </li>
                <li className="flex items-start checkmark-item-7">
                  <div className="flex-shrink-0 mt-1">
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
                  <div className="ml-4">
                    <h3 className="text-base md:text-lg font-bold text-accent mb-1">Professionalism From Start to Finish</h3>
                    <p className="text-base md:text-base text-secondary leading-relaxed">
                      Clear communication, reliability, adaptability, and a stress-free experience for your entire team.
                    </p>
                  </div>
                </li>
              </ul>
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
            <ul className="space-y-6">
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
                      className="w-8 h-8 text-purple-600 animate-[starBreathe_3s_ease-in-out_infinite]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      style={{ filter: 'drop-shadow(0 0 1px rgba(234, 179, 8, 0.8))' }}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#eab308" strokeWidth="0.5" />
                    </svg>
                  </div>
                  <span className="ml-4 text-lg md:text-xl text-secondary leading-relaxed">
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
