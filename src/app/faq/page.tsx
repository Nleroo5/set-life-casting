"use client";

import { Metadata } from "next";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const faqs = [
  {
    category: "For Talent",
    questions: [
      {
        q: "How do I apply to be a background actor?",
        a: "Follow our Facebook page where we post all casting calls. When you see a role that fits, follow the submission instructions in the post. Make sure to include recent photos and your contact information.",
      },
      {
        q: "Do I need acting experience?",
        a: "No prior acting experience is necessary for background work! We welcome enthusiastic individuals of all experience levels. However, professionalism and the ability to follow directions are essential.",
      },
      {
        q: "How much do background actors get paid?",
        a: "Pay rates vary depending on the production, your role, and the hours worked. We'll always communicate the pay rate upfront before you commit to a project. Rates are competitive with industry standards.",
      },
      {
        q: "What should I wear to a casting?",
        a: "This depends on the specific role. We'll provide wardrobe guidelines in each casting call. Generally, bring neutral, solid-colored clothing and any specific items requested.",
      },
      {
        q: "Can I bring a friend to set?",
        a: "No, you cannot bring guests to set. Only booked talent and essential crew are allowed on production sets for security and insurance reasons.",
      },
      {
        q: "How often will I be called for work?",
        a: "This varies based on production schedules and how well you fit current casting needs. Stay active on our Facebook page and respond promptly to casting calls to increase your opportunities.",
      },
      {
        q: "How do I stay updated on casting calls?",
        a: "Follow our Facebook page and turn on notifications to be alerted when we post new casting opportunities. You can also subscribe to our newsletter on our homepage.",
      },
      {
        q: "Can I work with you if I'm under 18?",
        a: "Yes, but minors must have parental consent and may need work permits depending on state requirements. Parents/guardians must be present on set for all minor talent.",
      },
      {
        q: "How do I know if I'm booked?",
        a: "You'll receive a confirmation message (usually by text or email) with all the details you need — call time, location, wardrobe notes, and any other instructions. If you don't receive a confirmation, you are not booked for the role.",
      },
      {
        q: "What types of photos should I submit?",
        a: "Keep it simple and natural! Your submission photos should be: Clear and well-lit, taken within the last 6 months, no filters, heavy makeup, hats, or sunglasses, one clear face photo + one full-body shot, and a plain background if possible. These help production see your real, current look, which is exactly what they need.",
      },
      {
        q: "What is a voucher?",
        a: "A voucher is your timecard for the day. You'll fill it out on set — either on paper or digitally — and it's what the payroll company uses to pay you. Make sure your name, times, and signature are correct before you leave set. If you ever have questions about payment, the payroll company listed on your voucher or the person who booked you can help.",
      },
      {
        q: "What do I do if I need to cancel?",
        a: "Life happens! If you need to cancel, contact the booking person immediately so we can replace you quickly. The more notice you give, the better — reliability helps you get booked again in the future.",
      },
      {
        q: "Do I need to bring anything special to set?",
        a: "Plan to bring: Your ID, the requested wardrobe, snacks, water, and a phone charger, and any personal comfort items (jacket, book, etc.). Extras can have long wait times, so being prepared makes the day easier.",
      },
    ],
  },
  {
    category: "For Productions",
    questions: [
      {
        q: "What types of productions do you work with?",
        a: "We work with all types of productions including feature films, TV series, commercials, music videos, and special events. Whether you're a major studio or independent production, we can help.",
      },
      {
        q: "How far in advance should I book background talent?",
        a: "We recommend booking as early as possible, ideally 1-2 weeks in advance for larger needs. However, we can often accommodate last-minute requests within 24-48 hours depending on availability.",
      },
      {
        q: "Do you provide union and non-union talent?",
        a: "We primarily work with non-union background actors. If you need union talent, please contact us to discuss your specific needs.",
      },
      {
        q: "What geographic area do you serve?",
        a: "We're based in Atlanta and serve productions throughout Georgia and the Southeast region. Our talent network extends across the area.",
      },
      {
        q: "What information do you need to cast a project?",
        a: "We need production dates, location, number of background actors needed, any specific requirements (age, ethnicity, wardrobe, special skills), pay rate, and call times.",
      },
      {
        q: "Do you handle payroll?",
        a: "Payment arrangements vary by production. We can discuss the best approach for your specific project needs when you contact us.",
      },
      {
        q: "Are your background actors reliable?",
        a: "Yes — though occasional last-minute cancellations are normal in extras casting, we keep them minimal with clear communication and confirmation steps. If someone does drop out, we act fast to replace them so your production stays on schedule.",
      },
      {
        q: "How quickly can you source talent?",
        a: "Very quickly! We regularly assist productions with same-day and next-day casting needs. For large or specialty requests, more lead time is helpful — but we're built for fast turnarounds when needed.",
      },
      {
        q: "Can you help with specialty casting?",
        a: "Yes — absolutely. We can find: Photo doubles, stand-ins, niche skills (dancers, athletes, musicians, etc.), unique looks, and specialty requests of any kind. If you need it, we'll find it.",
      },
      {
        q: "Do you offer on-set support?",
        a: "Most projects run smoothly with remote support, but if your production requires on-set management, we can provide that or coordinate with your team as needed. Just let us know the level of support you prefer.",
      },
      {
        q: "How many extras can you book at once?",
        a: "We handle everything from small, intimate scenes to large crowd days. Whether you need 5 people or 500, we scale our process to match your production's needs.",
      },
      {
        q: "Do you provide casting for minors?",
        a: "Yes — we handle casting minors as well. We are very familiar with Georgia state guidelines, parent communication, and permit requirements. We'll walk you through anything your production needs to stay compliant and safe.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/atlanta-casting-agency-questions-answers.jpg"
            alt="Atlanta casting agency frequently asked questions - Set Life Casting"
            fill
            className="object-cover object-[center_80%]"
            priority
          />
          {/* Translucent charcoal overlay */}
          <div className="absolute inset-0 bg-gray-900/85"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg animate-word" style={{ fontFamily: 'var(--font-galindo)' }}>
              Frequently Asked <span className="bg-gradient-to-r from-accent-light via-purple-400 to-purple-500 bg-clip-text text-transparent">Questions</span>
            </h1>
            <p className="text-lg md:text-lg text-white/90 leading-relaxed drop-shadow-md" style={{ fontFamily: 'var(--font-outfit)' }}>
              We've gathered the most common questions from talent and productions so you can find answers fast.
            </p>
          </div>
        </div>
      </section>

      {/* Unified Background Section */}
      <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

      {/* FAQ Sections */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqs.map((section, sectionIndex) => (
            <div key={section.category} className="mb-12">
              <h2 className="text-xl md:text-2xl font-bold text-secondary mb-6 pb-2 border-b-2 border-accent">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.questions.map((faq, qIndex) => {
                  const id = `${sectionIndex}-${qIndex}`;
                  const isOpen = openIndex === id;

                  return (
                    <div
                      key={id}
                      className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl overflow-hidden border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleAccordion(id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between transition-colors"
                      >
                        <span className="text-base md:text-base font-semibold text-accent pr-8">
                          {faq.q}
                        </span>
                        <motion.svg
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-5 h-5 text-accent flex-shrink-0"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 text-base md:text-base text-secondary">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6" style={{ fontFamily: 'var(--font-galindo)' }}>
            Still Have Questions?
          </h2>
          <p className="text-lg md:text-lg text-secondary-light mb-8" style={{ fontFamily: 'var(--font-outfit)' }}>
            We&apos;re here to help! Reach out and we&apos;ll get back to you as
            soon as possible.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors duration-200 font-semibold text-base md:text-base"
          >
            Contact Us
          </a>
        </div>
      </section>
      </div>
    </div>
  );
}
