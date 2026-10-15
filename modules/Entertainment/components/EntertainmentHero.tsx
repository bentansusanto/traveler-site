"use client";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { ShieldCheck, Zap, Tag, Headphones, Search, X, Ticket, ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

interface EntertainmentHeroProps {
  locale: string;
  t: (key: string) => string;
  search: string;
  onSearchChange: (value: string) => void;
}

export const EntertainmentHero: React.FC<EntertainmentHeroProps> = ({
  locale,
  t,
  search,
  onSearchChange
}) => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-16 sm:pt-24 md:pt-44 lg:pt-48 pb-14 sm:pb-18 md:pb-22 px-4 sm:px-6 lg:px-8">
      {/* Photographic Background Image (Vietnam Ba Na Hills / Bali Entertainment) with dark contrast overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1920&q=85&auto=format&fit=crop"
          fallbackSrc="/images/bali-destination.jpg"
          alt="Entertainment Attraction Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/65 to-slate-950/90" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Mobile Navigation Bar */}
        <div className="flex items-center justify-between mb-5 md:hidden">
          <Link
            href={`/${locale}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md transition-transform active:scale-95 border border-white/20"
            aria-label="Back to Home"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-[11px] font-semibold text-blue-200 backdrop-blur-md border border-white/20">
            <Ticket className="h-3.5 w-3.5 text-amber-300" />
            <span>{t("badge")}</span>
          </div>
          <div className="w-9" />
        </div>

        {/* Desktop Badge with ample top clearance from navbar */}
        <div className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-md border border-white/20 mb-5 sm:mb-6 shadow-sm">
          <Ticket className="h-3.5 w-3.5 text-amber-300" />
          <span>{t("badge")}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 drop-shadow-md">
          {t("title")}
        </h1>

        {/* Description */}
        <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-slate-100 font-normal leading-relaxed mb-8 drop-shadow-sm">
          {t("description")}
        </p>

        {/* Search Box */}
        <div className="mx-auto max-w-2xl">
          <div className="relative flex items-center rounded-2xl bg-white p-1.5 sm:p-2 shadow-xl shadow-slate-950/20 border border-white/20">
            <div className="flex items-center pl-3 text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors mr-1"
                aria-label={t("clearSearch")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="hidden sm:block">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-all cursor-default"
              >
                {t("search")}
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-blue-100">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{t("trustVerified")}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-blue-100">
            <Zap className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{t("trustInstant")}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-blue-100">
            <Tag className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>{t("trustBestPrice")}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-blue-100">
            <Headphones className="h-4 w-4 text-pink-400 shrink-0" />
            <span>{t("trustSupport")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
