"use client";

import React, { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    const id = useId();
    const checkboxId = props.id || id;

    return (
      <div className="w-full">
        <div className="flex items-start">
          <div className="flex items-center h-6">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className={cn(
                "h-5 w-5 rounded border-gray-300 text-accent",
                "focus:ring-2 focus:ring-accent focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "transition-all duration-200",
                error && "border-red-500 focus:ring-red-500",
                className
              )}
              {...props}
            />
          </div>
          {label && (
            <label
              htmlFor={checkboxId}
              className="ml-3 text-base text-secondary"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p
            className="mt-1 text-base text-red-500"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
