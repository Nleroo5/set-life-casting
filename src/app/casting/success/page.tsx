"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-100 via-pink-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-8 md:p-12 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1
            className="text-3xl md:text-4xl font-bold text-secondary mb-4"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Submission{" "}
            <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Successful!
            </span>
          </h1>

          <p
            className="text-lg text-secondary-light mb-8"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Thank you for submitting your profile! We&apos;ve received your
            information and will review it shortly.
          </p>

          {/* What's Next Section */}
          <div className="bg-accent/5 border-2 border-accent/20 rounded-xl p-6 mb-8 text-left">
            <h2
              className="text-xl font-bold text-secondary mb-4"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              What&apos;s Next?
            </h2>
            <ul
              className="space-y-3 text-secondary-light"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-accent flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>
                  Our casting team will review your submission within 24-48
                  hours
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-accent flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>
                  If you&apos;re selected, we&apos;ll contact you via email or
                  phone with details
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-accent flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>
                  Follow our Facebook page to stay updated on new casting calls
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-accent flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>
                  Check your dashboard to view your submission status
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button variant="primary" className="w-full sm:w-auto">
                View Dashboard
              </Button>
            </Link>
            <Link href="/casting">
              <Button variant="outline" className="w-full sm:w-auto">
                Browse More Roles
              </Button>
            </Link>
          </div>

          {/* Social Media Reminder */}
          <div className="mt-8 pt-6 border-t border-accent/20">
            <p
              className="text-sm text-secondary-light mb-3"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Stay connected for the latest casting opportunities:
            </p>
            <a
              href="https://www.facebook.com/setlifecasting"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-dark transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Follow Set Life Casting on Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
