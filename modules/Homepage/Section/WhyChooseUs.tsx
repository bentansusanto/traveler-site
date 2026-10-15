"use client";

import { Award, CalendarCheck, Layers, Route, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export const WhyChooseUs = () => {
  const t = useTranslations("WhyChooseUs");

  const features = [
    {
      title: t("features.allInOne"),
      desc: t("features.allInOneDesc"),
      icon: Layers
    },
    {
      title: t("features.professional"),
      desc: t("features.professionalDesc"),
      icon: Award
    },
    {
      title: t("features.multiTrip"),
      desc: t("features.multiTripDesc"),
      icon: Route
    },
    {
      title: t("features.flexible"),
      desc: t("features.flexibleDesc"),
      icon: CalendarCheck
    }
  ];

  return (
    <section className="w-full bg-slate-50/70 border-y border-slate-200/60 py-14 sm:py-18 md:py-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1 text-xs font-bold text-orange-600 border border-orange-200/80 uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
            <span>{t("sectionTag")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            {t("title")}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-500 font-normal leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-12 sm:mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => {
            const IconComp = feature.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col items-center text-center rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/5 hover:-translate-y-1.5 transition-all duration-300">
                <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105 shadow-xs">
                  <IconComp className="size-6 sm:size-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
