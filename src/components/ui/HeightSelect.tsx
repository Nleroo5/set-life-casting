"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface HeightSelectProps {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
}

const HeightSelect = ({
  label,
  error,
  value,
  onChange,
  name,
}: HeightSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate all height options in order from 2'6" to 7'2"
  const generateHeightOptions = () => {
    const options: { value: string; label: string }[] = [];
    for (let feet = 2; feet <= 7; feet++) {
      const maxInches = feet === 7 ? 2 : 11;
      for (let inches = 0; inches <= maxInches; inches++) {
        if (feet === 2 && inches < 6) continue;
        const height = `${feet}'${inches}"`;
        options.push({
          value: height,
          label: height,
        });
      }
    }
    return options;
  };

  const options = generateHeightOptions();

  // Scroll to 5'0" when dropdown opens
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      // Find the index of 5'0"
      const targetIndex = options.findIndex((opt) => opt.value === "5'0\"");
      if (targetIndex !== -1) {
        // Scroll to that option (each option is ~44px tall)
        const scrollPosition = targetIndex * 44 - 88; // Subtract 88 to center it a bit
        dropdownRef.current.scrollTop = Math.max(0, scrollPosition);
      }
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="w-full relative">
      {label && (
        <label
          className="block text-base font-medium text-secondary mb-2"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {label}
        </label>
      )}

      {/* Hidden input for form compatibility */}
      <input type="hidden" name={name} value={value || ""} />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-left",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
          "transition-all duration-200",
          error && "border-red-500 focus:ring-red-500"
        )}
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        <span className={cn("flex-1", !value && "text-gray-400")}>
          {value || "Select Height"}
        </span>
        <svg
          className={cn(
            "w-5 h-5 text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "px-4 py-2.5 cursor-pointer hover:bg-accent/10",
                  "transition-colors duration-150",
                  isSelected && "bg-accent/5 font-semibold text-accent"
                )}
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

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
};

HeightSelect.displayName = "HeightSelect";

export default HeightSelect;
