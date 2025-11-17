"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const projects = [
  {
    id: 10,
    title: "Film & TV Casting",
    type: "Production",
    image: "/images/atlanta-extras-agency-film-tv-casting-10.jpg",
    alt: "Atlanta extras agency film and TV casting production"
  },
  {
    id: 1,
    title: "Film Production",
    type: "Feature Film",
    image: "/images/set-life-casting-atlanta-film-production-1.jpg",
    alt: "Set Life Casting Atlanta film production"
  },
  {
    id: 2,
    title: "Movie Poster",
    type: "Film",
    image: "/images/atlanta-extras-casting-movie-poster-2.jpg",
    alt: "Atlanta extras casting movie poster"
  },
  {
    id: 3,
    title: "TV Commercial",
    type: "Commercial",
    image: "/images/set-life-casting-tv-commercial-production-3.jpg",
    alt: "Set Life Casting TV commercial production"
  },
  {
    id: 4,
    title: "Film Set",
    type: "Film",
    image: "/images/atlanta-background-actors-film-set-4.jpg",
    alt: "Atlanta background actors on film set"
  },
  {
    id: 5,
    title: "Feature Film",
    type: "Film",
    image: "/images/set-life-casting-feature-film-project-5.jpg",
    alt: "Set Life Casting feature film project"
  },
  {
    id: 6,
    title: "Movie Production",
    type: "Film",
    image: "/images/atlanta-casting-agency-movie-production-6.jpg",
    alt: "Atlanta casting agency movie production"
  },
  {
    id: 7,
    title: "Extras Talent",
    type: "Television",
    image: "/images/set-life-casting-extras-talent-work-7.jpg",
    alt: "Set Life Casting extras talent work"
  },
  {
    id: 8,
    title: "Background Casting",
    type: "Film",
    image: "/images/atlanta-film-industry-background-casting-8.jpg",
    alt: "Atlanta film industry background casting"
  },
  {
    id: 9,
    title: "Production",
    type: "Film",
    image: "/images/set-life-casting-production-company-poster-9.jpg",
    alt: "Set Life Casting production company poster"
  },
  {
    id: 11,
    title: "Background Talent",
    type: "Film",
    image: "/images/atlanta-background-talent-poster-11.jpg",
    alt: "Atlanta background talent poster"
  },
];

export default function Portfolio() {
  // Start at projects.length (middle set) to avoid immediate jump
  const [currentIndex, setCurrentIndex] = useState(projects.length);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  // Create infinite loop by duplicating items
  const extendedProjects = [...projects, ...projects, ...projects];
  const startIndex = projects.length; // Start from middle set

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => prev - 1);
  };

  // Auto-rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000); // Rotate every 3 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  // Reset to middle set when reaching edges (infinite loop)
  useEffect(() => {
    if (currentIndex >= projects.length * 2) {
      setTimeout(() => {
        setCurrentIndex(projects.length);
      }, 300);
    } else if (currentIndex < projects.length) {
      setTimeout(() => {
        setCurrentIndex(projects.length * 2 - 1);
      }, 300);
    }
  }, [currentIndex]);

  // Get visible cards (show 3 on desktop, 1 on mobile)
  const getVisibleCards = () => {
    const cards = [];
    for (let i = -1; i <= 1; i++) {
      const index = (startIndex + currentIndex + i) % extendedProjects.length;
      cards.push({ ...extendedProjects[index], position: i });
    }
    // Debug: Log the center card on initial load
    if (currentIndex === projects.length && cards[1]) {
      console.log('🎬 Center poster on load:', cards[1].image.split('/').pop());
    }
    return cards;
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStart - clientX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-secondary via-secondary-dark to-secondary text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
            <span className="text-accent">Productions</span> We&apos;ve Worked On
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
            Proud to have provided talented extras for these amazing projects
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Carousel Track */}
          <div
            ref={containerRef}
            className="relative h-[400px] md:h-[500px] cursor-grab active:cursor-grabbing"
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={handleDragStart}
            onTouchEnd={handleDragEnd}
          >
            <div className="flex items-center justify-center h-full gap-6 px-4 sm:px-8 md:px-20">
              <AnimatePresence initial={false} custom={direction}>
                {getVisibleCards().map((project, idx) => (
                  <motion.div
                    key={`${project.id}-${currentIndex}-${idx}`}
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 300 : -300, scale: 0.8 }}
                    animate={{
                      opacity: project.position === 0 ? 1 : 0.4,
                      x: project.position * 320,
                      scale: project.position === 0 ? 1 : 0.85,
                      zIndex: project.position === 0 ? 10 : 1,
                    }}
                    exit={{ opacity: 0, x: direction > 0 ? -300 : 300, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute w-[240px] sm:w-[280px] md:w-[300px]"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-secondary-dark shadow-2xl">
                      <Image
                        src={project.image}
                        alt={project.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 240px, (max-width: 768px) 280px, 300px"
                        priority={project.position === 0}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center mt-8 gap-2">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > (currentIndex % projects.length) ? 1 : -1);
                setCurrentIndex(startIndex + index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                (currentIndex % projects.length) === index
                  ? "bg-accent w-8"
                  : "bg-secondary-light hover:bg-accent/50"
              }`}
              aria-label={`Go to project ${index + 1}`}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-white text-lg">
            ...and many more productions across film, TV, commercials, and music videos
          </p>
        </motion.div>
      </div>
    </section>
  );
}
