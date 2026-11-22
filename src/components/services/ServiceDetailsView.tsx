"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getServiceById, SalonService } from "@/lib/api/serviceApi";
import { formatServiceDuration } from "@/lib/formatServiceDuration";
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
  Sparkles,
} from "lucide-react";

interface ServiceDetailsViewProps {
  backHref?: string;
  backLabel?: string;
  // The admin dashboard uses the same page inside a dark layout, so it can
  // request the dark palette while the public route keeps the light one.
  theme?: "light" | "dark";
}

export default function ServiceDetailsView({
  backHref = "/services",
  backLabel = "Browse Services",
  theme = "light",
}: ServiceDetailsViewProps) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const serviceId = params?.id || "";

  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const [service, setService] = useState<SalonService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      router.replace("/signin");
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
      <div
        className={`flex min-h-[60vh] items-center justify-center gap-3 text-base font-medium ${
          isDark ? "bg-[#110F0B] text-stone-300" : "text-stone-600"
        }`}
      >
        <Loader2
          className={`h-5 w-5 animate-spin ${
            isDark ? "text-amber-400" : "text-amber-700"
          }`}
        />
        <span>Loading service details...</span>
      </div>
    );
  }

  if (errorMsg || !service) {
    return (
      <div
        className={`mx-auto max-w-3xl px-4 py-14 ${
          isDark ? "min-h-screen bg-[#110F0B]" : ""
        }`}
      >
        <div
          className={`space-y-5 rounded-3xl border p-8 text-center shadow-lg ${
            isDark
              ? "border-rose-400/30 bg-[#181510]"
              : "border-rose-200 bg-white"
          }`}
        >
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${
              isDark
                ? "border-rose-400/30 bg-rose-500/10 text-rose-300"
                : "border-rose-200 bg-rose-50 text-rose-600"
            }`}
          >
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1
            className={`text-xl font-bold sm:text-2xl ${
              isDark ? "text-white" : "text-stone-900"
            }`}
          >
            Service Not Found
          </h1>
          <p
            className={`text-sm sm:text-base ${
              isDark ? "text-stone-300" : "text-stone-600"
            }`}
          >
            {errorMsg}
          </p>
          <Link
            href={resolvedBackHref}
            className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-bold transition ${
              isDark
                ? "border-stone-700 bg-[#14110D] text-stone-200 hover:border-amber-400/40 hover:text-amber-300"
                : "border-stone-200 bg-stone-50 text-stone-800 hover:border-amber-500/50 hover:bg-amber-50"
            }`}
          >
            <ArrowLeft
              className={`h-4 w-4 ${
                isDark ? "text-amber-400" : "text-amber-700"
              }`}
            />
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

  return (
    <section
      className={`mx-auto max-w-5xl space-y-6 px-4 py-10 ${
        isDark ? "min-h-screen bg-[#110F0B] text-stone-100" : ""
      }`}
    >
      <div>
        <Link
          href={resolvedBackHref}
          className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold shadow-2xs transition ${
            isDark
              ? "border-stone-700 bg-[#14110D] text-stone-200 hover:border-amber-400/40 hover:text-amber-300"
              : "border-stone-200 bg-white text-stone-800 hover:border-amber-500/50 hover:text-amber-800"
          }`}
        >
          <ArrowLeft
            className={`h-4 w-4 ${isDark ? "text-amber-400" : "text-amber-700"}`}
          />
          <span>{resolvedBackLabel}</span>
        </Link>
      </div>

      <div
        className={`space-y-7 overflow-hidden rounded-3xl border p-6 sm:p-8 ${
          isDark
            ? "border-stone-800 bg-[#181510] shadow-xl"
            : "border-amber-900/10 bg-white shadow-[0_12px_36px_rgb(28,25,23,0.06)]"
        }`}
      >
        <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-12">
          <div className="md:col-span-5">
            <div
              className={`overflow-hidden rounded-2xl border ${
                isDark
                  ? "border-stone-800 bg-stone-900"
                  : "border-stone-200 bg-stone-100"
              }`}
            >
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.serviceName}
                  className="h-64 w-full object-cover sm:h-72"
                />
              ) : (
                <div
                  className={`flex h-64 w-full items-center justify-center sm:h-72 ${
                    isDark
                      ? "bg-amber-500/10 text-amber-300"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <Scissors className="h-12 w-12" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5 md:col-span-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold sm:text-sm ${
                  isDark
                    ? "border-amber-400/30 bg-amber-500/10 text-amber-200"
                    : "border-amber-500/30 bg-amber-50 text-amber-900"
                }`}
              >
                <Tag
                  className={`h-4 w-4 ${
                    isDark ? "text-amber-400" : "text-amber-700"
                  }`}
                />
                {service.category}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold sm:text-sm ${
                  isDark
                    ? "border-stone-700 bg-[#14110D] text-stone-300"
                    : "border-stone-200 bg-stone-50 text-stone-700"
                }`}
              >
                <Clock
                  className={`h-4 w-4 ${
                    isDark ? "text-amber-400" : "text-amber-700"
                  }`}
                />
                {formatServiceDuration(service.duration)}
              </span>

              <span
                className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-bold sm:text-sm ${
                  isServiceActive
                    ? isDark
                      ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : isDark
                      ? "border-stone-600 bg-stone-800/60 text-stone-300"
                      : "border-stone-200 bg-stone-100 text-stone-600"
                }`}
              >
                {isServiceActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div>
              <h1
                className={`font-serif text-2xl font-bold tracking-tight sm:text-4xl ${
                  isDark ? "text-white" : "text-stone-900"
                }`}
              >
                {service.serviceName}
              </h1>
              {service.shortDescription && (
                <p
                  className={`mt-2 text-sm leading-relaxed sm:text-base ${
                    isDark ? "text-stone-400" : "text-stone-600"
                  }`}
                >
                  {service.shortDescription}
                </p>
              )}
            </div>

            <div
              className={`grid grid-cols-2 gap-4 rounded-2xl border p-4 sm:p-5 ${
                isDark
                  ? "border-stone-800 bg-[#14110D]"
                  : "border-stone-200/90 bg-stone-50/70"
              }`}
            >
              <div>
                <span
                  className={`block text-xs font-semibold uppercase tracking-wider ${
                    isDark ? "text-stone-400" : "text-stone-500"
                  }`}
                >
                  Price
                </span>
                <span
                  className={`mt-1 block text-2xl font-extrabold sm:text-3xl ${
                    isDark ? "text-amber-300" : "text-amber-800"
                  }`}
                >
                  ৳{Number(service.price).toLocaleString()}
                </span>
              </div>
              <div
                className={`border-l pl-4 sm:pl-5 ${
                  isDark ? "border-stone-800" : "border-stone-200"
                }`}
              >
                <span
                  className={`block text-xs font-semibold uppercase tracking-wider ${
                    isDark ? "text-stone-400" : "text-stone-500"
                  }`}
                >
                  Duration
                </span>
                <span
                  className={`mt-1.5 block text-base font-bold sm:text-lg ${
                    isDark ? "text-white" : "text-stone-900"
                  }`}
                >
                  {formatServiceDuration(service.duration)}
                </span>
              </div>
            </div>

            <div className="pt-1">
              {!isServiceActive ? (
                <div
                  className={`inline-flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    isDark
                      ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  <ShieldAlert
                    className={`h-5 w-5 shrink-0 ${
                      isDark ? "text-rose-300" : "text-rose-600"
                    }`}
                  />
                  <span>This service is currently inactive.</span>
                </div>
              ) : !isCustomer ? (
                <div
                  className={`inline-flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    isDark
                      ? "border-amber-400/30 bg-amber-500/10 text-amber-200"
                      : "border-amber-300 bg-amber-50 text-amber-900"
                  }`}
                >
                  <ShieldAlert
                    className={`h-5 w-5 shrink-0 ${
                      isDark ? "text-amber-400" : "text-amber-700"
                    }`}
                  />
                  <span>
                    Only customer accounts can book appointments (Admin/other
                    roles cannot book).
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowBookingForm((prev) => !prev)}
                  className="inline-flex cursor-pointer items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-600/25 transition hover:from-amber-400 hover:to-amber-600 sm:text-base"
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

        <div
          className={`rounded-2xl border p-5 sm:p-6 ${
            isDark
              ? "border-stone-800 bg-[#14110D]"
              : "border-stone-200/80 bg-stone-50/50"
          }`}
        >
          <h2
            className={`mb-3 text-xs font-bold uppercase tracking-wider ${
              isDark ? "text-amber-300" : "text-amber-800"
            }`}
          >
            Service Description
          </h2>
          <p
            className={`whitespace-pre-line text-sm leading-relaxed sm:text-base ${
              isDark ? "text-stone-300" : "text-stone-700"
            }`}
          >
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
              onClose={() => setShowBookingForm(false)}
            />
          </div>
        )}
      </div>
    </section>
  );
}
