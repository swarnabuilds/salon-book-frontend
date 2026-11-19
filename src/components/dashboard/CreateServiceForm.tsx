"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { createSalonService, CreateServicePayload } from "@/lib/action/serviceActions";
import { Scissors, CheckCircle2, AlertCircle, Loader2, ArrowUpRight } from "lucide-react";

interface CreateServiceFormProps {
  onSuccess?: () => void;
}

export function CreateServiceForm({ onSuccess }: CreateServiceFormProps) {
  const { data: session } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    const creatorEmail = session?.user?.email?.trim() || "";
    if (!creatorEmail) {
      setFeedback({
        type: "error",
        message: "Authenticated user email is missing. Please log in again.",
      });
      return;
    }

    setIsSubmitting(true);

    // Extract form fields using standard FormData
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload: CreateServicePayload = {
      name: String(formData.get("name") || "").trim(),
      image: String(formData.get("image") || "").trim(),
      category: String(formData.get("category") || "").trim(),
      price: Number(formData.get("price") || 0),
      duration: String(formData.get("duration") || "").trim(),
      shortDescription: String(formData.get("shortDescription") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      isActive: formData.get("isActive") === "on",
      createdBy: creatorEmail,
    };

    // Submit service payload to backend action
    const res = await createSalonService(payload);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({
        type: "success",
        message: "New service created successfully!",
      });
      form.reset();

      if (onSuccess) {
        onSuccess();
      }
    } else {
      setFeedback({
        type: "error",
        message: res.message || "Failed to create service.",
      });
    }
  };

  return (
    <div className="rounded-3xl border border-stone-800/80 bg-stone-950/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Subtle decorative glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Form header with service icon */}
      <div className="relative z-10 flex items-center gap-3.5 mb-7 pb-5 border-b border-stone-800/70">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
          <Scissors className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-white tracking-wide">
            Add New Salon Service
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Create a luxurious service package for your customers
          </p>
        </div>
      </div>

      {/* Submission feedback banner */}
      {feedback && (
        <div
          className={`relative z-10 mb-6 flex items-center gap-3 rounded-2xl border p-4 text-xs font-medium ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Service creation form */}
      <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Service name input */}
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-stone-300 mb-2">
              Service Name <span className="text-amber-400">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g., Royal Keratin Hair Spa"
              className="w-full rounded-xl border border-stone-800 bg-stone-900/70 px-4 py-3 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
            />
          </div>

          {/* Category selector */}
          <div>
            <label htmlFor="category" className="block text-xs font-medium text-stone-300 mb-2">
              Category <span className="text-amber-400">*</span>
            </label>
            <select
              id="category"
              name="category"
              defaultValue="Hair Care"
              className="w-full rounded-xl border border-stone-800 bg-stone-900/70 px-4 py-3 text-xs text-white focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
            >
              <option value="Hair Care">Hair Care</option>
              <option value="Skin & Facial">Skin & Facial</option>
              <option value="Bridal & Makeup">Bridal & Makeup</option>
              <option value="Spa & Massage">Spa & Massage</option>
              <option value="Nail & Grooming">Nail & Grooming</option>
            </select>
          </div>

          {/* Price input */}
          <div>
            <label htmlFor="price" className="block text-xs font-medium text-stone-300 mb-2">
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
              className="w-full rounded-xl border border-stone-800 bg-stone-900/70 px-4 py-3 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
            />
          </div>

          {/* Duration input */}
          <div>
            <label htmlFor="duration" className="block text-xs font-medium text-stone-300 mb-2">
              Duration <span className="text-amber-400">*</span>
            </label>
            <input
              id="duration"
              name="duration"
              type="text"
              required
              placeholder="e.g., 90 mins"
              className="w-full rounded-xl border border-stone-800 bg-stone-900/70 px-4 py-3 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
            />
          </div>
        </div>

        {/* Image URL input */}
        <div>
          <label htmlFor="image" className="block text-xs font-medium text-stone-300 mb-2">
            Service Image URL <span className="text-amber-400">*</span>
          </label>
          <input
            id="image"
            name="image"
            type="url"
            required
            placeholder="https://example.com/salon-service.jpg"
            className="w-full rounded-xl border border-stone-800 bg-stone-900/70 px-4 py-3 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
          />
        </div>

        {/* Short description input */}
        <div>
          <label htmlFor="shortDescription" className="block text-xs font-medium text-stone-300 mb-2">
            Short Description <span className="text-amber-400">*</span>
          </label>
          <input
            id="shortDescription"
            name="shortDescription"
            type="text"
            required
            placeholder="Brief highlight for service cards..."
            className="w-full rounded-xl border border-stone-800 bg-stone-900/70 px-4 py-3 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
          />
        </div>

        {/* Detailed description textarea */}
        <div>
          <label htmlFor="description" className="block text-xs font-medium text-stone-300 mb-2">
            Detailed Description <span className="text-amber-400">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Write complete details about the treatment, benefits, and session flow..."
            className="w-full rounded-xl border border-stone-800 bg-stone-900/70 px-4 py-3 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition resize-none"
          />
        </div>

        {/* Service availability toggle */}
        <div className="flex items-center justify-between rounded-2xl border border-stone-800/80 bg-stone-900/40 px-4 py-3.5">
          <div>
            <p className="text-xs font-semibold text-white">Service Availability</p>
            <p className="text-[11px] text-stone-400">
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-7 py-3.5 text-xs font-bold text-stone-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 transition-all duration-300 cursor-pointer"
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