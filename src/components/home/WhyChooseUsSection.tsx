"use client";

import React from "react";
import Link from "next/link";
import { Award, Sparkles, Clock, ArrowUpRight } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Certified Master Stylists",
    description:
      "Our professionals are industry-certified experts dedicated to delivering top-tier hair styling and grooming.",
  },
  {
    icon: Sparkles,
    title: "Premium Products Only",
    description:
      "We use 100% authentic, luxury-grade hair and skin care products for stunning, long-lasting results.",
  },
  {
    icon: Clock,
    title: "Seamless Online Booking",
    description:
      "Easily schedule, reschedule, or manage your salon appointments online in just a few clicks.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Same soft amber glow used by Featured Services */}
      <div className="pointer-events-none absolute inset-x-0 top-8 mx-auto h-64 max-w-3xl rounded-full bg-amber-500/10 blur-3xl -z-10" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12 pb-6 border-b border-amber-900/15">
        <div className="space-y-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-900 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-700 shrink-0" />
            <span>The SalonBook Difference</span>
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
            Why Choose Our{" "}
            <span className="bg-gradient-to-r from-amber-800 via-amber-600 to-yellow-700 bg-clip-text text-transparent">
              Sanctuary
            </span>
          </h2>

          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            We blend artistry, premium care, and effortless digital booking to
            redefine your ultimate grooming and beauty journey.
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex items-center gap-2 self-start md:self-auto rounded-2xl border border-amber-700/25 bg-white px-5 py-2.5 text-sm font-bold text-stone-800 hover:border-amber-600 hover:bg-amber-50/70 hover:text-amber-900 transition cursor-pointer"
        >
          <span>Explore Services</span>
          <ArrowUpRight className="h-4 w-4 text-amber-700" />
        </Link>
      </div>

      {/* Cards: light cards matching Featured Services, with a subtle gold accent */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        {features.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-8 shadow-[0_8px_30px_rgb(28,25,23,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/50 hover:shadow-[0_20px_45px_rgba(180,83,9,0.16)]"
            >
              {/* Gold top ribbon */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-orange-500 opacity-80 transition-all duration-300 group-hover:h-2 group-hover:opacity-100" />

              {/* Icon Box */}
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-50 text-amber-700 transition-colors duration-300 group-hover:bg-amber-100 group-hover:text-amber-800">
                <Icon className="h-5 w-5" />
              </div>

              {/* Title */}
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-3 transition-colors duration-300 group-hover:text-amber-700">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-stone-600 leading-relaxed">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
