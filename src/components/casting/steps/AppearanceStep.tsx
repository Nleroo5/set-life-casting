"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import RadioGroup from "@/components/ui/RadioGroup";
import MultiSelect from "@/components/ui/MultiSelect";
import HeightSelect from "@/components/ui/HeightSelect";
import DatePicker from "@/components/ui/DatePicker";
import { appearanceSchema, AppearanceFormData } from "@/lib/schemas/casting";

interface AppearanceStepProps {
  data: Partial<AppearanceFormData>;
  onNext: (data: AppearanceFormData) => void;
  onPrevious: () => void;
}

// Generate height options from 2'6" to 7'2"
// Order: placeholder, then 5'0"-7'2", then 2'6"-4'11" (so 5'0" shows first when opened)
const generateHeightOptions = () => {
  const options = [{ value: "", label: "Select Height" }];

  // First add 5'0" to 7'2" (taller heights)
  for (let feet = 5; feet <= 7; feet++) {
    const maxInches = feet === 7 ? 2 : 11;
    for (let inches = 0; inches <= maxInches; inches++) {
      options.push({
        value: `${feet}'${inches}"`,
        label: `${feet}'${inches}"`,
      });
    }
  }

  // Then add separator
  options.push({ value: "---", label: "───── Shorter Heights ─────" });

  // Then add 2'6" to 4'11" (shorter heights)
  for (let feet = 2; feet <= 4; feet++) {
    const maxInches = 11;
    for (let inches = 0; inches <= maxInches; inches++) {
      if (feet === 2 && inches < 6) continue;
      options.push({
        value: `${feet}'${inches}"`,
        label: `${feet}'${inches}"`,
      });
    }
  }

  return options;
};

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Other", label: "Other" },
];

const ETHNICITY_OPTIONS = [
  { value: "Caucasian", label: "Caucasian" },
  { value: "African American", label: "African American" },
  { value: "Hispanic/Latino", label: "Hispanic/Latino" },
  { value: "Asian", label: "Asian" },
  { value: "Middle Eastern", label: "Middle Eastern" },
  { value: "Native American", label: "Native American" },
  { value: "Pacific Islander", label: "Pacific Islander" },
  { value: "Mixed", label: "Mixed" },
  { value: "Other", label: "Other" },
];

const HAIR_COLOR_OPTIONS = [
  { value: "", label: "Select Hair Color" },
  { value: "Black", label: "Black" },
  { value: "Brown", label: "Brown" },
  { value: "Blonde", label: "Blonde" },
  { value: "Red", label: "Red" },
  { value: "Gray", label: "Gray" },
  { value: "White", label: "White" },
  { value: "Bald", label: "Bald" },
  { value: "Other", label: "Other" },
];

const HAIR_LENGTH_OPTIONS = [
  { value: "", label: "Select Hair Length" },
  { value: "Bald", label: "Bald" },
  { value: "Buzz", label: "Buzz" },
  { value: "Short", label: "Short" },
  { value: "Medium", label: "Medium" },
  { value: "Long", label: "Long" },
];

const EYE_COLOR_OPTIONS = [
  { value: "", label: "Select Eye Color" },
  { value: "Brown", label: "Brown" },
  { value: "Blue", label: "Blue" },
  { value: "Green", label: "Green" },
  { value: "Hazel", label: "Hazel" },
  { value: "Gray", label: "Gray" },
  { value: "Other", label: "Other" },
];

export default function AppearanceStep({ data, onNext, onPrevious }: AppearanceStepProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AppearanceFormData>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: data,
  });

  const onSubmit = (formData: AppearanceFormData) => {
    onNext(formData);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-bold text-secondary mb-4"
          style={{ fontFamily: "var(--font-galindo)" }}
        >
          Physical Appearance
        </h2>
        <p
          className="text-base text-secondary-light"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Help us match you to the right roles
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <RadioGroup
              label="Gender"
              options={GENDER_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.gender?.message}
            />
          )}
        />

        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Date of Birth"
              value={field.value}
              onChange={field.onChange}
              name={field.name}
              error={errors.dateOfBirth?.message}
              placeholder="Select your date of birth"
              maxDate={new Date()}
            />
          )}
        />

        <Controller
          name="ethnicity"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Ethnicity"
              options={ETHNICITY_OPTIONS}
              value={field.value || []}
              onChange={field.onChange}
              error={errors.ethnicity?.message}
            />
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <Controller
            name="height"
            control={control}
            render={({ field }) => (
              <HeightSelect
                label="Height"
                value={field.value}
                onChange={field.onChange}
                name={field.name}
                error={errors.height?.message}
              />
            )}
          />
          <Input
            label="Weight (lbs)"
            type="number"
            {...register("weight", { valueAsNumber: true })}
            error={errors.weight?.message}
            placeholder="150"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Select
            label="Hair Color"
            {...register("hairColor")}
            options={HAIR_COLOR_OPTIONS}
            error={errors.hairColor?.message}
          />
          <Select
            label="Hair Length"
            {...register("hairLength")}
            options={HAIR_LENGTH_OPTIONS}
            error={errors.hairLength?.message}
          />
        </div>

        <Select
          label="Eye Color"
          {...register("eyeColor")}
          options={EYE_COLOR_OPTIONS}
          error={errors.eyeColor?.message}
        />

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
