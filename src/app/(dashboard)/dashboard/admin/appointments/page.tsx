"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  getAllAppointments,
  updateAppointmentStatus,
  type SalonAppointment,
} from "@/lib/action/appointmentActions";
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Scissors,
  Search,
  X,
  XCircle,
} from "lucide-react";

type StatusFilter = "all" | "pending" | "confirmed" | "cancelled";
type ActionKind = "confirm" | "cancel";

function formatDate(value?: string): string {
  if (!value) return "Not available";

  const parsed = new Date(`${value}T00:00:00`);
  const target = Number.isNaN(parsed.getTime()) ? new Date(value) : parsed;

  if (Number.isNaN(target.getTime())) return value;

  return target.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value?: string): string {
  if (!value) return "Not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusBadgeClass(status: string): string {
  if (status === "confirmed") {
    return "border-emerald-400/35 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "completed") {
    return "border-sky-400/35 bg-sky-500/10 text-sky-300";
  }

  if (status === "cancelled") {
    return "border-rose-400/35 bg-rose-500/10 text-rose-300";
  }

  return "border-amber-400/35 bg-amber-500/10 text-amber-300";
}

function getPaymentBadgeClass(payment: string): string {
  if (payment === "paid") {
    return "border-emerald-400/35 bg-emerald-500/10 text-emerald-300";
  }

  return "border-stone-700 bg-stone-900 text-stone-300";
}

