"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const brands = [
  { name: "Miller's Ale House", logo: "/images/brands/millers-ale-house.webp" },
  { name: "Gorilla Glue", logo: "/images/brands/gorilla-glue.webp" },
  { name: "Ole Mexican Foods", logo: "/images/brands/ole-mexican-foods.webp" },
  { name: "Good Foods", logo: "/images/brands/good-foods.webp" },
  { name: "College Colors Day", logo: "/images/brands/college-colors-day.webp" },
  { name: "Antique Partner", logo: "/images/brands/antique-partner.webp" },
  { name: "Drive Lead Media", logo: "/images/brands/drive-lead-media.webp" },
];

export default function Brands() {
  // Duplicated so the track can loop seamlessly from 0 to -50%
  const track = [...brands, ...brands];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="display-md font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
            <span className="text-accent">Brands</span> We&apos;ve Worked With
          </h2>
          <p className="text-lg sm:text-xl text-secondary-light max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
            Trusted by production companies and brands across film, TV, and commercials
          </p>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex items-center gap-12 sm:gap-16 md:gap-20 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        >
          {track.map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="relative h-16 w-32 sm:h-20 sm:w-40 md:h-24 md:w-48 shrink-0 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              <Image
                src={brand.logo}
                alt={`${brand.name} logo`}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 192px"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
