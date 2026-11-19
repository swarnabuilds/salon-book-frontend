"use client";

import React, { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { getSalonServices, SalonService } from "@/lib/api/serviceApi";
import { CreateServiceForm } from "@/components/dashboard/CreateServiceForm";
import { ServiceToast } from "@/components/dashboard/ServiceToast";
import { Plus, X, Clock, Tag, Loader2, Scissors } from "lucide-react";

export default function ManageServicesPage() {
  const { data: session } = authClient.useSession();
  const userEmail = session?.user?.email?.trim().toLowerCase() || "";

  const [services, setServices] = useState<SalonService[]>([]);
  const [brokenImageIds, setBrokenImageIds] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Refresh services list after creating a new entry
  const refreshServices = useCallback(async () => {
    setIsLoading(true);
    const data = await getSalonServices(userEmail || undefined);
    setServices(data);
    setIsLoading(false);
  }, [userEmail]);

  // Fetch initial service records cleanly inside effect
  useEffect(() => {
    let isMounted = true;

    const fetchServices = async () => {
      const data = await getSalonServices(userEmail || undefined);
      if (isMounted) {
        setServices(data);
        setIsLoading(false);
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, [userEmail]);

  // Close modal, display toast feedback, and refresh list
  const handleServiceCreated = async (message: string) => {
    setIsModalOpen(false);
    setToast({ type: "success", message });
    await refreshServices();
  };

  // Mark individual service image as fallback if loading fails
  const handleImageError = (serviceId: string) => {
    setBrokenImageIds((prev) => ({ ...prev, [serviceId]: true }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Balanced section header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-stone-800/70 bg-stone-950/75 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-400">
            <Scissors className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-semibold text-white tracking-tight">
                Manage Services
              </h1>
              <span className="inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                {services.length}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Manage your salon service packages and pricing
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-semibold text-stone-950 shadow-md shadow-amber-500/15 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Create Service</span>
        </button>
      </div>

      {/* Modern services table card */}
      <div className="relative overflow-hidden rounded-2xl border border-stone-800/70 bg-stone-950/75 shadow-xl">
        <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl" />

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-stone-400 text-xs gap-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            <span>Loading services...</span>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
              <Scissors className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-white">No services created yet</p>
            <p className="text-xs text-stone-400 mt-1">
              Click &ldquo;Create Service&rdquo; to publish your first salon offering.
            </p>
          </div>
        ) : (
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-800/80 bg-stone-900/40 text-[11px] font-medium uppercase tracking-wider text-stone-400">
                  <th className="py-3.5 px-5">Service</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-800/60 text-xs">
                {services.map((service) => {
                  const hasValidImage =
                    Boolean(service.image) && !brokenImageIds[service._id];

                  return (
                    <tr
                      key={service._id}
                      className="group hover:bg-amber-500/[0.03] transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3.5">
                          {hasValidImage ? (
                            <img
                              src={service.image}
                              alt={service.name}
                              onError={() => handleImageError(service._id)}
                              className="h-11 w-11 rounded-xl object-cover border border-stone-800 group-hover:border-amber-500/30 transition shrink-0"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-800 bg-stone-900 text-amber-400/80 shrink-0">
                              <Scissors className="h-4 w-4" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate group-hover:text-amber-200 transition-colors">
                              {service.name}
                            </p>
                            <p className="text-[11px] text-stone-400 truncate max-w-xs">
                              {service.shortDescription}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200">
                          <Tag className="h-3 w-3 text-amber-400" />
                          {service.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-stone-300">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-stone-500" />
                          {service.duration}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-amber-400">
                        ৳{Number(service.price).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            service.isActive !== false
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border border-stone-700 bg-stone-800/80 text-stone-400"
                          }`}
                        >
                          {service.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-stone-800 bg-stone-950 p-6 sm:p-7 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-xl border border-stone-800 bg-stone-900 text-stone-400 hover:text-white hover:border-stone-700 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <CreateServiceForm onSuccess={handleServiceCreated} />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <ServiceToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}