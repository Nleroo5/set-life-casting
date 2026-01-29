"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import BasicInfoStep from "@/components/casting/steps/BasicInfoStep";
import AppearanceStep from "@/components/casting/steps/AppearanceStep";
import SizesStep from "@/components/casting/steps/SizesStep";
import DetailsStep from "@/components/casting/steps/DetailsStep";
import PhotosStep from "@/components/casting/steps/PhotosStep";
import { useAuth } from "@/contexts/AuthContext";
import {
  BasicInfoFormData,
  AppearanceFormData,
  SizesFormData,
  DetailsFormData,
  PhotosFormData,
} from "@/lib/schemas/casting";
import { logger } from "@/lib/logger";

const steps = [
  { number: 1, title: "Basic Info" },
  { number: 2, title: "Appearance" },
  { number: 3, title: "Sizes" },
  { number: 4, title: "Details" },
  { number: 5, title: "Photos" },
];

// Helper function to clean data for Firestore (convert undefined to null)
function cleanDataForFirestore<T extends Record<string, unknown>>(data: T): T {
  const cleaned = { ...data };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      cleaned[key] = null;
    }
  });
  return cleaned;
}

export default function CreateProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form data state
  const [formData, setFormData] = useState({
    basicInfo: {} as Partial<BasicInfoFormData>,
    appearance: {} as Partial<AppearanceFormData>,
    sizes: {} as Partial<SizesFormData>,
    details: {} as Partial<DetailsFormData>,
    photos: {} as Partial<PhotosFormData>,
  });

  const [isEditing, setIsEditing] = useState(false);

  // Load existing profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const profileDoc = await getDoc(doc(db, "profiles", user.uid));
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          setFormData({
            basicInfo: profileData.basicInfo || {},
            appearance: profileData.appearance || {},
            sizes: profileData.sizes || {},
            details: profileData.details || {},
            photos: profileData.photos || {},
          });
          setIsEditing(true); // Profile exists, so this is an edit
        }
      } catch (error) {
        logger.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      loadProfile();
    } else if (!authLoading && !user) {
      router.push("/login?redirect=/profile/create");
    }
  }, [authLoading, user, router]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const handleNext = async (stepData?: Record<string, unknown>) => {
    // Save step data
    if (stepData) {
      const stepKey = getCurrentStepKey();
      if (stepKey) {
        const updatedFormData = {
          ...formData,
          [stepKey]: stepData,
        };
        setFormData(updatedFormData);

        // Auto-save progress to Firebase
        if (user) {
          try {
            // Build update object with step data (clean undefined values)
            const updateData: Record<string, unknown> = {
              userId: user.uid,
              email: user.email,
              displayName: user.displayName,
              [stepKey]: cleanDataForFirestore(stepData as Record<string, unknown>),
              updatedAt: new Date(),
            };

            // ✅ Also update physical field if appearance, sizes, or details changed
            if (stepKey === "appearance" || stepKey === "sizes" || stepKey === "details") {
              const physical = {
                // From appearance
                gender: (stepKey === "appearance" ? stepData?.gender : updatedFormData.appearance?.gender) || null,
                ethnicity: (stepKey === "appearance" ? stepData?.ethnicity : updatedFormData.appearance?.ethnicity) || null,
                height: (stepKey === "appearance" ? stepData?.height : updatedFormData.appearance?.height) || null,
                weight: (stepKey === "appearance" ? stepData?.weight : updatedFormData.appearance?.weight) || null,
                hairColor: (stepKey === "appearance" ? stepData?.hairColor : updatedFormData.appearance?.hairColor) || null,
                hairLength: (stepKey === "appearance" ? stepData?.hairLength : updatedFormData.appearance?.hairLength) || null,
                eyeColor: (stepKey === "appearance" ? stepData?.eyeColor : updatedFormData.appearance?.eyeColor) || null,
                dateOfBirth: (stepKey === "appearance" ? stepData?.dateOfBirth : updatedFormData.appearance?.dateOfBirth) || null,
                // From sizes (gender-conditional)
                shirtSize: (stepKey === "sizes" ? stepData?.shirtSize : updatedFormData.sizes?.shirtSize) || null,
                pantWaist: (stepKey === "sizes" ? stepData?.pantWaist : updatedFormData.sizes?.pantWaist) || null,
                pantInseam: (stepKey === "sizes" ? stepData?.pantInseam : updatedFormData.sizes?.pantInseam) || null,
                dressSize: (stepKey === "sizes" ? stepData?.dressSize : updatedFormData.sizes?.dressSize) || null,
                womensPantSize: (stepKey === "sizes" ? stepData?.womensPantSize : updatedFormData.sizes?.womensPantSize) || null,
                shoeSize: (stepKey === "sizes" ? stepData?.shoeSize : updatedFormData.sizes?.shoeSize) || null,
                // Optional measurements
                bust: (stepKey === "sizes" ? stepData?.bust : updatedFormData.sizes?.bust) || null,
                waist: (stepKey === "sizes" ? stepData?.waist : updatedFormData.sizes?.waist) || null,
                hips: (stepKey === "sizes" ? stepData?.hips : updatedFormData.sizes?.hips) || null,
                neck: (stepKey === "sizes" ? stepData?.neck : updatedFormData.sizes?.neck) || null,
                sleeve: (stepKey === "sizes" ? stepData?.sleeve : updatedFormData.sizes?.sleeve) || null,
                jacketSize: (stepKey === "sizes" ? stepData?.jacketSize : updatedFormData.sizes?.jacketSize) || null,
                // From details
                visibleTattoos: (stepKey === "details" ? stepData?.visibleTattoos : updatedFormData.details?.visibleTattoos) || false,
                tattoosDescription: (stepKey === "details" ? stepData?.tattoosDescription : updatedFormData.details?.tattoosDescription) || null,
                facialHair: (stepKey === "details" ? stepData?.facialHair : updatedFormData.details?.facialHair) || null,
              };
              updateData.physical = physical;
            }

            await setDoc(
              doc(db, "profiles", user.uid),
              updateData,
              { merge: true }
            );
          } catch (error) {
            logger.error("Error saving progress:", error);
          }
        }
      }
    }

    if (currentStep === 5) {
      // Last step - submit the profile
      handleSubmit();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getCurrentStepKey = (): keyof typeof formData | null => {
    switch (currentStep) {
      case 1:
        return "basicInfo";
      case 2:
        return "appearance";
      case 3:
        return "sizes";
      case 4:
        return "details";
      case 5:
        return "photos";
      default:
        return null;
    }
  };

  const handleSubmit = async (photosData?: PhotosFormData) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    setIsSubmitting(true);

    // Use provided photosData if available, otherwise use formData.photos
    const finalPhotos = photosData || formData.photos;

    // Validate that photos exist
    if (!finalPhotos || !finalPhotos.photos || finalPhotos.photos.length < 2) {
      logger.error("Insufficient photos:", finalPhotos);
      alert("Please upload at least a headshot and full body photo before submitting.");
      setIsSubmitting(false);
      return;
    }

    logger.debug("Submitting profile with photos:", finalPhotos);

    try {
      // ✅ CRITICAL: Create consolidated "physical" field for easy searching
      // This combines all searchable physical attributes into one place
      const physical = {
        // From appearance
        gender: formData.appearance?.gender || null,
        ethnicity: formData.appearance?.ethnicity || null,
        height: formData.appearance?.height || null,
        weight: formData.appearance?.weight || null,
        hairColor: formData.appearance?.hairColor || null,
        hairLength: formData.appearance?.hairLength || null,
        eyeColor: formData.appearance?.eyeColor || null,
        dateOfBirth: formData.appearance?.dateOfBirth || null,
        // From sizes (gender-conditional)
        shirtSize: formData.sizes?.shirtSize || null,
        pantWaist: formData.sizes?.pantWaist || null,
        pantInseam: formData.sizes?.pantInseam || null,
        dressSize: formData.sizes?.dressSize || null,
        womensPantSize: formData.sizes?.womensPantSize || null,
        shoeSize: formData.sizes?.shoeSize || null,
        // Optional measurements
        bust: formData.sizes?.bust || null,
        waist: formData.sizes?.waist || null,
        hips: formData.sizes?.hips || null,
        neck: formData.sizes?.neck || null,
        sleeve: formData.sizes?.sleeve || null,
        jacketSize: formData.sizes?.jacketSize || null,
        // From details
        visibleTattoos: formData.details?.visibleTattoos || false,
        tattoosDescription: formData.details?.tattoosDescription || null,
        facialHair: formData.details?.facialHair || null,
      };

      logger.debug("✅ Consolidated physical attributes:", physical);

      // Create/update user profile with ALL data structures
      await setDoc(
        doc(db, "profiles", user.uid),
        {
          userId: user.uid,
          email: user.email,
          displayName: user.displayName,
          // Keep original structure for form editing (clean undefined values)
          basicInfo: formData.basicInfo,
          appearance: formData.appearance,
          sizes: cleanDataForFirestore(formData.sizes as Record<string, unknown>),
          details: formData.details,
          photos: finalPhotos,
          // ✅ NEW: Add consolidated "physical" field for searching & skins export
          physical: physical,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );

      logger.debug("✅ Profile successfully saved to Firebase with searchable physical data");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      logger.error("Profile creation error:", error);
      alert("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
          <p
            className="mt-4 text-lg text-secondary"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-100 via-pink-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-secondary mb-2"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            {isEditing ? "Edit Your" : "Create Your"}{" "}
            <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Profile
            </span>
          </h1>
          <p
            className="text-base text-secondary-light"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {isEditing
              ? "Update your profile information"
              : "Complete your profile to start submitting for casting calls"}
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator steps={steps} currentStep={currentStep} />

        {/* Form Steps */}
        <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 md:p-10 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] mt-8">
          {currentStep === 1 && (
            <BasicInfoStep
              data={formData.basicInfo}
              onNext={(data) => handleNext(data)}
              onPrevious={() => router.push("/dashboard")}
            />
          )}

          {currentStep === 2 && (
            <AppearanceStep
              data={formData.appearance}
              onNext={(data) => handleNext(data)}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 3 && (
            <SizesStep
              data={formData.sizes}
              gender={formData.appearance.gender}
              onNext={(data) => handleNext(data)}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 4 && (
            <DetailsStep
              data={formData.details}
              gender={formData.appearance.gender}
              onNext={(data) => handleNext(data)}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 5 && (
            <div>
              <PhotosStep
                data={formData.photos}
                onNext={(data) => {
                  setFormData((prev) => ({ ...prev, photos: data }));
                  // Pass photos data directly to handleSubmit to avoid closure issue
                  handleSubmit(data);
                }}
                onPrevious={handlePrevious}
              />
              {isSubmitting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-8 text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent mb-4"></div>
                    <p className="text-secondary font-semibold">
                      {isEditing ? "Updating your profile..." : "Creating your profile..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
