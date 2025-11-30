"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-12 md:py-16 lg:py-20 xl:py-24 bg-primary-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-12 text-center"
        >
          <h2 className="text-4xl font-bold text-secondary mb-4">
            Ready to Be an Extra?
          </h2>
          <p className="text-xl text-secondary-light mb-8 max-w-2xl mx-auto">
            Join our talent network and start your journey in the entertainment
            industry. We&apos;re always looking for enthusiastic, reliable
            background actors!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/resources">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl mb-2">📧</div>
              <h3 className="font-semibold text-secondary mb-1">
                Email Us
              </h3>
              <a
                href="mailto:contact@setlifecasting.com"
                className="text-accent hover:text-accent-dark text-sm"
              >
                contact@setlifecasting.com
              </a>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold text-secondary mb-1">
                Call Us
              </h3>
              <a
                href="tel:+1234567890"
                className="text-accent hover:text-accent-dark text-sm"
              >
                (123) 456-7890
              </a>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold text-secondary mb-1">
                Follow Us
              </h3>
              <a
                href="https://www.facebook.com/SetLifeCastingATL/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-dark text-sm"
              >
                @SetLifeCastingATL
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
