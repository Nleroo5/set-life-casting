"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface NewsletterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

export default function Newsletter() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>();

  const onSubmit = async (data: NewsletterFormData) => {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          city: data.city,
          state: data.state,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to subscribe');
      }

      setStatus("success");
      setMessage(result.message || "Thanks for subscribing! You'll hear from us soon.");
      reset();

      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");

      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    }
  };

  return (
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

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input
                type="text"
                placeholder="First Name"
                className="bg-white border-accent/30 text-secondary placeholder:text-secondary/60 focus:ring-accent focus:border-accent"
                {...register("firstName", {
                  required: "First name is required",
                })}
                error={errors.firstName?.message}
                disabled={status === "loading"}
              />
              <Input
                type="text"
                placeholder="Last Name"
                className="bg-white border-accent/30 text-secondary placeholder:text-secondary/60 focus:ring-accent focus:border-accent"
                {...register("lastName", {
                  required: "Last name is required",
                })}
                error={errors.lastName?.message}
                disabled={status === "loading"}
              />
              <Input
                type="email"
                placeholder="Email"
                className="bg-white border-accent/30 text-secondary placeholder:text-secondary/60 focus:ring-accent focus:border-accent"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                error={errors.email?.message}
                disabled={status === "loading"}
              />
              <Input
                type="tel"
                placeholder="Phone Number"
                className="bg-white border-accent/30 text-secondary placeholder:text-secondary/60 focus:ring-accent focus:border-accent"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[\d\s\-\(\)]+$/,
                    message: "Invalid phone number",
                  },
                })}
                error={errors.phone?.message}
                disabled={status === "loading"}
              />
              <Input
                type="text"
                placeholder="City"
                className="bg-white border-accent/30 text-secondary placeholder:text-secondary/60 focus:ring-accent focus:border-accent"
                {...register("city", {
                  required: "City is required",
                })}
                error={errors.city?.message}
                disabled={status === "loading"}
              />
              <Input
                type="text"
                placeholder="State"
                className="bg-white border-accent/30 text-secondary placeholder:text-secondary/60 focus:ring-accent focus:border-accent"
                {...register("state", {
                  required: "State is required",
                })}
                error={errors.state?.message}
                disabled={status === "loading"}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={status === "loading"}
              className="w-full"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </Button>

            {message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 text-sm ${
                  status === "success" ? "text-green-200" : "text-red-200"
                }`}
              >
                {message}
              </motion.p>
            )}
          </form>

          <p className="text-base text-secondary/70 mt-6">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
