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

            {/* MailerLite Embedded Form with Custom Styling */}
            <div className="max-w-2xl mx-auto newsletter-form-wrapper">
              <div className="ml-embedded" data-form="T0rQSC"></div>
            </div>

            {/* Custom CSS to match your original design exactly */}
            <style jsx global>{`
              /* Hide MailerLite branding and unnecessary elements */
              .ml-embedded .ml-form-embedWrapper,
              .ml-embedded .ml-form-embedHeader,
              .ml-embedded .ml-form-embedFooter,
              .ml-embedded h4,
              .ml-embedded p:not(.ml-error),
              .ml-embedded div[style*="text-align"] {
                display: none !important;
              }

              /* Container styling - remove all MailerLite defaults */
              .newsletter-form-wrapper .ml-embedded,
              .newsletter-form-wrapper .ml-embedded * {
                background: transparent !important;
                box-shadow: none !important;
              }

              .newsletter-form-wrapper .ml-form-embedContent,
              .newsletter-form-wrapper .ml-form-embedBody,
              .newsletter-form-wrapper .ml-form-formContent {
                padding: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
              }

              /* CRITICAL: Flatten DOM hierarchy with display: contents */
              .newsletter-form-wrapper .ml-embedded > div,
              .newsletter-form-wrapper .ml-form-embedContent,
              .newsletter-form-wrapper .ml-form-embedBody,
              .newsletter-form-wrapper .ml-form-embedBody > div,
              .newsletter-form-wrapper .ml-form-formContent,
              .newsletter-form-wrapper .ml-form-formContent > div:not([class*="Submit"]):not([class*="button"]),
              .newsletter-form-wrapper .ml-form-fieldRow {
                display: contents !important;
              }

              /* Apply grid directly to the form element */
              .newsletter-form-wrapper form {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 1rem !important;
                padding: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
                box-sizing: border-box !important;
              }

              /* Mobile: 1 column */
              @media (max-width: 640px) {
                .newsletter-form-wrapper form {
                  grid-template-columns: 1fr !important;
                }
              }

              /* Individual field containers - ensure they take grid cell */
              .newsletter-form-wrapper .ml-field-group {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                min-width: 0 !important;
                display: block !important;
                box-sizing: border-box !important;
              }

              /* Input fields - matching your original design */
              .newsletter-form-wrapper input[type="text"],
              .newsletter-form-wrapper input[type="email"],
              .newsletter-form-wrapper input[type="tel"] {
                width: 100% !important;
                min-width: 0 !important;
                padding: 0.75rem 1rem !important;
                border: 1px solid rgba(95, 101, 196, 0.3) !important;
                border-radius: 0.5rem !important;
                background-color: white !important;
                color: #484955 !important;
                font-family: var(--font-outfit) !important;
                font-size: 1rem !important;
                line-height: 1.5 !important;
                transition: all 0.2s ease !important;
                box-shadow: none !important;
                margin: 0 !important;
                box-sizing: border-box !important;
              }

              /* Input placeholder styling */
              .newsletter-form-wrapper input::placeholder {
                color: rgba(72, 73, 85, 0.6) !important;
                font-family: var(--font-outfit) !important;
              }

              /* Input focus state */
              .newsletter-form-wrapper input:focus {
                outline: none !important;
                border-color: #5f65c4 !important;
                box-shadow: 0 0 0 3px rgba(95, 101, 196, 0.1) !important;
              }

              /* Hide labels (using placeholders instead) */
              .newsletter-form-wrapper label {
                display: none !important;
              }

              /* Error messages */
              .newsletter-form-wrapper .ml-error {
                color: #ef4444 !important;
                font-size: 0.875rem !important;
                margin-top: 0.25rem !important;
                font-family: var(--font-outfit) !important;
                grid-column: 1 / -1 !important;
              }

              /* Submit button container - span full width */
              .newsletter-form-wrapper .ml-form-embedSubmit,
              .newsletter-form-wrapper button[type="submit"] {
                grid-column: 1 / -1 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0.75rem 1.5rem !important;
                display: block !important;
              }

              /* Submit button - matching your primary button style */
              .newsletter-form-wrapper button[type="submit"] {
                background-color: #5f65c4 !important;
                color: white !important;
                border: none !important;
                border-radius: 0.5rem !important;
                font-family: var(--font-outfit) !important;
                font-size: 1rem !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                box-shadow: none !important;
              }

              /* Button hover state */
              .newsletter-form-wrapper button[type="submit"]:hover {
                background-color: #4a4f9f !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
              }

              /* Button disabled state */
              .newsletter-form-wrapper button[type="submit"]:disabled {
                opacity: 0.5 !important;
                cursor: not-allowed !important;
                transform: none !important;
              }

              /* Success message styling */
              .newsletter-form-wrapper .ml-form-successBody,
              .newsletter-form-wrapper .ml-form-successContent {
                background-color: rgba(34, 197, 94, 0.1) !important;
                color: #16a34a !important;
                padding: 1rem !important;
                border-radius: 0.5rem !important;
                font-family: var(--font-outfit) !important;
                margin-top: 1rem !important;
                grid-column: 1 / -1 !important;
              }
            `}</style>

            <p className="text-base text-secondary/70 mt-6">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
