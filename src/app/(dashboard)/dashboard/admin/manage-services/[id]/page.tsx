"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getServiceById, SalonService } from "@/lib/api/serviceApi";
import {
  ArrowLeft,
  Clock,
  Tag,
  Scissors,
  Calendar,
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

// Format a readable display name from creator email
function formatCreatorName(email?: string): string {
  if (!email) return "Salon Admin";
  const localPart = email.split("@")[0] || "Salon Admin";
  return localPart
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ServiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const serviceId = params?.id || "";

  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const [service, setService] = useState<SalonService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Redirect unauthenticated users to Sign In page
  useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      router.replace("/sign-in");
    }
  }, [isSessionLoading, session, router]);

  // Fetch service details by dynamic [id]
  useEffect(() => {
    let isMounted = true;

    const loadDetails = async () => {
      if (!serviceId) return;
      setIsLoading(true);
      setErrorMsg(null);

      const data = await getServiceById(serviceId);
      if (!isMounted) return;

      if (!data || !data._id) {
        setErrorMsg("Invalid or non-existent service ID.");
        setService(null);
      } else {
        setService(data);
      }
      setIsLoading(false);
    };

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  if (isSessionLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-2.5 text-xs text-stone-400">
        <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
        <span>Loading service details...</span>
      </div>
    );
  }

  if (errorMsg || !service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-14">
        <div className="rounded-3xl border border-rose-500/30 bg-stone-950/90 p-7 text-center space-y-4 shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold text-white">Service Not Found</h1>
          <p className="text-xs text-stone-400">{errorMsg}</p>
          <Link
            href="/dashboard/admin/manage-services"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900 px-4 py-2 text-xs font-medium text-stone-200 hover:border-amber-500/40 hover:text-amber-300 transition"
          >
            <ArrowLeft className="h-4 w-4 text-amber-400" />
            <span>Manage Services</span>
          </Link>
        </div>
      </div>
    );
  }

  const isServiceActive = service.isActive !== false && service.status !== "inactive";
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isCustomer = userRole === "customer";
  const creatorDisplayName = formatCreatorName(service.createdBy);

  return (
    <section className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/admin/manage-services"
          className="inline-flex items-center gap-2 rounded-xl border border-amber-500/25 bg-stone-950/90 px-4 py-2 text-xs font-semibold text-stone-200 hover:border-amber-400/50 hover:text-amber-300 transition shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-amber-400" />
          <span>Manage Services</span>
        </Link>
      </div>

      {/* Fancy details card */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-800/80 bg-gradient-to-br from-stone-950 via-stone-950 to-stone-900/80 p-6 sm:p-8 shadow-2xl space-y-7">
        <div className="pointer-events-none -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl absolute" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-7 items-start">
          {/* Image frame */}
          <div className="md:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-stone-800/90 bg-stone-900 shadow-lg group">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.serviceName}
                  className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center text-amber-400">
                  <Scissors className="h-10 w-10" />
                </div>
              )}
            </div>
          </div>

          {/* Info & booking trigger */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                <Tag className="h-3.5 w-3.5" />
                {service.category}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-900/90 px-3 py-1 text-xs text-stone-300">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                {service.duration}
              </span>

              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                  isServiceActive
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border border-stone-700 bg-stone-800 text-stone-400"
                }`}
              >
                {isServiceActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {service.serviceName}
              </h1>
              {service.shortDescription && (
                <p className="text-xs sm:text-sm text-stone-400 mt-1.5 leading-relaxed">
                  {service.shortDescription}
                </p>
              )}
            </div>

            {/* Created by badge */}
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-stone-800/90 bg-stone-900/70 px-3.5 py-2 text-xs">
              <UserCheck className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-stone-400">Created by</span>
              <span className="font-semibold text-white">{creatorDisplayName}</span>
              {service.createdBy && (
                <span className="text-[11px] text-stone-500 hidden sm:inline">
                  ({service.createdBy})
                </span>
              )}
            </div>

            {/* Price & duration highlight card */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-stone-800/80 bg-stone-900/60 p-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                  Price
                </span>
                <span className="text-2xl font-bold text-amber-400 mt-0.5 block">
                  ৳{Number(service.price).toLocaleString()}
                </span>
              </div>
              <div className="border-l border-stone-800 pl-4">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                  Duration
                </span>
                <span className="text-sm font-semibold text-stone-200 mt-1.5 block">
                  {service.duration}
                </span>
              </div>
            </div>

            {/* Compact role / status notice or booking CTA */}
            <div className="pt-1">
              {!isServiceActive ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/15 via-rose-950/30 to-stone-900/60 px-3.5 py-2 text-xs font-medium text-rose-200 shadow-sm">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>This service is currently inactive.</span>
                </div>
              ) : !isCustomer ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-stone-900/80 to-stone-900/50 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-sm">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>Only customer accounts can submit appointment requests.</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowBookingForm((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-xs font-bold text-stone-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
                >
                  <Calendar className="h-4 w-4" />
                  <span>{showBookingForm ? "Hide Booking Form" : "Book Appointment"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Service description card */}
        <div className="relative z-10 rounded-2xl border border-stone-800/80 bg-stone-900/45 p-5 sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-2.5">
            Service Description
          </h2>
          <p className="text-sm leading-relaxed text-stone-300 whitespace-pre-line">
            {service.description || "No detailed description provided."}
          </p>
        </div>

        {/* Booking form container */}
        {showBookingForm && isServiceActive && isCustomer && (
          <div className="relative z-10 rounded-2xl border border-amber-500/30 bg-stone-900/60 p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-white">Request Appointment</h3>
            <p className="text-xs text-stone-400 mt-1">
              Booking form will go here next.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}