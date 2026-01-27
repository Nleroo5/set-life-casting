"use client";

import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "danger" | "warning" | "info";
}

const Badge = ({ className, variant = "default", children, ...props }: BadgeProps) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 border-gray-300",
    success: "bg-green-100 text-green-800 border-green-300",
    danger: "bg-red-100 text-red-800 border-red-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
        "transition-all duration-200",
        variants[variant],
        className
      )}
      style={{ fontFamily: "var(--font-outfit)" }}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.displayName = "Badge";

export default Badge;
