"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Search,
  Calendar,
  User,
} from "lucide-react";

interface TransactionItem {
  _id: string;
  appointmentId?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  serviceName?: string;
  appointmentDate?: string;
  amount?: number;
  currency?: string;
  stripeSessionId?: string;
  status?: string;
  createdAt?: string | Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function formatDateValue(value?: string | Date): string {
  if (!value) return "N/A";
  const str = String(value);
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(str)
    ? new Date(`${str}T00:00:00`)
    : new Date(str);

  if (Number.isNaN(parsed.getTime())) return str;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function shortenSessionId(sessionId?: string): string {
  if (!sessionId) return "N/A";
  if (sessionId.length <= 16) return sessionId;
  return `${sessionId.slice(0, 8)}...${sessionId.slice(-6)}`;
}

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "failed">(
    "all"
  );
  const [copiedId, setCopiedId] = useState<string>("");

  const user = session?.user;
  const userRole = String(
    (user as { role?: string } | undefined)?.role || ""
  ).toLowerCase();

  useEffect(() => {
    if (!isSessionLoading && !user) {
      router.replace("/sign-in");
    }
  }, [isSessionLoading, user, router]);

  useEffect(() => {
    if (isSessionLoading || !user) return;

    let active = true;

    fetch(`${API_URL}/transactions`, {
      cache: "no-store",
      credentials: "include",
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!active) return;

        if (!res.ok) {
          setErrorMsg(json?.message || "Failed to load transactions.");
          setTransactions([]);
          setIsLoadingData(false);
          return;
        }

        const list = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
            ? json.data
            : [];

        setTransactions(list);
        setErrorMsg("");
        setIsLoadingData(false);
      })
      .catch(() => {
        if (!active) return;
        setErrorMsg("Network error while loading transactions.");
        setTransactions([]);
        setIsLoadingData(false);
      });

    return () => {
      active = false;
    };
  }, [isSessionLoading, user]);

