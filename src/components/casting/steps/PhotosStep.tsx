"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import Button from "@/components/ui/Button";
import { photosSchema, PhotosFormData } from "@/lib/schemas/casting";
import { useAuth } from "@/contexts/AuthContext";
import { uploadPhoto, savePhotoMetadata, getPhotosByUserId, deletePhoto } from "@/lib/supabase/photos";
import Image from "next/image";
import { logger } from "@/lib/logger";

interface PhotosStepProps {
  data: Partial<PhotosFormData>;
  onNext: (data: PhotosFormData) => void;
  onPrevious: () => void;
}

interface PhotoSlot {
  id: string;
  type: "headshot" | "fullbody" | "additional";
  label: string;
  required: boolean;
  file?: File;
  preview?: string;
  url?: string;
  photoId?: string; // Database photo ID for deletion
  storagePath?: string; // Storage path for deletion
  uploading?: boolean;
  error?: string;
}

export default function PhotosStep({ data, onNext, onPrevious }: PhotosStepProps) {
  const { user } = useAuth();
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PhotosFormData>({
    resolver: zodResolver(photosSchema),
    defaultValues: data,
  });

  // Watch the photos field to debug validation
  const currentPhotos = watch("photos");

  // Log validation errors whenever they change
  useEffect(() => {
    if (errors.photos) {
      logger.error("❌ PhotosStep validation errors:", errors.photos);
    }
  }, [errors]);

  // Log current photos state for debugging
  useEffect(() => {
    logger.debug("📸 Current photos state:", {
      photoCount: currentPhotos?.length || 0,
      photos: currentPhotos?.map(p => ({ type: p.type, hasUrl: !!p.url })),
    });
  }, [currentPhotos]);

  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>([
    { id: "headshot", type: "headshot", label: "Headshot", required: true },
    { id: "fullbody", type: "fullbody", label: "Full Body", required: true },
    { id: "additional-1", type: "additional", label: "Additional Photo 1", required: false },
    { id: "additional-2", type: "additional", label: "Additional Photo 2", required: false },
    { id: "additional-3", type: "additional", label: "Additional Photo 3", required: false },
    { id: "additional-4", type: "additional", label: "Additional Photo 4", required: false },
    { id: "additional-5", type: "additional", label: "Additional Photo 5", required: false },
    { id: "additional-6", type: "additional", label: "Additional Photo 6", required: false },
  ]);

  // Initialize photoSlots from existing data when editing
  useEffect(() => {
    const loadExistingPhotos = async () => {
      // First, try to load from data prop (if provided)
      if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
        setPhotoSlots((prev) => {
          const newSlots = [...prev];
          data.photos!.forEach((photo) => {
            const slotIndex = newSlots.findIndex((s) => s.type === photo.type && !s.url);
            if (slotIndex !== -1) {
              newSlots[slotIndex] = {
                ...newSlots[slotIndex],
                url: photo.url,
                preview: photo.url,
              };
            }
          });
          return newSlots;
        });
      } else if (user) {
        // If no photos in data prop, fetch from database
        try {
          const { data: photos, error } = await getPhotosByUserId(user.id);
          if (error) {
            logger.error("Error loading existing photos:", error);
            return;
          }

          if (photos && photos.length > 0) {
            logger.info(`📸 Loaded ${photos.length} existing photos for editing`);
            setPhotoSlots((prev) => {
              const newSlots = [...prev];
              photos.forEach((photo) => {
                // Map photo type from database to slot type
                const slotType = photo.type === "portfolio" ? "additional" : photo.type as "headshot" | "fullbody" | "additional";
                const slotIndex = newSlots.findIndex((s) => s.type === slotType && !s.url);
                if (slotIndex !== -1) {
                  newSlots[slotIndex] = {
                    ...newSlots[slotIndex],
                    url: photo.url,
                    preview: photo.url,
                    photoId: photo.id, // Save database ID for deletion
                    storagePath: photo.storage_path, // Save storage path for deletion
                  };
                }
              });
              return newSlots;
            });
          }
        } catch (error) {
          logger.error("Error loading existing photos:", error);
        }
      }
    };

    loadExistingPhotos();
  }, [user]); // Re-run if user changes

  // Sync photoSlots with form value
  useEffect(() => {
    const photos = photoSlots
      .filter((slot) => slot.url)
      .map((slot) => ({
        url: slot.url!,
        type: slot.type,
      }));
    setValue("photos", photos, { shouldValidate: false });
  }, [photoSlots, setValue]);

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: false, // Disabled to avoid CSP issues with dynamic script loading
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      logger.error("Image compression error:", error);
      return file;
    }
  };

  const uploadToStorage = async (file: File, slotId: string, slotType: "headshot" | "fullbody" | "additional", retries = 3): Promise<{ url: string; photoId: string; storagePath: string }> => {
    if (!user) throw new Error("User not authenticated");

    const compressedFile = await compressImage(file);

    // Map slot type to photo type for database
    const photoType = slotType === "additional" ? "portfolio" : slotType;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Upload to Supabase Storage
        const uploadResult = await uploadPhoto(user.id, compressedFile, photoType);

        if ('error' in uploadResult) {
          throw uploadResult.error;
        }

        const { url, path } = uploadResult;

        // Save metadata to database
        // Note: profile_id will be null for now - it gets linked when profile is created
        const { data: photoData, error: metadataError } = await savePhotoMetadata(
          user.id,
          null, // profile_id - will be linked later
          {
            type: photoType,
            url,
            storage_path: path,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
          }
        );

        if (metadataError || !photoData) {
          logger.error('Failed to save photo metadata:', metadataError);
          throw new Error('Failed to save photo metadata');
        }

        logger.debug(`Successfully uploaded ${slotId} to Supabase Storage:`, url);
        return { url, photoId: photoData.id, storagePath: path };
      } catch (error) {
        logger.error(`Upload attempt ${attempt} failed for ${slotId}:`, error);
        if (attempt === retries) {
          throw error;
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error("Upload failed after all retries");
  };

  const handleFileDrop = useCallback(
    async (acceptedFiles: File[], slotId: string) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const preview = URL.createObjectURL(file);

      // Find the slot to get its type
      const slot = photoSlots.find(s => s.id === slotId);
      if (!slot) return;

      // If slot already has a photo in database, delete it first
      if (slot.photoId && slot.storagePath) {
        try {
          await deletePhoto(slot.photoId, slot.storagePath);
          logger.info(`Deleted old photo ${slot.photoId} before uploading replacement`);
        } catch (error) {
          logger.error("Error deleting old photo:", error);
          // Continue with upload anyway
        }
      }

      // Update slot with preview
      setPhotoSlots((prev) =>
        prev.map((s) =>
          s.id === slotId
            ? { ...s, file, preview, uploading: true, photoId: undefined, storagePath: undefined }
            : s
        )
      );

      try {
        // Upload to Supabase Storage
        const { url, photoId, storagePath } = await uploadToStorage(file, slotId, slot.type);

        // Update slot with URL, photo ID, and storage path for future deletions
        setPhotoSlots((prev) =>
          prev.map((s) =>
            s.id === slotId
              ? { ...s, url, photoId, storagePath, uploading: false, error: undefined }
              : s
          )
        );
      } catch (error) {
        logger.error("Upload error:", error);
        // Keep preview and file but set error state for retry
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setPhotoSlots((prev) =>
          prev.map((s) =>
            s.id === slotId
              ? { ...s, uploading: false, error: errorMessage }
              : s
          )
        );
      }
    },
    [user, setValue, photoSlots]
  );

  const removePhoto = async (slotId: string) => {
    const slot = photoSlots.find((s) => s.id === slotId);

    // If photo exists in database, delete it
    if (slot?.photoId && slot?.storagePath) {
      try {
        await deletePhoto(slot.photoId, slot.storagePath);
        logger.info(`Deleted photo ${slot.photoId} from database and storage`);
      } catch (error) {
        logger.error("Error deleting photo:", error);
        // Continue anyway - clear from UI even if delete fails
      }
    }

    setPhotoSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? { ...s, file: undefined, preview: undefined, url: undefined, photoId: undefined, storagePath: undefined, error: undefined }
          : s
      )
    );
  };

  const retryUpload = async (slotId: string) => {
    const slot = photoSlots.find((s) => s.id === slotId);
    if (!slot || !slot.file) return;

    // Clear error and set uploading state
    setPhotoSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? { ...s, uploading: true, error: undefined }
          : s
      )
    );

    try {
      // Retry upload
      const { url, photoId, storagePath } = await uploadToStorage(slot.file, slotId, slot.type);

      // Update slot with URL, photo ID, and storage path
      setPhotoSlots((prev) =>
        prev.map((s) =>
          s.id === slotId
            ? { ...s, url, photoId, storagePath, uploading: false, error: undefined }
            : s
        )
      );
    } catch (error) {
      logger.error("Retry upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setPhotoSlots((prev) =>
        prev.map((s) =>
          s.id === slotId
            ? { ...s, uploading: false, error: errorMessage }
            : s
        )
      );
    }
  };

  const onSubmit = (formData: PhotosFormData) => {
    logger.debug("📸 PhotosStep onSubmit called with formData:", {
      photoCount: formData.photos?.length || 0,
      photos: formData.photos?.map(p => ({ type: p.type, hasUrl: !!p.url })),
      rawFormData: formData
    });

    // Validate required photos
    const hasHeadshot = formData.photos?.some(p => p.type === "headshot");
    const hasFullbody = formData.photos?.some(p => p.type === "fullbody");

    logger.debug("📸 Photo validation:", {
      hasHeadshot,
      hasFullbody,
      totalPhotos: formData.photos?.length || 0
    });

    if (!hasHeadshot || !hasFullbody) {
      logger.error("❌ Photo validation failed - missing required photos");
    }

    logger.debug("📸 Calling onNext to proceed to final step...");
    onNext(formData);
  };

  // Check if any photos are currently uploading
  const isUploading = photoSlots.some((slot) => slot.uploading);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-bold text-secondary mb-4"
          style={{ fontFamily: "var(--font-galindo)" }}
        >
          Upload Your Photos
        </h2>
        <p
          className="text-base text-secondary-light"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Upload 2-8 recent photos. Headshot and full body are required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="photos"
          control={control}
          render={() => (
            <div className="space-y-4">
              {photoSlots.map((slot) => (
                <PhotoUploadSlot
                  key={slot.id}
                  slot={slot}
                  onDrop={(files) => handleFileDrop(files, slot.id)}
                  onRemove={() => removePhoto(slot.id)}
                  onRetry={() => retryUpload(slot.id)}
                />
              ))}
            </div>
          )}
        />

        {errors.photos && (
          <div className="bg-danger/10 border-2 border-danger rounded-lg p-4 mt-2">
            <p className="text-danger font-semibold">⚠️ Photo Upload Error:</p>
            <p className="text-danger text-sm mt-1">
              {errors.photos.message || "Please check your photo uploads"}
            </p>
            <p className="text-danger text-xs mt-2">
              {JSON.stringify(errors.photos)}
            </p>
          </div>
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
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={isUploading}
            onClick={() => {
              logger.debug("📸 Submit button clicked", {
                isUploading,
                photoCount: photoSlots.filter(s => s.url).length,
                hasErrors: !!errors.photos,
                errorMessage: errors.photos?.message,
              });
            }}
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface PhotoUploadSlotProps {
  slot: PhotoSlot;
  onDrop: (files: File[]) => void;
  onRemove: () => void;
  onRetry: () => void;
}

function PhotoUploadSlot({ slot, onDrop, onRemove, onRetry }: PhotoUploadSlotProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    disabled: slot.uploading,
  });

  const hasPhoto = slot.preview || slot.url;

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 transition-all ${
        slot.required
          ? "border-accent bg-accent/5"
          : "border-secondary-light/30 bg-white"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3
              className="text-lg font-semibold text-secondary"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {slot.label}
            </h3>
            {slot.required && (
              <span className="text-danger text-sm">*Required</span>
            )}
          </div>

          {!hasPhoto ? (
            <div
              {...getRootProps()}
              className={`cursor-pointer p-6 rounded-lg border-2 border-dashed text-center transition-colors ${
                isDragActive
                  ? "border-accent bg-accent/10"
                  : "border-secondary-light/30 hover:border-accent hover:bg-accent/5"
              }`}
            >
              <input {...getInputProps()} />
              {slot.uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <p className="text-secondary-light">Uploading...</p>
                </div>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-secondary-light"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-secondary-light text-sm">
                    {isDragActive
                      ? "Drop photo here"
                      : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-secondary-light/60 text-xs mt-1">
                    JPG, PNG, or WEBP (max 10MB)
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-accent">
                {slot.preview && (
                  <Image
                    src={slot.preview}
                    alt={slot.label}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-secondary font-medium">
                  {slot.file?.name}
                </p>
                {slot.uploading && (
                  <p className="text-xs text-secondary-light mt-1">
                    Uploading and compressing...
                  </p>
                )}
                {slot.error && (
                  <div className="mt-1">
                    <p className="text-xs text-danger">✗ {slot.error}</p>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="text-xs text-accent hover:text-accent-dark underline mt-1"
                      disabled={slot.uploading}
                    >
                      Retry upload
                    </button>
                  </div>
                )}
                {slot.url && !slot.error && (
                  <p className="text-xs text-success mt-1">✓ Uploaded</p>
                )}
              </div>
              <button
                type="button"
                onClick={onRemove}
                className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                disabled={slot.uploading}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
