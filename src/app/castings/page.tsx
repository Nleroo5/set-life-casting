"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function CastingsPage() {
  const [activeTab, setActiveTab] = useState<"open" | "closed">("open");

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/atlanta-casting-calls-background-actors.jpg"
            alt="Atlanta casting calls for background actors and extras - Set Life Casting"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Translucent charcoal overlay */}
          <div className="absolute inset-0 bg-gray-900/85"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg" style={{ fontFamily: 'var(--font-galindo)' }}>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.1s" }}
              >
                Current{" "}
              </span>
              <span
                className="animate-word bg-gradient-to-r from-accent-light via-purple-400 to-purple-500 bg-clip-text text-transparent [text-shadow:_0_0_30px_rgb(139_92_246_/_50%)]"
                style={{ display: "inline-block", animationDelay: "0.3s" }}
              >
                Casting{" "}
              </span>
              <span
                className="animate-word bg-gradient-to-r from-accent-light via-purple-400 to-purple-500 bg-clip-text text-transparent [text-shadow:_0_0_30px_rgb(139_92_246_/_50%)]"
                style={{ display: "inline-block", animationDelay: "0.5s" }}
              >
                Calls
              </span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed drop-shadow-md" style={{ fontFamily: 'var(--font-outfit)' }}>
              <span className="inline-block bg-gradient-to-r from-white via-purple-300 to-white bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer font-semibold">
                Find your next opportunity
              </span>
              {" "}
              and apply to current projects
            </p>
          </div>
        </div>
      </section>

      {/* Unified Background Section */}
      <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

        {/* Tabs */}
        <section className="pt-12 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setActiveTab("open")}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  activeTab === "open"
                    ? "bg-gradient-to-br from-white to-purple-50/30 border-2 border-[#7c3aed] shadow-[0_0_30px_rgba(124,58,237,0.3)] text-accent"
                    : "bg-white/50 border-2 border-gray-300 text-secondary hover:border-accent"
                }`}
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Now Casting
              </button>
              <button
                onClick={() => setActiveTab("closed")}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  activeTab === "closed"
                    ? "bg-gradient-to-br from-white to-purple-50/30 border-2 border-[#7c3aed] shadow-[0_0_30px_rgba(124,58,237,0.3)] text-accent"
                    : "bg-white/50 border-2 border-gray-300 text-secondary hover:border-accent"
                }`}
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Booked / Closed
              </button>
            </div>
          </div>
        </section>

        {/* Airtable Embeds */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-8 border-2 border-[#7c3aed] shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-300">
              {activeTab === "open" ? (
                <div className="w-full" style={{ minHeight: '600px' }}>
                  <iframe
                    className="airtable-embed w-full rounded-lg"
                    src="https://airtable.com/embed/apps1Tdw1Y4FHkiv3/shrUa4WthkQMnESNR?viewControls=on"
                    frameBorder="0"
                    width="100%"
                    height="600"
                    style={{ background: 'transparent' }}
                  ></iframe>
                </div>
              ) : (
                <div className="w-full" style={{ minHeight: '600px' }}>
                  <iframe
                    className="airtable-embed w-full rounded-lg"
                    src="https://airtable.com/embed/apps1Tdw1Y4FHkiv3/shrViWqKrUJ1xm5Rc?viewControls=on"
                    frameBorder="0"
                    width="100%"
                    height="600"
                    style={{ background: 'transparent' }}
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How to Apply Section */}
        <section className="pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-10 border-2 border-[#7c3aed] shadow-[0_0_30px_rgba(124,58,237,0.15)] text-center">
              <h2 className="text-3xl font-bold text-secondary mb-6" style={{ fontFamily: 'var(--font-galindo)' }}>
                How to Apply
              </h2>
              <div className="space-y-4 text-lg text-secondary" style={{ fontFamily: 'var(--font-outfit)' }}>
                <p>
                  <strong className="text-accent">Step 1:</strong> Check the casting calls above for roles that match your profile
                </p>
                <p>
                  <strong className="text-accent">Step 2:</strong> Follow us on{" "}
                  <a
                    href="https://www.facebook.com/SetLifeCastingATL/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline font-semibold"
                  >
                    Facebook
                  </a>
                  {" "}for detailed submission instructions
                </p>
                <p>
                  <strong className="text-accent">Step 3:</strong> Submit your photos and information as directed in the Facebook post
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
