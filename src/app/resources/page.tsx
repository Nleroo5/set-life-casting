"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import StarFrameImage from "@/components/ui/StarFrameImage";

export default function ResourcesPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/how-to-become-background-actor-atlanta.jpg"
            alt="How to become a background actor in Atlanta - Set Life Casting resources"
            fill
            className="object-cover"
            priority
          />
          {/* Translucent charcoal overlay */}
          <div className="absolute inset-0 bg-gray-900/85"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg animate-word" style={{ fontFamily: 'var(--font-galindo)', lineHeight: '1.3' }}>
              Everything You Need to Know About <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">Being An Extra</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed drop-shadow-md" style={{ fontFamily: 'var(--font-outfit)' }}>
              <span className="inline-block bg-gradient-to-r from-white via-purple-300 to-white bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer font-semibold">
                New to being an extra? Perfect!
              </span>
              {" "}
              We&apos;ve got you covered with all the info you need to get started & succeed on set.
            </p>
          </div>
        </div>
      </section>

      {/* Unified Background Section */}
      <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

      {/* START HERE */}
      <section className="py-12 md:py-16 lg:py-20 xl:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-8 text-center [text-shadow:_0_0_20px_rgb(234_179_8_/_70%),_0_0_40px_rgb(234_179_8_/_40%)]" style={{ fontFamily: 'var(--font-galindo)' }}>
              START HERE
            </div>
            <h2 className="text-3xl font-bold text-secondary mb-4 text-center" style={{ fontFamily: 'var(--font-galindo)' }}>
              New to Extra Work? Start Here.
            </h2>
            <p className="text-xl text-secondary-light leading-relaxed text-center max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
              Background actors (also called "extras") appear in the world of a film, TV show, or commercial—walking down the street, sitting in a restaurant, working in an office, and more. It's fun, fast-paced, and an easy way to step into the film industry.
            </p>

            {/* Down Arrow */}
            <div className="flex justify-center mt-8">
              <svg
                className="w-8 h-8 text-accent animate-bounce"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* How Casting Works - Simple Breakdown */}
      <section className="py-12 md:py-16 lg:py-20 xl:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
              How Casting Works (Simple Breakdown)
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-8 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300">
              <div className="text-5xl mb-4 text-center">1️⃣</div>
              <h3 className="text-xl font-bold text-accent mb-3 text-center" style={{ fontFamily: 'var(--font-galindo)' }}>
                See a Casting Call
              </h3>
              <p className="text-secondary leading-relaxed text-center" style={{ fontFamily: 'var(--font-outfit)' }}>
                Follow our Facebook for all current casting needs. When you see a role that fits, submit following the instructions on the casting call
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-8 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300">
              <div className="text-5xl mb-4 text-center">2️⃣</div>
              <h3 className="text-xl font-bold text-accent mb-3 text-center" style={{ fontFamily: 'var(--font-galindo)' }}>
                Submit Your Photos & Info
              </h3>
              <p className="text-secondary leading-relaxed text-center" style={{ fontFamily: 'var(--font-outfit)' }}>
                Give us clear, current photos and accurate details so we know you match what production needs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-8 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300">
              <div className="text-5xl mb-4 text-center">3️⃣</div>
              <h3 className="text-xl font-bold text-accent mb-3 text-center" style={{ fontFamily: 'var(--font-galindo)' }}>
                Bookings Are Sent by Text
              </h3>
              <p className="text-secondary leading-relaxed text-center" style={{ fontFamily: 'var(--font-outfit)' }}>
                If selected, you'll hear directly from us with instructions, wardrobe notes, and call time details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Know If You're Right for a Role */}
      <section className="py-12 md:py-16 lg:py-20 xl:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-8 md:p-10 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300">
            <h2 className="text-3xl font-bold text-secondary mb-6 text-center" style={{ fontFamily: 'var(--font-galindo)' }}>
              How to Know If You're Right for a Role
            </h2>
            <p className="text-lg text-secondary leading-relaxed text-center" style={{ fontFamily: 'var(--font-outfit)' }}>
              Before submitting, make sure you meet the listed requirements — such as age, height, sizes, availability, or any specialty skills. If a post says "must fit wardrobe size ___," "must be available all day," or "must be okay with smoke," those are non-negotiable.
            </p>
            <p className="text-lg text-secondary leading-relaxed mt-4 text-center" style={{ fontFamily: 'var(--font-outfit)' }}>
              This helps us book you correctly and keeps production running smoothly.
            </p>
          </div>
        </div>
      </section>

      {/* Photo Guidelines */}
      <section id="photos" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="h-1 w-20 bg-gradient-to-r from-accent to-purple-600 rounded-full mb-6 mx-auto" />
            <h2 className="text-3xl font-bold text-secondary mb-4 text-center animate-word" style={{ fontFamily: 'var(--font-galindo)' }}>
              How to <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">Submit Like a Pro</span>
            </h2>
            <p className="text-xl text-secondary-light leading-relaxed text-center max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
              Attention to detail is key, & your submission is our first glimpse of your ability to follow instructions! Your photos are our first look at you—here&apos;s how to nail them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* DO Section */}
            <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl p-8 border-2 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:shadow-[0_0_50px_rgba(34,197,94,0.25)] transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-700" style={{ fontFamily: 'var(--font-galindo)' }}>DO</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Use natural lighting—outdoors or near a window works great!",
                  "Choose a plain, neutral background (nothing distracting)",
                  "Show your face clearly (we need to see your beautiful face!)",
                  "Include a full-body shot",
                  "Make sure photos are recent (within 6 months—we want the real you!)",
                  "Use high-resolution images that aren't blurry",
                  "Read the casting call carefully & give us exactly what we ask for",
                ].map((item, index) => (
                  <li key={item} className="flex items-start">
                    <svg
                      className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-secondary leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DON'T Section */}
            <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl p-8 border-2 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:shadow-[0_0_50px_rgba(239,68,68,0.25)] transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-700" style={{ fontFamily: 'var(--font-galindo)' }}>DON&apos;T</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "No filters",
                  "Include group photos or photos with other people",
                  "Wear sunglasses or hats that hide your face",
                  "Submit blurry or low-quality images",
                  "Use old photos that don't reflect your current look",
                  "Include excessive makeup, wigs, or heavy styling",
                  "Take photos in cluttered locations or busy backgrounds",
                  "Use extreme angles or poses—keep it natural!",
                ].map((item, index) => (
                  <li key={item} className="flex items-start">
                    <svg
                      className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-secondary leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Real Example Photos */}
          <div className="max-w-5xl mx-auto">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-secondary mb-4 text-center"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              Real Example Photos
            </motion.h3>
            <p className="text-lg text-secondary-light text-center mb-8 max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
              These are real submissions from talent—use them as a guide for the type of clear, natural photos we love to see!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  src: "/images/atlanta-extras-headshot-front-example.jpg",
                  alt: "Atlanta extras casting headshot front view example"
                },
                {
                  src: "/images/atlanta-extras-headshot-side-profile-example.jpg",
                  alt: "Atlanta extras casting headshot side profile example"
                },
                {
                  src: "/images/atlanta-background-actor-full-body-front.jpg",
                  alt: "Atlanta background actor full body front view casting photo"
                },
                {
                  src: "/images/atlanta-background-actor-full-body-side.jpg",
                  alt: "Atlanta background actor full body side view casting photo"
                },
                {
                  src: "/images/film-casting-headshot-submission-example.jpg",
                  alt: "Film casting headshot submission example for extras"
                },
                {
                  src: "/images/tv-extras-casting-photo-submission-guide.jpg",
                  alt: "TV extras casting photo submission guide example"
                },
              ].map((photo, index) => (
                <motion.div
                  key={photo.src}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{
                    y: -8,
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  className="flex items-center justify-center"
                >
                  <StarFrameImage
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full"
                  />
                </motion.div>
              ))}
            </div>

            {/* Down Arrow */}
            <div className="flex justify-center mt-12">
              <svg
                className="w-8 h-8 text-accent animate-bounce"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Your First Day on Set: What to Expect */}
      <section id="etiquette" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="h-1 w-20 bg-gradient-to-r from-accent to-purple-600 rounded-full mb-6 mx-auto" />
            <h2 className="text-3xl font-bold text-secondary mb-4 text-center" style={{ fontFamily: 'var(--font-galindo)' }}>
              Your First Day on Set: What to Expect
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Before You Arrive",
                tips: [
                  "Confirm call time & location",
                  "Bring ID (if required)",
                  "Pack your wardrobe",
                  "Bring snacks/water/phone charger",
                  "Arrive early",
                  "Get good sleep",
                ],
              },
              {
                title: "On Set",
                tips: [
                  "Follow directions from ADs",
                  "Stay quiet during filming",
                  "Phone on silent",
                  "Don't approach actors",
                  "Be patient—film days move slowly",
                  "No social media without permission",
                ],
              },
            ].map((section) => (
              <div
                key={section.title}
                className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-8 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-accent mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.tips.map((tip) => (
                    <li key={tip} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-accent mr-3 flex-shrink-0 mt-0.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-secondary text-base leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Down Arrow */}
          <div className="flex justify-center mt-12">
            <svg
              className="w-8 h-8 text-accent animate-bounce"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Getting Paid Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="h-1 w-20 bg-gradient-to-r from-accent to-purple-600 rounded-full mb-6 mx-auto" />
            <h2 className="text-3xl font-bold text-secondary mb-6 text-center" style={{ fontFamily: 'var(--font-galindo)' }}>
              Getting Paid
            </h2>
            <div className="text-lg text-secondary-light leading-relaxed text-center max-w-3xl mx-auto space-y-4" style={{ fontFamily: 'var(--font-outfit)' }}>
              <p>
                On your shoot day, you'll fill out a voucher — either on paper or digitally. This voucher is your proof of work, so be sure to keep a copy for your records.
              </p>
              <p>
                Payments are issued by the production's payroll company, not Set Life Casting. Most payments arrive within 2–4 weeks, though some may take a little longer.
              </p>
              <p>
                If it's been more than a few weeks, reach out to the payroll company using the contact info on your voucher.
              </p>
              <p>
                Still stuck? You can also contact the person who booked you, and we'll help point you in the right direction.
              </p>
            </div>

            {/* Down Arrow */}
            <div className="flex justify-center mt-8">
              <svg
                className="w-8 h-8 text-accent animate-bounce"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-1 w-20 bg-gradient-to-r from-accent to-purple-600 rounded-full mb-6 mx-auto" />
          <h2 className="text-3xl font-bold text-secondary mb-6 animate-word" style={{ fontFamily: 'var(--font-galindo)' }}>
            Still Have <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">Questions?</span>
          </h2>
          <p className="text-xl text-secondary-light leading-relaxed mb-8" style={{ fontFamily: 'var(--font-outfit)' }}>
            We get it—there&apos;s a lot to learn! If something&apos;s unclear or you need help with anything, just reach out. We&apos;re here to help you succeed, whether it&apos;s your first day on set or your hundredth.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>
      </div>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-accent to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white" style={{ fontFamily: 'var(--font-galindo)' }}>
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-white/90 leading-relaxed" style={{ fontFamily: 'var(--font-outfit)' }}>
            Follow us on Facebook to see current casting calls & start your journey in the film industry today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.facebook.com/SetLifeCastingATL/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Follow on Facebook
              </Button>
            </a>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-accent"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
