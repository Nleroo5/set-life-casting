"use client";

import Image from "next/image";
import React from "react";

interface StarFrameImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function StarFrameImage({
  src,
  alt,
  width = 400,
  height = 533,
  className = "",
}: StarFrameImageProps) {
  return (
    <div className={`relative aspect-square ${className}`}>
      {/* Container with circular shape */}
      <div className="relative w-full h-full rounded-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>

      {/* Golden circle border overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="49"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
