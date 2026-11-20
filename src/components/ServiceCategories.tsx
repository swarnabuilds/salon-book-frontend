"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getSalonServices, SalonService } from "@/lib/api/serviceApi";
import {
  Scissors,
  Palette,
  Sparkles,
  Flower2,
  Brush,
  Hand,
  Waves,
  ArrowUpRight,
} from "lucide-react";

interface ServiceCategoriesProps {
  services?: SalonService[];
}

interface CategoryConfig {
  name: string;
  tagline: string;
  topAccent: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SALON_CATEGORY_ITEMS: CategoryConfig[] = [
  {
    name: "Haircut & Styling",
    tagline: "Precision cuts, blowouts & modern signature styles",
    topAccent: "from-amber-400 via-yellow-300 to-amber-500",
    icon: Scissors,
  },
  {
    name: "Hair Coloring",
    tagline: "Rich balayage, global shades & luminous gloss",
    topAccent: "from-yellow-300 via-amber-400 to-orange-400",
    icon: Palette,
  },
  {
    name: "Hair Treatment",
    tagline: "Deep keratin, repair masks & scalp nourishment",
    topAccent: "from-amber-500 via-yellow-300 to-amber-400",
    icon: Sparkles,
  },
  {
    name: "Facial & Skincare",
    tagline: "Hydrating facials, glow therapy & skin renewal",
    topAccent: "from-yellow-400 via-amber-300 to-yellow-500",
    icon: Flower2,
  },
  {
    name: "Makeup",
    tagline: "Bridal glamour, party looks & editorial finish",
    topAccent: "from-amber-400 via-yellow-200 to-amber-500",
    icon: Brush,
  },
  {
    name: "Manicure & Pedicure",
    tagline: "Nail shaping, cuticle care & soothing hand-foot rituals",
    topAccent: "from-yellow-300 via-amber-400 to-yellow-500",
    icon: Hand,
  },
  {
    name: "Spa & Massage",
    tagline: "Relaxing body massage, aromatherapy & calm escape",
    topAccent: "from-amber-500 via-yellow-300 to-orange-400",
    icon: Waves,
  },
];

// Safely extract an array from API responses
const extractServicesArray = (input: unknown): Record<string, unknown>[] => {
  if (Array.isArray(input)) {
    return input.filter((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object")
    );
  }

  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj.data)) return extractServicesArray(obj.data);
    if (Array.isArray(obj.services)) return extractServicesArray(obj.services);
  }

  return [];
};

const isServiceActive = (item: Record<string, unknown>): boolean => {
  if (item.isActive === false) return false;
  if (
    typeof item.status === "string" &&
    item.status.toLowerCase() === "inactive"
  ) {
    return false;
  }
  return true;
};

const getRawCategory = (item: Record<string, unknown>): string => {
  const raw = item.category ?? item.categoryName ?? item.category_name ?? "";
  return String(raw).trim().toLowerCase();
};

const getServiceImage = (item: Record<string, unknown>): string => {
  const raw = item.image ?? item.imageUrl ?? item.thumbnail ?? "";
  return typeof raw === "string" ? raw.trim() : "";
};

const normalizeCategoryName = (value?: string): string => {
  const clean = (value || "").trim().toLowerCase();
  if (clean === "skin & facial" || clean === "facial & skincare") {
    return "facial & skincare";
  }
  if (clean === "hair care") return "hair treatment";
  if (clean === "bridal & makeup") return "makeup";
  if (clean === "nail & grooming") return "manicure & pedicure";
  return clean;
};

