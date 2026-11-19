"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { createSalonService, CreateServicePayload } from "@/lib/action/serviceActions";
import { Scissors, AlertCircle, Loader2, ArrowUpRight } from "lucide-react";

const SALON_CATEGORIES = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
] as const;

interface CreateServiceFormProps {
  onSuccess?: (message: string) => void;
}

export function CreateServiceForm({ onSuccess }: CreateServiceFormProps) {
  const { data: session } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const creatorEmail = session?.user?.email?.trim() || "";
    if (!creatorEmail) {
      setErrorMessage("Authenticated user email is missing. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    // Extract form values using standard FormData API
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload: CreateServicePayload = {
      serviceName: String(formData.get("serviceName") || "").trim(),
      image: String(formData.get("image") || "").trim(),
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
              min="0"
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
              Duration <span className="text-amber-400">*</span>
            </label>
            <input
              id="duration"
              name="duration"
              type="text"
              required
              placeholder="e.g., 90 mins"
              className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
            />
          </div>
        </div>

        {/* Service image URL input */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-stone-300 mb-1.5"
          >
            Service Image URL <span className="text-amber-400">*</span>
          </label>
          <input
            id="image"
            name="image"
            type="url"
            required
            placeholder="https://example.com/salon-service.jpg"
            className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
          />
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
            disabled={isSubmitting}
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