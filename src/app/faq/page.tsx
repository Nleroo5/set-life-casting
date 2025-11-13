"use client";

import { Metadata } from "next";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    ],
  },
  {
    category: "General",
    questions: [
      {
        q: "How do I stay updated on casting calls?",
        a: "Follow our Facebook page and turn on notifications to be alerted when we post new casting opportunities. You can also subscribe to our newsletter on our homepage.",
      },
      {
        q: "What makes Set Life Casting different?",
        a: "We take a hands-on approach to every casting. We don't just fill roles—we carefully curate talent to match your production's unique needs. We also brief all talent on professionalism and set etiquette.",
      },
      {
        q: "Are your background actors reliable?",
        a: "Yes! We only work with professional, vetted talent. We maintain high standards and only recommend background actors who have proven to be reliable, punctual, and professional.",
      },
      {
        q: "Can I work with you if I'm under 18?",
        a: "Yes, but minors must have parental consent and may need work permits depending on state requirements. Parents/guardians must be present on set for all minor talent.",
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
      <section className="bg-gradient-to-br from-primary-light to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-secondary mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-secondary-light leading-relaxed">
              Find answers to common questions about working with Set Life
              Casting
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqs.map((section, sectionIndex) => (
            <div key={section.category} className="mb-12">
              <h2 className="text-2xl font-bold text-secondary mb-6 pb-2 border-b-2 border-accent">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.questions.map((faq, qIndex) => {
                  const id = `${sectionIndex}-${qIndex}`;
                  const isOpen = openIndex === id;

                  return (
                    <div
                      key={id}
                      className="bg-primary-light rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleAccordion(id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-primary transition-colors"
                      >
                        <span className="font-semibold text-secondary pr-8">
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
                            <div className="px-6 pb-4 text-secondary-light">
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
      <section className="py-20 bg-primary-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-secondary mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-secondary-light mb-8">
            We&apos;re here to help! Reach out and we&apos;ll get back to you as
            soon as possible.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors duration-200 font-semibold text-lg"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
