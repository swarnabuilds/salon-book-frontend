"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  Scissors,
  Search,
  XCircle,
} from "lucide-react";

type StatusFilter = "all" | "pending" | "confirmed" | "cancelled";

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

function ServiceThumb({ appointment }: { appointment: SalonAppointment }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (appointment.serviceImage && !imageFailed) {
    return (
      <img
        src={appointment.serviceImage}
        alt={appointment.serviceName}
        onError={() => setImageFailed(true)}
        className="h-12 w-14 shrink-0 rounded-xl border border-stone-700 object-cover"
      />
    );
  }

  return (
    <span className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/10 text-amber-300">
      <Scissors className="h-5 w-5" />
    </span>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  icon,
  accent,
  valueClass = "text-white",
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  accent: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
          {label}
        </span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${accent}`}
        >
          {icon}
        </span>
      </div>
      <p className={`mt-4 text-3xl font-extrabold ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs text-stone-500">{hint}</p>
    </div>
  );
}

export default function MyAppointmentsPage() {
  const router = useRouter();

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const sessionUser = session?.user as
    | {
        id?: string;
        name?: string | null;
        email?: string | null;
        role?: string | null;
        isBlocked?: boolean;
      }
    | undefined;

  const userEmail = sessionUser?.email || "";
  const userRole = String(sessionUser?.role || "customer")
    .trim()
    .toLowerCase();
  const isCustomer = userRole === "customer";

  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<SalonAppointment | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<SalonAppointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (isSessionLoading) return;

    if (!sessionUser) {
      router.replace("/signin");
      return;
    }

    if (sessionUser.isBlocked) {
      router.replace("/signin?blocked=1");
      return;
    }

    if (!isCustomer) {
      router.replace("/dashboard/admin");
    }
  }, [isSessionLoading, sessionUser, isCustomer, router]);

  useEffect(() => {
    if (isSessionLoading || !isCustomer || !userEmail) return;

    let isMounted = true;

    getMyAppointments().then((res) => {
      if (!isMounted) return;

      if (!res.success) {
        setAppointments([]);
        setErrorMsg(res.message || "Failed to load your appointments.");
        setIsLoading(false);
        return;
      }

      setAppointments(res.data);
      setErrorMsg("");
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isSessionLoading, isCustomer, userEmail]);

  // Close the actions menu when clicking anywhere else.
  useEffect(() => {
    if (!openMenuId) return;

    const closeMenu = () => setOpenMenuId(null);

    document.addEventListener("click", closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [openMenuId]);

  const summary = useMemo(() => {
    const pending = appointments.filter(
      (item) => String(item.status || "pending").toLowerCase() === "pending"
    ).length;
    const confirmed = appointments.filter(
      (item) => String(item.status || "").toLowerCase() === "confirmed"
    ).length;
    const cancelled = appointments.filter(
      (item) => String(item.status || "").toLowerCase() === "cancelled"
    ).length;

    return {
      total: appointments.length,
      pending,
      confirmed,
      cancelled,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return appointments.filter((item) => {
      const status = String(item.status || "pending").toLowerCase();

      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!query) return true;

      return `${item.serviceName} ${item.serviceCategory || ""}`
        .toLowerCase()
        .includes(query);
    });
  }, [appointments, searchQuery, statusFilter]);

  const hasFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  const refreshAppointments = async (showToast: boolean) => {
    setIsLoading(true);
    setErrorMsg("");

    const res = await getMyAppointments();

    if (!res.success) {
      setAppointments([]);
      setErrorMsg(res.message || "Failed to load your appointments.");
      setIsLoading(false);
      if (showToast) toast.error("Could not refresh your appointments.");
      return;
    }

    setAppointments(res.data);
    setIsLoading(false);
    if (showToast) toast.success("Appointments refreshed.");
  };

  const handleConfirmCancel = async (item: SalonAppointment) => {
    const statusText = String(item.status || "pending").toLowerCase();

    if (statusText !== "pending") {
      toast.error(`Cannot cancel an already ${statusText} appointment.`);
      setAppointmentToCancel(null);
      return;
    }

    setIsCancelling(true);
    const res = await cancelAppointment(item._id);
    setIsCancelling(false);

    if (!res.success) {
      toast.error(res.message || "Failed to cancel appointment.");
      return;
    }

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
    toast.success(res.message || "Appointment cancelled successfully.");
  };

  const handlePayNow = (item: SalonAppointment) => {
    const statusText = String(item.status || "pending").toLowerCase();
    const paymentText = String(item.paymentStatus || "unpaid").toLowerCase();

    if (statusText !== "confirmed") {
      toast.error("You can only pay for confirmed appointments.");
      return;
    }

    if (paymentText === "paid") {
      toast.error("This appointment is already paid.");
      return;
    }

    const params = new URLSearchParams({
      appointmentId: item._id,
      serviceName: item.serviceName || "Salon Service",
      amount: String(Number(item.servicePrice || 0)),
      date: formatAppointmentDate(item.appointmentDate),
      timeSlot: item.timeSlot || "",
    });

    router.push(`/checkout?${params.toString()}`);
  };

  if (isSessionLoading || !isCustomer) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center gap-3 bg-[#110F0B] text-lg font-semibold text-stone-300">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        <span>Checking your account...</span>
      </div>
    );
  }

  return (
    <>
      <section className="min-h-screen bg-[#110F0B] px-4 py-8 text-stone-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-800 bg-[#181510] p-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                Customer Dashboard
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                My Appointments
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-stone-400 sm:text-base">
                View every request, track confirmation, and pay for approved
                salon visits.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => refreshAppointments(true)}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-[#14110D] px-4 py-2.5 text-sm font-bold text-stone-200 transition hover:border-amber-400/40 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A68B5B] px-5 py-2.5 text-sm font-bold text-stone-950 transition hover:bg-[#B89B6A]"
              >
                <Plus className="h-4 w-4" />
                Book New Service
              </Link>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Requests"
              value={summary.total}
              hint="All bookings submitted by you"
              icon={<Calendar className="h-4 w-4 text-amber-300" />}
              accent="border-amber-400/30 bg-amber-500/10"
            />
            <SummaryCard
              label="Pending"
              value={summary.pending}
              hint="Awaiting salon confirmation"
              icon={<Clock className="h-4 w-4 text-amber-300" />}
              accent="border-amber-400/30 bg-amber-500/10"
              valueClass="text-amber-300"
            />
            <SummaryCard
              label="Confirmed"
              value={summary.confirmed}
              hint="Approved and ready for payment"
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />}
              accent="border-emerald-400/30 bg-emerald-500/10"
              valueClass="text-emerald-300"
            />
            <SummaryCard
              label="Cancelled"
              value={summary.cancelled}
              hint="Requests you cancelled"
              icon={<XCircle className="h-4 w-4 text-rose-300" />}
              accent="border-rose-400/30 bg-rose-500/10"
              valueClass="text-rose-300"
            />
          </div>

          {/* Search and filters */}
          <div className="rounded-2xl border border-stone-800 bg-[#181510] p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by service name or category..."
                  aria-label="Search appointments"
                  className="w-full rounded-xl border border-stone-700 bg-[#14110D] py-3 pl-11 pr-4 text-sm text-white placeholder-stone-500 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/15"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: "all", label: "All" },
                    { value: "pending", label: "Pending" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "cancelled", label: "Cancelled" },
                  ] as const
                ).map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    aria-pressed={statusFilter === filter.value}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                      statusFilter === filter.value
                        ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                        : "border-stone-700 bg-[#14110D] text-stone-300 hover:border-stone-600 hover:text-white"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-3 text-xs text-stone-500">
              Showing {filteredAppointments.length} of {appointments.length}{" "}
              appointments
            </p>
          </div>

          {/* States */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-stone-800 bg-[#181510] py-16 text-base font-semibold text-stone-300">
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <span>Loading your appointments...</span>
            </div>
          ) : errorMsg ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-300">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">
                Could not load appointments
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-rose-100/80">
                {errorMsg}
              </p>
              <button
                type="button"
                onClick={() => refreshAppointments(false)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-400"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="rounded-2xl border border-stone-800 bg-[#181510] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-amber-400">
                <Calendar className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">
                {hasFilters ? "No matching appointments" : "No appointments yet"}
              </h2>
              <p className="mt-2 text-sm text-stone-400">
                {hasFilters
                  ? "Try a different search term or status filter."
                  : "Explore our salon services and submit your first booking request."}
              </p>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-[#14110D] px-5 py-2.5 text-sm font-bold text-stone-200 transition hover:border-amber-400/40 hover:text-amber-300"
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  href="/services"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#A68B5B] px-5 py-2.5 text-sm font-bold text-stone-950 transition hover:bg-[#B89B6A]"
                >
                  <Plus className="h-4 w-4" />
                  Browse Services
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-stone-800 bg-[#181510] shadow-xl lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-stone-800 bg-[#15120E] text-xs font-bold uppercase tracking-wider text-stone-400">
                        <th className="px-5 py-4">Service</th>
                        <th className="px-4 py-4">Schedule</th>
                        <th className="px-4 py-4">Requested</th>
                        <th className="px-4 py-4">Price</th>
                        <th className="px-4 py-4">Status &amp; Payment</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-stone-800/80">
                      {filteredAppointments.map((item) => {
                        const statusText = String(
                          item.status || "pending"
                        ).toLowerCase();
                        const paymentText = String(
                          item.paymentStatus || "unpaid"
                        ).toLowerCase();
                        const canCancel = statusText === "pending";
                        const canPay =
                          statusText === "confirmed" && paymentText !== "paid";
                        const isMenuOpen = openMenuId === item._id;

                        return (
                          <tr
                            key={item._id}
                            className="transition-colors hover:bg-[#211C16]"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3.5">
                                <ServiceThumb appointment={item} />
                                <div className="min-w-0">
                                  <p className="truncate font-bold text-white">
                                    {item.serviceName}
                                  </p>
                                  <span className="mt-1 inline-flex rounded-lg border border-amber-400/25 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-200">
                                    {item.serviceCategory || "Salon Service"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-4 py-4">
                              <div className="space-y-1.5">
                                <span className="flex items-center gap-2 text-sm font-semibold text-stone-100">
                                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                                  {formatAppointmentDate(
                                    item.appointmentDate
                                  )}
                                </span>
                                <span className="flex items-center gap-2 text-sm text-stone-400">
                                  <Clock className="h-3.5 w-3.5 text-stone-500" />
                                  {item.timeSlot || "Time slot"}
                                </span>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-4 py-4">
                              <span className="inline-flex items-center gap-2 text-sm text-stone-300">
                                <CalendarPlus className="h-3.5 w-3.5 text-stone-500" />
                                {formatRequestDate(item.createdAt)}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-4">
                              <span className="inline-flex rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-300">
                                ৳
                                {Number(item.servicePrice || 0).toLocaleString()}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex flex-col items-start gap-1.5">
                                <span
                                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusBadgeClass(
                                    statusText
                                  )}`}
                                >
                                  {statusText}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getPaymentBadgeClass(
                                    paymentText
                                  )}`}
                                >
                                  {paymentText}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <div
                                className="relative inline-block text-left"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenMenuId((prev) =>
                                      prev === item._id ? null : item._id
                                    )
                                  }
                                  aria-label="Appointment actions"
                                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-700 bg-[#14110D] px-3.5 py-2 text-xs font-bold text-stone-200 transition hover:border-amber-400/40 hover:text-amber-300"
                                >
                                  <span>Actions</span>
                                  <MoreVertical className="h-4 w-4" />
                                </button>

                                {isMenuOpen && (
                                  <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-stone-700 bg-[#181510] p-1.5 shadow-2xl">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        setSelectedAppointment(item);
                                      }}
                                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-stone-200 transition hover:bg-[#241F18] hover:text-white"
                                    >
                                      <Eye className="h-4 w-4 text-sky-400" />
                                      View Details
                                    </button>

                                    {canPay && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          handlePayNow(item);
                                        }}
                                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-[#241F18]"
                                      >
                                        <CreditCard className="h-4 w-4" />
                                        Pay Now
                                      </button>
                                    )}

                                    {canCancel && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          setAppointmentToCancel(item);
                                        }}
                                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-[#241F18]"
                                      >
                                        <XCircle className="h-4 w-4" />
                                        Cancel Request
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

              {/* Mobile cards */}
              <div className="space-y-3 lg:hidden">
                {filteredAppointments.map((item) => {
                  const statusText = String(
                    item.status || "pending"
                  ).toLowerCase();
                  const paymentText = String(
                    item.paymentStatus || "unpaid"
                  ).toLowerCase();
                  const canCancel = statusText === "pending";
                  const canPay =
                    statusText === "confirmed" && paymentText !== "paid";

                  return (
                    <article
                      key={item._id}
                      className="rounded-2xl border border-stone-800 bg-[#181510] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <ServiceThumb appointment={item} />
                          <div className="min-w-0">
                            <p className="truncate font-bold text-white">
                              {item.serviceName}
                            </p>
                            <p className="truncate text-xs text-stone-400">
                              {item.serviceCategory || "Salon Service"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusBadgeClass(
                            statusText
                          )}`}
                        >
                          {statusText}
                        </span>
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-800 pt-4 text-xs">
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-stone-500">
                            Schedule
                          </dt>
                          <dd className="mt-1 text-stone-200">
                            {formatAppointmentDate(item.appointmentDate)}
                            <span className="block text-stone-400">
                              {item.timeSlot || "Time slot"}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-stone-500">
                            Price
                          </dt>
                          <dd className="mt-1 font-bold text-amber-300">
                            ৳
                            {Number(item.servicePrice || 0).toLocaleString()}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-stone-500">
                            Requested
                          </dt>
                          <dd className="mt-1 text-stone-300">
                            {formatRequestDate(item.createdAt)}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-stone-500">
                            Payment
                          </dt>
                          <dd className="mt-1">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-0.5 font-semibold capitalize ${getPaymentBadgeClass(
                                paymentText
                              )}`}
                            >
                              {paymentText}
                            </span>
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAppointment(item)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-500/20"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Details
                        </button>

                        {canPay && (
                          <button
                            type="button"
                            onClick={() => handlePayNow(item)}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            Pay Now
                          </button>
                        )}

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => setAppointmentToCancel(item)}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
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
