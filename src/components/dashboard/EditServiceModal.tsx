"use client";

import React, { useState } from "react";
import { SalonService } from "@/lib/api/serviceApi";
import {
  updateSalonService,
  UpdateServicePayload,
} from "@/lib/action/serviceActions";
import { Pencil, X, AlertCircle, Loader2, Check } from "lucide-react";

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

  if (!service) return null;

  const isCurrentlyActive =
    service.isActive !== false && service.status !== "inactive";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const payload: UpdateServicePayload = {
      serviceName: String(formData.get("serviceName") || "").trim(),
      image: String(formData.get("image") || "").trim(),
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
                <option value="Hair Care">Hair Care</option>
                <option value="Skin & Facial">Skin & Facial</option>
                <option value="Bridal & Makeup">Bridal & Makeup</option>
                <option value="Spa & Massage">Spa & Massage</option>
                <option value="Nail & Grooming">Nail & Grooming</option>
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
                min="0"
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
                Duration <span className="text-amber-400">*</span>
              </label>
              <input
                id="edit-duration"
                name="duration"
                type="text"
                required
                defaultValue={service.duration}
                className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label
              htmlFor="edit-image"
              className="block text-xs font-medium text-stone-300 mb-1.5"
            >
              Service Image URL <span className="text-amber-400">*</span>
            </label>
            <input
              id="edit-image"
              name="image"
              type="url"
              required
              defaultValue={service.image}
              className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
            />
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
              disabled={isSubmitting}
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