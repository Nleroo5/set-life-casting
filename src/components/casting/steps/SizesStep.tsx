"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { sizesSchema, SizesFormData } from "@/lib/schemas/casting";

interface SizesStepProps {
  data: Partial<SizesFormData>;
  gender?: string;
  onNext: (data: SizesFormData) => void;
  onPrevious: () => void;
}

// Industry-standard size options based on Casting Networks, Actors Access, Central Casting
const MENS_SHIRT_SIZES = [
  { value: "", label: "Select Size" },
  { value: "XS", label: "XS (Extra Small)" },
  { value: "S", label: "S (Small)" },
  { value: "M", label: "M (Medium)" },
  { value: "L", label: "L (Large)" },
  { value: "XL", label: "XL (Extra Large)" },
  { value: "2XL", label: "2XL" },
  { value: "3XL", label: "3XL" },
];

// Women's dress sizes: 00, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24 + letter sizes
const WOMENS_DRESS_SIZES = [
  { value: "", label: "Select Size" },
  { value: "00", label: "00" },
  { value: "0", label: "0" },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: String((i + 1) * 2),
    label: String((i + 1) * 2),
  })),
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "1X", label: "1X" },
  { value: "2X", label: "2X" },
  { value: "3X", label: "3X" },
];

// Women's pant sizes: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24
const WOMENS_PANT_SIZES = [
  { value: "", label: "Select Size" },
  { value: "0", label: "0" },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: String((i + 1) * 2),
    label: String((i + 1) * 2),
  })),
];

// Men's shoe sizes: 6-15
const MENS_SHOE_SIZES = [
  { value: "", label: "Select Size" },
  ...Array.from({ length: 19 }, (_, i) => {
    const size = 6 + i * 0.5;
    return {
      value: String(size),
      label: String(size),
    };
  }),
];

// Women's shoe sizes: 5-13
const WOMENS_SHOE_SIZES = [
  { value: "", label: "Select Size" },
  ...Array.from({ length: 17 }, (_, i) => {
    const size = 5 + i * 0.5;
    return {
      value: String(size),
      label: String(size),
    };
  }),
];

// Women's shirt sizes
const WOMENS_SHIRT_SIZES = [
  { value: "", label: "Select Size" },
  { value: "XS", label: "XS (Extra Small)" },
  { value: "S", label: "S (Small)" },
  { value: "M", label: "M (Medium)" },
  { value: "L", label: "L (Large)" },
  { value: "XL", label: "XL (Extra Large)" },
  { value: "2XL", label: "2XL" },
  { value: "3XL", label: "3XL" },
];

// Men's jacket sizes (even numbers 34-52)
const MENS_JACKET_SIZES = [
  { value: "", label: "Select Size (Optional)" },
  ...Array.from({ length: 10 }, (_, i) => {
    const size = 34 + i * 2;
    return {
      value: String(size),
      label: String(size),
    };
  }),
];

