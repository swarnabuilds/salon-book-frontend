"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  getMyAppointments,
  SalonAppointment,
} from "@/lib/action/appointmentActions";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  RefreshCw,
  Scissors,
  Sparkles,
  User,
  UserCheck,
  XCircle,
} from "lucide-react";

function formatDateLabel(dateStr?: string): string {
  if (!dateStr) return "N/A";

  const parsed = new Date(`${dateStr}T00:00:00`);
  const target = Number.isNaN(parsed.getTime()) ? new Date(dateStr) : parsed;

  if (Number.isNaN(target.getTime())) return dateStr;

  return target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadgeStyle(status: string): string {
  if (status === "confirmed") {
    return "border-emerald-400/40 bg-emerald-500/15 text-emerald-300";
  }
  if (status === "cancelled") {
    return "border-rose-400/40 bg-rose-500/15 text-rose-300";
  }
  if (status === "completed") {
    return "border-sky-400/40 bg-sky-500/15 text-sky-300";
  }
  return "border-amber-400/40 bg-amber-500/15 text-amber-300";
}

function ServiceThumb({ appointment }: { appointment: SalonAppointment }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (appointment.serviceImage && !imageFailed) {
    return (
      <img
        src={appointment.serviceImage}
        alt={appointment.serviceName}
        onError={() => setImageFailed(true)}
        className="h-14 w-16 shrink-0 rounded-xl border border-stone-700 object-cover"
      />
    );
  }

  return (
    <span className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/10 text-amber-300">
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

export default function CustomerOverviewPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const sessionUser = session?.user as
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string | null;
        isBlocked?: boolean;
      }
    | undefined;

  const userRole = String(sessionUser?.role || "customer")
    .trim()
    .toLowerCase();
  const isCustomer = userRole === "customer";
  const userEmail = sessionUser?.email || "";
  const userName = sessionUser?.name || "Customer";

  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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

    let active = true;

    getMyAppointments().then((res) => {
      if (!active) return;

      if (!res.success) {
        setAppointments([]);
        setErrorMsg(res.message || "Failed to load your dashboard.");
        setIsLoading(false);
        return;
      }

      setAppointments(res.data);
      setErrorMsg("");
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [isSessionLoading, isCustomer, userEmail]);

  const overviewStats = useMemo(() => {
    const totalRequests = appointments.length;
    const pendingCount = appointments.filter(
      (item) => String(item.status || "pending").toLowerCase() === "pending"
    ).length;
    const confirmedCount = appointments.filter(
      (item) => String(item.status || "").toLowerCase() === "confirmed"
    ).length;
    const cancelledCount = appointments.filter(
      (item) => String(item.status || "").toLowerCase() === "cancelled"
    ).length;

    return {
      totalRequests,
      pendingCount,
      confirmedCount,
      cancelledCount,
    };
  }, [appointments]);

  const recentAppointments = useMemo(
    () => appointments.slice(0, 4),
    [appointments]
  );

  const nextConfirmedAppointment = useMemo(
    () =>
      appointments.find(
        (item) => String(item.status || "").toLowerCase() === "confirmed"
      ) || null,
    [appointments]
  );

  const refreshOverview = async () => {
    setIsLoading(true);
    setErrorMsg("");

    const res = await getMyAppointments();

    if (!res.success) {
      setAppointments([]);
      setErrorMsg(res.message || "Failed to load your dashboard.");
      setIsLoading(false);
      return;
    }

    setAppointments(res.data);
    setIsLoading(false);
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
    <section className="min-h-screen bg-[#110F0B] px-4 py-8 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-[#1F1A12] via-[#181510] to-[#120F0B] p-6 shadow-xl sm:p-7">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/25 to-[#120F0C] text-xl font-extrabold text-amber-300 shadow-lg shadow-amber-950/50">
                {sessionUser?.image ? (
                  <img
                    src={sessionUser.image}
                    alt={userName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{userName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Customer Dashboard
                </p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Welcome back, {userName}
                </h1>
                <p className="mt-1 text-sm text-stone-400 sm:text-base">
                  Track your appointment requests, confirmations, and upcoming
                  salon visits.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/customer/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-[#14110D] px-4 py-2.5 text-sm font-bold text-stone-200 transition hover:border-amber-400/40 hover:text-amber-300"
              >
                <User className="h-4 w-4 text-amber-400" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-xl bg-[#A68B5B] px-5 py-2.5 text-sm font-bold text-stone-950 transition hover:bg-[#B89B6A]"
              >
                <span>Book Service</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Required overview stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Requests"
            value={overviewStats.totalRequests}
            hint="All bookings submitted by you"
            icon={<Calendar className="h-4 w-4 text-amber-300" />}
            accent="border-amber-400/30 bg-amber-500/10"
          />
          <SummaryCard
            label="Pending"
            value={overviewStats.pendingCount}
            hint="Awaiting salon confirmation"
            icon={<Clock className="h-4 w-4 text-amber-300" />}
            accent="border-amber-400/30 bg-amber-500/10"
            valueClass="text-amber-300"
          />
          <SummaryCard
            label="Confirmed"
            value={overviewStats.confirmedCount}
            hint="Approved and ready for payment"
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />}
            accent="border-emerald-400/30 bg-emerald-500/10"
            valueClass="text-emerald-300"
          />
          <SummaryCard
            label="Cancelled"
            value={overviewStats.cancelledCount}
            hint="Cancelled booking requests"
            icon={<XCircle className="h-4 w-4 text-rose-300" />}
            accent="border-rose-400/30 bg-rose-500/10"
            valueClass="text-rose-300"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-stone-800 bg-[#181510] py-16 text-base font-semibold text-stone-300">
            <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
            <span>Loading your dashboard...</span>
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-300">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">
              Could not load your dashboard
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-rose-100/80">
              {errorMsg}
            </p>
            <button
              type="button"
              onClick={refreshOverview}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-400"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent requests */}
            <div className="rounded-2xl border border-stone-800 bg-[#181510] shadow-xl lg:col-span-2">
              <div className="flex flex-col justify-between gap-3 border-b border-stone-800 bg-[#1D1913] px-5 py-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-white sm:text-xl">
                    Recent Appointment Requests
                  </h2>
                  <p className="text-sm text-stone-400">
                    Latest updates on your salon service requests
                  </p>
                </div>

                <Link
                  href="/dashboard/customer/appointments"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-300 transition hover:text-amber-200"
                >
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {recentAppointments.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-amber-400">
                    <CalendarCheck className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-stone-200">
                    No appointment requests found yet.
                  </p>
                  <p className="mt-1 text-sm text-stone-400">
                    Explore our salon services and submit your first booking
                    request.
                  </p>
                  <Link
                    href="/services"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#A68B5B] px-5 py-2.5 text-sm font-bold text-stone-950 transition hover:bg-[#B89B6A]"
                  >
                    <span>Browse Services</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-stone-800/80">
                  {recentAppointments.map((item) => {
                    const statusText = String(
                      item.status || "pending"
                    ).toLowerCase();
                    const paymentText = String(
                      item.paymentStatus || "unpaid"
                    ).toLowerCase();

                    return (
                      <div
                        key={item._id}
                        className="flex flex-col gap-4 px-5 py-4 transition hover:bg-[#201B15] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3.5">
                          <ServiceThumb appointment={item} />
                          <div className="min-w-0">
                            <p className="truncate font-bold text-white">
                              {item.serviceName}
                            </p>
                            <p className="truncate text-xs text-stone-400 sm:text-sm">
                              {item.serviceCategory || "Salon Service"}
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-400">
                              <Clock className="h-3.5 w-3.5 text-stone-500" />
                              {formatDateLabel(item.appointmentDate)} •{" "}
                              {item.timeSlot || "Time slot"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-300">
                            ৳
                            {Number(item.servicePrice || 0).toLocaleString()}
                          </span>

                          <span
                            className={`rounded-lg border px-3 py-1 text-xs font-bold capitalize ${getStatusBadgeStyle(
                              statusText
                            )}`}
                          >
                            {statusText}
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-lg border border-stone-700 bg-[#14110D] px-3 py-1 text-xs font-semibold capitalize text-stone-300">
                            <CreditCard className="h-3.5 w-3.5 text-amber-400" />
                            {paymentText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Side panel */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-b from-[#1E1912] to-[#16130E] p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/35 bg-amber-500/10 text-amber-300">
                  <UserCheck className="h-5 w-5" />
                </span>
                <h2 className="mt-3 text-xl font-bold text-white">
                  {nextConfirmedAppointment
                    ? "Your Next Confirmed Visit"
                    : "Ready for Your Next Visit?"}
                </h2>

                {nextConfirmedAppointment ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 rounded-xl border border-stone-800 bg-[#14110D] p-3">
                      <ServiceThumb appointment={nextConfirmedAppointment} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {nextConfirmedAppointment.serviceName}
                        </p>
                        <p className="text-xs text-stone-400">
                          {formatDateLabel(
                            nextConfirmedAppointment.appointmentDate
                          )}{" "}
                          • {nextConfirmedAppointment.timeSlot}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/customer/appointments"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#A68B5B] px-5 py-3 text-sm font-bold text-stone-950 transition hover:bg-[#B89B6A]"
                    >
                      <span>Manage Appointment</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <>
                    <p className="mt-2 text-sm leading-relaxed text-stone-300">
                      Browse our salon catalog and book a service. Once the
                      salon confirms your request, you can pay securely with
                      Stripe.
                    </p>
                    <Link
                      href="/services"
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#A68B5B] px-5 py-3 text-sm font-bold text-stone-950 transition hover:bg-[#B89B6A]"
                    >
                      <span>Explore Services</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-stone-800 bg-[#181510] p-6">
                <h2 className="text-lg font-bold text-white">Quick Links</h2>
                <div className="mt-4 space-y-2.5">
                  <Link
                    href="/dashboard/customer/appointments"
                    className="flex items-center justify-between rounded-xl border border-stone-800 bg-[#14110D] px-4 py-3 text-sm font-semibold text-stone-200 transition hover:border-amber-400/40 hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4 text-amber-400" />
                      My Appointments
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/dashboard/customer/profile"
                    className="flex items-center justify-between rounded-xl border border-stone-800 bg-[#14110D] px-4 py-3 text-sm font-semibold text-stone-200 transition hover:border-amber-400/40 hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2">
                      <User className="h-4 w-4 text-amber-400" />
                      My Profile
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
