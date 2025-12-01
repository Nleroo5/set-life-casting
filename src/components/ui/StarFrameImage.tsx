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
      {/* Container with circular shape, yellow border, glow, and breathing animation */}
      <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.6)] animate-[imageBreathe_3s_ease-in-out_infinite]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
