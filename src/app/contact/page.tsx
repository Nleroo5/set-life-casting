"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ContactPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/atlanta-background-actor-casting-services.jpg"
            alt="Atlanta background actor casting services - Contact Set Life Casting"
            fill
            className="object-cover object-[center_60%]"
            priority
          />
          {/* Translucent charcoal overlay */}
          <div className="absolute inset-0 bg-gray-900/85"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg" style={{ fontFamily: 'var(--font-galindo)' }}>
              <span
                className="animate-word"
                style={{ display: "inline-block", animationDelay: "0.1s" }}
              >
                Let&apos;s{" "}
              </span>
              <span
                className="animate-word bg-gradient-to-r from-accent-light via-purple-400 to-purple-500 bg-clip-text text-transparent [text-shadow:_0_0_10px_rgb(139_92_246_/_80%),_0_0_20px_rgb(139_92_246_/_60%),_0_0_40px_rgb(139_92_246_/_40%),_0_0_80px_rgb(139_92_246_/_20%)]"
                style={{ display: "inline-block", animationDelay: "0.3s" }}
              >
                Work{" "}
              </span>
              <span
                className="animate-word bg-gradient-to-r from-accent-light via-purple-400 to-purple-500 bg-clip-text text-transparent [text-shadow:_0_0_10px_rgb(139_92_246_/_80%),_0_0_20px_rgb(139_92_246_/_60%),_0_0_40px_rgb(139_92_246_/_40%),_0_0_80px_rgb(139_92_246_/_20%)]"
                style={{ display: "inline-block", animationDelay: "0.5s" }}
              >
                Together!
              </span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed drop-shadow-md" style={{ fontFamily: 'var(--font-outfit)' }}>
              <span className="inline-block bg-gradient-to-r from-white via-purple-300 to-white bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer font-semibold">
                Whether you&apos;re a production looking for talent or an actor ready to work,
              </span>
              {" "}
              we&apos;d love to hear from you!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Unified Background Section */}
      <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

      {/* Contact Content */}
      <section className="py-12 md:py-16 lg:py-20 xl:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Production Inquiries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-8 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300"
            >
              <div className="text-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="w-16 h-16 bg-gradient-to-br from-accent/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/10"
                >
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <h2 className="text-3xl font-bold text-secondary mb-2" style={{ fontFamily: 'var(--font-galindo)' }}>
                  Production Inquiries
                </h2>
                <p className="text-accent font-medium text-sm">No talent please</p>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex items-start"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-accent"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-1">Phone</h3>
                    <a
                      href="tel:770-502-5460"
                      className="text-accent hover:text-accent-dark text-lg transition-colors duration-200 relative group"
                    >
                      770-502-5460
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-dark group-hover:w-full transition-all duration-300"></span>
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex items-start"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-accent"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-1">Email</h3>
                    <a
                      href="mailto:ChazlynYu@gmail.com"
                      className="text-accent hover:text-accent-dark break-all transition-colors duration-200 relative group"
                    >
                      ChazlynYu@gmail.com
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-dark group-hover:w-full transition-all duration-300"></span>
                    </a>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Talent Inquiries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-8 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] hover:shadow-[0_0_50px_rgba(95,101,196,0.3)] hover:border-purple-400 transition-all duration-300"
            >
              <div className="text-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="w-16 h-16 bg-gradient-to-br from-accent/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/10"
                >
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </motion.div>
                <h2 className="text-3xl font-bold text-secondary mb-2" style={{ fontFamily: 'var(--font-galindo)' }}>
                  Talent Inquiries
                </h2>
                <p className="text-secondary-light text-sm">Background actors & extras</p>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="flex items-start"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-accent"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-1">Phone</h3>
                    <a
                      href="tel:470-693-8314"
                      className="text-accent hover:text-accent-dark text-lg transition-colors duration-200 relative group"
                    >
                      470-693-8314
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-dark group-hover:w-full transition-all duration-300"></span>
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="flex items-start"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-accent"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-1">Email</h3>
                    <a
                      href="mailto:SetLifeCasting@gmail.com"
                      className="text-accent hover:text-accent-dark break-all transition-colors duration-200 relative group"
                    >
                      SetLifeCasting@gmail.com
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-dark group-hover:w-full transition-all duration-300"></span>
                    </a>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                Location
              </h3>
              <div className="flex items-center justify-center text-secondary-light">
                <svg
                  className="w-6 h-6 text-accent mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-lg" style={{ fontFamily: 'var(--font-outfit)' }}>Atlanta, Georgia — Serving the Southeast</p>
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <h3 className="text-xl font-semibold text-secondary mb-6" style={{ fontFamily: 'var(--font-galindo)' }}>
              Follow Us for Casting Updates
            </h3>
            <div className="flex justify-center space-x-4">
              <motion.a
                href="https://www.facebook.com/SetLifeCastingATL/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-14 h-14 bg-accent/10 hover:bg-[#1877f2] text-accent hover:text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="Facebook"
              >
                <svg
                  className="w-7 h-7"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </motion.a>
              <motion.a
                href="https://www.instagram.com/setlifecastingatl/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-14 h-14 bg-accent/10 hover:bg-gradient-to-br hover:from-[#833ab4] hover:via-[#fd1d1d] hover:to-[#fcb045] text-accent hover:text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="Instagram"
              >
                <svg
                  className="w-7 h-7"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
      </div>
    </div>
  );
}
