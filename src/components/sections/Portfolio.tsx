"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const projects = [
  { id: 1, title: "Ozark", type: "TV Series" },
  { id: 2, title: "Feature Film", type: "Film" },
  { id: 3, title: "Commercial", type: "Commercial" },
  { id: 4, title: "TV Series", type: "Television" },
  { id: 5, title: "Music Video", type: "Music Video" },
  { id: 6, title: "Independent Film", type: "Film" },
];

export default function Portfolio() {
  const [currentIndex, setCurrentIndex] = useState(0);
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
          <h2 className="text-4xl font-bold mb-4">
            Productions We&apos;ve Worked On
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Proud to have provided talented extras for these amazing projects
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-accent hover:bg-accent-dark text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 -ml-6"
            aria-label="Previous project"
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
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

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
            <div className="flex items-center justify-center h-full gap-6 px-20">
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
                    className="absolute w-[280px] md:w-[300px]"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-secondary-dark shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent-dark/40" />
                      <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                        <div>
                          <span className="text-xs font-semibold text-accent uppercase mb-2 block">
                            {project.type}
                          </span>
                          <h3 className="text-xl font-bold">{project.title}</h3>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-accent hover:bg-accent-dark text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 -mr-6"
            aria-label="Next project"
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
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
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
