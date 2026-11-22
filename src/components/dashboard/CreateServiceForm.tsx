"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { createSalonService, CreateServicePayload } from "@/lib/action/serviceActions";
import { SALON_CATEGORIES } from "@/lib/serviceCategories";
import { uploadImageToImgbb } from "@/lib/uploadImage";
import {
  Scissors,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Image as ImageIcon,
  Upload,
} from "lucide-react";

interface CreateServiceFormProps {
  onSuccess?: (message: string) => void;
}

export function CreateServiceForm({ onSuccess }: CreateServiceFormProps) {
  const { data: session } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setErrorMessage(null);

    const result = await uploadImageToImgbb(file);

    setIsUploadingImage(false);
    event.target.value = "";

    if (!result.success || !result.url) {
      setErrorMessage(result.message || "Failed to upload image.");
      return;
    }

    setImageUrl(result.url);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const creatorEmail = session?.user?.email?.trim() || "";
    if (!creatorEmail) {
      setErrorMessage("Authenticated user email is missing. Please log in again.");
      return;
    }

    if (!imageUrl) {
      setErrorMessage("Please upload a service image before publishing.");
      return;
    }

    setIsSubmitting(true);

    // Extract form values using standard FormData API
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload: CreateServicePayload = {
      serviceName: String(formData.get("serviceName") || "").trim(),
      image: imageUrl,
      category: String(formData.get("category") || "").trim(),
      price: Number(formData.get("price") || 0),
      duration: String(formData.get("duration") || "").trim(),
      shortDescription: String(formData.get("shortDescription") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      isActive: formData.get("isActive") === "on",
      createdBy: creatorEmail,
    };

    // Call backend service creation action
    const res = await createSalonService(payload);
    setIsSubmitting(false);

    if (res.success) {
      form.reset();
      setImageUrl("");
      if (onSuccess) {
        onSuccess("New service created successfully!");
      }
    } else {
      setErrorMessage(res.message || "Failed to create service.");
    }
  };

  return (
    <div className="relative">
      {/* Form header */}
      <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-stone-800/70">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
          <Scissors className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-white tracking-wide">
            Create Salon Service
          </h2>
          <p className="text-sm text-stone-400 mt-0.5">
            Add a new service package to your catalog
          </p>
        </div>
      </div>

      {/* Inline error alert if creation fails */}
      {errorMessage && (
        <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Service creation form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service name field */}
          <div>
            <label
              htmlFor="serviceName"
              className="block text-sm font-medium text-stone-300 mb-1.5"
            >
              Service Name <span className="text-amber-400">*</span>
            </label>
            <input
              id="serviceName"
              name="serviceName"
              type="text"
              required
              placeholder="e.g., Royal Keratin Hair Spa"
              className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
            />
          </div>

          {/* Category dropdown */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-stone-300 mb-1.5"
            >
              Category <span className="text-amber-400">*</span>
            </label>
            <select
              id="category"
              name="category"
              defaultValue="Haircut & Styling"
              className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-3 text-sm text-white focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
            >
              {SALON_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Price input */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-stone-300 mb-1.5"
            >
              Price (BDT) <span className="text-amber-400">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              required
              min="1"
              step="any"
              placeholder="e.g., 2500"
              className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
            />
          </div>

          {/* Duration input */}
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-stone-300 mb-1.5"
            >
              Duration (minutes) <span className="text-amber-400">*</span>
            </label>
            <input
              id="duration"
              name="duration"
              type="number"
              required
              min="1"
              step="1"
              placeholder="e.g., 90"
              className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
            />
          </div>
        </div>

        {/* Service image upload */}
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1.5">
            Service Image <span className="text-amber-400">*</span>
          </label>

          <div className="flex flex-col gap-3 rounded-2xl border border-stone-800 bg-stone-900/50 p-3 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-800 bg-stone-900 text-amber-400">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Selected service"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-6 w-6" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20">
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>
                  {isUploadingImage
                    ? "Uploading..."
                    : imageUrl
                      ? "Replace Image"
                      : "Upload Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingImage || isSubmitting}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="mt-1.5 text-xs text-stone-500">
                Upload a JPG or PNG file. The image is hosted on ImgBB.
              </p>
            </div>
          </div>
        </div>

        {/* Short description input */}
        <div>
          <label
            htmlFor="shortDescription"
            className="block text-sm font-medium text-stone-300 mb-1.5"
          >
            Short Description <span className="text-amber-400">*</span>
          </label>
          <input
            id="shortDescription"
            name="shortDescription"
            type="text"
            required
            placeholder="Brief highlight for service cards..."
            className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
          />
        </div>

        {/* Detailed description textarea */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-stone-300 mb-1.5"
          >
            Detailed Description <span className="text-amber-400">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            placeholder="Write complete details about the treatment, benefits, and session flow..."
            className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition resize-none"
          />
        </div>

        {/* Service active toggle */}
        <div className="flex items-center justify-between rounded-2xl border border-stone-800/80 bg-stone-900/50 px-4 py-3.5">
          <div>
            <p className="text-sm font-semibold text-white">Service Availability</p>
            <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
              Show this service immediately to customers for booking
            </p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={true}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-stone-700 rounded-full peer peer-checked:bg-amber-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-950 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        {/* Submit button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-stone-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 transition-all duration-300 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Service...</span>
              </>
            ) : (
              <>
                <span>Publish Service</span>
                <ArrowUpRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}