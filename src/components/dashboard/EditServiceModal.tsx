"use client";

import React, { useState } from "react";
import { SalonService } from "@/lib/api/serviceApi";
import {
  updateSalonService,
  UpdateServicePayload,
} from "@/lib/action/serviceActions";
import { SALON_CATEGORIES } from "@/lib/serviceCategories";
import { uploadImageToImgbb } from "@/lib/uploadImage";
import {
  Pencil,
  X,
  AlertCircle,
  Loader2,
  Check,
  Image as ImageIcon,
  Upload,
} from "lucide-react";

interface EditServiceModalProps {
  service: SalonService | null;
  onClose: () => void;
  onSuccess: (updatedService: SalonService, message: string) => void;
}

export function EditServiceModal({
  service,
  onClose,
  onSuccess,
}: EditServiceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(service?.image || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  if (!service) return null;

  const isCurrentlyActive =
    service.isActive !== false && service.status !== "inactive";

  // Keep any legacy category value selectable while offering the
  // requirement's official category list.
  const categoryOptions = Array.from(
    new Set([service.category, ...SALON_CATEGORIES])
  );

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!imageUrl) {
      setErrorMessage("Please upload a service image before saving.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const payload: UpdateServicePayload = {
      serviceName: String(formData.get("serviceName") || "").trim(),
      image: imageUrl,
      category: String(formData.get("category") || "").trim(),
      price: Number(formData.get("price") || 0),
      duration: String(formData.get("duration") || "").trim(),
      shortDescription: String(formData.get("shortDescription") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      isActive: formData.get("isActive") === "on",
    };

    const res = await updateSalonService(service._id, payload);
    setIsSubmitting(false);

    if (res.success) {
      const mergedService: SalonService = {
        ...service,
        ...payload,
        ...(res.data || {}),
      };
      onSuccess(
        mergedService,
        `"${mergedService.serviceName}" updated successfully!`
      );
    } else {
      setErrorMessage(res.message || "Failed to update service.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        key={service._id}
        className="relative w-full max-w-2xl rounded-3xl border border-stone-800 bg-stone-950 p-6 sm:p-7 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close edit modal"
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-xl border border-stone-800 bg-stone-900 text-stone-400 hover:text-white hover:border-stone-700 disabled:opacity-50 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-stone-800/70">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <Pencil className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-white tracking-wide">
              Edit Salon Service
            </h2>
            <p className="text-xs text-stone-400">
              Update details for &ldquo;{service.serviceName}&rdquo;
            </p>
          </div>
        </div>

        {/* Inline error alert */}
        {errorMessage && (
          <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-medium text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service name */}
            <div>
              <label
                htmlFor="edit-serviceName"
                className="block text-xs font-medium text-stone-300 mb-1.5"
              >
                Service Name <span className="text-amber-400">*</span>
              </label>
              <input
                id="edit-serviceName"
                name="serviceName"
                type="text"
                required
                defaultValue={service.serviceName}
                className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="edit-category"
                className="block text-xs font-medium text-stone-300 mb-1.5"
              >
                Category <span className="text-amber-400">*</span>
              </label>
              <select
                id="edit-category"
                name="category"
                defaultValue={service.category}
                className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-2.5 text-xs text-white focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="edit-price"
                className="block text-xs font-medium text-stone-300 mb-1.5"
              >
                Price (BDT) <span className="text-amber-400">*</span>
              </label>
              <input
                id="edit-price"
                name="price"
                type="number"
                required
                min="1"
                step="any"
                defaultValue={service.price}
                className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
              />
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="edit-duration"
                className="block text-xs font-medium text-stone-300 mb-1.5"
              >
                Duration (minutes) <span className="text-amber-400">*</span>
              </label>
              <input
                id="edit-duration"
                name="duration"
                type="number"
                required
                min="1"
                step="1"
                defaultValue={service.duration}
                className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
              />
            </div>
          </div>

          {/* Service image upload */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Service Image <span className="text-amber-400">*</span>
            </label>

            <div className="flex flex-col gap-3 rounded-2xl border border-stone-800 bg-stone-900/50 p-3 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-800 bg-stone-900 text-amber-400">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={service.serviceName}
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
                <p className="mt-1.5 text-[11px] text-stone-500">
                  Upload a JPG or PNG file. The image is hosted on ImgBB.
                </p>
              </div>
            </div>
          </div>

          {/* Short description */}
          <div>
            <label
              htmlFor="edit-shortDescription"
              className="block text-xs font-medium text-stone-300 mb-1.5"
            >
              Short Description <span className="text-amber-400">*</span>
            </label>
            <input
              id="edit-shortDescription"
              name="shortDescription"
              type="text"
              required
              defaultValue={service.shortDescription}
              className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
            />
          </div>

          {/* Detailed description */}
          <div>
            <label
              htmlFor="edit-description"
              className="block text-xs font-medium text-stone-300 mb-1.5"
            >
              Detailed Description <span className="text-amber-400">*</span>
            </label>
            <textarea
              id="edit-description"
              name="description"
              required
              rows={3}
              defaultValue={service.description}
              className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition resize-none"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-800/80 bg-stone-900/50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-white">Service Availability</p>
              <p className="text-[11px] text-stone-400">
                Toggle whether this service is active for customers
              </p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={isCurrentlyActive}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-stone-700 rounded-full peer peer-checked:bg-amber-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-950 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl border border-stone-800 bg-stone-900 px-4 py-2.5 text-xs font-medium text-stone-300 hover:text-white hover:border-stone-700 disabled:opacity-50 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-stone-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}