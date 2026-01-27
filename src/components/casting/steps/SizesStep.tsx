"use client";

import React from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import RadioGroup from "@/components/ui/RadioGroup";
import { sizesSchema, SizesFormData } from "@/lib/schemas/casting";

interface SizesStepProps {
  data: Partial<SizesFormData>;
  gender?: string;
  onNext: (data: SizesFormData) => void;
  onPrevious: () => void;
}

const SHIRT_SIZES = [
  { value: "", label: "Select Size" },
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "2XL", label: "2XL" },
  { value: "3XL", label: "3XL" },
  { value: "4XL+", label: "4XL+" },
];

const DRESS_SIZES = [
  { value: "", label: "Select Size" },
  ...Array.from({ length: 25 }, (_, i) => ({
    value: String(i * 2),
    label: String(i * 2),
  })),
  { value: "24+", label: "24+" },
  { value: "N/A", label: "N/A" },
];

const SUIT_SIZES = [
  { value: "", label: "Select Size" },
  ...Array.from({ length: 10 }, (_, i) => ({
    value: String((i + 17) * 2),
    label: String((i + 17) * 2),
  })),
  { value: "52+", label: "52+" },
  { value: "N/A", label: "N/A" },
];

const SHOE_GENDER_OPTIONS = [
  { value: "M", label: "Men's" },
  { value: "W", label: "Women's" },
];

export default function SizesStep({ data, gender, onNext, onPrevious }: SizesStepProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SizesFormData>({
    resolver: zodResolver(sizesSchema),
    defaultValues: data,
  });

  const showDressSize = gender === "Female" || gender === "Non-binary";

  const onSubmit = (formData: SizesFormData) => {
    onNext(formData);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-bold text-secondary mb-4"
          style={{ fontFamily: "var(--font-galindo)" }}
        >
          Sizes
        </h2>
        <p
          className="text-base text-secondary-light"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Wardrobe and sizing information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Select
          label="Shirt Size"
          {...register("shirtSize")}
          options={SHIRT_SIZES}
          error={errors.shirtSize?.message}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Pants Waist (inches)"
            type="number"
            {...register("pantsWaist", { valueAsNumber: true })}
            error={errors.pantsWaist?.message}
            placeholder="32"
          />
          <Input
            label="Pants Inseam (inches)"
            type="number"
            {...register("pantsInseam", { valueAsNumber: true })}
            error={errors.pantsInseam?.message}
            placeholder="30"
          />
        </div>

        {showDressSize && (
          <Select
            label="Dress Size"
            {...register("dressSize")}
            options={DRESS_SIZES}
            error={errors.dressSize?.message}
          />
        )}

        <Select
          label="Suit/Jacket Size"
          {...register("suitSize")}
          options={SUIT_SIZES}
          error={errors.suitSize?.message}
        />

        <div className="space-y-3">
          <label
            className="block text-base font-medium text-secondary"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Shoe Size
          </label>
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Size"
              {...register("shoeSize")}
              error={errors.shoeSize?.message}
              placeholder="9.5"
            />
            <Controller
              name="shoeSizeGender"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  label="Gender"
                  options={SHOE_GENDER_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.shoeSizeGender?.message}
                />
              )}
            />
          </div>
        </div>

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
