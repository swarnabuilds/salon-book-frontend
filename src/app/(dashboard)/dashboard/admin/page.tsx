"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getCustomers, type CustomerUser } from "@/lib/api/userApi";
import type { SalonService } from "@/lib/api/serviceApi";
import type { SalonAppointment } from "@/lib/action/appointmentActions";
import type { SalonTransaction } from "@/lib/api/transactionApi";
import {
  getAdminOverview,
  type AdminOverviewStats,
} from "@/lib/api/adminApi";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  RefreshCw,
  Scissors,
  Sparkles,
  Users,
} from "lucide-react";

interface OverviewData {
  customers: CustomerUser[];
  services: SalonService[];
  appointments: SalonAppointment[];
  transactions: SalonTransaction[];
  stats: AdminOverviewStats;
}

const EMPTY_STATS: AdminOverviewStats = {
  totalServices: 0,
  activeServices: 0,
  totalAppointments: 0,
  pendingCount: 0,
  confirmedCount: 0,
  completedCount: 0,
  paidCount: 0,
  totalRevenue: 0,
  currency: "usd",
};

const EMPTY_OVERVIEW: OverviewData = {
  customers: [],
  services: [],
  appointments: [],
  transactions: [],
  stats: EMPTY_STATS,
};

const QUICK_ACTIONS = [
  {
    label: "Manage Services",
    description: "Add, update, or deactivate salon services.",
    href: "/dashboard/admin/manage-services",
    icon: Scissors,
  },
  {
    label: "Manage Appointments",
    description: "Confirm or cancel customer booking requests.",
    href: "/dashboard/admin/appointments",
    icon: CalendarCheck,
  },
  {
    label: "Manage Users",
    description: "Review customers and block or unblock accounts.",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    label: "Transactions",
    description: "Track Stripe payments and payment status.",
    href: "/dashboard/admin/transactions",
    icon: CreditCard,
  },
];

