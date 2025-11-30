"use client";

import React from "react";

const mainServices = [
  {
    number: "01",
    icon: (
      <svg
        className="w-12 h-12"
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
    title: "Film & TV Productions",
    description:
      "Background actors, photo doubles, stand-ins, and specialty day players for film, television, and streaming. Fast, reliable casting with clear communication and consistent results — no matter the size of the production.",
  },
  {
    number: "02",
    icon: (
      <svg
        className="w-12 h-12"
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
    title: "Commercial & Brand Casting",
    description:
      "Models, influencers, and real-people casting for commercials, social media, digital advertising, and print campaigns. Perfect faces, fast turnarounds, and seamless coordination for your brand's message.",
  },
  {
    number: "03",
    icon: (
      <svg
        className="w-12 h-12"
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
    title: "Specialized Casting",
    description:
      "Unique, hard-to-find, or highly specific talent requests — from unusual skills to hyper-specific looks. If your production needs something rare, niche, or out-of-the-box, we'll find the perfect match.",
  },
];


export default function Features() {
  return (
    <section className="pt-12 pb-24 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-14 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
            What We Offer
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-secondary-light max-w-2xl mx-auto px-4" style={{ fontFamily: 'var(--font-outfit)' }}>
            Professional casting services for film, TV, and commercial productions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
          {mainServices.map((service, index) => (
            <div
              key={service.title}
              className="relative bg-gradient-to-br from-white to-purple-50/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-[#7c3aed] shadow-[0_0_30px_rgba(124,58,237,0.15)] hover:shadow-[0_0_50px_rgba(124,58,237,0.3)] transition-all duration-300 h-full text-center"
            >
              {/* Content */}
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-accent mb-3 sm:mb-4 transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-secondary leading-relaxed text-base sm:text-lg md:text-xl lg:text-2xl">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
