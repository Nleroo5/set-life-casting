"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-accent text-white hover:bg-accent-dark active:bg-accent-dark disabled:bg-gray-300",
      secondary:
        "bg-secondary text-white hover:bg-secondary-dark active:bg-secondary-dark disabled:bg-gray-300",
      outline:
        "border-2 border-accent text-accent hover:bg-accent hover:text-white disabled:border-gray-300 disabled:text-gray-300",
      ghost:
        "text-accent hover:bg-accent/10 active:bg-accent/20 disabled:text-gray-300",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm md:text-base",
      md: "px-5 py-2.5 md:px-6 md:py-3 text-base md:text-lg",
      lg: "px-6 py-3 md:px-8 md:py-4 text-lg md:text-xl",
    };

    const MotionButton = motion.button;

    return (
      <MotionButton
        ref={ref}
        type={type}
        className={cn(
          "rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
          variants[variant],
          sizes[size],
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...(props as any)}
      >
        {children}
      </MotionButton>
    );
  }
);

Button.displayName = "Button";

export default Button;
