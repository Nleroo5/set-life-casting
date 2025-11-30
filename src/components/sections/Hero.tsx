"use client";

import React, { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Button from "@/components/ui/Button";
import Link from "next/link";

function AnimatedCounter({
  target,
  duration,
  suffix = ""
}: {
  target: number;
  duration: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      setCount(Math.floor(progress * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-[600px] md:min-h-[800px] lg:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/atlanta-casting-video.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/70 via-secondary/60 to-secondary/70" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight px-2 animate-word" style={{ fontFamily: 'var(--font-galindo)' }}>
            Casting Made <span className="bg-gradient-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">Simple</span> — For Talent & Productions
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl max-w-3xl mx-auto mb-12 leading-relaxed px-4 text-white/90" style={{ fontFamily: 'var(--font-outfit)' }}>
            Seamless extras casting for film, television, commercials, and music videos across Georgia and the Southeast
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/contact">
              <Button variant="primary" size="lg">
                Contact Us
              </Button>
            </Link>
            <Link href="/resources">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-secondary"
              >
                Talent Resources
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-white mb-2">
                <AnimatedCounter target={150} duration={4} suffix="+" />
              </div>
              <div className="text-base md:text-lg lg:text-lg xl:text-xl text-white/80 font-medium">
                Productions Served
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-white mb-2">
                <AnimatedCounter target={100000} duration={6} suffix="+" />
              </div>
              <div className="text-base md:text-lg lg:text-lg xl:text-xl text-white/80 font-medium">
                Talent Cast
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-white/70"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
