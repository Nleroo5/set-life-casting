"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Word {
  text: string;
  delay: number;
  gradient?: boolean;
}

interface AnimatedHeadingProps {
  words: Word[];
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedHeading({ words, className, style }: AnimatedHeadingProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Force animations to only run on client after mount
    const timer = setTimeout(() => setShouldAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <h1 className={className} style={style}>
      {words.map((word, index) => (
        <motion.span
          key={`word-${index}-${word.text}`}
          initial={false}
          animate={shouldAnimate ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.3, y: -20 }}
          transition={{
            duration: 0.8,
            delay: word.delay,
            ease: [0.34, 1.56, 0.64, 1]
          }}
          className={word.gradient ? "bg-gradient-to-r from-accent-light via-purple-400 to-purple-500 bg-clip-text text-transparent [text-shadow:_0_0_30px_rgb(139_92_246_/_50%)]" : ""}
          style={{ display: "inline-block" }}
        >
          {word.text}
        </motion.span>
      ))}
    </h1>
  );
}
