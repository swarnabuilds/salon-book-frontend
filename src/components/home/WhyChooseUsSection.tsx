import React from "react";
import { ShieldCheck, Sparkles, Clock, Award, Users, HeartHandshake } from "lucide-react";

export function WhyChooseUsSection() {
  // Features data highlighting salon expertise and premium experience
  const features = [
    {
      icon: <Award className="h-6 w-6 text-amber-400" />,
      title: "Certified Master Stylists",
      description: "Our professionals are industry-certified experts dedicated to delivering top-tier hair styling and grooming.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-amber-400" />,
      title: "Premium Products Only",
      description: "We use 100% authentic, luxury-grade hair and skin care products for stunning, long-lasting results.",
    },
    {
      icon: <Clock className="h-6 w-6 text-amber-400" />,
      title: "Seamless Online Booking",
      description: "Easily schedule, reschedule, or manage your salon appointments online in just a few clicks.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-amber-400" />,
      title: "Hygiene & Safety First",
      description: "We maintain rigorous sanitation protocols to ensure a clean, safe, and relaxing sanctuary for every client.",
    },
    {
      icon: <Users className="h-6 w-6 text-amber-400" />,
      title: "Personalized Consultation",
      description: "Every treatment begins with a tailored consultation to match your unique look and personal style.",
    },
    {
      icon: <HeartHandshake className="h-6 w-6 text-amber-400" />,
      title: "Exquisite Client Care",
      description: "Enjoy a dedicated concierge desk and welcoming ambiance designed entirely around your comfort.",
    },
  ];

  return (
    <section className="relative bg-stone-950 py-24 lg:py-32 overflow-hidden text-stone-100">
      {/* Decorative Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-medium text-amber-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The SalonBook Difference</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Why Choose Our <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">Sanctuary</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-400 leading-relaxed">
            We blend artistry, premium care, and effortless digital booking to redefine your ultimate grooming and beauty journey.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-3xl border border-stone-800/80 bg-stone-900/60 p-8 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/50 hover:bg-stone-900 hover:-translate-y-1 shadow-xl"
            >
              {/* Subtle hover gradient glow inside card */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

              <div className="relative z-10 space-y-4">
                {/* Icon Wrapper */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg font-semibold text-white group-hover:text-amber-300 transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}