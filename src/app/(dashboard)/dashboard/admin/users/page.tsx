"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  getCustomers,
  setCustomerBlocked,
  type CustomerUser,
} from "@/lib/api/userApi";
import { toast } from "sonner";
import {
  AlertCircle,
  Ban,
  CalendarDays,
  CheckCircle2,
  Eye,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";

type StatusFilter = "all" | "active" | "blocked";

function formatDate(value?: string | null): string {
  if (!value) return "Not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string, email: string): string {
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
  name: string;
  email: string;
  image?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (image && !imageFailed) {
    return (
      <img
        src={image}
        alt={name || email}
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

function CustomerStatusBadge({ isBlocked }: { isBlocked: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
        isBlocked
          ? "border-rose-400/35 bg-rose-500/10 text-rose-300"
          : "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
      }`}
    >
      {isBlocked ? (
        <Ban className="h-3.5 w-3.5" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5" />
      )}
      {isBlocked ? "Blocked" : "Active"}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
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
      <p className="mt-4 text-3xl font-extrabold text-white">{value}</p>
    </div>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const sessionUser = session?.user as
    | { role?: string; isBlocked?: boolean }
    | undefined;

  const isAdmin =
    String(sessionUser?.role || "").trim().toLowerCase() === "admin";

  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedUser, setSelectedUser] = useState<CustomerUser | null>(null);
  const [userToToggle, setUserToToggle] = useState<CustomerUser | null>(null);
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

    getCustomers().then((result) => {
      if (!active) return;

      if (!result.success) {
        setCustomers([]);
        setErrorMsg(
          result.message || "Failed to load registered customers."
        );
        setIsLoading(false);
        return;
      }

      setCustomers(result.data);
      setErrorMsg("");
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [isSessionLoading, isAdmin]);

  const summary = useMemo(() => {
    const blocked = customers.filter((customer) => customer.isBlocked).length;

    return {
      total: customers.length,
      active: customers.length - blocked,
      blocked,
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "blocked"
          ? customer.isBlocked
          : !customer.isBlocked);

      if (!matchesStatus) return false;
      if (!query) return true;

      return `${customer.name} ${customer.email}`
        .toLowerCase()
        .includes(query);
    });
  }, [customers, searchQuery, statusFilter]);

  const hasFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMsg("");

    const result = await getCustomers();

    if (!result.success) {
      setCustomers([]);
      setErrorMsg(result.message || "Failed to load registered customers.");
      setIsLoading(false);
      toast.error("Could not refresh the customer list.");
      return;
    }

    setCustomers(result.data);
    setIsLoading(false);
    toast.success("Customer list refreshed.");
  };

  const handleToggleBlock = async () => {
    if (!userToToggle || isUpdating) return;

    const customer = userToToggle;
    const nextBlocked = !customer.isBlocked;

    setIsUpdating(true);
    const result = await setCustomerBlocked(customer._id, nextBlocked);
    setIsUpdating(false);

    if (!result.success) {
      toast.error(result.message || "Failed to update customer status.");
      return;
    }

    const updatedCustomer =
      result.data || { ...customer, isBlocked: nextBlocked };

    setCustomers((previous) =>
      previous.map((item) =>
        item._id === customer._id ? updatedCustomer : item
      )
    );

    setSelectedUser((previous) =>
      previous && previous._id === customer._id
        ? updatedCustomer
        : previous
    );

    toast.success(
      result.message ||
        (nextBlocked
          ? "Customer blocked successfully."
          : "Customer unblocked successfully.")
    );
    setUserToToggle(null);
  };

  const openBlockConfirmation = (customer: CustomerUser) => {
    setSelectedUser(null);
    setUserToToggle(customer);
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
                Manage Customers
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-stone-400 sm:text-base">
                View registered customers, inspect their details, and block or
                unblock accounts when needed.
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
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total Customers"
              value={summary.total}
              icon={<Users className="h-4 w-4 text-amber-300" />}
              accent="border-amber-400/30 bg-amber-500/10"
            />
            <SummaryCard
              label="Active Customers"
              value={summary.active}
              icon={<UserCheck className="h-4 w-4 text-emerald-300" />}
              accent="border-emerald-400/30 bg-emerald-500/10"
            />
            <SummaryCard
              label="Blocked Customers"
              value={summary.blocked}
              icon={<UserX className="h-4 w-4 text-rose-300" />}
              accent="border-rose-400/30 bg-rose-500/10"
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
                  placeholder="Search by customer name or email..."
                  aria-label="Search customers"
                  className="w-full rounded-xl border border-stone-700 bg-[#14110D] py-3 pl-11 pr-4 text-sm text-white placeholder-stone-500 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/15"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: "all", label: "All" },
                    { value: "active", label: "Active" },
                    { value: "blocked", label: "Blocked" },
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
              Showing {filteredCustomers.length} of {customers.length} customers
            </p>
          </div>

          {/* Loading, error, empty, and list states */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-stone-800 bg-[#181510] py-16 text-base font-semibold text-stone-300">
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <span>Loading registered customers...</span>
            </div>
          ) : errorMsg ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-300">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">
                Could not load customers
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
          ) : filteredCustomers.length === 0 ? (
            <div className="rounded-2xl border border-stone-800 bg-[#181510] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-amber-400">
                <User className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">
                No customers found
              </h2>
              <p className="mt-2 text-sm text-stone-400">
                {hasFilters
                  ? "No customers match your search or filter."
                  : "Registered customers will appear here after they sign up."}
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
              <div className="hidden overflow-hidden rounded-2xl border border-stone-800 bg-[#181510] shadow-xl md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-stone-800 bg-[#15120E] text-xs font-bold uppercase tracking-wider text-stone-400">
                        <th className="px-5 py-4">Customer</th>
                        <th className="px-4 py-4">Joined</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-stone-800/80">
                      {filteredCustomers.map((customer) => (
                        <tr
                          key={customer._id}
                          className="transition-colors hover:bg-[#211C16]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3.5">
                              <CustomerAvatar
                                name={customer.name}
                                email={customer.email}
                                image={customer.image}
                              />
                              <div className="min-w-0">
                                <p className="truncate font-bold text-white">
                                  {customer.name || "Unnamed customer"}
                                </p>
                                <p className="truncate text-sm text-stone-400">
                                  {customer.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-stone-300">
                            {formatDate(customer.createdAt)}
                          </td>

                          <td className="px-4 py-4">
                            <CustomerStatusBadge
                              isBlocked={customer.isBlocked}
                            />
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedUser(customer)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-500/20"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() => openBlockConfirmation(customer)}
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                                  customer.isBlocked
                                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                    : "border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                }`}
                              >
                                {customer.isBlocked ? (
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                ) : (
                                  <Ban className="h-3.5 w-3.5" />
                                )}
                                {customer.isBlocked ? "Unblock" : "Block"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {filteredCustomers.map((customer) => (
                  <article
                    key={customer._id}
                    className="rounded-2xl border border-stone-800 bg-[#181510] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <CustomerAvatar
                          name={customer.name}
                          email={customer.email}
                          image={customer.image}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-white">
                            {customer.name || "Unnamed customer"}
                          </p>
                          <p className="truncate text-sm text-stone-400">
                            {customer.email}
                          </p>
                        </div>
                      </div>

                      <CustomerStatusBadge isBlocked={customer.isBlocked} />
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-stone-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-stone-400">
                        Joined {formatDate(customer.createdAt)}
                      </p>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(customer)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-500/20 sm:flex-none"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => openBlockConfirmation(customer)}
                          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition sm:flex-none ${
                            customer.isBlocked
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                              : "border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                          }`}
                        >
                          {customer.isBlocked ? (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          ) : (
                            <Ban className="h-3.5 w-3.5" />
                          )}
                          {customer.isBlocked ? "Unblock" : "Block"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Customer details modal */}
      {selectedUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Customer details"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedUser(null);
            }
          }}
        >
          <div className="w-full max-w-lg rounded-3xl border border-stone-800 bg-[#181510] p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                  Customer Details
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  {selectedUser.name || "Unnamed customer"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close customer details"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-700 bg-[#14110D] text-stone-400 transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-stone-800 bg-[#14110D] p-4">
              <CustomerAvatar
                name={selectedUser.name}
                email={selectedUser.email}
                image={selectedUser.image}
              />
              <div className="min-w-0">
                <p className="truncate font-bold text-white">
                  {selectedUser.name || "Unnamed customer"}
                </p>
                <p className="truncate text-sm text-stone-400">
                  {selectedUser.email}
                </p>
              </div>
              <div className="ml-auto shrink-0">
                <CustomerStatusBadge isBlocked={selectedUser.isBlocked} />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-stone-800 bg-[#14110D] p-3.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Email
                  </p>
                  <p className="break-all text-sm font-semibold text-stone-100">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-stone-800 bg-[#14110D] p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Role
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize text-stone-100">
                    {selectedUser.role || "customer"}
                  </p>
                </div>

                <div className="rounded-xl border border-stone-800 bg-[#14110D] p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Email Verified
                  </p>
                  <p className="mt-1 text-sm font-semibold text-stone-100">
                    {selectedUser.emailVerified ? "Yes" : "No"}
                  </p>
                </div>

                <div className="rounded-xl border border-stone-800 bg-[#14110D] p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Joined
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-stone-100">
                    <CalendarDays className="h-4 w-4 text-amber-400" />
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>

                <div className="rounded-xl border border-stone-800 bg-[#14110D] p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Customer ID
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-stone-300">
                    {selectedUser._id}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-xl border border-stone-700 bg-[#14110D] px-5 py-2.5 text-sm font-bold text-stone-200 transition hover:text-white"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => openBlockConfirmation(selectedUser)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  selectedUser.isBlocked
                    ? "bg-emerald-500 text-stone-950 hover:bg-emerald-400"
                    : "bg-rose-500 text-white hover:bg-rose-400"
                }`}
              >
                {selectedUser.isBlocked ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <Ban className="h-4 w-4" />
                )}
                {selectedUser.isBlocked ? "Unblock Customer" : "Block Customer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block/unblock confirmation modal */}
      {userToToggle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            userToToggle.isBlocked
              ? "Confirm unblock customer"
              : "Confirm block customer"
          }
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isUpdating) {
              setUserToToggle(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-[#181510] p-6 shadow-2xl sm:p-7">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                  userToToggle.isBlocked
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-400/30 bg-rose-500/10 text-rose-300"
                }`}
              >
                {userToToggle.isBlocked ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : (
                  <Ban className="h-6 w-6" />
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  {userToToggle.isBlocked
                    ? "Unblock this customer?"
                    : "Block this customer?"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-400">
                  {userToToggle.isBlocked
                    ? `${userToToggle.name || userToToggle.email} will be able to sign in and use the platform again.`
                    : `${userToToggle.name || userToToggle.email} will no longer be able to access protected dashboard features.`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setUserToToggle(null)}
                disabled={isUpdating}
                className="rounded-xl border border-stone-700 bg-[#14110D] px-5 py-2.5 text-sm font-bold text-stone-200 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleToggleBlock}
                disabled={isUpdating}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  userToToggle.isBlocked
                    ? "bg-emerald-500 text-stone-950 hover:bg-emerald-400"
                    : "bg-rose-500 text-white hover:bg-rose-400"
                }`}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : userToToggle.isBlocked ? (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Unblock Customer
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4" />
                    Block Customer
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
