"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  getAdminTransactions,
  type SalonTransaction,
} from "@/lib/api/transactionApi";
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";

type StatusFilter = "all" | "paid" | "failed";

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

function formatAmount(amount?: number, currency?: string): string {
  const code = String(currency || "USD").toUpperCase();
  const value = Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return code === "USD" ? `$${value}` : `${code} ${value}`;
}

function getInitials(name?: string, email?: string): string {
  const source = (name || email || "C").trim();
  const parts = source.split(/\s+/);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function CustomerAvatar({ transaction }: { transaction: SalonTransaction }) {
  const [imageFailed, setImageFailed] = useState(false);
  const label = transaction.customerName || transaction.customerEmail || "Customer";

  if (transaction.customerImage && !imageFailed) {
    return (
      <img
        src={transaction.customerImage}
        alt={label}
        onError={() => setImageFailed(true)}
        className="h-10 w-10 shrink-0 rounded-xl border border-stone-700 object-cover"
      />
    );
  }

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/10 text-xs font-extrabold text-amber-300">
      {getInitials(transaction.customerName, transaction.customerEmail)}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = String(status || "paid").toLowerCase();
  const isPaid = normalized === "paid";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize ${
        isPaid
          ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
          : "border-rose-400/35 bg-rose-500/10 text-rose-300"
      }`}
    >
      {isPaid ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}
      {normalized}
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
  value: string | number;
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
      <p className={`mt-4 text-2xl font-extrabold sm:text-3xl ${valueClass}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-stone-500">{hint}</p>
    </div>
  );
}

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const sessionUser = session?.user as
    | { role?: string; isBlocked?: boolean }
    | undefined;

  const isAdmin =
    String(sessionUser?.role || "").trim().toLowerCase() === "admin";

  const [transactions, setTransactions] = useState<SalonTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [copiedId, setCopiedId] = useState("");

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

    getAdminTransactions().then((result) => {
      if (!active) return;

      if (!result.success) {
        setTransactions([]);
        setErrorMsg(result.message || "Failed to load transactions.");
        setIsLoading(false);
        return;
      }

      setTransactions(result.data);
      setErrorMsg("");
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [isSessionLoading, isAdmin]);

  const summary = useMemo(() => {
    const paidItems = transactions.filter(
      (tx) => String(tx.status || "paid").toLowerCase() === "paid"
    );
    const failedItems = transactions.filter(
      (tx) => String(tx.status || "").toLowerCase() === "failed"
    );

    const revenueByCurrency = paidItems.reduce<Record<string, number>>(
      (totals, tx) => {
        const code = String(tx.currency || "USD").toUpperCase();
        totals[code] = (totals[code] || 0) + Number(tx.amount || 0);
        return totals;
      },
      {}
    );

    const currencies = Object.keys(revenueByCurrency);
    const primaryCurrency = currencies[0] || "USD";
    const revenue = revenueByCurrency[primaryCurrency] || 0;

    return {
      total: transactions.length,
      paid: paidItems.length,
      failed: failedItems.length,
      revenue,
      revenueLabel:
        currencies.length > 1
          ? `${formatAmount(revenue, primaryCurrency)} (+${currencies.length - 1} more)`
          : formatAmount(revenue, primaryCurrency),
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return transactions.filter((tx) => {
      const status = String(tx.status || "paid").toLowerCase();

      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!query) return true;

      return [
        tx.customerName,
        tx.customerEmail,
        tx.customerId,
        tx.serviceName,
        tx.stripeSessionId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [transactions, searchQuery, statusFilter]);

  const hasFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMsg("");

    const result = await getAdminTransactions();

    if (!result.success) {
      setTransactions([]);
      setErrorMsg(result.message || "Failed to load transactions.");
      setIsLoading(false);
      toast.error("Could not refresh the transaction ledger.");
      return;
    }

    setTransactions(result.data);
    setIsLoading(false);
    toast.success("Transaction ledger refreshed.");
  };

  const handleCopySessionId = (rowId: string, sessionId?: string) => {
    if (!sessionId) return;

    navigator.clipboard
      ?.writeText(sessionId)
      .then(() => toast.success("Stripe session ID copied."))
      .catch(() => toast.error("Could not copy the session ID."));

    setCopiedId(rowId);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === rowId ? "" : prev));
    }, 1800);
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              Admin Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Payment Transactions
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-stone-400 sm:text-base">
              A read-only ledger of Stripe checkout payments, customer details,
              and session references.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2.5 text-xs font-bold uppercase text-amber-300">
              <Lock className="h-3.5 w-3.5" />
              Read-only
            </span>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-[#14110D] px-4 py-2.5 text-sm font-bold text-stone-200 transition hover:border-amber-400/40 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total Transactions"
            value={summary.total}
            hint="Every recorded checkout"
            icon={<CreditCard className="h-4 w-4 text-amber-300" />}
            accent="border-amber-400/30 bg-amber-500/10"
          />
          <SummaryCard
            label="Successful Payments"
            value={summary.paid}
            hint="Paid through Stripe"
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />}
            accent="border-emerald-400/30 bg-emerald-500/10"
            valueClass="text-emerald-300"
          />
          <SummaryCard
            label="Failed Payments"
            value={summary.failed}
            hint="Payment attempts that failed"
            icon={<XCircle className="h-4 w-4 text-rose-300" />}
            accent="border-rose-400/30 bg-rose-500/10"
            valueClass="text-rose-300"
          />
          <SummaryCard
            label="Total Revenue"
            value={summary.revenueLabel}
            hint="Sum of successful payments"
            icon={<TrendingUp className="h-4 w-4 text-amber-300" />}
            accent="border-amber-400/30 bg-amber-500/10"
            valueClass="text-amber-300"
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
                placeholder="Search by customer, service, or session ID..."
                aria-label="Search transactions"
                className="w-full rounded-xl border border-stone-700 bg-[#14110D] py-3 pl-11 pr-4 text-sm text-white placeholder-stone-500 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/15"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: "all", label: "All" },
                  { value: "paid", label: "Paid" },
                  { value: "failed", label: "Failed" },
                ] as const
              ).map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  aria-pressed={statusFilter === filter.value}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-bold capitalize transition ${
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
            Showing {filteredTransactions.length} of {transactions.length}{" "}
            transactions
          </p>
        </div>

        {/* Loading, error, empty, and list states */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-stone-800 bg-[#181510] py-16 text-base font-semibold text-stone-300">
            <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
            <span>Loading transactions...</span>
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-300">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">
              Could not load transactions
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
        ) : filteredTransactions.length === 0 ? (
          <div className="rounded-2xl border border-stone-800 bg-[#181510] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-amber-400">
              <Wallet className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">
              No transactions found
            </h2>
            <p className="mt-2 text-sm text-stone-400">
              {hasFilters
                ? "No transactions match your search or filter."
                : "Payments for your services will appear here automatically."}
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
                <table className="w-full min-w-[980px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-stone-800 bg-[#15120E] text-xs font-bold uppercase tracking-wider text-stone-400">
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-4 py-4">Service</th>
                      <th className="px-4 py-4">Appointment</th>
                      <th className="px-4 py-4">Amount</th>
                      <th className="px-4 py-4">Stripe Session</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Paid On</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-800/80">
                    {filteredTransactions.map((tx, index) => {
                      const rowId = tx._id || `${tx.stripeSessionId || "tx"}-${index}`;

                      return (
                        <tr
                          key={rowId}
                          className="transition-colors hover:bg-[#211C16]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <CustomerAvatar transaction={tx} />
                              <div className="min-w-0">
                                <p className="truncate font-bold text-white">
                                  {tx.customerName || "Customer"}
                                </p>
                                <p className="truncate text-sm text-stone-400">
                                  {tx.customerEmail || tx.customerId || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="font-semibold text-stone-100">
                              {tx.serviceName || "Salon Service"}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-stone-300">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-amber-400" />
                              {formatDateValue(tx.appointmentDate)}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            <span className="inline-flex rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-300">
                              {formatAmount(tx.amount, tx.currency)}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            {tx.stripeSessionId ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopySessionId(rowId, tx.stripeSessionId)
                                }
                                title={tx.stripeSessionId}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 bg-[#14110D] px-2.5 py-1.5 font-mono text-xs text-stone-300 transition hover:border-amber-400/40 hover:text-amber-200"
                              >
                                <span>
                                  {shortenSessionId(tx.stripeSessionId)}
                                </span>
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

                          <td className="whitespace-nowrap px-4 py-4">
                            <StatusBadge status={tx.status} />
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-stone-300">
                            {formatDateValue(tx.paidAt || tx.createdAt)}
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
              {filteredTransactions.map((tx, index) => {
                const rowId = tx._id || `${tx.stripeSessionId || "tx"}-${index}`;

                return (
                  <article
                    key={rowId}
                    className="rounded-2xl border border-stone-800 bg-[#181510] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <CustomerAvatar transaction={tx} />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-white">
                            {tx.customerName || "Customer"}
                          </p>
                          <p className="truncate text-sm text-stone-400">
                            {tx.customerEmail || tx.customerId || "N/A"}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={tx.status} />
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-800 pt-4 text-xs">
                      <div>
                        <dt className="font-bold uppercase tracking-wider text-stone-500">
                          Service
                        </dt>
                        <dd className="mt-1 truncate font-semibold text-stone-100">
                          {tx.serviceName || "Salon Service"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold uppercase tracking-wider text-stone-500">
                          Amount
                        </dt>
                        <dd className="mt-1 font-bold text-amber-300">
                          {formatAmount(tx.amount, tx.currency)}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold uppercase tracking-wider text-stone-500">
                          Appointment
                        </dt>
                        <dd className="mt-1 text-stone-300">
                          {formatDateValue(tx.appointmentDate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold uppercase tracking-wider text-stone-500">
                          Paid On
                        </dt>
                        <dd className="mt-1 text-stone-300">
                          {formatDateValue(tx.paidAt || tx.createdAt)}
                        </dd>
                      </div>
                    </dl>

                    {tx.stripeSessionId && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCopySessionId(rowId, tx.stripeSessionId)
                        }
                        className="mt-3 inline-flex w-full items-center justify-between gap-2 rounded-lg border border-stone-700 bg-[#14110D] px-3 py-2 font-mono text-xs text-stone-300 transition hover:border-amber-400/40 hover:text-amber-200"
                      >
                        <span className="truncate">
                          {shortenSessionId(tx.stripeSessionId)}
                        </span>
                        {copiedId === rowId ? (
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                        )}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
