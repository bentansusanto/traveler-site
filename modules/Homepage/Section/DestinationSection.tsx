"use client";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFindAllDestinationQuery } from "@/store/services/destination.service";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Star, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const DestinationCard = ({ item, locale, currentCurrency, isMobile, priority }: any) => {
  const t = useTranslations("HomePage.Destination");
  const translation =
    item.translations?.find((tr: any) => tr.language_code === locale) || item.translations?.[0];
  const name =
    translation?.name || item.name || (item.city_name ? `Tour in ${item.city_name}` : "Tour Destination");
  const image = item.thumbnail || translation?.thumbnail || "/images/hero_things_todo_mobile.png";
  const rawPrice = parseFloat(item.price) || 0;
  const strikePrice = rawPrice > 0 ? rawPrice * 1.2 : 0;
  const categoryName = item.category_destination_name || item.category?.name || "Tour";
  const locationName = item.city_name ? `${item.city_name}` : item.location?.split(",")[0] || "Turkey";

  const formatPrice = (amount: number) => {
    let displayPrice = Number(amount || 0);
    if (currentCurrency.code !== "USD") {
      displayPrice = displayPrice * (currentCurrency.idrToUsdRate || 1);
    }

    return new Intl.NumberFormat(
      currentCurrency.code === "IDR"
        ? "id-ID"
        : currentCurrency.code === "TRY"
        ? "tr-TR"
        : "en-US",
      {
        style: "currency",
        currency: currentCurrency.code,
        maximumFractionDigits: currentCurrency.code === "IDR" ? 0 : 2
      }
    )
      .format(displayPrice)
      .replace("$", "US$ ");
  };

  return (
    <Link
      href={`/${locale}/tour-holiday-religion/${translation?.slug || item.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-200/60 ${
        isMobile ? "w-[260px] shrink-0" : "w-[300px] shrink-0"
      }`}>
      {/* Image */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackSrc="/images/hero_things_todo_mobile.png"
          priority={priority}
          sizes={isMobile ? "260px" : "300px"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Tag on Top-Left */}
        {categoryName && (
          <div className="absolute top-2.5 left-2.5 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md shadow-xs border border-white/10">
            {categoryName}
          </div>
        )}

        {/* Location Badge on Top-Right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-slate-800 backdrop-blur-md shadow-xs border border-slate-200/60">
          <MapPin className="h-3 w-3 text-blue-600 shrink-0" />
          <span className="truncate max-w-[90px]">{locationName}</span>
        </div>
      </div>

      {/* Card Body Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Destination Name */}
        <h3 className="line-clamp-2 text-sm md:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
          {name}
        </h3>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-slate-800">4.9</span>
          <span className="text-[11px] text-slate-400 font-medium truncate">
            {t("reviews", { count: "1.8k" })}
          </span>
        </div>

        {/* Price & Action Section */}
        <div className="mt-auto pt-3 flex items-end justify-between gap-1.5">
          <div className="min-w-0">
            {strikePrice > 0 && (
              <p className="text-[11px] font-medium text-slate-400 line-through truncate">
                {formatPrice(strikePrice)}
              </p>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-base md:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                {formatPrice(rawPrice)}
              </span>
              <span className="text-[11px] font-medium text-slate-500 shrink-0">
                {t("perPerson")}
              </span>
            </div>
          </div>

          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export const DestinationSection = () => {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const currentCurrency = useSelector((state: any) => state.currency);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("HomePage.Destination");

  // Fetch destination data from API
  const { data: response } = useFindAllDestinationQuery();
  const destinations = response?.data || [];

  // Filter out invalid destinations (missing ID or translations)
  const validDestinations = destinations.filter(
    (dest: any) => dest.id && dest.translations && dest.translations.length > 0
  );

  // Desktop: Scroll-based carousel
  const carouselDestinations = validDestinations.slice(0, 12);
  const maxIndex = Math.max(carouselDestinations.length - 4, 0); // Max scroll index (total - visible items)
  const [scrollIndex, setScrollIndex] = useState(0);
  const cardWidth = 316; // 300px width + 16px gap

  // Mobile: Scroll position check
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Desktop: Handle next/prev navigation
  const handleNext = () => {
    if (scrollIndex < maxIndex) {
      const newIndex = scrollIndex + 1;
      setScrollIndex(newIndex);
      desktopScrollRef.current?.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth"
      });
    }
  };

  const handlePrev = () => {
    if (scrollIndex > 0) {
      const newIndex = scrollIndex - 1;
      setScrollIndex(newIndex);
      desktopScrollRef.current?.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth"
      });
    }
  };

  // Desktop: Sync scrollIndex with actual scroll position
  useEffect(() => {
    if (!isMobile) {
      const container = desktopScrollRef.current;
      const onScroll = () => {
        const index = Math.round((container?.scrollLeft || 0) / cardWidth);
        setScrollIndex(index);
      };
      container?.addEventListener("scroll", onScroll);
      return () => container?.removeEventListener("scroll", onScroll);
    }
  }, [isMobile, cardWidth]);

  // Mobile: Check scroll position
  const checkScrollPosition = () => {
    if (mobileScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = mobileScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    if (isMobile) {
      checkScrollPosition();
      const container = mobileScrollRef.current;
      if (container) {
        container.addEventListener("scroll", checkScrollPosition);
        return () => container.removeEventListener("scroll", checkScrollPosition);
      }
    }
  }, [isMobile]);

  // Mobile: Scroll function
  const scrollMobile = (direction: "left" | "right") => {
    if (mobileScrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        direction === "left"
          ? mobileScrollRef.current.scrollLeft - scrollAmount
          : mobileScrollRef.current.scrollLeft + scrollAmount;

      mobileScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth"
      });
    }
  };

  // Removed renderDestinationCard inside main component as we use DestinationCard now

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-100 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1 text-xs font-bold text-orange-600 border border-orange-200/80 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
            <span>{t("badge")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            {t("title")}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
            {t("description1")}{" "}
            <span className="font-semibold text-blue-600">
              {t("highlight")}
            </span>{" "}
            {t("description2")}
          </p>
        </div>

        {/* Navigation Buttons */}
        {!isMobile ? (
          // Desktop: Scroll-based Navigation
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={scrollIndex <= 0}
              aria-label="Previous destination"
              className={`flex size-10 items-center justify-center rounded-full border transition-all ${
                scrollIndex <= 0
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 opacity-50"
                  : "border-slate-200 bg-white text-slate-700 shadow-xs hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
              }`}>
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={scrollIndex >= maxIndex}
              aria-label="Next destination"
              className={`flex size-10 items-center justify-center rounded-full border transition-all ${
                scrollIndex >= maxIndex
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 opacity-50"
                  : "border-slate-200 bg-white text-slate-700 shadow-xs hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
              }`}>
              <ChevronRight className="size-5" />
            </button>
          </div>
        ) : (
          // Mobile: Scroll Navigation (hidden on mobile)
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => scrollMobile("left")}
              disabled={!canScrollLeft}
              aria-label="Previous destination"
              className={`flex size-10 items-center justify-center rounded-full border transition-all ${
                !canScrollLeft
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 opacity-50"
                  : "border-slate-200 bg-white text-slate-700 shadow-xs hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
              }`}>
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => scrollMobile("right")}
              disabled={!canScrollRight}
              aria-label="Next destination"
              className={`flex size-10 items-center justify-center rounded-full border transition-all ${
                !canScrollRight
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 opacity-50"
                  : "border-slate-200 bg-white text-slate-700 shadow-xs hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
              }`}>
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </div>

      {/* Destination Cards - Conditional Rendering */}
      {isMobile ? (
        // Mobile View: Horizontal Scroll with Hidden Scrollbar
        <div ref={mobileScrollRef} className="scrollbar-hide mt-8 flex gap-4 overflow-x-auto pb-4">
          {carouselDestinations.map((item: any, idx: number) => (
            <DestinationCard key={item.id} item={item} locale={locale} currentCurrency={currentCurrency} isMobile={isMobile} priority={idx < 2} />
          ))}
        </div>
      ) : (
        // Desktop View: Scroll-based Carousel
        <div ref={desktopScrollRef} className="scrollbar-hide mt-8 flex gap-5 overflow-x-auto pb-4">
          {carouselDestinations.map((item: any, idx: number) => (
            <DestinationCard key={item.id} item={item} locale={locale} currentCurrency={currentCurrency} isMobile={isMobile} priority={idx < 2} />
          ))}
        </div>
      )}
    </section>
  );
};