function getInitials(name?: string, email?: string): string {
  const source = (name || email || "C").trim();
  const parts = source.split(/\s+/);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function CustomerAvatar({
  name,
  email,
  image,
}: {
  name?: string;
  email?: string;
  image?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (image && !imageFailed) {
    return (
      <img
        src={image}
        alt={name || email || "Customer"}
        onError={() => setImageFailed(true)}
        className="h-11 w-11 shrink-0 rounded-xl border border-stone-700 object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/10 text-sm font-bold text-amber-300">
      {getInitials(name, email)}
    </div>
  );
}

function ServiceThumb({ image, name }: { image?: string; name?: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (image && !imageFailed) {
    return (
      <img
        src={image}
        alt={name || "Salon service"}
        onError={() => setImageFailed(true)}
        className="h-11 w-11 shrink-0 rounded-xl border border-stone-700 object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/10 text-amber-300">
      <Scissors className="h-4 w-4" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusBadgeClass(
        status
      )}`}
    >
      {status === "confirmed" ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : status === "cancelled" ? (
        <XCircle className="h-3.5 w-3.5" />
      ) : (
        <Clock className="h-3.5 w-3.5" />
      )}
      {status}
    </span>
  );
}

function PaymentBadge({ payment }: { payment: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getPaymentBadgeClass(
        payment
      )}`}
    >
      {payment}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
  valueClass = "text-white",
}: {
  label: string;
  value: number;
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
    </div>
  );
}

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const sessionUser = session?.user as
    | { role?: string; isBlocked?: boolean }
    | undefined;

  const isAdmin =
    String(sessionUser?.role || "").trim().toLowerCase() === "admin";

  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedAppointment, setSelectedAppointment] =
    useState<SalonAppointment | null>(null);
  const [actionTarget, setActionTarget] = useState<{
    appointment: SalonAppointment;
    action: ActionKind;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

    if (!isAdmin) {
      router.replace("/dashboard/customer");
    }
  }, [isSessionLoading, sessionUser, isAdmin, router]);

  useEffect(() => {
    if (isSessionLoading || !isAdmin) return;

    let active = true;

    getAllAppointments().then((result) => {
      if (!active) return;

      if (!result.success) {
        setAppointments([]);
        setErrorMsg(result.message || "Failed to load appointments.");
        setIsLoading(false);
        return;
      }

      setAppointments(result.data);
      setErrorMsg("");
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [isSessionLoading, isAdmin]);

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

      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }

      if (!query) return true;

      return `${item.customerName || ""} ${item.customerEmail || ""} ${
        item.serviceName || ""
      }`
        .toLowerCase()
        .includes(query);
    });
  }, [appointments, searchQuery, statusFilter]);

  const hasFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMsg("");

    const result = await getAllAppointments();

    if (!result.success) {
      setAppointments([]);
      setErrorMsg(result.message || "Failed to load appointments.");
      setIsLoading(false);
      toast.error("Could not refresh the appointment list.");
      return;
    }

    setAppointments(result.data);
    setIsLoading(false);
    toast.success("Appointment list refreshed.");
  };

  const openAction = (appointment: SalonAppointment, action: ActionKind) => {
    setSelectedAppointment(null);
    setActionTarget({ appointment, action });
  };

  const handleAction = async () => {
    if (!actionTarget || isUpdating) return;

    const { appointment, action } = actionTarget;
    const nextStatus = action === "confirm" ? "confirmed" : "cancelled";

    setIsUpdating(true);
    const result = await updateAppointmentStatus(appointment._id, nextStatus);
    setIsUpdating(false);

    if (!result.success) {
      toast.error(result.message || "Failed to update appointment status.");
      return;
    }

    const updatedAppointment = { ...appointment, status: nextStatus };

    setAppointments((previous) =>
      previous.map((row) =>
        row._id === appointment._id ? updatedAppointment : row
      )
    );

    setSelectedAppointment((previous) =>
      previous && previous._id === appointment._id
        ? updatedAppointment
        : previous
    );

    toast.success(
      result.message || `Appointment ${nextStatus} successfully.`
    );
    setActionTarget(null);
  };

  if (isSessionLoading || !isAdmin) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center gap-3 bg-[#110F0B] text-lg font-semibold text-stone-300">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        <span>Checking admin access...</span>
      </div>
    );
  }

  return (
    <>
      <section className="min-h-screen bg-[#110F0B] px-4 py-8 text-stone-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page header */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-800 bg-[#181510] p-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                Admin Dashboard
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                Manage Appointments
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-stone-400 sm:text-base">
                Review every booking request, confirm pending appointments, and
                cancel pending or confirmed ones.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-stone-700 bg-[#14110D] px-4 py-2.5 text-sm font-bold text-stone-200 transition hover:border-amber-400/40 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Requests"
              value={summary.total}
              icon={<CalendarCheck className="h-4 w-4 text-amber-300" />}
              accent="border-amber-400/30 bg-amber-500/10"
            />
            <SummaryCard
              label="Pending"
              value={summary.pending}
              icon={<Clock className="h-4 w-4 text-amber-300" />}
              accent="border-amber-400/30 bg-amber-500/10"
              valueClass="text-amber-300"
            />
            <SummaryCard
              label="Confirmed"
              value={summary.confirmed}
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />}
              accent="border-emerald-400/30 bg-emerald-500/10"
              valueClass="text-emerald-300"
            />
            <SummaryCard
              label="Cancelled"
              value={summary.cancelled}
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
                  placeholder="Search by customer, email, or service..."
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

          {/* Loading, error, empty, and list states */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-stone-800 bg-[#181510] py-16 text-base font-semibold text-stone-300">
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <span>Loading appointment requests...</span>
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
                onClick={handleRefresh}
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
                No appointments found
              </h2>
              <p className="mt-2 text-sm text-stone-400">
                {hasFilters
                  ? "No appointments match your search or filter."
                  : "Bookings for your services will appear here."}
              </p>
              {hasFilters && (
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
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-stone-800 bg-[#181510] shadow-xl lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[940px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-stone-800 bg-[#15120E] text-xs font-bold uppercase tracking-wider text-stone-400">
                        <th className="px-5 py-4">Customer</th>
                        <th className="px-4 py-4">Service</th>
                        <th className="px-4 py-4">Schedule</th>
                        <th className="px-4 py-4">Price</th>
                        <th className="px-4 py-4">Status</th>
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
                        const canConfirm = statusText === "pending";
                        const canCancel =
                          statusText === "pending" ||
                          statusText === "confirmed";

                        return (
                          <tr
                            key={item._id}
                            className="transition-colors hover:bg-[#211C16]"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3.5">
                                <CustomerAvatar
                                  name={item.customerName}
                                  email={item.customerEmail}
                                  image={item.customerImage}
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-bold text-white">
                                    {item.customerName || "Customer"}
                                  </p>
                                  <p className="truncate text-sm text-stone-400">
                                    {item.customerEmail || "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3.5">
                                <ServiceThumb
                                  image={item.serviceImage}
                                  name={item.serviceName}
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-bold text-white">
                                    {item.serviceName || "Salon service"}
                                  </p>
                                  <p className="truncate text-sm text-stone-400">
                                    {item.serviceCategory || "Salon Service"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-4 py-4">
                              <p className="flex items-center gap-1.5 text-sm font-semibold text-stone-100">
                                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                                {formatDate(item.appointmentDate)}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-400">
                                <Clock className="h-3.5 w-3.5" />
                                {item.timeSlot || "Time slot"}
                              </p>
                              <p className="mt-1 text-[11px] text-stone-500">
                                Requested {formatDateTime(item.createdAt)}
                              </p>
                            </td>

                            <td className="whitespace-nowrap px-4 py-4">
                              <span className="inline-flex rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-300">
                                $
                                {Number(item.servicePrice || 0).toLocaleString()}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex flex-col items-start gap-1.5">
                                <StatusBadge status={statusText} />
                                <PaymentBadge payment={paymentText} />
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedAppointment(item)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-500/20"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </button>

                                {canConfirm && (
                                  <button
                                    type="button"
                                    onClick={() => openAction(item, "confirm")}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Confirm
                                  </button>
                                )}

                                {canCancel && (
                                  <button
                                    type="button"
                                    onClick={() => openAction(item, "cancel")}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Cancel
                                  </button>
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
                  const canConfirm = statusText === "pending";
                  const canCancel =
                    statusText === "pending" || statusText === "confirmed";

                  return (
                    <article
                      key={item._id}
                      className="rounded-2xl border border-stone-800 bg-[#181510] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <CustomerAvatar
                            name={item.customerName}
                            email={item.customerEmail}
                            image={item.customerImage}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-bold text-white">
                              {item.customerName || "Customer"}
                            </p>
                            <p className="truncate text-sm text-stone-400">
                              {item.customerEmail || "No email"}
                            </p>
                          </div>
                        </div>

                        <StatusBadge status={statusText} />
                      </div>

                      <div className="mt-4 space-y-3 border-t border-stone-800 pt-4">
                        <div className="flex items-center gap-3">
                          <ServiceThumb
                            image={item.serviceImage}
                            name={item.serviceName}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white">
                              {item.serviceName || "Salon service"}
                            </p>
                            <p className="truncate text-xs text-stone-400">
                              {item.serviceCategory || "Salon Service"}
                            </p>
                          </div>

                          <span className="ml-auto shrink-0 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-300">
                            ${Number(item.servicePrice || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-amber-400" />
                            {formatDate(item.appointmentDate)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {item.timeSlot || "Time slot"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-stone-500">
                            Requested {formatDateTime(item.createdAt)}
                          </span>
                          <PaymentBadge payment={paymentText} />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-800 pt-4">
                        <button
                          type="button"
                          onClick={() => setSelectedAppointment(item)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-500/20"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>

                        {canConfirm && (
                          <button
                            type="button"
                            onClick={() => openAction(item, "confirm")}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Confirm
                          </button>
                        )}

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => openAction(item, "cancel")}
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

      {/* Appointment details modal */}
      {selectedAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Appointment details"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAppointment(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-stone-800 bg-[#181510] p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                  Appointment Details
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  {selectedAppointment.serviceName || "Salon service"}
                </h2>
                <p className="mt-1 text-sm text-stone-400">
                  {selectedAppointment.serviceCategory || "Salon Service"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                aria-label="Close appointment details"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-700 bg-[#14110D] text-stone-400 transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Customer information */}
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-stone-800 bg-[#14110D] p-4">
              <CustomerAvatar
                name={selectedAppointment.customerName}
                email={selectedAppointment.customerEmail}
                image={selectedAppointment.customerImage}
              />
              <div className="min-w-0">
                <p className="truncate font-bold text-white">
                  {selectedAppointment.customerName || "Customer"}
                </p>
                <p className="flex items-center gap-1.5 truncate text-sm text-stone-400">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {selectedAppointment.customerEmail || "No email"}
                </p>
              </div>
              <div className="ml-auto flex shrink-0 flex-col items-end gap-1.5">
                <StatusBadge
                  status={String(
                    selectedAppointment.status || "pending"
                  ).toLowerCase()}
                />
                <PaymentBadge
                  payment={String(
                    selectedAppointment.paymentStatus || "unpaid"
                  ).toLowerCase()}
                />
              </div>
            </div>

            {/* Appointment facts */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-stone-800 bg-[#14110D] p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Appointment Date
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-stone-100">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  {formatDate(selectedAppointment.appointmentDate)}
                </p>
              </div>

              <div className="rounded-xl border border-stone-800 bg-[#14110D] p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Time Slot
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-stone-100">
                  <Clock className="h-4 w-4 text-amber-400" />
                  {selectedAppointment.timeSlot || "Not available"}
                </p>
              </div>

              <div className="rounded-xl border border-stone-800 bg-[#14110D] p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Service Price
                </p>
                <p className="mt-1 text-sm font-semibold text-amber-300">
                  ${Number(selectedAppointment.servicePrice || 0).toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl border border-stone-800 bg-[#14110D] p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Booking Requested
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-stone-100">
                  <CalendarCheck className="h-4 w-4 text-amber-400" />
                  {formatDateTime(selectedAppointment.createdAt)}
                </p>
              </div>

              <div className="rounded-xl border border-stone-800 bg-[#14110D] p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Appointment Status
                </p>
                <p className="mt-1 text-sm font-semibold capitalize text-stone-100">
                  {String(
                    selectedAppointment.status || "pending"
                  ).toLowerCase()}
                </p>
              </div>

              <div className="rounded-xl border border-stone-800 bg-[#14110D] p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Payment Status
                </p>
                <p className="mt-1 text-sm font-semibold capitalize text-stone-100">
                  {String(
                    selectedAppointment.paymentStatus || "unpaid"
                  ).toLowerCase()}
                </p>
              </div>
            </div>

            {/* Customer message */}
            <div className="mt-3 rounded-xl border border-stone-800 bg-[#14110D] p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Customer Message
              </p>
              <p className="mt-1.5 flex items-start gap-2 text-sm text-stone-200">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  {selectedAppointment.message?.trim() ||
                    "No message provided."}
                </span>
              </p>
            </div>

            {/* Details actions */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="rounded-xl border border-stone-700 bg-[#14110D] px-5 py-2.5 text-sm font-bold text-stone-200 transition hover:text-white"
              >
                Close
              </button>

              {String(selectedAppointment.status || "pending").toLowerCase() ===
                "confirmed" && (
                <button
                  type="button"
                  onClick={() => openAction(selectedAppointment, "cancel")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-400"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Appointment
                </button>
              )}

              {String(selectedAppointment.status || "pending").toLowerCase() ===
                "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => openAction(selectedAppointment, "cancel")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-5 py-2.5 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Request
                  </button>

                  <button
                    type="button"
                    onClick={() => openAction(selectedAppointment, "confirm")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-stone-950 transition hover:bg-emerald-400"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm Appointment
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm/cancel confirmation modal */}
      {actionTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            actionTarget.action === "confirm"
              ? "Confirm appointment"
              : "Cancel appointment"
          }
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isUpdating) {
              setActionTarget(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-[#181510] p-6 shadow-2xl sm:p-7">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                  actionTarget.action === "confirm"
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-400/30 bg-rose-500/10 text-rose-300"
                }`}
              >
                {actionTarget.action === "confirm" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  {actionTarget.action === "confirm"
                    ? "Confirm this appointment?"
                    : "Cancel this appointment?"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-400">
                  {actionTarget.action === "confirm"
                    ? `${
                        actionTarget.appointment.customerName ||
                        actionTarget.appointment.customerEmail ||
                        "This customer"
                      } will be able to pay for "${
                        actionTarget.appointment.serviceName || "this service"
                      }" after you confirm it.`
                    : `${
                        actionTarget.appointment.customerName ||
                        actionTarget.appointment.customerEmail ||
                        "This customer"
                      }'s booking for "${
                        actionTarget.appointment.serviceName || "this service"
                      }" will be cancelled.`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setActionTarget(null)}
                disabled={isUpdating}
                className="rounded-xl border border-stone-700 bg-[#14110D] px-5 py-2.5 text-sm font-bold text-stone-200 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep as is
              </button>

              <button
                type="button"
                onClick={handleAction}
                disabled={isUpdating}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  actionTarget.action === "confirm"
                    ? "bg-emerald-500 text-stone-950 hover:bg-emerald-400"
                    : "bg-rose-500 text-white hover:bg-rose-400"
                }`}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : actionTarget.action === "confirm" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm Appointment
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Cancel Appointment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
