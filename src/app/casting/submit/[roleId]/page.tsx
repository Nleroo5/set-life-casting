"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
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

interface Role {
  id: string;
  projectId: string;
  name: string;
  description: string;
  requirements: string;
  bookingStatus: "now-booking" | "booked";
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
  const { user, loading: authLoading } = useAuth();
  const roleId = params.roleId as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Skip Step 1 if user is already authenticated
  useEffect(() => {
    if (!authLoading && user && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [authLoading, user, currentStep]);

  async function fetchRoleData() {
    try {
      const roleDoc = await getDoc(doc(db, "roles", roleId));
      if (!roleDoc.exists()) {
        router.push("/casting");
        return;
      }

      const roleData = { id: roleDoc.id, ...roleDoc.data() } as Role;
      setRole(roleData);

      // Fetch project
      const projectDoc = await getDoc(doc(db, "projects", roleData.projectId));
      if (projectDoc.exists()) {
        setProject({ id: projectDoc.id, ...projectDoc.data() } as Project);
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      router.push("/casting");
    } finally {
      setLoading(false);
    }
  }

  const handleNext = (stepData?: any) => {
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
          photos: formData.photos,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // Create submission record
      await addDoc(collection(db, "submissions"), {
        userId: user.uid,
        roleId: role.id,
        projectId: project.id,
        roleName: role.name,
        projectTitle: project.title,
        status: "pending",
        submittedAt: new Date(),
        profileData: {
          basicInfo: formData.basicInfo,
          appearance: formData.appearance,
          sizes: formData.sizes,
          details: formData.details,
          photos: formData.photos,
        },
      });

      // Redirect to success page
      router.push("/casting/success");
    } catch (error) {
      console.error("Submission error:", error);
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

  if (!role || !project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-secondary mb-2"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Submit for{" "}
            <span className="bg-gradient-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
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
        <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-6 md:p-10 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] mt-8">
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
            />
          )}
        </div>
      </div>
    </div>
  );
}
