"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  error?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

const MultiSelect = ({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = "Select options...",
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
    // Close dropdown after selection
    setIsOpen(false);
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

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
        <span className={cn("flex-1", value.length === 0 && "text-gray-400")}>
          {value.length === 0
            ? placeholder
            : selectedLabels.join(", ")}
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
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={cn(
                  "flex items-center px-4 py-3 cursor-pointer hover:bg-accent/10",
                  "transition-colors duration-150",
                  isSelected && "bg-accent/5"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded border-2 mr-3 flex items-center justify-center",
                    isSelected
                      ? "bg-accent border-accent"
                      : "border-gray-300"
                  )}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className="text-base text-secondary"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {option.label}
                </span>
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

MultiSelect.displayName = "MultiSelect";

export default MultiSelect;
