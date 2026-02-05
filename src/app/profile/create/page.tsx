"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfile, updateProfileStep, createProfile } from "@/lib/supabase/profiles";
import { linkPhotosToProfile } from "@/lib/supabase/photos";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import EmailVerificationBanner from "@/components/ui/EmailVerificationBanner";
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
    let isMounted = true;

    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data: profileData, error } = await getProfile(user.id);

        // Only update state if component is still mounted
        if (!isMounted) return;

        if (error) {
          logger.error("Error loading profile:", error);
        } else if (profileData) {
          // Profile exists - populate form
          // Note: Photos are stored separately in photos table (not part of ProfileData)
          // Type casting needed due to mismatch between ProfileData and form schema types
          setFormData({
            basicInfo: profileData.basicInfo || {},
            appearance: profileData.appearance || {},
            sizes: (profileData.sizes || {}) as any,
            details: (profileData.details || {}) as any,
            photos: {}, // Photos fetched separately by PhotosStep component
          });
          setIsEditing(true); // Profile exists, so this is an edit
        }
      } catch (error) {
        if (isMounted) {
          logger.error("Error loading profile:", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (!authLoading && user) {
      // Check email verification before allowing profile creation
      if (!user.email_confirmed_at) {
        // Allow loading profile for display, but block submission
        // User will see banner to verify email
      }
      loadProfile();
    } else if (!authLoading && !user) {
      router.push("/login?redirect=/profile/create");
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
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
        // Use consistent updater function pattern
        setFormData((prev) => ({
          ...prev,
          [stepKey]: stepData,
        }));

        // Auto-save progress to Supabase (not for photos - they're already saved)
        if (user && stepKey !== 'photos') {
          try {
            const { error } = await updateProfileStep(
              user.id,
              stepKey as 'basicInfo' | 'appearance' | 'sizes' | 'details',
              stepData
            );

            if (error) {
              logger.error("❌ Auto-save failed:", error);
              // Show user-friendly notification
              console.warn("⚠️ Your changes were not saved automatically. Please try again.");
            } else {
              logger.debug(`✅ Auto-saved ${stepKey} to Supabase`);
            }
          } catch (error) {
            logger.error("❌ Auto-save error:", error);
            console.warn("⚠️ Your changes were not saved automatically. Please try again.");
          }
        }
      }
    }

    // Move to next step (photos step handles submission directly)
    if (currentStep < 5) {
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

    // ✅ CRITICAL SECURITY: Enforce email verification
    if (!user.email_confirmed_at) {
      alert("Please verify your email address before submitting your profile. Check your inbox for the verification link.");
      setIsSubmitting(false);
      return;
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

    // Validate headshot and full body photos are present
    const hasHeadshot = finalPhotos.photos.some((p) => p.type === "headshot");
    const hasFullBody = finalPhotos.photos.some((p) => p.type === "fullbody");

    if (!hasHeadshot) {
      logger.error("Missing headshot photo");
      alert("Headshot photo is required. Please upload a headshot before submitting.");
      setIsSubmitting(false);
      return;
    }

    if (!hasFullBody) {
      logger.error("Missing full body photo");
      alert("Full body photo is required. Please upload a full body photo before submitting.");
      setIsSubmitting(false);
      return;
    }

    logger.debug("Submitting profile with photos:", finalPhotos);

    try {
      // Transform appearance data to match database schema
      // Height needs to be split from string "5'10"" to feet: 5, inches: 10
      // Weight needs to move from appearance to sizes
      let heightFeet: number | undefined;
      let heightInches: number | undefined;
      let weight: number | undefined;

      // Parse height string like "5'10"" into feet and inches
      if (formData.appearance.height) {
        const heightMatch = formData.appearance.height.match(/^(\d+)'(\d+)"?$/);
        if (heightMatch) {
          heightFeet = parseInt(heightMatch[1], 10);
          heightInches = parseInt(heightMatch[2], 10);
        }
      }

      // Get weight from appearance data
      if (formData.appearance.weight) {
        weight = formData.appearance.weight;
      }

      // Create/update user profile in Supabase
      const { data, error } = await createProfile(user.id, {
        basicInfo: formData.basicInfo,
        appearance: {
          ...formData.appearance,
          // Remove height/weight from appearance as they're being moved to sizes
          height: undefined,
          weight: undefined,
        },
        sizes: {
          ...formData.sizes,
          // Add parsed height and weight to sizes
          heightFeet,
          heightInches,
          weight,
        } as any,
        details: formData.details as any,
        profileComplete: true,
        lastStepCompleted: 5,
      });

      if (error) {
        logger.error("❌ Supabase createProfile error:", error);
        throw error;
      }

      if (!data) {
        logger.error("❌ No data returned from createProfile");
        throw new Error("Profile creation returned no data");
      }

      logger.debug("✅ Profile successfully saved to Supabase:", data);

      // Link photos to the newly created profile
      const { data: linkedPhotos, error: linkError } = await linkPhotosToProfile(user.id, data.id);

      if (linkError) {
        logger.error("❌ Failed to link photos to profile:", linkError);
        // Continue anyway - photos exist but not linked to profile
        // User can re-submit or admin can fix manually
      } else {
        logger.debug(`✅ Successfully linked ${linkedPhotos?.length || 0} photos to profile`);
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      logger.error("❌ Profile creation error (full details):", {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        formData: {
          hasBasicInfo: !!formData.basicInfo,
          hasAppearance: !!formData.appearance,
          hasSizes: !!formData.sizes,
          hasDetails: !!formData.details,
          photoCount: finalPhotos?.photos?.length || 0,
        },
      });

      // User-friendly error messages
      let userMessage = "Unable to save your profile. ";

      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes("network") || error.message.includes("fetch")) {
          userMessage += "Please check your internet connection and try again.";
        } else if (error.message.includes("email")) {
          userMessage += "There's an issue with your email. Please verify your email address.";
        } else if (error.message.includes("photo")) {
          userMessage += "There's an issue with your photos. Please re-upload them.";
        } else {
          userMessage += "Please try again or contact support if the problem persists.";
        }
      } else {
        userMessage += "Please try again or contact support if the problem persists.";
      }

      alert(userMessage);
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

        {/* Email Verification Banner */}
        <EmailVerificationBanner />

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
