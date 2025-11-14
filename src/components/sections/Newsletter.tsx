"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface NewsletterFormData {
  email: string;
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
      // TODO: Replace with your newsletter API endpoint or Firebase setup
      console.log("Newsletter subscription:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStatus("success");
      setMessage("Thanks for subscribing! You'll hear from us soon.");
      reset();

      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");

      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 text-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold mb-4 text-secondary">
            Never Miss a Casting Call
          </h2>
          <p className="text-xl text-secondary-light mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new
            casting opportunities, industry tips, and exclusive updates.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-md mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white border-secondary/20 text-secondary placeholder:text-secondary/60 focus:ring-accent"
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
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={status === "loading"}
                className="sm:w-auto whitespace-nowrap"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>

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

          <p className="text-sm text-secondary/70 mt-6">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