  const handleCopySessionId = (id: string, sessionId?: string) => {
    if (!sessionId) return;
    navigator.clipboard?.writeText(sessionId).catch(() => null);
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === id ? "" : prev));
    }, 1800);
  };

  const summary = useMemo(() => {
    const paidItems = transactions.filter(
      (tx) => String(tx.status || "").toLowerCase() === "paid"
    );
    const failedItems = transactions.filter(
      (tx) => String(tx.status || "").toLowerCase() === "failed"
    );
    const totalSuccessfulAmount = paidItems.reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0
    );

    return {
      totalCount: transactions.length,
      paidCount: paidItems.length,
      failedCount: failedItems.length,
      totalSuccessfulAmount,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions.filter((tx) => {
      const txStatus = String(tx.status || "paid").toLowerCase();
      if (statusFilter !== "all" && txStatus !== statusFilter) {
        return false;
      }
      if (!q) return true;

      const haystack = [
        tx.customerName,
        tx.customerEmail,
        tx.customerId,
        tx.serviceName,
        tx.stripeSessionId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [transactions, searchQuery, statusFilter]);

  if (isSessionLoading || isLoadingData) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center gap-3 bg-[#110F0B] text-lg font-semibold text-stone-300">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        <span>Loading transactions...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <section className="min-h-screen bg-[#110F0B] px-4 py-8 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-800 bg-[#181510] p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
              Admin Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Payment Transactions
            </h1>
            <p className="mt-1.5 text-sm text-stone-400 sm:text-base">
              Monitor Stripe checkout payments, session references, and
              transaction history.
            </p>
          </div>

          {userRole && (
            <span className="self-start rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 uppercase sm:self-auto">
              Read-Only Ledger
            </span>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5">
            <span className="text-xs font-bold tracking-wider text-stone-400 uppercase">
              Total Transactions
            </span>
            <p className="mt-3 text-3xl font-extrabold text-white">
              {summary.totalCount}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5">
            <span className="text-xs font-bold tracking-wider text-stone-400 uppercase">
              Successful Payments
            </span>
            <p className="mt-3 text-3xl font-extrabold text-emerald-300">
              {summary.paidCount}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5">
            <span className="text-xs font-bold tracking-wider text-stone-400 uppercase">
              Failed Payments
            </span>
            <p className="mt-3 text-3xl font-extrabold text-rose-300">
              {summary.failedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5">
            <span className="text-xs font-bold tracking-wider text-stone-400 uppercase">
              Total Revenue (Paid)
            </span>
            <p className="mt-3 text-3xl font-extrabold text-amber-300">
              ${summary.totalSuccessfulAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-800 bg-[#181510] p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, service, or Stripe session ID..."
              className="w-full rounded-xl border border-stone-700 bg-[#14110D] py-2.5 pr-4 pl-10 text-sm text-white outline-none transition focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["all", "paid", "failed"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold uppercase transition ${
                  statusFilter === tab
                    ? "bg-[#A68B5B] text-stone-950"
                    : "border border-stone-700 bg-[#14110D] text-stone-300 hover:border-amber-400/40 hover:text-amber-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Error or Table */}
        {errorMsg ? (
          <div className="rounded-2xl border border-rose-400/40 bg-[#181510] p-8 text-center text-rose-300">
            {errorMsg}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="rounded-2xl border border-stone-800 bg-[#181510] px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-amber-400">
              <CreditCard className="h-6 w-6" />
            </div>
            <h2 className="mt-3 text-xl font-bold text-white">
              No Transactions Found
            </h2>
            <p className="mt-1 text-sm text-stone-400">
              Completed or recorded Stripe payments will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-stone-800 bg-[#181510] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-stone-800 bg-[#15120E] text-xs font-bold tracking-wider text-stone-400 uppercase">
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-4 py-4">Related Service</th>
                    <th className="px-4 py-4">Appointment Date</th>
                    <th className="px-4 py-4">Amount &amp; Currency</th>
                    <th className="px-4 py-4">Stripe Session</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Transaction Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-800/80 text-sm">
                  {filteredTransactions.map((tx, idx) => {
                    const rowId = tx._id || `${tx.stripeSessionId || "tx"}-${idx}`;
                    const txStatus = String(tx.status || "paid").toLowerCase();
                    const isPaid = txStatus === "paid";
                    const currency = String(tx.currency || "USD").toUpperCase();

                    return (
                      <tr
                        key={rowId}
                        className="transition-colors hover:bg-[#211C16]"
                      >
                        {/* Customer Information */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-700 bg-[#14110D] text-amber-400">
                              <User className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-white">
                                {tx.customerName || "Customer"}
                              </p>
                              <p className="truncate text-xs text-stone-400">
                                {tx.customerEmail || tx.customerId || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Related Service */}
                        <td className="px-4 py-4 font-semibold text-stone-100">
                          {tx.serviceName || "Salon Service"}
                        </td>

                        {/* Appointment Date */}
                        <td className="whitespace-nowrap px-4 py-4 text-stone-300">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-amber-400" />
                            <span>{formatDateValue(tx.appointmentDate)}</span>
                          </span>
                        </td>

                        {/* Payment Amount & Currency */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/35 bg-amber-500/10 px-3 py-1 font-bold text-amber-300">
                            <span>${Number(tx.amount || 0).toLocaleString()}</span>
                            <span className="text-xs font-semibold text-amber-200/80">
                              {currency}
                            </span>
                          </span>
                        </td>

                        {/* Stripe Checkout Session ID */}
                        <td className="whitespace-nowrap px-4 py-4">
                          {tx.stripeSessionId ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleCopySessionId(rowId, tx.stripeSessionId)
                              }
                              title={tx.stripeSessionId}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-700 bg-[#14110D] px-2.5 py-1.5 font-mono text-xs text-stone-300 transition hover:border-amber-400/40 hover:text-amber-200"
                            >
                              <span>{shortenSessionId(tx.stripeSessionId)}</span>
                              {copiedId === rowId ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-stone-400" />
                              )}
                            </button>
                          ) : (
                            <span className="text-xs text-stone-500">N/A</span>
                          )}
                        </td>

                        {/* Payment Status */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold capitalize ${
                              isPaid
                                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                                : "border-rose-400/40 bg-rose-500/15 text-rose-300"
                            }`}
                          >
                            {isPaid ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            <span>{txStatus}</span>
                          </span>
                        </td>

                        {/* Transaction Date */}
                        <td className="whitespace-nowrap px-5 py-4 text-right text-stone-300">
                          {formatDateValue(tx.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}