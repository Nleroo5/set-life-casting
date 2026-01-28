/**
 * Environment Variable Validation
 *
 * Validates all required environment variables at startup using Zod.
 * This ensures the application fails fast with clear error messages
 * if required configuration is missing.
 */

import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Firebase Configuration (required for app to function)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "Firebase API key is required"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, "Firebase auth domain is required"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "Firebase project ID is required"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, "Firebase storage bucket is required"),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, "Firebase messaging sender ID is required"),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, "Firebase app ID is required"),

  // Site Configuration (required)
  NEXT_PUBLIC_SITE_URL: z.string().url("Site URL must be a valid URL"),
  NEXT_PUBLIC_CONTACT_EMAIL: z.string().email("Contact email must be valid"),

  // Optional configurations
  NEXT_PUBLIC_CONTACT_PHONE: z.string().optional(),
  MAILERLITE_API_KEY: z.string().optional(),
  FACEBOOK_PAGE_ACCESS_TOKEN: z.string().optional(),
  FACEBOOK_PAGE_ID: z.string().optional(),
});

// Type for validated environment variables
export type Env = z.infer<typeof envSchema>;

// Validate environment variables
function validateEnv(): Env {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
      NEXT_PUBLIC_CONTACT_PHONE: process.env.NEXT_PUBLIC_CONTACT_PHONE,
      MAILERLITE_API_KEY: process.env.MAILERLITE_API_KEY,
      FACEBOOK_PAGE_ACCESS_TOKEN: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues.map(err => `  - ${err.path.join('.')}: ${err.message}`).join('\n');
      throw new Error(
        `❌ Invalid environment configuration:\n${missing}\n\nPlease check your .env.local file.`
      );
    }
    throw error;
  }
}

// Export validated environment variables
// This will throw an error at startup if validation fails
export const env = validateEnv();
