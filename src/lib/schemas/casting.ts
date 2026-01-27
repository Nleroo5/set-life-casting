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

// Step 4: Sizes
export const sizesSchema = z.object({
  shirtSize: z.string().min(1, "Shirt size is required"),
  pantsWaist: z.number().min(1, "Pants waist is required"),
  pantsInseam: z.number().min(1, "Pants inseam is required"),
  dressSize: z.string().optional(),
  suitSize: z.string().optional(),
  shoeSize: z.string().min(1, "Shoe size is required"),
  shoeSizeGender: z.enum(["M", "W"]),
});

// Step 5: Additional Details
export const detailsSchema = z.object({
  visibleTattoos: z.boolean(),
  tattoosDescription: z.string().optional(),
  piercings: z.boolean(),
  piercingsDescription: z.string().optional(),
  facialHair: z.string().min(1, "Facial hair option is required"),
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
