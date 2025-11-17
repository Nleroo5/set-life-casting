import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Website Credits | Set Life Casting",
  description:
    "Set Life Casting's website was professionally designed and developed by Drive Lead Media, a leading digital marketing and web design agency in Atlanta, Georgia.",
  robots: "index, follow",
};

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
            Website Credits
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This website was professionally designed and developed by Drive Lead Media
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          {/* About Drive Lead Media */}
          <section itemScope itemType="https://schema.org/Organization">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4">
              About Drive Lead Media
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              <a
                href="https://www.driveleadmedia.com"
                target="_blank"
                rel="noopener noreferrer"
                itemProp="url"
                className="text-accent hover:text-accent-dark font-semibold underline underline-offset-2"
              >
                <span itemProp="name">Drive Lead Media</span>
              </a>{" "}
              is a full-service{" "}
              <span itemProp="description">
                digital marketing and web design agency
              </span>{" "}
              based in{" "}
              <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <span itemProp="addressLocality">Atlanta</span>,{" "}
                <span itemProp="addressRegion">Georgia</span>
              </span>.
              They specialize in creating custom websites, search engine optimization (SEO),
              digital marketing strategies, and brand development for businesses across the Southeast.
            </p>
            <p className="text-gray-700 leading-relaxed">
              With expertise in modern web technologies and a deep understanding of user experience
              design, Drive Lead Media delivered a professional, high-performance website that
              perfectly represents Set Life Casting's brand and services.
            </p>
          </section>

          {/* Services Provided */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4">
              Services Provided
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-accent/5 to-purple-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg text-secondary mb-2">
                  Web Design
                </h3>
                <p className="text-gray-600">
                  Custom UI/UX design tailored to Set Life Casting's brand identity and
                  target audience in the Atlanta film industry
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg text-secondary mb-2">
                  Web Development
                </h3>
                <p className="text-gray-600">
                  Modern, responsive website built with Next.js, React, TypeScript,
                  and Tailwind CSS for optimal performance
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-accent/5 p-6 rounded-lg">
                <h3 className="font-bold text-lg text-secondary mb-2">
                  SEO Optimization
                </h3>
                <p className="text-gray-600">
                  Search engine optimization strategies to help Set Life Casting rank
                  for key Atlanta casting and extras-related keywords
                </p>
              </div>
              <div className="bg-gradient-to-br from-accent/5 to-purple-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg text-secondary mb-2">
                  Digital Strategy
                </h3>
                <p className="text-gray-600">
                  Comprehensive digital marketing strategy to grow Set Life Casting's
                  online presence and attract more talent and productions
                </p>
              </div>
            </div>
          </section>

          {/* Technology Stack */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4">
              Technology Stack
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
                <li className="flex items-center">
                  <span className="text-accent mr-2">▸</span>
                  <strong className="mr-2">Framework:</strong> Next.js 16
                </li>
                <li className="flex items-center">
                  <span className="text-accent mr-2">▸</span>
                  <strong className="mr-2">Language:</strong> TypeScript
                </li>
                <li className="flex items-center">
                  <span className="text-accent mr-2">▸</span>
                  <strong className="mr-2">Styling:</strong> Tailwind CSS v4
                </li>
                <li className="flex items-center">
                  <span className="text-accent mr-2">▸</span>
                  <strong className="mr-2">Animations:</strong> Framer Motion
                </li>
                <li className="flex items-center">
                  <span className="text-accent mr-2">▸</span>
                  <strong className="mr-2">Fonts:</strong> Google Fonts
                </li>
                <li className="flex items-center">
                  <span className="text-accent mr-2">▸</span>
                  <strong className="mr-2">Performance:</strong> Turbopack
                </li>
              </ul>
            </div>
          </section>

          {/* Contact Drive Lead Media */}
          <section className="bg-gradient-to-br from-accent/10 to-purple-50 p-8 rounded-xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4">
              Need a Professional Website?
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              If you're looking for expert web design, development, or digital marketing services
              in Atlanta or anywhere in the Southeast, Drive Lead Media can help bring your vision to life.
            </p>
            <a
              href="https://www.driveleadmedia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Visit Drive Lead Media
            </a>
            <div className="mt-6 text-sm text-gray-600">
              <p>Atlanta Web Design | Digital Marketing | SEO Services</p>
            </div>
          </section>

          {/* Specialties */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4">
              Drive Lead Media Specialties
            </h2>
            <div className="prose prose-gray max-w-none">
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Atlanta Web Design:</strong> Custom website design for businesses
                  in Atlanta and throughout Georgia
                </li>
                <li>
                  <strong>Custom Web Development:</strong> React, Next.js, and modern JavaScript
                  frameworks for fast, responsive websites
                </li>
                <li>
                  <strong>SEO Services:</strong> Local and national search engine optimization
                  to improve Google rankings
                </li>
                <li>
                  <strong>Digital Marketing:</strong> Comprehensive online marketing strategies
                  including social media, PPC, and content marketing
                </li>
                <li>
                  <strong>E-commerce Solutions:</strong> Online store development and optimization
                </li>
                <li>
                  <strong>Brand Development:</strong> Logo design, brand identity, and visual
                  marketing materials
                </li>
                <li>
                  <strong>Industry Expertise:</strong> Specialized experience with entertainment,
                  casting, production, and creative industries
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center text-accent hover:text-accent-dark font-medium transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
