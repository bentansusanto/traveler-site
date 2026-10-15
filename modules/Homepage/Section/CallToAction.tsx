"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Sparkles, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export const CallToAction = () => {
  const t = useTranslations("HomePage.CTA");
  const locale = useLocale();

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 px-6 py-16 text-center shadow-2xl shadow-blue-950/30 md:px-16 md:py-20 lg:py-24 border border-blue-800/40">
        {/* Background Image & Ambient Glow */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero_things_todo_mobile.png"
            alt="Adventure Background"
            fill
            className="object-cover opacity-25 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-blue-950/60 to-slate-950/80" />
        </div>

        {/* Ambient Decorative Lighting */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex max-w-3xl flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-500/15 px-4 py-1.5 backdrop-blur-md mb-6 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-xs font-bold tracking-wider text-orange-400 uppercase">
              {t("badge")}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
            {t("title")}
          </h2>
          <p className="mt-4 text-xs sm:text-sm md:text-base lg:text-lg font-normal leading-relaxed text-slate-200 max-w-2xl">
            {t("description")}
          </p>

          <div className="mt-8 sm:mt-10">
            <Link
              href={`/${locale}/tour-holiday-religion`}
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm sm:text-base font-bold text-blue-900 shadow-xl shadow-black/10 transition-all duration-300 hover:bg-sky-50 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 active:scale-95">
              <span>{t("btn")}</span>
              <ArrowRight className="size-4 sm:size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Trust Metrics Pill Row */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 border-t border-white/10 pt-8 text-white/90">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
              <span>{t("trustRating")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
              <span>{t("trustDestinations")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <Clock className="h-4 w-4 text-sky-400 shrink-0" />
              <span>{t("trustSupport")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
