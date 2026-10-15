"use client";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { cn } from "@/lib/utils";
import { EntertainmentAttraction } from "@/store/services/entertainment-attraction.service";
import { ArrowRight, MapPin, Star } from "lucide-react";
import Link from "next/link";
import React from "react";

interface AttractionCardProps {
  attraction: EntertainmentAttraction;
  locale: string;
  t: (key: string, params?: Record<string, any>) => string;
  formatPrice: (price: number) => string;
  onViewTickets: (attraction: EntertainmentAttraction) => void;
}

export const AttractionCard: React.FC<AttractionCardProps> = ({
  attraction,
  locale,
  t,
  formatPrice,
  onViewTickets
}) => {
  const translation =
    attraction.translations?.find((tr) => tr.language_code === locale) ||
    attraction.translations?.[0];

  const name = translation?.name || "Entertainment Attraction";
  const image =
    attraction.thumbnail ||
    attraction.images?.[0] ||
    "/images/hero_things_todo_mobile.png";

  const locationState = attraction.state?.name || attraction.state_name || "";
  const locationCountry =
    attraction.country?.name || attraction.country_name || "";
  const locationName = [locationState, locationCountry]
    .filter(Boolean)
    .join(", ") || "Turkey";

  const categoryName =
    attraction.category_entertainment?.name ||
    attraction.category_entertainment_name ||
    "Attraction";

  // Calculate prices
  const ticketPrices = (attraction.tickets || [])
    .map((tk) => Number(tk.price) || 0)
    .filter((p) => p > 0);
  const rawPrice =
    ticketPrices.length > 0
      ? Math.min(...ticketPrices)
      : Number(attraction.price) || 0;
  const strikePrice = rawPrice > 0 ? rawPrice * 1.25 : 0;
  const ticketCount = attraction.tickets?.length || 0;

  const isInstantAvailable = !attraction.daily_quota || attraction.daily_quota > 0;

  const cardHref = `/${locale}/entertainment-attraction/${translation?.slug || attraction.id}`;

  return (
    <Link
      href={cardHref}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-200/60"
    >
      {/* Card Thumbnail Image */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackSrc="/images/hero_things_todo_mobile.png"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Availability / Instant Confirmation Floating Badge (Left) */}
        <div
          className={cn(
            "absolute top-2 left-2 sm:top-2.5 sm:left-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white backdrop-blur-md shadow-xs z-10",
            isInstantAvailable ? "bg-emerald-600/90" : "bg-slate-800/90"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0",
              isInstantAvailable ? "bg-white animate-pulse" : "bg-slate-400"
            )}
          />
          <span>
            {attraction.daily_quota
              ? `${attraction.daily_quota}/d`
              : t("instantShort")}
          </span>
        </div>

        {/* Ticket Count Badge (Right) */}
        {ticketCount > 0 && (
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 rounded-full bg-slate-900/80 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white backdrop-blur-md shadow-xs border border-white/10 z-10">
            {ticketCount === 1
              ? t("ticketShort")
              : t("ticketsShort", { count: ticketCount })}
          </div>
        )}
      </div>

      {/* Card Body Info */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        {/* Category Tag & Location */}
        <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
          <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 truncate">
            {categoryName}
          </span>
          <span className="flex items-center gap-0.5 text-[9px] sm:text-[11px] font-medium text-slate-500 shrink-0">
            <MapPin className="h-2.5 w-2.5 text-red-500 shrink-0" />
            <span className="truncate max-w-[65px] sm:max-w-[120px]">{locationName}</span>
          </span>
        </div>

        {/* Attraction Name: clamp to 2 lines with min-height for uniform card heights */}
        <h3 className="line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] text-[11px] sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
          {name}
        </h3>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1 border-b border-slate-100 pb-1.5 sm:pb-2">
          <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400 shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-800">4.9</span>
          <span className="text-[9px] sm:text-[11px] text-slate-400 font-medium truncate">
            {t("reviews", { count: "1.8k" })}
          </span>
        </div>

        {/* Price & Action Section */}
        <div className="mt-auto pt-2 flex items-end justify-between gap-1">
          <div className="min-w-0">
            {strikePrice > 0 && (
              <p className="text-[9px] sm:text-[10px] font-medium text-slate-400 line-through truncate">
                {formatPrice(strikePrice)}
              </p>
            )}
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                {formatPrice(rawPrice)}
              </span>
              <span className="text-[8px] sm:text-[10px] font-medium text-slate-500 shrink-0">
                {t("perTicket")}
              </span>
            </div>
          </div>

          <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};
