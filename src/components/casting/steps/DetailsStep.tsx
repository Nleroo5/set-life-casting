"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import RadioGroup from "@/components/ui/RadioGroup";
import { detailsSchema, DetailsFormData } from "@/lib/schemas/casting";

interface DetailsStepProps {
  data: Partial<DetailsFormData>;
  gender?: string;
  onNext: (data: DetailsFormData) => void;
  onPrevious: () => void;
}

const YES_NO_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const FACIAL_HAIR_OPTIONS = [
  { value: "", label: "Select" },
  { value: "Clean Shaven", label: "Clean Shaven" },
  { value: "Stubble", label: "Stubble" },
  { value: "Goatee", label: "Goatee" },
  { value: "Full Beard", label: "Full Beard" },
  { value: "Mustache", label: "Mustache" },
  { value: "N/A", label: "N/A" },
];

export default function DetailsStep({ data, gender, onNext, onPrevious }: DetailsStepProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      gender: gender,
      visibleTattoos: false,
      facialHair: "",
      ...data,
    },
  });

  const visibleTattoos = watch("visibleTattoos");

  // Show facial hair field for male, non-binary, other, but NOT for female
  const showFacialHair = gender !== "Female";

  const onSubmit = (formData: DetailsFormData) => {
    onNext(formData);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-bold text-secondary mb-4"
          style={{ fontFamily: "var(--font-galindo)" }}
        >
          Additional Details
        </h2>
        <p
          className="text-base text-secondary-light"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          A few more details about your appearance
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hidden gender field to ensure validation works */}
        <input type="hidden" {...register("gender")} value={gender} />

        <div className="space-y-4">
          <Controller
            name="visibleTattoos"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="Do you have visible tattoos?"
                options={YES_NO_OPTIONS}
                value={field.value === true ? "true" : "false"}
                onChange={(val) => field.onChange(val === "true")}
                error={errors.visibleTattoos?.message}
              />
            )}
          />

          {visibleTattoos && (
            <Textarea
              label="Please describe your tattoos (location, size, style)"
              {...register("tattoosDescription")}
              error={errors.tattoosDescription?.message}
              placeholder="E.g., Small rose on left forearm, tribal band on right bicep"
              rows={3}
            />
          )}
        </div>

        {showFacialHair && (
          <Select
            label="Facial Hair"
            {...register("facialHair")}
            options={FACIAL_HAIR_OPTIONS}
            error={errors.facialHair?.message}
          />
        )}

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
