"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getServiceById, SalonService } from "@/lib/api/serviceApi";
import { BookAppointmentForm } from "@/components/services/BookAppointmentForm";
import {
  ArrowLeft,
  Clock,
  Tag,
  Scissors,
  Calendar,
  Loader2,
  AlertCircle,
  ShieldAlert,
  UserCheck,
  Sparkles,
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

  // Fetch service details by dynamic [id] from backend/database
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

  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = userRole === "admin";
  const backHref = isAdmin ? "/dashboard/admin/manage-services" : "/services";
  const backLabel = isAdmin ? "Manage Services" : "Browse Services";

  if (isSessionLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-3 text-base font-medium text-stone-300">
        <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
        <span>Loading service details...</span>
      </div>
    );
  }

  if (errorMsg || !service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-14">
        <div className="rounded-3xl border border-rose-500/35 bg-stone-950/95 p-8 text-center space-y-5 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/15 text-rose-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Service Not Found
          </h1>
          <p className="text-sm sm:text-base text-stone-300">{errorMsg}</p>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2.5 rounded-2xl border border-amber-400/35 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/50 px-6 py-3 text-sm sm:text-base font-bold text-amber-200 shadow-lg shadow-black/30 hover:border-amber-400 hover:text-amber-300 transition"
          >
            <ArrowLeft className="h-4 w-4 text-amber-400" />
            <span>{backLabel}</span>
          </Link>
        </div>
      </div>
    );
  }

  const isServiceActive =
    service.isActive !== false && service.status !== "inactive";
  const isCustomer = userRole === "customer";
  const canBook = isServiceActive && isCustomer;
  const creatorDisplayName = formatCreatorName(service.createdBy);

  return (
    <section className="max-w-5xl mx-auto px-4 py-7 space-y-6">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2.5 rounded-2xl border border-amber-400/35 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/45 px-5 py-3 text-sm sm:text-base font-bold text-amber-200 shadow-lg shadow-black/30 hover:border-amber-400 hover:text-amber-300 hover:-translate-x-0.5 transition duration-200"
        >
          <ArrowLeft className="h-4 w-4 text-amber-400" />
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* Fancy details card */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-stone-950 via-stone-950 to-stone-900/90 p-6 sm:p-8 shadow-2xl space-y-7">
        <div className="pointer-events-none -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl absolute" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-7 items-start">
          {/* Image frame */}
          <div className="md:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-stone-900 shadow-xl group">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.serviceName}
                  className="h-64 sm:h-72 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex h-64 sm:h-72 w-full items-center justify-center text-amber-400">
                  <Scissors className="h-12 w-12" />
                </div>
              )}
            </div>
          </div>

          {/* Info & booking trigger */}
          <div className="md:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-xl border border-amber-400/35 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 px-4 py-2 text-sm font-semibold text-amber-200 shadow-sm">
                <Tag className="h-4 w-4 text-amber-400" />
                {service.category}
              </span>

              <span className="inline-flex items-center gap-2 rounded-xl border border-stone-700/90 bg-stone-900/90 px-4 py-2 text-sm font-semibold text-stone-200 shadow-sm">
                <Clock className="h-4 w-4 text-amber-400" />
                {service.duration}
              </span>

              <span
                className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-bold shadow-sm ${
                  isServiceActive
                    ? "border border-emerald-400/35 bg-emerald-500/15 text-emerald-300"
                    : "border border-stone-700 bg-stone-800 text-stone-300"
                }`}
              >
                {isServiceActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                {service.serviceName}
              </h1>
              {service.shortDescription && (
                <p className="text-sm sm:text-base text-stone-300 mt-2 leading-relaxed">
                  {service.shortDescription}
                </p>
              )}
            </div>

            {/* Created by badge */}
            <div className="inline-flex flex-wrap items-center gap-2.5 rounded-2xl border border-amber-500/20 bg-stone-900/80 px-4 py-2.5 text-sm shadow-sm">
              <UserCheck className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-stone-400">Created by</span>
              <span className="font-bold text-white">
                {creatorDisplayName}
              </span>
              {service.createdBy && (
                <span className="text-xs sm:text-sm text-stone-400">
                  ({service.createdBy})
                </span>
              )}
            </div>

            {/* Price & duration highlight card */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-amber-500/20 bg-stone-900/70 p-4 sm:p-5 shadow-inner">
              <div>
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-stone-400 block">
                  Price
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1 block">
                  ৳{Number(service.price).toLocaleString()}
                </span>
              </div>
              <div className="border-l border-stone-800 pl-4 sm:pl-5">
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-stone-400 block">
                  Duration
                </span>
                <span className="text-base sm:text-lg font-bold text-stone-100 mt-1.5 block">
                  {service.duration}
                </span>
              </div>
            </div>

            {/* Role & active status enforcement */}
            <div className="pt-1">
              {!isServiceActive ? (
                <div className="inline-flex items-center gap-2.5 rounded-2xl border border-rose-500/35 bg-gradient-to-r from-rose-500/20 via-rose-950/40 to-stone-900/70 px-4 py-3 text-sm font-semibold text-rose-200 shadow-md">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400" />
                  <span>This service is currently inactive.</span>
                </div>
              ) : !isCustomer ? (
                <div className="inline-flex items-center gap-2.5 rounded-2xl border border-amber-500/35 bg-gradient-to-r from-amber-500/20 via-stone-900/90 to-stone-900/60 px-4 py-3 text-sm font-semibold text-amber-200 shadow-md">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
                  <span>
                    Only customer accounts can book appointments (Admin/other
                    roles cannot book).
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowBookingForm((prev) => !prev)}
                  className="inline-flex items-center gap-2.5 rounded-2xl border border-amber-300/50 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-6 py-3.5 text-sm sm:text-base font-extrabold text-stone-950 shadow-xl shadow-amber-500/25 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 hover:-translate-y-0.5 transition duration-200 cursor-pointer"
                >
                  {showBookingForm ? (
                    <Calendar className="h-5 w-5" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                  <span>
                    {showBookingForm
                      ? "Hide Booking Form"
                      : "Book Appointment"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Service description card */}
        <div className="relative z-10 rounded-2xl border border-amber-500/15 bg-stone-900/55 p-5 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300 mb-3">
            Service Description
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-stone-200 whitespace-pre-line">
            {service.description || "No detailed description provided."}
          </p>
        </div>

        {/* Inline Booking Form — strictly for active service + customer role */}
        {showBookingForm && canBook && (
          <div className="relative z-10">
            <BookAppointmentForm
              serviceId={service._id}
              serviceName={service.serviceName}
              price={Number(service.price) || 0}
              duration={service.duration}
              customerId={session?.user?.id}
              customerName={session?.user?.name || ""}
              customerEmail={session?.user?.email || ""}
              customerRole={userRole || "customer"}
              onClose={() => setShowBookingForm(false)}
            />
          </div>
        )}
      </div>
    </section>
  );
}