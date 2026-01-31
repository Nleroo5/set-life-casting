"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function PrivacyPage() {
  const lastUpdated = "January 16, 2025";

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-12 md:pb-16 lg:pb-20 xl:pb-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/atlanta-casting-privacy-policy-protection.jpg"
            alt="Privacy Policy - Set Life Casting Atlanta protecting your personal information"
            fill
            className="object-cover object-center"
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight px-2 drop-shadow-lg animate-word" style={{ fontFamily: 'var(--font-galindo)' }}>
              Privacy <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent glow-text">Policy</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed drop-shadow-md" style={{ fontFamily: 'var(--font-outfit)' }}>
              <span className="inline-block bg-linear-to-r from-white via-purple-300 to-white bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer font-semibold">
                Your privacy is important to us
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <div className="bg-linear-to-br from-purple-100 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

        <section className="py-12 md:py-16 lg:py-20 xl:py-24 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-10 border-2 border-[#7c3aed] shadow-[0_0_30px_rgba(124,58,237,0.15)]"
            >
              <p className="text-sm text-secondary-light mb-8 text-center" style={{ fontFamily: 'var(--font-outfit)' }}>
                Last Updated: {lastUpdated}
              </p>

              <div className="space-y-8 text-secondary" style={{ fontFamily: 'var(--font-outfit)' }}>
                {/* Introduction */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    1. Introduction
                  </h2>
                  <p className="leading-relaxed">
                    Set Life Casting LLC ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                  </p>
                </div>

                {/* Information We Collect */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    2. Information We Collect
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-accent mb-2">Personal Information</h3>
                      <p className="leading-relaxed">
                        We may collect personal information that you voluntarily provide to us when you:
                      </p>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>Submit casting applications or inquiries</li>
                        <li>Contact us via email, phone, or social media</li>
                        <li>Subscribe to our newsletter or updates</li>
                        <li>Participate in our services or events</li>
                      </ul>
                      <p className="leading-relaxed mt-2">
                        This information may include: name, email address, phone number, physical address, date of birth, photographs, videos, and other information you choose to provide.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-accent mb-2">Automatically Collected Information</h3>
                      <p className="leading-relaxed">
                        When you visit our website, we may automatically collect certain information about your device, including:
                      </p>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>IP address and browser type</li>
                        <li>Operating system and device information</li>
                        <li>Pages visited and time spent on our site</li>
                        <li>Referring website addresses</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* How We Use Your Information */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    3. How We Use Your Information
                  </h2>
                  <p className="leading-relaxed mb-2">We use the information we collect to:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Process casting applications and connect talent with production opportunities</li>
                    <li>Communicate with you regarding casting calls and updates</li>
                    <li>Respond to your inquiries and provide customer support</li>
                    <li>Send newsletters and marketing communications (with your consent)</li>
                    <li>Improve our website and services</li>
                    <li>Comply with legal obligations</li>
                    <li>Protect against fraudulent or illegal activity</li>
                  </ul>
                </div>

                {/* Information Sharing */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    4. Information Sharing and Disclosure
                  </h2>
                  <p className="leading-relaxed mb-2">We may share your information with:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Production Companies:</strong> We may share your headshots, information, and contact details with production companies and casting directors for legitimate casting opportunities</li>
                    <li><strong>Service Providers:</strong> Third-party vendors who assist us in operating our website and providing services (e.g., email service providers, analytics services)</li>
                    <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights and safety</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition of our business</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    We do not sell your personal information to third parties.
                  </p>
                </div>

                {/* Data Security */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    5. Data Security
                  </h2>
                  <p className="leading-relaxed">
                    We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </div>

                {/* Your Rights */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    6. Your Rights and Choices
                  </h2>
                  <p className="leading-relaxed mb-2">You have the right to:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Access, update, or delete your personal information</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Withdraw consent for data processing</li>
                    <li>Request a copy of your data</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    To exercise these rights, please contact us at SetLifeCasting@gmail.com or (470) 693-8314.
                  </p>
                </div>

                {/* Third-Party Links */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    7. Third-Party Links
                  </h2>
                  <p className="leading-relaxed">
                    Our website may contain links to third-party websites (such as Facebook and Instagram). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
                  </p>
                </div>

                {/* Children's Privacy */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    8. Children's Privacy
                  </h2>
                  <p className="leading-relaxed">
                    Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                  </p>
                </div>

                {/* Changes to Policy */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    9. Changes to This Privacy Policy
                  </h2>
                  <p className="leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                  </p>
                </div>

                {/* Contact Us */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    10. Contact Us
                  </h2>
                  <p className="leading-relaxed mb-2">
                    If you have any questions about this Privacy Policy, please contact us:
                  </p>
                  <div className="ml-4 space-y-1">
                    <p>
                      <strong>Email:</strong>{" "}
                      <a href="mailto:SetLifeCasting@gmail.com" className="text-accent hover:underline">
                        SetLifeCasting@gmail.com
                      </a>
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      <a href="tel:+14706938314" className="text-accent hover:underline">
                        (470) 693-8314
                      </a>
                    </p>
                    <p>
                      <strong>Location:</strong> Atlanta, Georgia
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
