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
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  User,
  Sparkles,
  CreditCard,
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

export default function CustomerOverviewPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [loadedEmail, setLoadedEmail] = useState<string>("");

  const user = session?.user;
  const userEmail = user?.email || "";
  const userName = user?.name || "Customer";

  useEffect(() => {
    if (!isSessionLoading && !user) {
      router.replace("/sign-in");
    }
  }, [isSessionLoading, user, router]);

  useEffect(() => {
    if (isSessionLoading || !userEmail) return;

    let active = true;

    getMyAppointments(userEmail).then((res) => {
      if (!active) return;
      setAppointments(res.success ? res.data : []);
      setLoadedEmail(userEmail);
    });

    return () => {
      active = false;
    };
  }, [isSessionLoading, userEmail]);

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

  const recentAppointments = useMemo(() => {
    return appointments.slice(0, 4);
  }, [appointments]);

  const isLoading =
    isSessionLoading || (Boolean(userEmail) && loadedEmail !== userEmail);

  if (isLoading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center gap-3 bg-[#110F0B] text-lg font-semibold text-stone-300">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        <span>Loading dashboard overview...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <section className="min-h-screen bg-[#110F0B] px-4 py-8 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Card */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-800 bg-[#181510] p-6 sm:flex-row sm:items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Customer Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Welcome back, {userName}
            </h1>
            <p className="mt-1.5 text-sm text-stone-400 sm:text-base">
              Track your appointment requests, confirmation status, and
              upcoming salon visits.
            </p>
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

        {/* 4 Required Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total Appointment Requests */}
          <div className="rounded-2xl border border-stone-800 bg-[#181510] p-6 transition hover:border-amber-400/35">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-stone-400 uppercase">
                Total Appointment Requests
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
                <Calendar className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-white">
              {overviewStats.totalRequests}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              All bookings submitted by you
            </p>
          </div>

          {/* Pending Appointments */}
          <div className="rounded-2xl border border-stone-800 bg-[#181510] p-6 transition hover:border-amber-400/35">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-stone-400 uppercase">
                Pending Appointments
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
                <Clock className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-amber-300">
              {overviewStats.pendingCount}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Awaiting salon confirmation
            </p>
          </div>

          {/* Confirmed Appointments */}
          <div className="rounded-2xl border border-stone-800 bg-[#181510] p-6 transition hover:border-emerald-400/35">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-stone-400 uppercase">
                Confirmed Appointments
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-emerald-300">
              {overviewStats.confirmedCount}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Approved and ready for payment
            </p>
          </div>

          {/* Cancelled Appointments */}
          <div className="rounded-2xl border border-stone-800 bg-[#181510] p-6 transition hover:border-rose-400/35">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-stone-400 uppercase">
                Cancelled Appointments
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-300">
                <XCircle className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-rose-300">
              {overviewStats.cancelledCount}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Cancelled booking requests
            </p>
          </div>
        </div>

        {/* Recent Bookings Preview */}
        <div className="rounded-2xl border border-stone-800 bg-[#181510] shadow-xl">
          <div className="flex flex-col justify-between gap-3 border-b border-stone-800 bg-[#1D1913] px-6 py-4 sm:flex-row sm:items-center">
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
              <span>View All Appointments</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-base font-semibold text-stone-300">
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
                    className="flex flex-col justify-between gap-4 px-6 py-4 transition hover:bg-[#201B15] sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <p className="text-base font-bold text-white">
                        {item.serviceName}
                      </p>
                      <p className="text-xs text-stone-400 sm:text-sm">
                        {formatDateLabel(item.appointmentDate)} •{" "}
                        {item.timeSlot || "Time slot"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-300">
                        ${Number(item.servicePrice || 0).toLocaleString()}
                      </span>

                      <span
                        className={`rounded-lg border px-3 py-1 text-xs font-bold capitalize ${getStatusBadgeStyle(
                          statusText
                        )}`}
                      >
                        {statusText}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-lg border border-stone-700 bg-[#14110D] px-3 py-1 text-xs font-semibold text-stone-300 capitalize">
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
      </div>
    </section>
  );
}