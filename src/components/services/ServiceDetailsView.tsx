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

function formatCreatorName(email?: string): string {
  if (!email) return "Salon Admin";
  const localPart = email.split("@")[0] || "Salon Admin";
  return localPart
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface ServiceDetailsViewProps {
  backHref?: string;
  backLabel?: string;
}

export default function ServiceDetailsView({
  backHref = "/services",
  backLabel = "Browse Services",
}: ServiceDetailsViewProps) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const serviceId = params?.id || "";

  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const [service, setService] = useState<SalonService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      router.replace("/sign-in");
    }
  }, [isSessionLoading, session, router]);

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
  const resolvedBackHref =
    userRole === "admin" ? "/dashboard/admin/manage-services" : backHref;
  const resolvedBackLabel =
    userRole === "admin" ? "Manage Services" : backLabel;

  if (isSessionLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-3 text-base font-medium text-stone-600">
        <Loader2 className="h-5 w-5 animate-spin text-amber-700" />
        <span>Loading service details...</span>
      </div>
    );
  }

  if (errorMsg || !service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-14">
        <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center space-y-5 shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
            Service Not Found
          </h1>
          <p className="text-sm sm:text-base text-stone-600">{errorMsg}</p>
          <Link
            href={resolvedBackHref}
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-2.5 text-sm font-bold text-stone-800 hover:border-amber-500/50 hover:bg-amber-50 transition"
          >
            <ArrowLeft className="h-4 w-4 text-amber-700" />
            <span>{resolvedBackLabel}</span>
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
    <section className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div>
        <Link
          href={resolvedBackHref}
          className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-800 shadow-2xs hover:border-amber-500/50 hover:text-amber-800 transition"
        >
          <ArrowLeft className="h-4 w-4 text-amber-700" />
          <span>{resolvedBackLabel}</span>
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-amber-900/10 bg-white p-6 sm:p-8 shadow-[0_12px_36px_rgb(28,25,23,0.06)] space-y-7">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-7 items-start">
          <div className="md:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.serviceName}
                  className="h-64 sm:h-72 w-full object-cover"
                />
              ) : (
                <div className="flex h-64 sm:h-72 w-full items-center justify-center bg-amber-50 text-amber-700">
                  <Scissors className="h-12 w-12" />
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-50 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-amber-900">
                <Tag className="h-4 w-4 text-amber-700" />
                {service.category}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-stone-700">
                <Clock className="h-4 w-4 text-amber-700" />
                {service.duration}
              </span>

              <span
                className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-bold ${
                  isServiceActive
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-stone-200 bg-stone-100 text-stone-600"
                }`}
              >
                {isServiceActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                {service.serviceName}
              </h1>
              {service.shortDescription && (
                <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed">
                  {service.shortDescription}
                </p>
              )}
            </div>

            <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-stone-200 bg-amber-50/40 px-4 py-2.5 text-xs sm:text-sm">
              <UserCheck className="h-4 w-4 text-amber-700 shrink-0" />
              <span className="text-stone-500">Created by</span>
              <span className="font-bold text-stone-900">
                {creatorDisplayName}
              </span>
              {service.createdBy && (
                <span className="text-stone-500">({service.createdBy})</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-stone-200/90 bg-stone-50/70 p-4 sm:p-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
                  Price
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-800 mt-1 block">
                  ৳{Number(service.price).toLocaleString()}
                </span>
              </div>
              <div className="border-l border-stone-200 pl-4 sm:pl-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
                  Duration
                </span>
                <span className="text-base sm:text-lg font-bold text-stone-900 mt-1.5 block">
                  {service.duration}
                </span>
              </div>
            </div>

            <div className="pt-1">
              {!isServiceActive ? (
                <div className="inline-flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600" />
                  <span>This service is currently inactive.</span>
                </div>
              ) : !isCustomer ? (
                <div className="inline-flex items-center gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700" />
                  <span>
                    Only customer accounts can book appointments (Admin/other
                    roles cannot book).
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowBookingForm((prev) => !prev)}
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-md shadow-amber-600/25 hover:from-amber-400 hover:to-amber-600 transition cursor-pointer"
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

        <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-5 sm:p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">
            Service Description
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-stone-700 whitespace-pre-line">
            {service.description || "No detailed description provided."}
          </p>
        </div>

        {showBookingForm && canBook && (
          <div>
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