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
        console.error("Error loading profile:", error);
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

  const handleNext = async (stepData?: any) => {
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
            await setDoc(
              doc(db, "profiles", user.uid),
              {
                userId: user.uid,
                email: user.email,
                displayName: user.displayName,
                [stepKey]: stepData,
                updatedAt: new Date(),
              },
              { merge: true }
            );
          } catch (error) {
            console.error("Error saving progress:", error);
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
      console.error("Insufficient photos:", finalPhotos);
      alert("Please upload at least a headshot and full body photo before submitting.");
      setIsSubmitting(false);
      return;
    }

    console.log("Submitting profile with photos:", finalPhotos);

    try {
      // Create/update user profile
      await setDoc(
        doc(db, "profiles", user.uid),
        {
          userId: user.uid,
          email: user.email,
          displayName: user.displayName,
          basicInfo: formData.basicInfo,
          appearance: formData.appearance,
          sizes: formData.sizes,
          details: formData.details,
          photos: finalPhotos,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );

      console.log("Profile successfully saved to Firebase");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Profile creation error:", error);
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
