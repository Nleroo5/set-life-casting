"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProfile, createProfile } from "@/lib/supabase/profiles";
import { getRole, getProject } from "@/lib/supabase/casting";
import { createSubmission } from "@/lib/supabase/submissions";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import AccountStep from "@/components/casting/steps/AccountStep";
import BasicInfoStep from "@/components/casting/steps/BasicInfoStep";
import AppearanceStep from "@/components/casting/steps/AppearanceStep";
import SizesStep from "@/components/casting/steps/SizesStep";
import DetailsStep from "@/components/casting/steps/DetailsStep";
import PhotosStep from "@/components/casting/steps/PhotosStep";
import ReviewStep from "@/components/casting/steps/ReviewStep";
import { useAuth } from "@/contexts/AuthContext";
import {
  BasicInfoFormData,
  AppearanceFormData,
  SizesFormData,
  DetailsFormData,
  PhotosFormData,
} from "@/lib/schemas/casting";
import { logger } from "@/lib/logger";

interface Role {
  id: string;
  projectId: string;
  name: string;
  requirements: string;
  rate: string;
  bookingDates: string[]; // Array of ISO date strings for multiple booking dates
  location: string;
  bookingStatus: "booking" | "booked";
  additionalNotes?: string;
  referenceImageUrl?: string;
}

interface Project {
  id: string;
  title: string;
  type: string;
  location: string;
  shootDates: string;
}

const steps = [
  { number: 1, title: "Account" },
  { number: 2, title: "Basic Info" },
  { number: 3, title: "Appearance" },
  { number: 4, title: "Sizes" },
  { number: 5, title: "Details" },
  { number: 6, title: "Photos" },
  { number: 7, title: "Review" },
];

