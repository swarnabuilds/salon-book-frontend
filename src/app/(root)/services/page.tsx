"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSalonServices, SalonService } from "@/lib/api/serviceApi";
import { formatServiceDuration } from "@/lib/formatServiceDuration";
import {
  normalizeServiceCategory,
  SALON_CATEGORIES,
} from "@/lib/serviceCategories";
import {
  Search,
  Scissors,
  Clock,
  Tag,
  ArrowRight,
  Sparkles,
  Loader2,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

const REQUIRED_CATEGORIES = SALON_CATEGORIES;
const normalizeCategory = normalizeServiceCategory;

function BrowseServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [services, setServices] = useState<SalonService[]>([]);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    urlCategory || "All"
  );
  const [sortByPrice, setSortByPrice] = useState<"default" | "asc" | "desc">(
    "default"
  );

  // Derive active category cleanly without calling setState inside useEffect
  const activeCategory = urlCategory || selectedCategory;

  // Fetch all services and keep only active ones
  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      setIsLoading(true);
      const data = await getSalonServices();
      if (!isMounted) return;

      const activeOnly = data.filter(
        (item) => item.isActive !== false && item.status !== "inactive"
      );
      setServices(activeOnly);
      setIsLoading(false);
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  // Keep only "All" + the exact categories specified in the requirement document
  const categoryOptions = useMemo(() => {
    return ["All", ...REQUIRED_CATEGORIES];
  }, []);

  // Apply search, category filter, and price sort
  const filteredServices = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const result = services.filter((service) => {
      const matchesName =
        !normalizedSearch ||
        (service.serviceName || "").toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        activeCategory === "All" ||
        normalizeCategory(service.category) === normalizeCategory(activeCategory);

      return matchesName && matchesCategory;
    });

    if (sortByPrice === "asc") {
      return [...result].sort(
        (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)
      );
    }

    if (sortByPrice === "desc") {
      return [...result].sort(
        (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0)
      );
    }

    return result;
  }, [services, searchQuery, activeCategory, sortByPrice]);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    if (urlCategory) {
      router.replace("/services", { scroll: false });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortByPrice("default");
    if (urlCategory) {
      router.replace("/services", { scroll: false });
    }
  };

  const hasActiveFilter =
    searchQuery.trim() !== "" ||
    activeCategory !== "All" ||
    sortByPrice !== "default";

  return (
    <main className="relative min-h-screen py-14 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
      {/* Subtle ambient gold glow */}
      <div className="pointer-events-none absolute inset-x-0 top-12 mx-auto h-72 max-w-4xl rounded-full bg-amber-500/10 blur-3xl -z-10" />

      {/* Modern Luxury Page Header */}
      <div className="space-y-3.5 pb-7 border-b border-amber-900/15">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-100/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-900 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-amber-700 shrink-0" />
          <span>Salon Catalog</span>
        </span>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900">
              Browse All{" "}
              <span className="bg-gradient-to-r from-amber-800 via-amber-600 to-yellow-700 bg-clip-text text-transparent">
                Salon Services
              </span>
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-2xl leading-relaxed">
              Search by service name, filter by signature category, or sort by
              price to book your next grooming and beauty ritual.
            </p>
          </div>

          {!isLoading && (
            <div className="inline-flex items-center gap-2 self-start md:self-auto rounded-2xl border border-amber-700/20 bg-white/90 px-4 py-2 text-sm font-semibold text-stone-700 shadow-2xs">
              <span>Showing</span>
              <span className="text-amber-800 font-extrabold text-base">
                {filteredServices.length}
              </span>
              <span>
                active {filteredServices.length === 1 ? "service" : "services"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search, Sort & Category Filter Bar */}
      <div className="rounded-3xl border border-amber-900/10 bg-white/95 backdrop-blur-md p-5 sm:p-7 shadow-[0_12px_36px_rgb(28,25,23,0.06)] space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search by Service Name */}
          <div className="md:col-span-6 relative">
            <Search className="h-4 w-4 text-amber-700/75 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services by name (e.g., Facial, Keratin, Spa)..."
              className="w-full rounded-2xl border border-stone-200 bg-amber-50/35 pl-11 pr-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
            />
          </div>

          {/* Sort by Price */}
          <div className="md:col-span-4">
            <div className="relative flex items-center">
              <SlidersHorizontal className="h-4 w-4 text-amber-700 absolute left-3.5 pointer-events-none" />
              <select
                aria-label="Sort services by price"
                value={sortByPrice}
                onChange={(e) =>
                  setSortByPrice(
                    e.target.value as "default" | "asc" | "desc"
                  )
                }
                className="w-full appearance-none rounded-2xl border border-stone-200 bg-amber-50/35 pl-10 pr-4 py-3 text-sm font-medium text-stone-800 focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition cursor-pointer"
              >
                <option value="default">Sort by: Featured Default</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Reset Button */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!hasActiveFilter}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-700 hover:border-amber-500/50 hover:bg-amber-50/60 hover:text-amber-900 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Required Categories Only */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-100">
          {categoryOptions.map((category) => {
            const isSelected =
              normalizeCategory(activeCategory) === normalizeCategory(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleSelectCategory(category)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white shadow-md shadow-amber-600/25 scale-[1.01]"
                    : "border border-stone-200/90 bg-stone-50/80 text-stone-700 hover:border-amber-500/50 hover:bg-amber-50/70 hover:text-amber-900"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 gap-2.5 text-sm font-medium text-stone-600">
          <Loader2 className="h-5 w-5 animate-spin text-amber-700" />
          <span>Loading salon services...</span>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-3xl border border-amber-900/10 bg-white p-14 text-center space-y-3 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-700/20 bg-amber-500/10 text-amber-700">
            <Scissors className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-xl font-bold text-stone-900">
            No matching services found
          </h2>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Try clearing your search keyword, switching categories, or resetting
            the price filter.
          </p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-700 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredServices.map((service) => {
            const hasImage =
              Boolean(service.image) && !brokenImages[service._id];

            return (
              <article
                key={service._id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-[0_10px_30px_rgb(28,25,23,0.05)] hover:shadow-[0_22px_48px_rgb(180,83,9,0.16)] hover:border-amber-500/50 hover:-translate-y-1.5 transition-all duration-300"
              >
                <div>
                  {/* Image */}
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

                    <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-stone-950/80 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-amber-200 shadow-sm">
                      <Tag className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>{service.category}</span>
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2.5">
                    <h2 className="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                      {service.serviceName}
                    </h2>

                    <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed min-h-[2.75rem]">
                      {service.shortDescription || service.description}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mx-5 mb-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xl font-extrabold tracking-tight text-stone-900 block leading-none">
                      <span className="text-amber-700 mr-0.5">৳</span>
                      {Number(service.price).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 mt-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                      <span>{formatServiceDuration(service.duration)}</span>
                    </span>
                  </div>

                  <Link
                    href={`/services/${service._id}`}
                    className="inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 px-4 py-2.5 text-sm font-bold tracking-wide text-white shadow-md shadow-amber-600/25 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-600/35 active:scale-[0.98] transition-all duration-200 group/btn"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-amber-100 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function BrowseServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center gap-2 text-sm text-stone-600">
          <Loader2 className="h-5 w-5 animate-spin text-amber-700" />
          <span>Loading services...</span>
        </div>
      }
    >
      <BrowseServicesContent />
    </Suspense>
  );
}