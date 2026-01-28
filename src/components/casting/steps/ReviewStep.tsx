"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import { reviewSchema, ReviewFormData } from "@/lib/schemas/casting";
import {
  BasicInfoFormData,
  AppearanceFormData,
  SizesFormData,
  DetailsFormData,
  PhotosFormData,
} from "@/lib/schemas/casting";
import Image from "next/image";

interface ReviewStepProps {
  basicInfo: BasicInfoFormData;
  appearance: AppearanceFormData;
  sizes: SizesFormData;
  details: DetailsFormData;
  photos: PhotosFormData;
  onPrevious: () => void;
  onSubmit: () => Promise<void>;
  isExistingProfile?: boolean;
}

export default function ReviewStep({
  basicInfo,
  appearance,
  sizes,
  details,
  photos,
  onPrevious,
  onSubmit,
  isExistingProfile = false,
}: ReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      confirmContact: false,
    },
  });

  const onFormSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-bold text-secondary mb-4"
          style={{ fontFamily: "var(--font-galindo)" }}
        >
          Review Your Submission
        </h2>
        <p
          className="text-base text-secondary-light"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Please review all information before submitting
        </p>
      </div>

      {isExistingProfile && (
        <div className="mb-6 p-4 bg-linear-to-r from-green-50 to-blue-50 border-2 border-green-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3
                className="text-lg font-semibold text-secondary mb-1"
                style={{ fontFamily: "var(--font-galindo)" }}
              >
                Using Your Existing Profile
              </h3>
              <p
                className="text-sm text-secondary-light"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                We've loaded your saved profile information. Review it below and click "Submit Application" to apply for this role.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <ReviewSection title="Basic Information">
          <ReviewItem label="Name" value={`${basicInfo.firstName} ${basicInfo.lastName}`} />
          <ReviewItem label="Phone" value={basicInfo.phone} />
          <ReviewItem label="Email" value={basicInfo.email} />
          <ReviewItem label="Location" value={`${basicInfo.city}, ${basicInfo.state}`} />
        </ReviewSection>

        {/* Appearance */}
        <ReviewSection title="Appearance">
          <ReviewItem label="Gender" value={appearance.gender} />
          <ReviewItem label="Date of Birth" value={appearance.dateOfBirth} />
          <ReviewItem label="Ethnicity" value={appearance.ethnicity.join(", ")} />
          <ReviewItem label="Height" value={appearance.height} />
          <ReviewItem label="Weight" value={`${appearance.weight} lbs`} />
          <ReviewItem label="Hair" value={`${appearance.hairColor} (${appearance.hairLength})`} />
          <ReviewItem label="Eyes" value={appearance.eyeColor} />
        </ReviewSection>

        {/* Sizes */}
        <ReviewSection title="Sizes">
          <ReviewItem label="Shirt" value={sizes.shirtSize} />
          <ReviewItem label="Pants" value={`Waist: ${sizes.pantsWaist}" / Inseam: ${sizes.pantsInseam}"`} />
          {sizes.dressSize && <ReviewItem label="Dress" value={sizes.dressSize} />}
          {sizes.suitSize && <ReviewItem label="Suit" value={sizes.suitSize} />}
          <ReviewItem label="Shoe" value={`${sizes.shoeSize} (${sizes.shoeSizeGender})`} />
        </ReviewSection>

        {/* Additional Details */}
        <ReviewSection title="Additional Details">
          <ReviewItem
            label="Visible Tattoos"
            value={details.visibleTattoos ? "Yes" : "No"}
          />
          {details.visibleTattoos && details.tattoosDescription && (
            <ReviewItem label="Tattoos Description" value={details.tattoosDescription} />
          )}
          <ReviewItem
            label="Piercings (other than ears)"
            value={details.piercings ? "Yes" : "No"}
          />
          {details.piercings && details.piercingsDescription && (
            <ReviewItem label="Piercings Description" value={details.piercingsDescription} />
          )}
          <ReviewItem label="Facial Hair" value={details.facialHair} />
        </ReviewSection>

        {/* Photos */}
        <ReviewSection title="Photos">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-accent/30">
                <Image
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-accent/90 px-2 py-1">
                  <p className="text-xs text-white text-center capitalize">
                    {photo.type === "fullbody" ? "Full Body" : photo.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ReviewSection>

        {/* Confirmation Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-accent/30 rounded-xl p-6 space-y-4">
            <h3
              className="text-lg font-semibold text-secondary mb-4"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              Confirmation
            </h3>

            <Controller
              name="confirmContact"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="I consent to being contacted for casting opportunities that match my profile"
                  checked={field.value}
                  onChange={field.onChange}
                  error={errors.confirmContact?.message}
                />
              )}
            />

            {errors.confirmContact && (
              <p className="text-danger text-sm mt-2">
                Please confirm to submit
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              className="flex-1"
              disabled={isSubmitting}
            >
              Previous
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ReviewSectionProps {
  title: string;
  children: React.ReactNode;
}

function ReviewSection({ title, children }: ReviewSectionProps) {
  return (
    <div className="bg-white border-2 border-accent/20 rounded-xl p-6">
      <h3
        className="text-xl font-semibold text-secondary mb-4 pb-3 border-b border-accent/20"
        style={{ fontFamily: "var(--font-galindo)" }}
      >
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface ReviewItemProps {
  label: string;
  value: string;
}

function ReviewItem({ label, value }: ReviewItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <dt
        className="text-sm font-medium text-secondary-light sm:w-1/3"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {label}:
      </dt>
      <dd
        className="text-base text-secondary sm:w-2/3"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {value}
      </dd>
    </div>
  );
}
