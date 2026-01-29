import { z } from "zod";

// Step 2: Basic Info
export const basicInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

// Step 3: Appearance
export const appearanceSchema = z.object({
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ethnicity: z.array(z.string()).min(1, "Select at least one ethnicity"),
  height: z.string().min(1, "Height is required"),
  weight: z.number().min(1, "Weight is required"),
  hairColor: z.string().min(1, "Hair color is required"),
  hairLength: z.string().min(1, "Hair length is required"),
  eyeColor: z.string().min(1, "Eye color is required"),
});

// Step 4: Sizes (Gender-Conditional)
// Based on industry standards from Casting Networks, Actors Access, Central Casting
export const sizesSchema = z.object({
  // Gender is passed from appearance step to determine which fields to show
  gender: z.string().min(1, "Gender is required"),

  // Male-specific sizes
  shirtSize: z.string().optional(),
  pantWaist: z.number().nullable().optional().or(z.nan().transform(() => undefined)),
  pantInseam: z.number().nullable().optional().or(z.nan().transform(() => undefined)),

  // Female-specific sizes
  dressSize: z.string().optional(),
  womensPantSize: z.string().optional(),

  // Universal fields
  shoeSize: z.string().min(1, "Shoe size is required"),

  // Optional measurements (with NaN and null handling for empty fields)
  bust: z.number().nullable().optional().or(z.nan().transform(() => undefined)),
  waist: z.number().nullable().optional().or(z.nan().transform(() => undefined)),
  hips: z.number().nullable().optional().or(z.nan().transform(() => undefined)),
  neck: z.number().nullable().optional().or(z.nan().transform(() => undefined)),
  sleeve: z.number().nullable().optional().or(z.nan().transform(() => undefined)),
  jacketSize: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validate based on gender
  const isMale = data.gender === "Male";
  const isFemale = data.gender === "Female";
  const isNonBinary = data.gender === "Non-binary";

  if (isMale) {
    // Male required fields
    if (!data.shirtSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Shirt size is required",
        path: ["shirtSize"],
      });
    }
    if (!data.pantWaist || data.pantWaist < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pant waist is required",
        path: ["pantWaist"],
      });
    }
    if (!data.pantInseam || data.pantInseam < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pant inseam is required",
        path: ["pantInseam"],
      });
    }
  } else if (isFemale) {
    // Female required fields: shirt, dress, pant size, shoe
    if (!data.shirtSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Shirt size is required",
        path: ["shirtSize"],
      });
    }
    if (!data.dressSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dress size is required",
        path: ["dressSize"],
      });
    }
    if (!data.womensPantSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pant size is required",
        path: ["womensPantSize"],
      });
    }
  } else if (isNonBinary) {
    // Non-binary can fill either set, but must fill at least one complete set
    const hasMaleData = data.shirtSize && data.pantWaist && data.pantInseam;
    const hasFemaleData = data.shirtSize && data.dressSize && data.womensPantSize;

    if (!hasMaleData && !hasFemaleData) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please provide either male or female sizing information",
        path: ["gender"],
      });
    }
  }
});

// Step 5: Additional Details
export const detailsSchema = z.object({
  gender: z.string().optional(), // Passed from appearance step
  visibleTattoos: z.boolean(),
  tattoosDescription: z.string().optional(),
  facialHair: z.string().optional(),
}).superRefine((data, ctx) => {
  // Facial hair is only required for male, non-binary, and other genders (not female)
  const isFemale = data.gender === "Female";

  if (!isFemale && (!data.facialHair || data.facialHair.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Facial hair option is required",
      path: ["facialHair"],
    });
  }
});

// Step 6: Photos
export const photosSchema = z.object({
  photos: z.array(z.object({
    url: z.string(),
    type: z.enum(["headshot", "fullbody", "additional"]),
  })).min(2, "At least 2 photos required (headshot and full body)"),
});

// Step 7: Review
export const reviewSchema = z.object({
  confirmContact: z.boolean().refine((val) => val === true, {
    message: "You must consent to being contacted",
  }),
});

// Complete submission schema
export const submissionSchema = basicInfoSchema
  .merge(appearanceSchema)
  .merge(sizesSchema)
  .merge(detailsSchema)
  .merge(photosSchema)
  .merge(reviewSchema);

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type AppearanceFormData = z.infer<typeof appearanceSchema>;
export type SizesFormData = z.infer<typeof sizesSchema>;
export type DetailsFormData = z.infer<typeof detailsSchema>;
export type PhotosFormData = z.infer<typeof photosSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type SubmissionFormData = z.infer<typeof submissionSchema>;
