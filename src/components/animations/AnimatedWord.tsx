"use client";

import { motion } from "framer-motion";

interface AnimatedWordProps {
  children: React.ReactNode;
  delay: number;
  className?: string;
}

export default function AnimatedWord({ children, delay, className = "" }: AnimatedWordProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.3, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.34, 1.56, 0.64, 1]
      }}
      className={className}
      style={{ display: "inline-block" }}
    >
      {children}
    </motion.span>
  );
}
