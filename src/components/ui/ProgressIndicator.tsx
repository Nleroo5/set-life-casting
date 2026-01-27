"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressStep {
  number: number;
  title: string;
}

export interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
}

const ProgressIndicator = ({ steps, currentStep }: ProgressIndicatorProps) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.number}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-base md:text-lg font-bold",
                    "border-2 transition-all duration-300",
                    isCompleted &&
                      "bg-accent border-accent text-white",
                    isCurrent &&
                      "bg-white border-accent text-accent ring-4 ring-accent/20",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-white border-gray-300 text-gray-400"
                  )}
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <p
                  className={cn(
                    "mt-2 text-xs md:text-sm font-medium text-center max-w-[80px]",
                    isCurrent ? "text-accent" : "text-gray-500"
                  )}
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {step.title}
                </p>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 md:mx-4">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      isCompleted ? "bg-accent" : "bg-gray-300"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

ProgressIndicator.displayName = "ProgressIndicator";

export default ProgressIndicator;
