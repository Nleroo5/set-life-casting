"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function TermsPage() {
  const lastUpdated = "January 16, 2025";

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/atlanta-casting-terms-of-service-agreement.jpg"
            alt="Terms of Service - Set Life Casting Atlanta service agreement and guidelines"
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
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg animate-word" style={{ fontFamily: 'var(--font-galindo)' }}>
              Terms of <span className="bg-gradient-to-r from-accent-light via-purple-400 to-purple-500 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed drop-shadow-md" style={{ fontFamily: 'var(--font-outfit)' }}>
              <span className="inline-block bg-gradient-to-r from-white via-purple-300 to-white bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer font-semibold">
                Please read these terms carefully
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

        <section className="py-12 md:py-16 lg:py-20 xl:py-24 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-10 border-2 border-[#7c3aed] shadow-[0_0_30px_rgba(124,58,237,0.15)]"
            >
              <p className="text-sm text-secondary-light mb-8 text-center" style={{ fontFamily: 'var(--font-outfit)' }}>
                Last Updated: {lastUpdated}
              </p>

              <div className="space-y-8 text-secondary" style={{ fontFamily: 'var(--font-outfit)' }}>
                {/* Introduction */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    1. Agreement to Terms
                  </h2>
                  <p className="leading-relaxed">
                    By accessing or using the Set Life Casting LLC website ("Site") and services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Site or services.
                  </p>
                  <p className="leading-relaxed mt-2">
                    These Terms constitute a legally binding agreement between you and Set Life Casting LLC ("we," "our," or "us").
                  </p>
                </div>

                {/* Use of Services */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    2. Use of Our Services
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-accent mb-2">Eligibility</h3>
                      <p className="leading-relaxed">
                        You must be at least 18 years old to use our services independently. If you are under 18, you must have parental or guardian consent to use our services.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-accent mb-2">Account Responsibility</h3>
                      <p className="leading-relaxed">
                        You are responsible for maintaining the confidentiality of any account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-accent mb-2">Prohibited Uses</h3>
                      <p className="leading-relaxed mb-2">You agree not to:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Provide false, misleading, or fraudulent information</li>
                        <li>Violate any applicable laws or regulations</li>
                        <li>Infringe on intellectual property rights of others</li>
                        <li>Transmit viruses, malware, or harmful code</li>
                        <li>Harass, abuse, or harm others</li>
                        <li>Use our services for any illegal or unauthorized purpose</li>
                        <li>Attempt to gain unauthorized access to our systems</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Casting Services */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    3. Casting Services
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-accent mb-2">No Guarantee of Employment</h3>
                      <p className="leading-relaxed">
                        Set Life Casting provides casting services but does not guarantee employment, bookings, or specific outcomes. Final casting decisions are made by production companies and clients, not by Set Life Casting.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-accent mb-2">Talent Submissions</h3>
                      <p className="leading-relaxed">
                        By submitting your information, photos, and materials to us, you grant Set Life Casting the right to share this information with production companies, casting directors, and other industry professionals for legitimate casting opportunities.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-accent mb-2">Professionalism Required</h3>
                      <p className="leading-relaxed">
                        All talent must conduct themselves professionally when working on productions. Unprofessional behavior may result in removal from our talent database and future casting opportunities.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Intellectual Property */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    4. Intellectual Property Rights
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-accent mb-2">Our Content</h3>
                      <p className="leading-relaxed">
                        All content on our Site, including text, graphics, logos, images, and software, is the property of Set Life Casting LLC or its licensors and is protected by copyright, trademark, and other intellectual property laws.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-accent mb-2">Your Content</h3>
                      <p className="leading-relaxed">
                        You retain ownership of any photos, videos, or materials you submit to us. However, by submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and distribute your content for casting and promotional purposes related to our services.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-accent mb-2">Representations and Warranties</h3>
                      <p className="leading-relaxed">
                        You represent and warrant that you own or have the necessary rights to all content you submit, and that such content does not violate any third-party rights or applicable laws.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payments and Fees */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    5. Payments and Fees
                  </h2>
                  <p className="leading-relaxed">
                    Set Life Casting does not charge talent registration fees. Payment for work performed on productions is handled directly between talent and the production company or their payroll service. We are not responsible for payment disputes between talent and production companies.
                  </p>
                </div>

                {/* Disclaimer of Warranties */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    6. Disclaimer of Warranties
                  </h2>
                  <p className="leading-relaxed">
                    OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                </div>

                {/* Limitation of Liability */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    7. Limitation of Liability
                  </h2>
                  <p className="leading-relaxed">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, SET LIFE CASTING LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Your use or inability to use our services</li>
                    <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
                    <li>Any interruption or cessation of transmission to or from our services</li>
                    <li>Any conduct or content of any third party on our services</li>
                    <li>Any content obtained from our services</li>
                  </ul>
                </div>

                {/* Indemnification */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    8. Indemnification
                  </h2>
                  <p className="leading-relaxed">
                    You agree to indemnify, defend, and hold harmless Set Life Casting LLC, its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of our services, your violation of these Terms, or your violation of any third-party rights.
                  </p>
                </div>

                {/* Third-Party Services */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    9. Third-Party Services and Links
                  </h2>
                  <p className="leading-relaxed">
                    Our Site may contain links to third-party websites or services (such as Airtable, Facebook, and Instagram) that are not owned or controlled by Set Life Casting. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that we shall not be responsible or liable for any damage or loss caused by your use of any such third-party services.
                  </p>
                </div>

                {/* Modifications */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    10. Modifications to Terms
                  </h2>
                  <p className="leading-relaxed">
                    We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our services after revisions become effective, you agree to be bound by the revised Terms.
                  </p>
                </div>

                {/* Termination */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    11. Termination
                  </h2>
                  <p className="leading-relaxed">
                    We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use our services will immediately cease.
                  </p>
                </div>

                {/* Governing Law */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    12. Governing Law and Jurisdiction
                  </h2>
                  <p className="leading-relaxed">
                    These Terms shall be governed by and construed in accordance with the laws of the State of Georgia, United States, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the courts located in Georgia, and you hereby consent to personal jurisdiction and venue therein.
                  </p>
                </div>

                {/* Severability */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    13. Severability and Waiver
                  </h2>
                  <p className="leading-relaxed">
                    If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will continue in full force and effect. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                  </p>
                </div>

                {/* Entire Agreement */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    14. Entire Agreement
                  </h2>
                  <p className="leading-relaxed">
                    These Terms, together with our{" "}
                    <Link href="/privacy" className="text-accent hover:underline font-semibold">
                      Privacy Policy
                    </Link>
                    , constitute the entire agreement between you and Set Life Casting LLC regarding our services and supersede all prior agreements and understandings.
                  </p>
                </div>

                {/* Contact Us */}
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
                    15. Contact Information
                  </h2>
                  <p className="leading-relaxed mb-2">
                    If you have any questions about these Terms of Service, please contact us:
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

                {/* Acknowledgment */}
                <div className="mt-8 p-6 bg-accent/5 rounded-lg border border-accent/20">
                  <p className="leading-relaxed text-center">
                    <strong>BY USING OUR SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.</strong>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
