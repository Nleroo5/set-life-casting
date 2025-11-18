"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  company: [
    { name: "Services", href: "/services" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ],
  resources: [
    { name: "Talent Resources", href: "/resources" },
    { name: "Photo Guidelines", href: "/resources#photos" },
    { name: "Current Castings", href: "/#castings" },
  ],
  social: [
    {
      name: "Facebook",
      href: "https://www.facebook.com/SetLifeCastingATL/",
      icon: (
        <svg className="w-5 h-5 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/setlifecastingatl/",
      icon: (
        <svg className="w-5 h-5 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
        </svg>
      ),
    },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Glass Morphism Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 backdrop-blur-sm"></div>

      {/* Top Glowing Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent shadow-[0_0_10px_rgba(168,85,247,0.4)]"></div>

      {/*
        Website Design & Development by Drive Lead Media
        Atlanta Web Design | Digital Marketing | SEO Services
        https://www.driveleadmedia.com
      */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Desktop: 4 Columns */}
        <div className="hidden md:grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/drive-lead-media-crm.firebasestorage.app/o/websiteQuotes%2Fquote_1760395151657_f05s8xyu2%2Flogo%2FScreen%20Shot%202024-01-27%20at%203.54.57%20PM-fotor-2024012904710.jpg?alt=media&token=be6f763a-80f6-47d1-ad5e-b2fd483b339d"
                  alt="Set Life Casting Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-galindo)' }}>Set Life Casting</span>
            </Link>
            <p className="text-white/90 text-sm">
              Atlanta&apos;s premier extras casting company for film, TV,
              commercials, and music videos.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-accent transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-bold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-accent transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-bold mb-4 text-white">Connect</h3>
            <div className="space-y-3 mb-6">
              <a
                href="mailto:SetLifeCasting@gmail.com"
                className="text-white/80 hover:text-accent transition-colors duration-200 text-sm block"
              >
                SetLifeCasting@gmail.com
              </a>
              <a
                href="tel:+14706938314"
                className="text-white/80 hover:text-accent transition-colors duration-200 text-sm block"
              >
                (470) 693-8314
              </a>
            </div>
            <div className="flex space-x-4">
              {footerLinks.social.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-accent transition-all duration-200 hover:scale-110"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Centered Hub Layout */}
        <div className="md:hidden text-center space-y-8">
          {/* Brand - Centered */}
          <div>
            <Link href="/" className="inline-flex items-center space-x-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/drive-lead-media-crm.firebasestorage.app/o/websiteQuotes%2Fquote_1760395151657_f05s8xyu2%2Flogo%2FScreen%20Shot%202024-01-27%20at%203.54.57%20PM-fotor-2024012904710.jpg?alt=media&token=be6f763a-80f6-47d1-ad5e-b2fd483b339d"
                  alt="Set Life Casting Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-galindo)' }}>Set Life Casting</span>
            </Link>
            <p className="text-white/90 text-sm max-w-sm mx-auto">
              Atlanta&apos;s premier extras casting company for film, TV,
              commercials, and music videos.
            </p>
          </div>

          {/* Social Icons - Large & Centered */}
          <div className="flex justify-center space-x-6">
            {footerLinks.social.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-accent transition-all duration-200 hover:scale-110"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* Navigation Links - 2 Columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-md mx-auto">
            <div className="text-left">
              <h3 className="font-bold mb-3 text-white text-base">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-accent transition-colors duration-200 text-sm block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-left">
              <h3 className="font-bold mb-3 text-white text-base">Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-accent transition-colors duration-200 text-sm block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info - Centered */}
          <div className="space-y-3">
            <a
              href="mailto:SetLifeCasting@gmail.com"
              className="text-white/80 hover:text-accent transition-colors duration-200 text-sm block"
            >
              SetLifeCasting@gmail.com
            </a>
            <a
              href="tel:+14706938314"
              className="text-white/80 hover:text-accent transition-colors duration-200 text-sm block"
            >
              (470) 693-8314
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 shadow-[0_-1px_10px_rgba(168,85,247,0.1)]">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
              <p className="text-white/90">
                © {currentYear} Set Life Casting LLC. All rights reserved.
              </p>
              <span className="hidden sm:inline text-white/40">•</span>
              <p className="text-white/70" itemScope itemType="https://schema.org/WebSite">
                Website by{" "}
                <a
                  href="https://www.driveleadmedia.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  itemProp="creator"
                  className="text-white hover:text-accent transition-colors duration-200 font-medium underline decoration-white/30 hover:decoration-accent underline-offset-2"
                  title="Drive Lead Media - Digital Marketing & Web Design Agency"
                  aria-label="Visit Drive Lead Media - Professional Web Design and Digital Marketing Agency in Atlanta"
                >
                  Drive Lead Media
                </a>
              </p>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-white/80 hover:text-accent transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-white/80 hover:text-accent transition-colors duration-200 text-sm"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
