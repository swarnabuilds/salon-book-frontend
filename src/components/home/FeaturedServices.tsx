"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getSalonServices, SalonService } from "@/lib/api/serviceApi";
import {
  Scissors,
  Clock,
  Tag,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";

export function FeaturedServices() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFeatured = async () => {
      setIsLoading(true);
      const allServices = await getSalonServices();
      if (!isMounted) return;

      const activeServices = allServices
        .filter((item) => item.isActive !== false && item.status !== "inactive")
        .slice(0, 6);

      setServices(activeServices);
      setIsLoading(false);
    };

    loadFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Subtle luxury background glow */}
      <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-64 max-w-3xl rounded-full bg-amber-500/10 blur-3xl -z-10" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12 pb-6 border-b border-amber-900/15">
        <div className="space-y-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-900 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-700 shrink-0" />
            <span>Signature Offerings</span>
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
            Featured Salon{" "}
            <span className="bg-gradient-to-r from-amber-800 via-amber-600 to-yellow-700 bg-clip-text text-transparent">
              Services
            </span>
          </h2>

          <p className="text-sm text-stone-600 max-w-xl leading-relaxed">
            Curated hair, facial, bridal, and spa rituals designed to bring out
            your natural radiance with calm precision.
          </p>
        </div>

        {/* Fancy "View All Services" Button */}
        <Link
          href="/services"
          className="inline-flex items-center justify-center gap-2.5 shrink-0 self-start md:self-auto whitespace-nowrap rounded-full border border-amber-500/40 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 px-6 py-3 text-xs font-semibold tracking-wide text-amber-200 shadow-lg shadow-stone-900/15 hover:border-amber-400 hover:text-white hover:shadow-amber-700/20 transition-all duration-300 group"
        >
          <span>Explore All Services</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 group-hover:bg-amber-500 group-hover:text-stone-950 transition-all duration-300">
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>

      {/* States */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-2.5 text-xs font-medium text-stone-600">
          <Loader2 className="h-5 w-5 animate-spin text-amber-700" />
          <span>Curating featured services...</span>
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-3xl border border-amber-900/15 bg-white/80 backdrop-blur-sm p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-700/20 bg-amber-500/10 text-amber-700">
            <Scissors className="h-5 w-5" />
          </div>
          <p className="text-base font-semibold text-stone-900">
            No active services available right now
          </p>
          <p className="text-xs text-stone-500 mt-1">
            New signature salon treatments will appear here shortly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {services.map((service) => {
            const hasImage =
              Boolean(service.image) && !brokenImages[service._id];

            return (
              <article
                key={service._id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-[0_8px_30px_rgb(28,25,23,0.06)] hover:shadow-[0_20px_45px_rgb(180,83,9,0.16)] hover:border-amber-500/50 hover:-translate-y-1.5 transition-all duration-300"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-56 w-full overflow-hidden bg-stone-100">
                    {hasImage ? (
                      <img
                        src={service.image}
                        alt={service.serviceName}
                        onError={() =>
                          setBrokenImages((prev) => ({
                            ...prev,
                            [service._id]: true,
                          }))
                        }
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-amber-50 text-amber-700">
                        <Scissors className="h-10 w-10" />
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                    {/* Category Badge */}
                    <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-stone-950/75 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-amber-200 shadow-sm">
                      <Tag className="h-3 w-3 text-amber-400 shrink-0" />
                      <span>{service.category}</span>
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                      {service.serviceName}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed min-h-[2.25rem]">
                      {service.shortDescription || service.description}
                    </p>
                  </div>
                </div>

                {/* Price, Duration & Fancy CTA Footer */}
                <div className="mx-5 mb-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xl font-extrabold tracking-tight text-stone-900 block leading-none">
                      <span className="text-amber-700 mr-0.5">৳</span>
                      {Number(service.price).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 mt-1.5">
                      <Clock className="h-3 w-3 text-amber-700 shrink-0" />
                      <span>{service.duration}</span>
                    </span>
                  </div>

                  {/* Fancy "View Details" Button */}
                  <Link
                    href={`/dashboard/admin/manage-services/${service._id}`}
                    className="inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 px-4 py-2.5 text-xs font-bold tracking-wide text-white shadow-md shadow-amber-600/25 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-600/35 active:scale-[0.98] transition-all duration-200 group/btn"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-amber-100 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}