function formatDateLabel(value?: string): string {
  if (!value) return "N/A";

  const parsed = new Date(`${value}T00:00:00`);
  const target = Number.isNaN(parsed.getTime()) ? new Date(value) : parsed;

  if (Number.isNaN(target.getTime())) return value;

  return target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(amount: number, currency?: string): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const code = (currency || "usd").toUpperCase();

  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${code}`;
}

function getStatusBadgeClass(status: string): string {
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

function getPaymentBadgeClass(payment: string): string {
  if (payment === "paid") {
    return "border-emerald-400/40 bg-emerald-500/15 text-emerald-300";
  }

  return "border-stone-700 bg-stone-900 text-stone-300";
}

// Customers are platform-wide; every other number comes from the admin's
// own scoped overview endpoint.
async function loadAdminOverview() {
  const [customerResult, overviewResult] = await Promise.all([
    getCustomers(),
    getAdminOverview(),
  ]);

  if (!customerResult.success || !overviewResult.success) {
    return {
      success: false as const,
      message:
        customerResult.message ||
        overviewResult.message ||
        "Failed to load the dashboard overview.",
      data: EMPTY_OVERVIEW,
    };
  }

  return {
    success: true as const,
    data: {
      customers: customerResult.data,
      services: overviewResult.data.services,
      appointments: overviewResult.data.appointments,
      transactions: overviewResult.data.transactions,
      stats: overviewResult.data.stats,
    },
  };
}

function StatCard({
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
    <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5 transition hover:border-amber-400/35">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
          {label}
        </span>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${accent}`}
        >
          {icon}
        </span>
      </div>

      <p className={`mt-4 text-3xl font-extrabold ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs text-stone-400">{hint}</p>
    </div>
  );
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const sessionUser = session?.user as
    | { name?: string; role?: string; isBlocked?: boolean }
    | undefined;

  const isAdmin =
    String(sessionUser?.role || "").trim().toLowerCase() === "admin";

  const [overview, setOverview] = useState<OverviewData>(EMPTY_OVERVIEW);
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

    if (!isAdmin) {
      router.replace("/dashboard/customer");
    }
  }, [isSessionLoading, sessionUser, isAdmin, router]);

  useEffect(() => {
    if (isSessionLoading || !isAdmin) return;

    let active = true;

    loadAdminOverview().then((result) => {
      if (!active) return;

      if (!result.success) {
        setOverview(EMPTY_OVERVIEW);
        setErrorMsg(result.message);
        setIsLoading(false);
        return;
      }

      setOverview(result.data);
      setErrorMsg("");
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [isSessionLoading, isAdmin]);

  const stats = useMemo(() => {
    const serverStats = overview.stats;

    return {
      customerCount: overview.customers.length,
      activeServices: serverStats.activeServices,
      totalAppointments: serverStats.totalAppointments,
      pendingCount: serverStats.pendingCount,
      confirmedCount: serverStats.confirmedCount,
      paidCount: serverStats.paidCount,
      paidAmount: serverStats.totalRevenue,
      currency: serverStats.currency,
    };
  }, [overview]);

  const recentAppointments = useMemo(
    () => overview.appointments.slice(0, 5),
    [overview.appointments]
  );

  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMsg("");

    const result = await loadAdminOverview();

    if (!result.success) {
      setOverview(EMPTY_OVERVIEW);
      setErrorMsg(result.message);
      setIsLoading(false);
      toast.error("Could not refresh the dashboard overview.");
      return;
    }

    setOverview(result.data);
    setIsLoading(false);
    toast.success("Dashboard overview refreshed.");
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
    <section className="min-h-screen bg-[#110F0B] px-4 py-8 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page header */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-800 bg-[#181510] p-6 sm:flex-row sm:items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              Admin Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Welcome back{sessionUser?.name ? `, ${sessionUser.name}` : ""}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-stone-400 sm:text-base">
              Monitor customers, services, appointment requests, and payments
              from one place.
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

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-stone-800 bg-[#181510] py-16 text-base font-semibold text-stone-300">
            <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
            <span>Loading dashboard overview...</span>
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-300">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">
              Could not load the overview
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
        ) : (
          <>
            {/* Required overview statistics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                label="Total Registered Customers"
                value={stats.customerCount}
                hint="Platform-wide customer accounts"
                icon={<Users className="h-5 w-5 text-amber-300" />}
                accent="border-amber-400/30 bg-amber-500/10"
              />

              <StatCard
                label="Total Active Services"
                value={stats.activeServices}
                hint="Services currently open for booking"
                icon={<Scissors className="h-5 w-5 text-sky-300" />}
                accent="border-sky-400/30 bg-sky-500/10"
              />

              <StatCard
                label="Total Appointment Requests"
                value={stats.totalAppointments}
                hint="All booking requests received"
                icon={<CalendarCheck className="h-5 w-5 text-amber-300" />}
                accent="border-amber-400/30 bg-amber-500/10"
              />

              <StatCard
                label="Pending Appointments"
                value={stats.pendingCount}
                hint="Waiting for your confirmation"
                icon={<Clock className="h-5 w-5 text-amber-300" />}
                accent="border-amber-400/30 bg-amber-500/10"
                valueClass="text-amber-300"
              />

              <StatCard
                label="Confirmed Appointments"
                value={stats.confirmedCount}
                hint="Approved and scheduled salon visits"
                icon={<CheckCircle2 className="h-5 w-5 text-emerald-300" />}
                accent="border-emerald-400/30 bg-emerald-500/10"
                valueClass="text-emerald-300"
              />

              <StatCard
                label="Total Successful Payments"
                value={stats.paidCount}
                hint={
                  stats.paidCount > 0
                    ? `${formatAmount(stats.paidAmount, stats.currency)} collected`
                    : "No successful payments yet"
                }
                icon={<CreditCard className="h-5 w-5 text-emerald-300" />}
                accent="border-emerald-400/30 bg-emerald-500/10"
                valueClass="text-emerald-300"
              />
            </div>

            {/* Quick links to the management pages */}
            <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Quick Actions
              </h2>
              <p className="mt-1 text-sm text-stone-400">
                Jump straight into the area you need to manage.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="group rounded-xl border border-stone-800 bg-[#14110D] p-4 transition hover:border-amber-400/40 hover:bg-[#1D1913]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-300">
                          <Icon className="h-4 w-4" />
                        </span>
                        <ArrowRight className="h-4 w-4 text-stone-500 transition group-hover:translate-x-0.5 group-hover:text-amber-300" />
                      </div>

                      <p className="mt-3 text-sm font-bold text-white">
                        {action.label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-stone-400">
                        {action.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Latest appointment requests */}
            <div className="rounded-2xl border border-stone-800 bg-[#181510] shadow-xl">
              <div className="flex flex-col justify-between gap-3 border-b border-stone-800 bg-[#1D1913] px-6 py-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-white sm:text-xl">
                    Latest Appointment Requests
                  </h2>
                  <p className="text-sm text-stone-400">
                    Newest bookings that may need your attention
                  </p>
                </div>

                <Link
                  href="/dashboard/admin/appointments"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-300 transition hover:text-amber-200"
                >
                  <span>View All Appointments</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {recentAppointments.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-base font-semibold text-stone-300">
                    No appointment requests yet.
                  </p>
                  <p className="mt-1 text-sm text-stone-400">
                    Customer booking requests will appear here.
                  </p>
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
                        className="flex flex-col justify-between gap-3 px-6 py-4 transition hover:bg-[#201B15] sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="truncate text-base font-bold text-white">
                            {item.serviceName || "Salon service"}
                          </p>
                          <p className="truncate text-xs text-stone-400 sm:text-sm">
                            {item.customerName || item.customerEmail || "Customer"}
                            {" • "}
                            {formatDateLabel(item.appointmentDate)}
                            {item.timeSlot ? ` • ${item.timeSlot}` : ""}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-300">
                            ${Number(item.servicePrice || 0).toLocaleString()}
                          </span>

                          <span
                            className={`rounded-lg border px-3 py-1 text-xs font-bold capitalize ${getStatusBadgeClass(
                              statusText
                            )}`}
                          >
                            {statusText}
                          </span>

                          <span
                            className={`rounded-lg border px-3 py-1 text-xs font-semibold capitalize ${getPaymentBadgeClass(
                              paymentText
                            )}`}
                          >
                            {paymentText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
