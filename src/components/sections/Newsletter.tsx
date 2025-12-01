"use client";

import { motion } from "framer-motion";
import Script from "next/script";

export default function Newsletter() {
  return (
    <>
      {/* MailerLite Universal Script */}
      <Script
        id="mailerlite-universal"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[])
            .push(arguments);},l=d.createElement(e),l.async=1,l.src=u,
            n=d.getElementsByTagName(e)[0],n.parentNode.insertBefore(l,n);})
            (window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
            ml('account', '1420435');
          `,
        }}
      />

      <section className="py-12 md:py-16 lg:py-20 xl:py-24 bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 text-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 px-2 heading-shimmer" style={{ fontFamily: 'var(--font-galindo)' }}>
              Stay Connected With <span className="text-accent">Set Life Casting</span>
            </h2>
            <p className="text-lg sm:text-xl text-secondary-light mb-8 max-w-2xl mx-auto px-2" style={{ fontFamily: 'var(--font-outfit)' }}>
              Join our mailing list for exclusive updates, important announcements, and helpful resources you won't find anywhere else.
            </p>

            {/* MailerLite Embedded Form */}
            <div className="max-w-2xl mx-auto">
              <div className="ml-embedded" data-form="T0rQSC"></div>
            </div>

            <p className="text-base text-secondary/70 mt-6">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
