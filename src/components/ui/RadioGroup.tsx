"use client";

import React, { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  error?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
}

const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ className, label, error, options, value, onChange, name, ...props }, ref) => {
    const id = useId();
    const groupName = name || id;

    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-base font-medium text-secondary mb-3"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {label}
          </label>
        )}
        <div className="space-y-3">
          {options.map((option, index) => {
            const optionId = `${groupName}-${option.value}`;
            return (
              <div key={option.value} className="flex items-center">
                <input
                  ref={index === 0 ? ref : undefined}
                  id={optionId}
                  type="radio"
                  name={groupName}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  className={cn(
                    "h-5 w-5 border-gray-300 text-accent",
                    "focus:ring-2 focus:ring-accent focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-all duration-200",
                    error && "border-red-500 focus:ring-red-500",
                    className
                  )}
                  {...props}
                />
                <label
                  htmlFor={optionId}
                  className="ml-3 text-base text-secondary cursor-pointer"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {option.label}
                </label>
              </div>
            );
          })}
        </div>
        {error && (
          <p
            className="mt-2 text-base text-red-500"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export default RadioGroup;
