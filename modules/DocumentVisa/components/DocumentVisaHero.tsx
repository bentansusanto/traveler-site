"use client";

import { ArrowRight, ChevronLeft, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getLocalizedText } from "@/store/services/document-visa.service";

interface DocumentVisaHeroProps {
  locale: string;
  onOpenMobileSearch: () => void;
  onOpenDesktopSearch: () => void;
  countryFilter: string | null;
}

export const DocumentVisaHero = ({
  locale,
  onOpenMobileSearch,
  onOpenDesktopSearch,
  countryFilter
}: DocumentVisaHeroProps) => {
  const t = useTranslations("DocumentVisa");

  return (
    <div className="relative min-h-[380px] md:min-h-[500px] w-full overflow-hidden bg-slate-900 flex flex-col justify-center">
      {/* Background Image & Clean Solid Dark Overlay */}
      <Image
        src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2000&q=80"
        alt="International Document & Visa Assistance"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Top Mobile Floating Bar */}
      <div className="absolute inset-x-0 top-4 z-20 px-3.5 sm:px-5 md:hidden">
        <div className="mx-auto flex w-full max-w-lg items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            href={`/${locale}`}
            prefetch={true}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div
            onClick={onOpenMobileSearch}
            className="relative flex flex-1 min-w-0 items-center h-10 cursor-pointer rounded-2xl bg-white/95 px-3.5 shadow-md backdrop-blur-md overflow-hidden">
            <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            <span className="text-xs font-medium text-slate-500 truncate block w-full min-w-0">
              {countryFilter ? `Destinasi: ${getLocalizedText(countryFilter, locale)}` : t("searchPlaceholderMobile")}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Content Center Wrapper */}
      <div className="relative mx-auto w-full max-w-7xl px-5 pt-20 pb-12 md:pt-36 md:pb-16 md:px-8 flex flex-col items-center text-center">
        {/* Main Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md max-w-3xl leading-tight">
          {t("heroTitle")}
        </h1>

        {/* Subtitle */}
        <p className="mt-4 md:mt-5 text-sm sm:text-base text-slate-200/90 max-w-2xl font-normal leading-relaxed">
          {t("heroSubtitle")}
        </p>

        {/* Desktop & Tablet Search Card Bar */}
        <div className="mt-6 md:mt-8 hidden w-full max-w-xl md:block px-2 sm:px-0">
          <div
            onClick={onOpenDesktopSearch}
            className="flex items-center h-13 sm:h-14 w-full cursor-pointer rounded-2xl bg-white p-1.5 sm:p-2 shadow-xl shadow-black/25 transition-all hover:shadow-2xl overflow-hidden min-w-0">
            <div className="flex flex-1 min-w-0 items-center px-3 sm:px-4 overflow-hidden">
              <Search className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-slate-400 mr-2.5 sm:mr-3 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-slate-500 truncate block w-full min-w-0">
                {countryFilter ? `Destinasi: ${getLocalizedText(countryFilter, locale)}` : t("searchPlaceholder")}
              </span>
            </div>

            <button
              type="button"
              className="flex h-10 shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl bg-blue-600 px-4 sm:px-6 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95">
              <span>{t("searchBtn")}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