export default function SizesStep({ data, gender, onNext, onPrevious }: SizesStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SizesFormData>({
    resolver: zodResolver(sizesSchema),
    defaultValues: {
      ...data,
      gender: gender || data.gender, // Ensure gender is included
    },
  });

  const isMale = gender === "Male";
  const isFemale = gender === "Female";
  const isNonBinary = gender === "Non-binary";

  const onSubmit = (formData: SizesFormData) => {
    // Ensure gender is included in submission
    const submissionData = {
      ...formData,
      gender: gender || formData.gender,
    };
    onNext(submissionData);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-bold text-secondary mb-4"
          style={{ fontFamily: "var(--font-galindo)" }}
        >
          Clothing Sizes
        </h2>
        <p
          className="text-base text-secondary-light mb-2"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Professional wardrobe sizing for casting calls
        </p>
        <p
          className="text-sm text-secondary-light"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          All measurements are US sizing standards
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hidden gender field to ensure validation works */}
        <input type="hidden" {...register("gender")} value={gender} />

        {/* MALE SIZES */}
        {(isMale || isNonBinary) && (
          <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-accent/20">
            <h3
              className="text-lg font-bold text-secondary mb-4"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              {isNonBinary ? "Male Sizing (Optional)" : "Required Sizes"}
            </h3>

            <div className="space-y-6">
              <Select
                label="Shirt Size"
                {...register("shirtSize")}
                options={MENS_SHIRT_SIZES}
                error={errors.shirtSize?.message}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Pant Waist (inches)"
                  type="number"
                  {...register("pantWaist", { valueAsNumber: true })}
                  error={errors.pantWaist?.message}
                  placeholder="32"
                />
                <Input
                  label="Pant Inseam (inches)"
                  type="number"
                  {...register("pantInseam", { valueAsNumber: true })}
                  error={errors.pantInseam?.message}
                  placeholder="30"
                />
              </div>

              <Select
                label="Shoe Size (US Men's)"
                {...register("shoeSize")}
                options={MENS_SHOE_SIZES}
                error={isMale ? errors.shoeSize?.message : undefined}
              />
            </div>
          </div>
        )}

        {/* FEMALE SIZES */}
        {(isFemale || isNonBinary) && (
          <div className="bg-linear-to-br from-pink-50 to-purple-50 rounded-xl p-6 border-2 border-accent/20">
            <h3
              className="text-lg font-bold text-secondary mb-4"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              {isNonBinary ? "Female Sizing (Optional)" : "Required Sizes"}
            </h3>

            <div className="space-y-6">
              <Select
                label="Shirt Size"
                {...register("shirtSize")}
                options={WOMENS_SHIRT_SIZES}
                error={isFemale ? errors.shirtSize?.message : undefined}
              />

              <Select
                label="Dress Size (US)"
                {...register("dressSize")}
                options={WOMENS_DRESS_SIZES}
                error={errors.dressSize?.message}
              />

              <Select
                label="Pant Size (US Women's)"
                {...register("womensPantSize")}
                options={WOMENS_PANT_SIZES}
                error={errors.womensPantSize?.message}
              />

              <Select
                label="Shoe Size (US Women's)"
                {...register("shoeSize")}
                options={WOMENS_SHOE_SIZES}
                error={isFemale ? errors.shoeSize?.message : undefined}
              />
            </div>
          </div>
        )}

        {/* OPTIONAL MEASUREMENTS */}
        <div className="bg-linear-to-br from-white to-purple-50/30 rounded-xl p-6 border-2 border-accent/10">
          <h3
            className="text-lg font-bold text-secondary mb-2"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Additional Measurements
          </h3>
          <p
            className="text-sm text-secondary-light mb-4"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Optional - Helpful for precise wardrobe fitting
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Male optional measurements */}
            {isMale && (
              <>
                <Input
                  label="Neck (inches)"
                  type="number"
                  {...register("neck", { valueAsNumber: true })}
                  error={errors.neck?.message}
                  placeholder="15.5"
                />
                <Input
                  label="Sleeve (inches)"
                  type="number"
                  {...register("sleeve", { valueAsNumber: true })}
                  error={errors.sleeve?.message}
                  placeholder="33"
                />
                <Select
                  label="Jacket Size"
                  {...register("jacketSize")}
                  options={MENS_JACKET_SIZES}
                  error={errors.jacketSize?.message}
                />
              </>
            )}

            {/* Female optional measurements */}
            {isFemale && (
              <>
                <Input
                  label="Bust (inches)"
                  type="number"
                  {...register("bust", { valueAsNumber: true })}
                  error={errors.bust?.message}
                  placeholder="36"
                />
                <Input
                  label="Waist (inches)"
                  type="number"
                  {...register("waist", { valueAsNumber: true })}
                  error={errors.waist?.message}
                  placeholder="28"
                />
                <Input
                  label="Hips (inches)"
                  type="number"
                  {...register("hips", { valueAsNumber: true })}
                  error={errors.hips?.message}
                  placeholder="38"
                />
              </>
            )}

            {/* Non-binary can see all measurements */}
            {isNonBinary && (
              <>
                <Input
                  label="Bust (inches)"
                  type="number"
                  {...register("bust", { valueAsNumber: true })}
                  error={errors.bust?.message}
                  placeholder="36"
                />
                <Input
                  label="Waist (inches)"
                  type="number"
                  {...register("waist", { valueAsNumber: true })}
                  error={errors.waist?.message}
                  placeholder="28"
                />
                <Input
                  label="Hips (inches)"
                  type="number"
                  {...register("hips", { valueAsNumber: true })}
                  error={errors.hips?.message}
                  placeholder="38"
                />
                <Input
                  label="Neck (inches)"
                  type="number"
                  {...register("neck", { valueAsNumber: true })}
                  error={errors.neck?.message}
                  placeholder="15.5"
                />
                <Input
                  label="Sleeve (inches)"
                  type="number"
                  {...register("sleeve", { valueAsNumber: true })}
                  error={errors.sleeve?.message}
                  placeholder="33"
                />
                <Select
                  label="Jacket Size"
                  {...register("jacketSize")}
                  options={MENS_JACKET_SIZES}
                  error={errors.jacketSize?.message}
                />
              </>
            )}
          </div>
        </div>

        {/* Helper Text for Non-Binary */}
        {isNonBinary && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <p
              className="text-sm text-secondary-light text-center"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Please provide sizing for at least one category (male or female) to help us match you with appropriate wardrobe options.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            className="flex-1"
          >
            Previous
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Next
          </Button>
        </div>
      </form>
    </div>
  );
}
