"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Current Castings", href: "/casting" },
  { name: "Talent Resources", href: "/resources" },
  { name: "FAQ", href: "/faq" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 flex-shrink min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Set Life Casting Logo"
                fill
                sizes="(max-width: 640px) 40px, 48px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-base sm:text-lg md:text-lg font-bold text-secondary truncate" style={{ fontFamily: 'var(--font-galindo)' }}>
              Set Life Casting
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-base md:text-base text-secondary hover:text-accent transition-colors duration-200 font-medium"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {isAdmin ? (
                  <Link href="/admin">
                    <Button variant="primary" size="md">
                      Admin Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button variant="primary" size="md">
                      Dashboard
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="md">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 text-secondary hover:text-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/90 backdrop-blur-md border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-base text-secondary hover:text-accent hover:bg-primary-light rounded-lg transition-all duration-200 font-medium"
                  style={{ fontFamily: 'var(--font-outfit)' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-3">
                {user ? (
                  <>
                    {isAdmin ? (
                      <Link href="/admin" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="primary" size="md" className="w-full">
                          Admin Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/dashboard" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="primary" size="md" className="w-full">
                          Dashboard
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <Link href="/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
