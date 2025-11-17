"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function ResourcesPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
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
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg" style={{ fontFamily: 'var(--font-galindo)', lineHeight: '1.3' }}>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.1s" }}
              >
                Everything{" "}
              </span>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.3s" }}
              >
                You{" "}
              </span>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.5s" }}
              >
                Need{" "}
              </span>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.7s" }}
              >
                to{" "}
              </span>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.9s" }}
              >
                Know{" "}
              </span>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "1.1s" }}
              >
                About{" "}
              </span>
              <span
                className="animate-word bg-gradient-to-r from-accent-light via-purple-400 to-purple-500 bg-clip-text text-transparent [text-shadow:_0_0_30px_rgb(139_92_246_/_50%)]"
                style={{ display: "inline-block", animationDelay: "1.3s" }}
              >
                Working{" "}
              </span>
              <span
                className="animate-word bg-gradient-to-r from-accent-light via-purple-400 to-purple-500 bg-clip-text text-transparent [text-shadow:_0_0_30px_rgb(139_92_246_/_50%)]"
                style={{ display: "inline-block", animationDelay: "1.5s" }}
              >
                with{" "}
              </span>
              <span
                className="animate-word bg-gradient-to-r from-accent-light via-purple-400 to-purple-500 bg-clip-text text-transparent [text-shadow:_0_0_30px_rgb(139_92_246_/_50%)]"
                style={{ display: "inline-block", animationDelay: "1.7s" }}
              >
                Us
              </span>
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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="h-1 w-20 bg-gradient-to-r from-accent to-purple-600 rounded-full mb-6 mx-auto" />
            <h2 className="text-3xl font-bold text-secondary mb-4 text-center" style={{ fontFamily: 'var(--font-galindo)' }}>
              <span className="text-accent">START HERE:</span> New to Background Work?
            </h2>
            <p className="text-xl text-secondary-light leading-relaxed text-center max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
              Never been an extra before? No worries! Here&apos;s the deal: background actors (also called extras) are the people you see in the background of films, TV shows, and commercials. You know, the ones sitting in the restaurant, walking down the street, or filling the courtroom. It&apos;s a fun way to be part of the magic of filmmaking, & you get paid for it!
            </p>
            <p className="text-xl text-secondary-light leading-relaxed mt-4 text-center max-w-3xl mx-auto">
              Follow us on Facebook to see casting calls, submit your photos when you find a role that fits, and show up ready to work. It&apos;s that simple.
            </p>
          </div>
        </div>
      </section>

      {/* Photo Guidelines */}
      <section id="photos" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="h-1 w-20 bg-gradient-to-r from-accent to-purple-600 rounded-full mb-6 mx-auto" />
            <h2 className="text-3xl font-bold text-secondary mb-4 text-center" style={{ fontFamily: 'var(--font-galindo)' }}>
              How to Submit <span className="text-accent">Like a Pro</span>
            </h2>
            <p className="text-xl text-secondary-light leading-relaxed text-center max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
              Attention to detail is key, & your submission is our first glimpse of your ability to follow instructions! Your photos are our first look at you—here&apos;s how to nail them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-secondary mb-6">DO:</h3>
              <ul className="space-y-4">
                {[
                  "Use natural lighting—outdoors or near a window works great!",
                  "Choose a plain, neutral background (nothing distracting)",
                  "Show your face clearly with a friendly expression (we need to see your beautiful face!)",
                  "Include a full-body shot in neutral clothing",
                  "Make sure photos are recent (within 6 months—we want the real you!)",
                  "Use high-resolution images that aren't blurry",
                  "Show your natural look with minimal makeup",
                  "Read the casting call carefully & give us exactly what we ask for",
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <svg
                      className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-secondary-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-secondary mb-6">
                DON&apos;T:
              </h3>
              <ul className="space-y-4">
                {[
                  "Use heavily filtered or edited photos (no Instagram filters!)",
                  "Include group photos or photos with other people",
                  "Wear sunglasses or hats that hide your face",
                  "Submit blurry or low-quality images",
                  "Use old photos that don't reflect your current look",
                  "Include excessive makeup, wigs, or heavy styling",
                  "Take photos in cluttered locations or busy backgrounds",
                  "Use extreme angles or poses—keep it natural!",
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <svg
                      className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-secondary-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Example Submission Photos */}
          <div className="max-w-5xl mx-auto">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-secondary mb-6 text-center"
            >
              Example Submission Photos
            </motion.h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="aspect-[3/4] rounded-xl border-2 border-accent/20 overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={400}
                    height={533}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Set Etiquette */}
      <section id="etiquette" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="h-1 w-20 bg-gradient-to-r from-accent to-purple-600 rounded-full mb-6 mx-auto" />
            <h2 className="text-3xl font-bold text-secondary mb-4 text-center" style={{ fontFamily: 'var(--font-galindo)' }}>
              On Set: <span className="text-accent">How to Be a Pro</span>
            </h2>
            <p className="text-xl text-secondary-light leading-relaxed text-center max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
              Professional behavior on set ensures you&apos;ll be called back for future projects. Follow these tips & you&apos;ll do great!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Your First Day",
                tips: [
                  "Confirm your call time & location the night before",
                  "Show up on time (or better yet, a few minutes early!)",
                  "Bring valid ID & work documentation (required!)",
                  "Pack the requested wardrobe (read the details carefully)",
                  "Bring snacks, water & a phone charger",
                  "Get a good night's sleep—you'll need your energy!",
                ],
              },
              {
                title: "On Set",
                tips: [
                  "Follow all directions from ADs & crew—they're running the show",
                  "Stay quiet during filming (nothing kills a take faster than background noise)",
                  "Keep your phone on silent at all times",
                  "Be patient during long setups—filmmaking takes time",
                  "Don't approach principal actors (they're working, not socializing)",
                  "Don't post on social media without permission (seriously, don't)",
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
        </div>
      </section>

      {/* Getting Paid Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="h-1 w-20 bg-gradient-to-r from-accent to-purple-600 rounded-full mb-6 mx-auto" />
            <h2 className="text-3xl font-bold text-secondary mb-4 text-center" style={{ fontFamily: 'var(--font-galindo)' }}>
              <span className="text-accent">Getting Paid</span>
            </h2>
            <p className="text-xl text-secondary-light leading-relaxed text-center max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
              Your hard work earns you a voucher at the end of your shoot day. Hang onto that voucher—it's your proof of work! Payment typically processes within 2-4 weeks. If it's been over 4 weeks, no worries! Just reach out to the payroll company using the contact info on your voucher. Your booking contact is your go-to person for any payment questions.
            </p>
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-1 w-20 bg-gradient-to-r from-accent to-purple-600 rounded-full mb-6 mx-auto" />
          <h2 className="text-3xl font-bold text-secondary mb-6" style={{ fontFamily: 'var(--font-galindo)' }}>
            Still Have <span className="text-accent">Questions?</span>
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
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-galindo)' }}>
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
