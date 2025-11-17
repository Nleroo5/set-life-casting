"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function WhyChooseUs() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="pt-20 pb-12 relative">
      {/* Golden Radial Glow - Behind everything */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className="w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0.2) 30%, rgba(217, 119, 6, 0.1) 50%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'goldenPulse 4s ease-in-out infinite'
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative cursor-pointer"
        >
          {/* Movie Clapper Board Container */}
          <div className="relative bg-white shadow-2xl overflow-hidden rounded-lg">

            {/* TOP CLAPPER STICK with diagonal stripes */}
            <div className="relative bg-black h-20">
              {/* Diagonal black and white stripes */}
              <div className="absolute inset-0 flex">
                {[...Array(14)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 ${i % 2 === 0 ? 'bg-black' : 'bg-white'}`}
                    style={{
                      transform: 'skewX(-15deg)',
                      transformOrigin: 'top'
                    }}
                  />
                ))}
              </div>

              {/* Bottom edge shadow for depth */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-b from-black/50 to-transparent" />
            </div>

            {/* HINGE BAR */}
            <div className="h-3 bg-gradient-to-b from-gray-800 via-gray-700 to-gray-900 relative shadow-inner">
              {/* Highlight on top edge */}
              <div className="absolute top-0 left-0 right-0 h-px bg-white/30" />
              {/* Shadow on bottom edge */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-black/60" />

              {/* Hinge screws/bolts */}
              <div className="absolute left-12 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-sm border border-gray-500" />
              <div className="absolute right-12 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-sm border border-gray-500" />
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-sm border border-gray-500" />
            </div>

            {/* COLOR BARS - Traditional clapper board identification */}
            <div className="h-12 flex relative">
              <div className="flex-1 bg-gradient-to-b from-yellow-400 to-yellow-500" />
              <div className="flex-1 bg-gradient-to-b from-purple-500 to-purple-600" />
              <div className="flex-1 bg-gradient-to-b from-red-500 to-red-600" />
              <div className="flex-1 bg-gradient-to-b from-blue-500 to-blue-600" />
              <div className="flex-1 bg-gradient-to-b from-green-500 to-green-600" />
            </div>

            {/* MAIN BOARD - Header */}
            <div className="px-8 py-6 relative">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center" style={{ fontFamily: 'var(--font-fredoka)' }}>
                Why Productions Choose Set Life Casting
              </h2>
            </div>

            {/* MAIN BOARD - Content */}
            <motion.div
              className="px-8 md:px-12 py-10 space-y-6 bg-white relative"
              animate={{
                y: isHovered ? -4 : 0
              }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-lg leading-[1.9] text-gray-700 font-normal" style={{ fontFamily: 'var(--font-outfit)' }}>
                With over a decade of experience in Atlanta&apos;s film and television industry,
                Set Life Casting has become the go-to extras casting company for productions
                across Georgia and the Southeast. From independent films to major studio projects,
                we&apos;ve built our reputation on being easy to work with, highly efficient, and
                completely hands-on throughout the casting process.
              </p>

              <p className="text-lg leading-[1.9] text-gray-700 font-normal" style={{ fontFamily: 'var(--font-outfit)' }}>
                We specialize in connecting productions with the right background actors and
                talent, whether you need featured extras, UGC talent, or specialized roles.
                Our team brings industry knowledge and attention to detail that ensures every
                project gets exactly what it needs, no matter how unique the requirements.
              </p>

              <p className="text-lg leading-[1.9] text-gray-700 font-normal" style={{ fontFamily: 'var(--font-outfit)' }}>
                For productions and talent alike, we make the casting process seamless from
                start to finish.
              </p>
            </motion.div>

            {/* Bottom edge details */}
            <div className="h-2 bg-gradient-to-b from-gray-300 to-gray-400" />

            {/* Side depth shadows */}
            <div className="absolute -left-1 top-24 bottom-2 w-1 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
            <div className="absolute -right-1 top-24 bottom-2 w-1 bg-gradient-to-l from-black/30 to-transparent pointer-events-none" />
          </div>

          {/* Outer shadow for depth */}
          <motion.div
            className="absolute inset-0 -z-10 rounded-lg"
            animate={{
              boxShadow: isHovered
                ? "0 30px 60px -15px rgba(0, 0, 0, 0.4), 0 15px 30px -10px rgba(95, 101, 196, 0.2)"
                : "0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(95, 101, 196, 0.15)"
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </div>
    </section>
  );
}
