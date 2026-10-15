"use client";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { cn } from "@/lib/utils";
import { DocumentVisaItem, getLocalizedText } from "@/store/services/document-visa.service";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface DocumentVisaCardProps {
  item: DocumentVisaItem;
  locale: string;
  formatPrice: (price: number) => string;
}

export const DocumentVisaCard = ({
  item,
  locale,
  formatPrice
}: DocumentVisaCardProps) => {
  const t = useTranslations("DocumentVisa");

  const translation =
    item.translations?.find((tr) => tr.language_code === locale) ||
    item.translations?.[0];

  const title = getLocalizedText(translation?.title || item.title, locale) || "Layanan Visa";
  const description = getLocalizedText(translation?.description || item.description, locale);
  const countryName = getLocalizedText(item.country_name || (item as any).country?.name, locale) || "International";
  const validity = getLocalizedText(item.validity, locale);
  const processingTime = getLocalizedText(item.processing_time, locale);
  const thumbnail = item.thumbnail || "/images/placeholder.jpg";

  // Visa type text
  const visaTypeBadge =
    item.visa_type === "tourist"
      ? t("touristVisa")
      : item.visa_type === "business"
      ? t("businessVisa")
      : item.visa_type === "umrah_hajj"
      ? t("umrahVisa")
      : item.visa_type === "study"
      ? t("studyVisa")
      : item.visa_type === "passport_new"
      ? t("passportService")
      : "Visa";

  const cardHref = `/${locale}/documents-visa/${item.slug || item.id}`;

  return (
    <Link
      href={cardHref}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-200/60 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-600/20">
      {/* Thumbnail Aspect Ratio 16/11 */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={thumbnail}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackSrc="/images/placeholder.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top-Right Floating Badge: Processing Speed */}
        {processingTime && (
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 inline-flex max-w-[42%] items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-bold text-slate-800 backdrop-blur-md shadow-xs border border-slate-200/60">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 shrink-0" />
            <span className="truncate">{processingTime}</span>
          </div>
        )}
      </div>

      {/* Card Body Info */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5 md:p-4">
        {/* Country Tag & Visa Category */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 mb-1">
          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 truncate max-w-[60%]">
            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500 shrink-0" />
            <span className="truncate">{countryName}</span>
          </span>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-slate-600 border border-slate-200/60 truncate max-w-[38%]">
            {visaTypeBadge}
          </span>
        </div>

        {/* Main Title */}
        <h3 className="line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] text-xs sm:text-sm md:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
          {title}
        </h3>

        {/* Description snippet */}
        {description && (
          <p className="mt-1 line-clamp-1 sm:line-clamp-2 text-[10px] sm:text-xs text-slate-500 font-normal leading-relaxed">
            {description}
          </p>
        )}

        {/* Specs Row */}
        <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 border-t border-slate-100 pt-2 sm:pt-2.5 text-[9px] sm:text-[11px] text-slate-600">
          {validity && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-1.5 sm:px-2 py-0.5 sm:py-1 border border-slate-200/60 max-w-[50%] truncate">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400 shrink-0" />
              <span className="truncate">{validity}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-1.5 sm:px-2 py-0.5 sm:py-1 border border-slate-200/60 max-w-[48%] truncate">
            {item.is_interview_required ? (
              <>
                <ShieldAlert className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-500 shrink-0" />
                <span className="truncate">{t("interviewRequired")}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-600 shrink-0" />
                <span className="truncate">{t("noInterview")}</span>
              </>
            )}
          </span>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-2.5 sm:pt-3 flex items-end justify-between gap-1 border-t border-slate-100">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] sm:text-[11px] font-medium text-slate-400 block truncate">
              {t("startsFrom")}
            </span>
            <span className="text-xs sm:text-sm md:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate block">
              {formatPrice(item.starting_price)}
            </span>
          </div>

          <span className="inline-flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};