export default function SubmitPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const roleId = params.roleId as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    basicInfo: {} as Partial<BasicInfoFormData>,
    appearance: {} as Partial<AppearanceFormData>,
    sizes: {} as Partial<SizesFormData>,
    details: {} as Partial<DetailsFormData>,
    photos: {} as Partial<PhotosFormData>,
  });

  useEffect(() => {
    fetchRoleData();
  }, [roleId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Redirect admins to admin page - they don't need to submit for roles
  useEffect(() => {
    if (!authLoading && isAdmin) {
      router.push("/admin/casting");
    }
  }, [authLoading, isAdmin, router]);

  // Require email verification before submitting
  useEffect(() => {
    if (!authLoading && user && !user.email_confirmed_at && !isAdmin) {
      alert("Please verify your email address before submitting for roles. Check your inbox for the verification link.");
      router.push("/dashboard");
    }
  }, [authLoading, user, isAdmin, router]);

  // Check for existing profile and either skip to review or skip Step 1
  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      checkExistingProfile();
    }
  }, [authLoading, user, isAdmin]);

  async function checkExistingProfile() {
    if (!user) return;

    try {
      const { data: profileData, error } = await getProfile(user.id);

      if (error) {
        logger.error("Error loading profile:", error);
        if (currentStep === 1) {
          setCurrentStep(2);
        }
        return;
      }

      if (profileData) {
        // Check if profile has all required data
        const hasCompleteProfile =
          profileData.basicInfo &&
          profileData.appearance &&
          profileData.sizes &&
          profileData.details &&
          profileData.photos;

        if (hasCompleteProfile) {
          // Load existing profile data
          setFormData({
            basicInfo: profileData.basicInfo || {},
            appearance: profileData.appearance || {},
            sizes: profileData.sizes || {},
            details: profileData.details || {},
            photos: profileData.photos || {},
          });
          setHasExistingProfile(true);
          setCurrentStep(7); // Skip directly to review
        } else {
          // Incomplete profile, start from step 2
          setFormData({
            basicInfo: profileData.basicInfo || {},
            appearance: profileData.appearance || {},
            sizes: profileData.sizes || {},
            details: profileData.details || {},
            photos: profileData.photos || {},
          });
          setCurrentStep(2);
        }
      } else if (currentStep === 1) {
        // No profile, skip to step 2 (basic info)
        setCurrentStep(2);
      }
    } catch (error) {
      logger.error("Error checking profile:", error);
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    }
  }

  // Duplicate submission prevention is handled by database UNIQUE constraint
  // on (user_id, role_id) in Supabase submissions table

  async function fetchRoleData() {
    try {
      const { data: roleData, error: roleError } = await getRole(roleId, true);

      if (roleError || !roleData) {
        logger.error("Error fetching role:", roleError);
        router.push("/casting");
        return;
      }

      setRole(roleData as any); // Cast to Role interface (old Firebase structure)

      // Get project data
      if ((roleData as any).project_id) {
        const { data: projectData, error: projectError } = await getProject((roleData as any).project_id);
        if (projectData && !projectError) {
          setProject(projectData as any); // Cast to Project interface
        }
      }
    } catch (error) {
      logger.error("Error fetching role:", error);
      router.push("/casting");
    } finally {
      setLoading(false);
    }
  }

  const handleNext = (stepData?: Record<string, unknown>) => {
    // Save step data
    if (stepData) {
      const stepKey = getCurrentStepKey();
      if (stepKey) {
        setFormData((prev) => ({
          ...prev,
          [stepKey]: stepData,
        }));
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getCurrentStepKey = (): keyof typeof formData | null => {
    switch (currentStep) {
      case 2:
        return "basicInfo";
      case 3:
        return "appearance";
      case 4:
        return "sizes";
      case 5:
        return "details";
      case 6:
        return "photos";
      default:
        return null;
    }
  };

  const handleFinalSubmit = async () => {
    if (!user || !role || !project) {
      throw new Error("Missing required data");
    }

    try {
      // Create/update user profile in Supabase
      const { data: profileResult, error: profileError } = await createProfile(user.id, {
        basicInfo: formData.basicInfo,
        appearance: formData.appearance,
        sizes: formData.sizes,
        details: formData.details,
        profileComplete: true,
        lastStepCompleted: 7,
      });

      if (profileError) {
        logger.error("Profile creation error:", profileError);
        throw new Error("Failed to save profile");
      }

      if (!profileResult) {
        throw new Error("Profile creation returned no data");
      }

      const profileId = profileResult.id;

      // Create submission record
      // Note: Database UNIQUE constraint on (user_id, role_id) prevents duplicates
      const { error: submissionError } = await createSubmission(
        user.id,
        profileId,
        role.id,
        project.id,
        {
          preferred_contact: 'email',
        }
      );

      if (submissionError) {
        // Check for PostgreSQL unique violation (duplicate submission)
        if ((submissionError as any).code === '23505') {
          alert("You have already submitted for this role.");
          router.push("/dashboard");
          return;
        }

        logger.error("Submission error:", submissionError);
        throw new Error("Failed to create submission");
      }

      logger.debug("✅ Submission created successfully");

      // Redirect to success page
      router.push("/casting/success");
    } catch (error) {
      logger.error("Submission error:", error);
      throw error;
    }
  };

  if (loading || authLoading) {
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

  // Admins will be redirected, show nothing while redirecting
  if (isAdmin) {
    return null;
  }

  if (!role || !project) {
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
            Submit for{" "}
            <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {role.name}
            </span>
          </h1>
          <p
            className="text-base text-secondary-light"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {project.title} • {project.type}
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator steps={steps} currentStep={currentStep} />

        {/* Form Steps */}
        <div className="bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-6 md:p-10 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] mt-8">
          {currentStep === 1 && <AccountStep onNext={() => handleNext()} />}

          {currentStep === 2 && (
            <BasicInfoStep
              data={formData.basicInfo}
              onNext={(data) => handleNext(data)}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 3 && (
            <AppearanceStep
              data={formData.appearance}
              onNext={(data) => handleNext(data)}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 4 && (
            <SizesStep
              data={formData.sizes}
              gender={formData.appearance.gender}
              onNext={(data) => handleNext(data)}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 5 && (
            <DetailsStep
              data={formData.details}
              gender={formData.appearance.gender}
              onNext={(data) => handleNext(data)}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 6 && (
            <PhotosStep
              data={formData.photos}
              onNext={(data) => handleNext(data)}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 7 && (
            <ReviewStep
              basicInfo={formData.basicInfo as BasicInfoFormData}
              appearance={formData.appearance as AppearanceFormData}
              sizes={formData.sizes as SizesFormData}
              details={formData.details as DetailsFormData}
              photos={formData.photos as PhotosFormData}
              onPrevious={handlePrevious}
              onSubmit={handleFinalSubmit}
              isExistingProfile={hasExistingProfile}
            />
          )}
        </div>
      </div>
    </div>
  );
}
