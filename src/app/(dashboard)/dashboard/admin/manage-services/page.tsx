"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  getAdminServices,
  type SalonService,
} from "@/lib/api/serviceApi";
import {
  deleteSalonService,
  setServiceActive,
} from "@/lib/action/serviceActions";
import { formatServiceDuration } from "@/lib/formatServiceDuration";
import { CreateServiceForm } from "@/components/dashboard/CreateServiceForm";
import { DeleteServiceModal } from "@/components/dashboard/DeleteServiceModal";
import { EditServiceModal } from "@/components/dashboard/EditServiceModal";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Scissors,
  Search,
  Tag,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

type StatusFilter = "all" | "active" | "inactive";

function isServiceActive(service: SalonService): boolean {
  return service.isActive !== false && service.status !== "inactive";
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

function ServiceThumb({ service }: { service: SalonService }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (service.image && !imageFailed) {
    return (
      <img
        src={service.image}
        alt={service.serviceName}
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

function ServiceStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
        active
          ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
          : "border-stone-600 bg-stone-800/60 text-stone-300"
      }`}
    >
      {active ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function ManageServicesPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const sessionUser = session?.user as
    | { role?: string; isBlocked?: boolean }
    | undefined;

  const isAdmin =
    String(sessionUser?.role || "").trim().toLowerCase() === "admin";

  const [services, setServices] = useState<SalonService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<SalonService | null>(null);
  const [serviceToDelete, setServiceToDelete] =
    useState<SalonService | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

    getAdminServices().then((result) => {
      if (!active) return;

      if (!result.success) {
        setServices([]);
        setErrorMsg(result.message || "Failed to load services.");
        setIsLoading(false);
        return;
      }

      setServices(result.data);
      setErrorMsg("");
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [isSessionLoading, isAdmin]);

  const summary = useMemo(() => {
    const activeCount = services.filter(isServiceActive).length;

    return {
      total: services.length,
      active: activeCount,
      inactive: services.length - activeCount,
    };
  }, [services]);

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return services.filter((service) => {
      const active = isServiceActive(service);

      if (statusFilter === "active" && !active) return false;
      if (statusFilter === "inactive" && active) return false;
      if (!query) return true;

      return `${service.serviceName} ${service.category}`
        .toLowerCase()
        .includes(query);
    });
  }, [services, searchQuery, statusFilter]);

  const hasFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMsg("");

    const result = await getAdminServices();

    if (!result.success) {
      setServices([]);
      setErrorMsg(result.message || "Failed to load services.");
      setIsLoading(false);
      toast.error("Could not refresh the service list.");
      return;
    }

    setServices(result.data);
    setIsLoading(false);
    toast.success("Service list refreshed.");
  };

  const handleServiceCreated = async (message: string) => {
    setIsCreateOpen(false);
    toast.success(message);
    await handleRefresh();
  };

  const handleServiceUpdated = (
    updatedService: SalonService,
    message: string
  ) => {
    setServices((previous) =>
      previous.map((item) =>
        item._id === updatedService._id ? updatedService : item
      )
    );
    setServiceToEdit(null);
    toast.success(message);
  };

  const handleToggleActive = async (service: SalonService) => {
    if (togglingId) return;

    const nextActive = !isServiceActive(service);

    setTogglingId(service._id);
    const result = await setServiceActive(service._id, nextActive);
    setTogglingId(null);

    if (!result.success) {
      toast.error(result.message || "Failed to update service status.");
      return;
    }

    setServices((previous) =>
      previous.map((item) =>
        item._id === service._id
          ? {
              ...item,
              isActive: nextActive,
              status: nextActive ? "active" : "inactive",
            }
          : item
      )
    );

    toast.success(
      nextActive
        ? `"${service.serviceName}" is now active.`
        : `"${service.serviceName}" is now inactive.`
    );
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);
    const result = await deleteSalonService(serviceToDelete._id);
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.message || "Failed to delete service.");
      return;
    }

    setServices((previous) =>
      previous.filter((item) => item._id !== serviceToDelete._id)
    );
    toast.success(`"${serviceToDelete.serviceName}" deleted successfully.`);
    setServiceToDelete(null);
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
                Manage Services
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-stone-400 sm:text-base">
                Create, update, activate, or remove the salon services shown to
                customers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A68B5B] px-4 py-2.5 text-sm font-bold text-stone-950 transition hover:bg-[#B89B6A]"
              >
                <Plus className="h-4 w-4" />
                Create Service
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total Services"
              value={summary.total}
              icon={<Scissors className="h-4 w-4 text-amber-300" />}
              accent="border-amber-400/30 bg-amber-500/10"
            />
            <SummaryCard
              label="Active Services"
              value={summary.active}
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />}
              accent="border-emerald-400/30 bg-emerald-500/10"
              valueClass="text-emerald-300"
            />
            <SummaryCard
              label="Inactive Services"
              value={summary.inactive}
              icon={<XCircle className="h-4 w-4 text-stone-300" />}
              accent="border-stone-600 bg-stone-800/60"
              valueClass="text-stone-300"
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
                  aria-label="Search services"
                  className="w-full rounded-xl border border-stone-700 bg-[#14110D] py-3 pl-11 pr-4 text-sm text-white placeholder-stone-500 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/15"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: "all", label: "All" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
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
              Showing {filteredServices.length} of {services.length} services
            </p>
          </div>

          {/* Loading, error, empty, and list states */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-stone-800 bg-[#181510] py-16 text-base font-semibold text-stone-300">
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <span>Loading services...</span>
            </div>
          ) : errorMsg ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-300">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">
                Could not load services
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
          ) : filteredServices.length === 0 ? (
            <div className="rounded-2xl border border-stone-800 bg-[#181510] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-amber-400">
                <Scissors className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">
                No services found
              </h2>
              <p className="mt-2 text-sm text-stone-400">
                {hasFilters
                  ? "No services match your search or filter."
                  : "Services you create will appear here."}
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
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#A68B5B] px-5 py-2.5 text-sm font-bold text-stone-950 transition hover:bg-[#B89B6A]"
                >
                  <Plus className="h-4 w-4" />
                  Create Service
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-stone-800 bg-[#181510] shadow-xl lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-stone-800 bg-[#15120E] text-xs font-bold uppercase tracking-wider text-stone-400">
                        <th className="px-5 py-4">Service</th>
                        <th className="px-4 py-4">Category</th>
                        <th className="px-4 py-4">Duration</th>
                        <th className="px-4 py-4">Price</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-stone-800/80">
                      {filteredServices.map((service) => {
                        const active = isServiceActive(service);
                        const isToggling = togglingId === service._id;

                        return (
                          <tr
                            key={service._id}
                            className="transition-colors hover:bg-[#211C16]"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3.5">
                                <ServiceThumb service={service} />
                                <div className="min-w-0">
                                  <p className="truncate font-bold text-white">
                                    {service.serviceName}
                                  </p>
                                  <p className="max-w-xs truncate text-sm text-stone-400">
                                    {service.shortDescription ||
                                      service.description}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                                <Tag className="h-3 w-3 text-amber-400" />
                                {service.category || "Uncategorized"}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm text-stone-300">
                              <span className="inline-flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-stone-500" />
                                {formatServiceDuration(service.duration)}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-4">
                              <span className="inline-flex rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-300">
                                ৳{Number(service.price || 0).toLocaleString()}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <ServiceStatusBadge active={active} />
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/dashboard/admin/manage-services/${service._id}`}
                                  title="View details"
                                  aria-label={`View ${service.serviceName}`}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-500/20"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => setServiceToEdit(service)}
                                  title="Edit service"
                                  aria-label={`Edit ${service.serviceName}`}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(service)}
                                  disabled={isToggling}
                                  title={
                                    active
                                      ? "Deactivate service"
                                      : "Activate service"
                                  }
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                    active
                                      ? "border-stone-600 bg-stone-800/60 text-stone-300 hover:bg-stone-700/70"
                                      : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                  }`}
                                >
                                  {isToggling ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : active ? (
                                    <PowerOff className="h-3.5 w-3.5" />
                                  ) : (
                                    <Power className="h-3.5 w-3.5" />
                                  )}
                                  {active ? "Deactivate" : "Activate"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setServiceToDelete(service)}
                                  title="Delete service"
                                  aria-label={`Delete ${service.serviceName}`}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
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
                {filteredServices.map((service) => {
                  const active = isServiceActive(service);
                  const isToggling = togglingId === service._id;

                  return (
                    <article
                      key={service._id}
                      className="rounded-2xl border border-stone-800 bg-[#181510] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <ServiceThumb service={service} />
                          <div className="min-w-0">
                            <p className="truncate font-bold text-white">
                              {service.serviceName}
                            </p>
                            <p className="truncate text-sm text-stone-400">
                              {service.category || "Uncategorized"}
                            </p>
                          </div>
                        </div>

                        <ServiceStatusBadge active={active} />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-800 pt-4 text-xs text-stone-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {formatServiceDuration(service.duration)}
                        </span>
                        <span className="inline-flex rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-sm font-bold text-amber-300">
                          ৳{Number(service.price || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/dashboard/admin/manage-services/${service._id}`}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-500/20"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>

                        <button
                          type="button"
                          onClick={() => setServiceToEdit(service)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(service)}
                          disabled={isToggling}
                          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            active
                              ? "border-stone-600 bg-stone-800/60 text-stone-300"
                              : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : active ? (
                            <PowerOff className="h-3.5 w-3.5" />
                          ) : (
                            <Power className="h-3.5 w-3.5" />
                          )}
                          {active ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setServiceToDelete(service)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Edit service modal */}
      <EditServiceModal
        key={serviceToEdit?._id || "edit-service"}
        service={serviceToEdit}
        onClose={() => setServiceToEdit(null)}
        onSuccess={handleServiceUpdated}
      />

      {/* Delete confirmation modal */}
      <DeleteServiceModal
        isOpen={Boolean(serviceToDelete)}
        serviceName={serviceToDelete?.serviceName || ""}
        isDeleting={isDeleting}
        onClose={() => setServiceToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Create service modal */}
      {isCreateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create service"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsCreateOpen(false);
            }
          }}
        >
          <div className="relative my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-stone-800 bg-stone-950 p-6 shadow-2xl sm:p-7">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              aria-label="Close create service modal"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-stone-800 bg-stone-900 text-stone-400 transition hover:border-stone-700 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <CreateServiceForm onSuccess={handleServiceCreated} />
          </div>
        </div>
      )}
    </>
  );
}