export function ServiceCategories({ services }: ServiceCategoriesProps) {
  const [fetchedList, setFetchedList] = useState<Record<string, unknown>[]>([]);
  const [hasLoadedRemote, setHasLoadedRemote] = useState<boolean>(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (services) return;

    let isMounted = true;

    const loadServices = async () => {
      try {
        const response = await getSalonServices();
        if (!isMounted) return;
        setFetchedList(extractServicesArray(response));
      } finally {
        if (isMounted) {
          setHasLoadedRemote(true);
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, [services]);

  const isLoading = !services && !hasLoadedRemote;

  const activeServices = (
    services ? extractServicesArray(services) : fetchedList
  ).filter(isServiceActive);

  const getCategoryServices = (categoryName: string) => {
    const target = normalizeCategoryName(categoryName);
    return activeServices.filter(
      (service) => normalizeCategoryName(getRawCategory(service)) === target
    );
  };

  const getCategoryPreviewImage = (categoryName: string): string => {
    const matching = getCategoryServices(categoryName);
    for (const srv of matching) {
      const img = getServiceImage(srv);
      if (img) return img;
    }
    return "";
  };

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-amber-900/15">
        <div className="space-y-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-100/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-900">
            <Sparkles className="h-3.5 w-3.5 text-amber-700 shrink-0" />
            <span>Explore By Category</span>
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
            Salon Service{" "}
            <span className="bg-gradient-to-r from-amber-800 via-amber-600 to-yellow-700 bg-clip-text text-transparent">
              Categories
            </span>
          </h2>

          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            Choose a category to explore tailored treatments and book your
            preferred session effortlessly.
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex items-center gap-2 self-start md:self-auto rounded-2xl border border-amber-700/25 bg-white px-5 py-2.5 text-sm font-bold text-stone-800 hover:border-amber-600 hover:bg-amber-50/70 hover:text-amber-900 transition cursor-pointer"
        >
          <span>View All Services</span>
          <ArrowUpRight className="h-4 w-4 text-amber-700" />
        </Link>
      </div>

      {/* Category Cards Grid: Top 4 take 3 cols each, bottom 3 take 4 cols each on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5">
        {SALON_CATEGORY_ITEMS.map((item, idx) => {
          const IconComponent = item.icon;
          const count = getCategoryServices(item.name).length;
          const previewImage = getCategoryPreviewImage(item.name);
          const showImage = Boolean(previewImage) && !brokenImages[item.name];
          const href = `/services?category=${encodeURIComponent(item.name)}`;
          const isBottomRowCard = idx >= 4;

          return (
            <Link
              key={item.name}
              href={href}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-[0_8px_28px_rgb(28,25,23,0.05)] transition-all duration-300 hover:-translate-y-2 hover:border-amber-400/70 hover:bg-gradient-to-br hover:from-[#1F1A17] hover:via-[#26201B] hover:to-[#181411] hover:shadow-[0_24px_52px_rgba(28,25,23,0.28)] ${
                isBottomRowCard ? "lg:col-span-4" : "lg:col-span-3"
              }`}
            >
              {/* Fancy top yellow/gold ribbon & soft glow */}
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 z-20 h-1.5 bg-gradient-to-r ${item.topAccent} opacity-90 transition-all duration-300 group-hover:h-2 group-hover:opacity-100`}
              />
              <div className="pointer-events-none absolute -top-10 inset-x-6 z-20 h-16 rounded-full bg-yellow-300/35 blur-2xl opacity-75 transition-all duration-300 group-hover:bg-amber-300/35 group-hover:opacity-100" />

              <div>
                {/* Category Image Header */}
                <div className="relative h-40 w-full overflow-hidden bg-amber-50/70">
                  {showImage ? (
                    <img
                      src={previewImage}
                      alt={item.name}
                      onError={() =>
                        setBrokenImages((prev) => ({
                          ...prev,
                          [item.name]: true,
                        }))
                      }
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100/80 via-amber-50 to-orange-100/70 text-amber-800">
                      <IconComponent className="h-11 w-11 opacity-80 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                  {/* Service Count Badge on Image */}
                  <span className="absolute top-3.5 right-3.5 inline-flex items-center rounded-full border border-white/25 bg-stone-950/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-amber-200 shadow-sm">
                    {isLoading
                      ? "..."
                      : `${count} ${count === 1 ? "Service" : "Services"}`}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 pb-2 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-600/25 bg-gradient-to-br from-amber-100/90 to-orange-100/70 text-amber-800 transition-all duration-300 group-hover:border-amber-300/60 group-hover:from-amber-400 group-hover:via-amber-500 group-hover:to-orange-500 group-hover:text-stone-950">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 transition-colors duration-300 group-hover:text-white line-clamp-1">
                      {item.name}
                    </h3>
                  </div>

                  <p className="text-sm text-stone-600 leading-relaxed transition-colors duration-300 group-hover:text-stone-300">
                    {item.tagline}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mx-6 mb-5 mt-4 pt-4 border-t border-stone-100 transition-colors duration-300 group-hover:border-white/15 flex items-center justify-between text-sm font-bold text-amber-800 group-hover:text-amber-300">
                <span>Explore Category</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}