"use client";

import React from "react";
import { motion } from "framer-motion";

export default function CastingStatus() {
  return (
    <section id="castings" className="pt-12 pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
            <span className="text-accent">Latest</span> Casting Opportunities
          </h2>
          <p className="text-xl text-secondary-light max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
            Follow us on Facebook for real-time casting updates and opportunities
          </p>
        </motion.div>

        {/* Follow Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <a
            href="https://www.facebook.com/SetLifeCastingATL/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-[#1877f2] text-white rounded-lg hover:bg-[#166fe5] transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg
              className="w-6 h-6 mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Follow Our Page
          </a>
        </motion.div>

        {/* Facebook Page Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center mb-20"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-[500px]">
            <iframe
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FSetLifeCastingATL%2F&tabs=timeline&width=500&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
              width="500"
              height="600"
              style={{
                border: "none",
                overflow: "hidden",
              }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              className="w-full"
            />
          </div>
        </motion.div>

        {/* What We Offer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-galindo)' }}>
            What <span className="text-accent">We Offer</span>
          </h2>
          <p className="text-xl text-secondary-light max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-outfit)' }}>
            Professional casting services for film, TV, and commercial productions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Film & TV Productions",
              description:
                "Background talent for movies, TV series, and streaming content. We provide vetted professionals for every production need.",
            },
            {
              title: "Commercial & Brand Casting",
              description:
                "Models, influencers, and real people for ads, print, and digital campaigns. Perfect faces for your brand message.",
            },
            {
              title: "Specialized Casting",
              description:
                "AI doubles, motion capture, and emerging media productions. Cutting-edge talent for next-generation content.",
            },
          ].map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className="group relative bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full text-center border-2 border-transparent hover:border-accent/20">
                <h3 className="text-2xl font-bold text-secondary mb-4 group-hover:text-accent transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-secondary-light leading-relaxed text-base">
                  {service.description}
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent/20 to-purple-500/20 group-hover:from-accent group-hover:to-purple-500 transition-all duration-500 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
