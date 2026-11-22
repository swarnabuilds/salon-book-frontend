"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  cancelAppointment,
  getMyAppointments,
  SalonAppointment,
} from "@/lib/action/appointmentActions";
import AppointmentDetailsModal from "@/components/my-appointment/AppointmentDetailsModal";
import CancelAppointmentModal from "@/components/my-appointment/CancelAppointmentModal";
import {
  Calendar,
  Clock,
  Loader2,
  Scissors,
  CalendarPlus,
  Plus,
  MoreVertical,
  Eye,
  CreditCard,
  XCircle,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

interface ToastState {
  type: "success" | "error";
  message: string;
}

function formatAppointmentDate(dateStr?: string): string {
  if (!dateStr) return "N/A";

  const parsed = new Date(`${dateStr}T00:00:00`);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const fallback = new Date(dateStr);

  return Number.isNaN(fallback.getTime())
    ? dateStr
    : fallback.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function formatRequestDate(dateStr?: string): string {
  if (!dateStr) return "N/A";

  const parsed = new Date(dateStr);

  if (Number.isNaN(parsed.getTime())) return dateStr;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadgeClass(status: string): string {
  if (status === "confirmed") {
    return "border-emerald-400/40 bg-emerald-500/15 text-emerald-300";
  }

  if (status === "completed") {
    return "border-sky-400/40 bg-sky-500/15 text-sky-300";
  }

  if (status === "cancelled") {
    return "border-rose-400/40 bg-rose-500/15 text-rose-300";
  }

  return "border-amber-400/40 bg-amber-500/15 text-amber-300";
}

function getPaymentBadgeClass(payment: string): string {
  if (payment === "paid") {
    return "border-emerald-400/40 bg-emerald-500/15 text-emerald-300";
  }

  return "border-stone-700 bg-stone-900 text-stone-300";
}

function getCategoryBadgeClass(index: number): string {
  void index;
  return "border-amber-400/35 bg-amber-500/10 text-amber-200";
}

export default function MyAppointmentsPage() {
  const router = useRouter();

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [loadedForEmail, setLoadedForEmail] = useState<string>("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<SalonAppointment | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<SalonAppointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const userEmail = session?.user?.email || "";
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      router.replace("/sign-in");
    }
  }, [isSessionLoading, session, router]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (isSessionLoading || !userEmail) return;

    let isMounted = true;

    getMyAppointments(userEmail).then((res) => {
      if (!isMounted) return;

      setAppointments(res.success ? res.data : []);
      setLoadedForEmail(userEmail);
    });

    return () => {
      isMounted = false;
    };
  }, [isSessionLoading, userEmail]);

  const handleConfirmCancel = async (item: SalonAppointment) => {
    const statusText = String(item.status || "pending").toLowerCase();

    if (statusText !== "pending") {
      setToast({
        type: "error",
        message: `Cannot cancel an already ${statusText} appointment.`,
      });
      setAppointmentToCancel(null);
      return;
    }

    setIsCancelling(true);
    const res = await cancelAppointment(item._id);
    setIsCancelling(false);

    if (res.success) {
      setAppointments((prev) =>
        prev.map((row) =>
          row._id === item._id ? { ...row, status: "cancelled" } : row
        )
      );
      if (selectedAppointment?._id === item._id) {
        setSelectedAppointment((prev) =>
          prev ? { ...prev, status: "cancelled" } : null
        );
      }
      setAppointmentToCancel(null);
      setToast({
        type: "success",
        message: res.message,
      });
    } else {
      setToast({
        type: "error",
        message: res.message,
      });
    }
  };

  const handlePayNow = (item: SalonAppointment) => {
    const statusText = String(item.status || "pending").toLowerCase();
    const paymentText = String(item.paymentStatus || "unpaid").toLowerCase();

    if (statusText !== "confirmed") {
      setToast({
        type: "error",
        message: "You can only pay for confirmed appointments.",
      });
      return;
    }

    if (paymentText === "paid") {
      setToast({
        type: "error",
        message: "This appointment is already paid.",
      });
      return;
    }

    const params = new URLSearchParams({
      appointmentId: item._id,
      serviceName: item.serviceName || "Salon Service",
      amount: String(Number(item.servicePrice || 20)),
      date: formatAppointmentDate(item.appointmentDate),
      timeSlot: item.timeSlot || "",
    });

    router.push(`/checkout?${params.toString()}`);
  };

  const isLoading =
    isSessionLoading || (Boolean(userEmail) && loadedForEmail !== userEmail);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-lg font-semibold text-stone-300">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        <span>Loading your appointments...</span>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-5 right-5 z-50 flex max-w-md items-center gap-3.5 rounded-2xl border px-5 py-4 text-base font-bold shadow-2xl backdrop-blur-md ${
            toast.type === "success"
              ? "border-emerald-400/50 bg-[#181510]/95 text-emerald-200"
              : "border-rose-400/50 bg-[#181510]/95 text-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Close notification"
            className="ml-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="mx-auto min-h-screen max-w-7xl space-y-6 bg-[#110F0B] px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-800 bg-[#181510] px-6 py-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
              My Appointments
            </h1>
            <p className="mt-1.5 text-base text-stone-400 sm:text-lg">
              All appointment requests submitted by your account.
            </p>
          </div>

          {userRole !== "admin" && (
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-[#A68B5B] px-5 py-3 text-base font-bold text-stone-950 transition hover:bg-[#B89B6A] sm:self-auto"
            >
              <Plus className="h-5 w-5" />
              Book New Service
            </Link>
          )}
        </div>

        {/* Appointments Table */}
        {appointments.length === 0 ? (
          <div className="space-y-3 rounded-xl border border-stone-800 bg-[#181510] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-900">
              <Calendar className="h-6 w-6 text-amber-400" />
            </div>

            <h2 className="text-xl font-bold text-white sm:text-2xl">
              No Appointments Yet
            </h2>

            <p className="text-base text-stone-400 sm:text-lg">
              You have not submitted any appointment requests yet.
            </p>
          </div>
        ) : (
          <div className="overflow-visible rounded-xl border border-stone-800 bg-[#181510] shadow-xl">
            {/* Table Top Bar */}
            <div className="flex items-center justify-between border-b border-stone-800 bg-[#1D1913] px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-white sm:text-xl">
                  Booking History
                </h2>
                <p className="mt-1 text-sm text-stone-400 sm:text-base">
                  Manage your salon bookings
                </p>
              </div>

              <span className="rounded-md border border-stone-700 bg-[#14110D] px-3.5 py-1.5 text-sm font-semibold text-stone-300 sm:text-base">
                {appointments.length} Bookings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-stone-800 bg-[#15120E] text-xs font-bold uppercase tracking-wider text-stone-400 sm:text-sm">
                    <th className="px-5 py-4">Service</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Appointment Schedule</th>
                    <th className="px-4 py-4">Request Date</th>
                    <th className="px-4 py-4">Price</th>
                    <th className="px-4 py-4">Status &amp; Payment</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-800/80 text-base sm:text-lg">
                  {appointments.map((item, idx) => {
                    const statusText = String(
                      item.status || "pending"
                    ).toLowerCase();

                    const paymentText = String(
                      item.paymentStatus || "unpaid"
                    ).toLowerCase();

                    const canCancel = statusText === "pending";
                    // Show Pay Now only when payment is not yet paid and booking isn't cancelled
                    const canPay =
                      paymentText !== "paid" && statusText !== "cancelled";
                    const isMenuOpen = openMenuId === item._id;

                    return (
                      <tr
                        key={item._id}
                        className="transition-colors duration-200 hover:bg-[#211C16]"
                      >
                        {/* Service Image & Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="relative flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-700 bg-[#120F0C] text-amber-400">
                              <Scissors className="h-5 w-5" />

                              {item.serviceImage && (
                                <img
                                  src={item.serviceImage}
                                  alt={item.serviceName}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                  className="absolute inset-0 h-full w-full object-cover"
                                />
                              )}
                            </div>

                            <span className="max-w-[200px] text-base font-bold text-white sm:text-lg">
                              {item.serviceName}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold sm:text-base ${getCategoryBadgeClass(
                              idx
                            )}`}
                          >
                            {item.serviceCategory || "Salon Service"}
                          </span>
                        </td>

                        {/* Appointment Date & Time */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 font-semibold text-stone-100">
                              <Calendar className="h-4 w-4 shrink-0 text-amber-400" />
                              <span>
                                {formatAppointmentDate(item.appointmentDate)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-stone-400 sm:text-base">
                              <Clock className="h-4 w-4 shrink-0 text-stone-400" />
                              <span>{item.timeSlot}</span>
                            </div>
                          </div>
                        </td>

                        {/* Request Date */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="inline-flex items-center gap-2 text-sm font-medium text-stone-300 sm:text-base">
                            <CalendarPlus className="h-4 w-4 shrink-0 text-stone-400" />
                            <span>{formatRequestDate(item.createdAt)}</span>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="inline-flex rounded-md border border-amber-400/35 bg-amber-500/10 px-3.5 py-1.5 text-base font-bold text-amber-300 sm:text-lg">
                            ${Number(item.servicePrice || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* Status & Payment */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-start gap-2">
                            <span
                              className={`inline-flex items-center rounded-md border px-3 py-1 text-xs font-bold capitalize sm:text-sm ${getStatusBadgeClass(
                                statusText
                              )}`}
                            >
                              {statusText}
                            </span>

                            <span
                              className={`inline-flex items-center rounded-md border px-3 py-1 text-xs font-semibold capitalize sm:text-sm ${getPaymentBadgeClass(
                                paymentText
                              )}`}
                            >
                              {paymentText}
                            </span>
                          </div>
                        </td>

                        {/* Action Dropdown */}
                        <td className="px-5 py-4 text-right">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId((prev) =>
                                  prev === item._id ? null : item._id
                                )
                              }
                              aria-label="Appointment actions"
                              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-700 bg-[#14110D] px-3.5 py-2 text-sm font-semibold text-stone-200 transition hover:border-amber-400/40 hover:text-amber-300 sm:text-base"
                            >
                              <span>Actions</span>
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 z-30 mt-2 w-52 rounded-lg border border-stone-700 bg-[#181510] p-1.5 shadow-2xl">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setSelectedAppointment(item);
                                  }}
                                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-semibold text-stone-200 transition hover:bg-[#241F18] hover:text-white sm:text-base"
                                >
                                  <Eye className="h-4 w-4 text-sky-400" />
                                  <span>View Details</span>
                                </button>

                                {canPay && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handlePayNow(item);
                                    }}
                                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-semibold text-stone-200 transition hover:bg-[#241F18] hover:text-emerald-300 sm:text-base"
                                  >
                                    <CreditCard className="h-4 w-4 text-emerald-400" />
                                    <span>Pay Now</span>
                                  </button>
                                )}

                                {canCancel && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setAppointmentToCancel(item);
                                    }}
                                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-[#241F18] hover:text-rose-200 sm:text-base"
                                  >
                                    <XCircle className="h-4 w-4 text-rose-400" />
                                    <span>Cancel Request</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        formatAppointmentDate={formatAppointmentDate}
        formatRequestDate={formatRequestDate}
        getStatusBadgeClass={getStatusBadgeClass}
        getPaymentBadgeClass={getPaymentBadgeClass}
      />

      <CancelAppointmentModal
        appointment={appointmentToCancel}
        isCancelling={isCancelling}
        onClose={() => setAppointmentToCancel(null)}
        onConfirmCancel={handleConfirmCancel}
        formatAppointmentDate={formatAppointmentDate}
      />
    </>
  );
}