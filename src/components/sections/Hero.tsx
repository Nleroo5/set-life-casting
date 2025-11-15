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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/videos/atlanta-casting-video.mp4" type="video/mp4" />
        </video>
        {/* Translucent charcoal overlay */}
        <div className="absolute inset-0 bg-gray-900/80" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Your Next Role
            <br />
            <span className="bg-gradient-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">Starts Here</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed">
            <span className="inline-block bg-gradient-to-r from-accent via-purple-400 to-accent bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer font-semibold">
              Atlanta&apos;s Premier Extras Casting Agency
            </span>
            {" "}
            <span className="text-white/90">
              for film, television, commercials & music videos across Georgia and the Southeast.
            </span>
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="#castings">
              <Button variant="primary" size="lg">
                View Current Castings
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
              <div className="text-4xl font-bold text-white mb-2">
                <AnimatedCounter target={100} duration={4} suffix="+" />
              </div>
              <div className="text-sm text-white/80 font-medium">
                Productions Served
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-white mb-2">
                <AnimatedCounter target={100000} duration={6} suffix="+" />
              </div>
              <div className="text-sm text-white/80 font-medium">
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
