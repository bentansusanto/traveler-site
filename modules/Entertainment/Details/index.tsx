"use client";

import { Footer } from "@/components/layout/traveler-layout/Footer";
import { Navbar } from "@/components/layout/traveler-layout/Navbar";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  MapPin,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  Users,
  X
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AttractionCard } from "../components/AttractionCard";
import { useEntertainmentDetailLogic } from "./logic";

export const EntertainmentDetailPage: React.FC = () => {
  const {
    attraction,
    translation,
    galleryImages,
    isLoading,
    isBooking,
    selectedDate,
    setSelectedDate,
    isDateDisabled,
    visitDate,
    ticketQuantities,
    handleIncrease,
    handleDecrease,
    totalSelectedTickets,
    subtotal,
    isOverQuota,
    formatPrice,
    isSaved,
    toggleSave,
    handleShare,
    similarAttractions,
    handleBooking,
    locale,
    t
  } = useEntertainmentDetailLogic();

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Keyboard navigation for full photo gallery
  useEffect(() => {
    if (!isGalleryOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelectedGalleryIndex((prev) =>
          prev > 0 ? prev - 1 : galleryImages.length - 1
        );
      } else if (e.key === "ArrowRight") {
        setSelectedGalleryIndex((prev) =>
          prev < galleryImages.length - 1 ? prev + 1 : 0
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGalleryOpen, galleryImages.length]);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">
            {t("loadingDetails")}
          </p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!attraction || !translation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50/50 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 mb-4 shadow-xs">
          <Ticket className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {t("attractionNotFound")}
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-500 max-w-sm">
          {t("attractionNotFoundDesc")}
        </p>
        <Link
          href={`/${locale}/entertainment-attraction`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{t("backToAttractions")}</span>
        </Link>
      </div>
    );
  }

  const name = translation?.name || "Entertainment Attraction";
  const description = translation?.description || "";
  const categoryName =
    attraction.category_entertainment?.name ||
    attraction.category_entertainment_name ||
    "Attraction";
  const locationState = attraction.state?.name || attraction.state_name || "";
  const locationCountry =
    attraction.country?.name || attraction.country_name || "";
  const locationName = [locationState, locationCountry]
    .filter(Boolean)
    .join(", ") || "Turkey";

  const ticketPrices = (attraction.tickets || [])
    .map((tk) => Number(tk.price) || 0)
    .filter((p) => p > 0);
  const startingPrice =
    ticketPrices.length > 0
      ? Math.min(...ticketPrices)
      : Number(attraction.price) || 0;
  const strikePrice = startingPrice > 0 ? startingPrice * 1.25 : 0;
  const tickets = attraction.tickets || [];

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Desktop Navbar */}
      <div className="hidden lg:block">
        <Navbar />
      </div>

      <div className="mx-auto max-w-7xl px-0 lg:px-8 pt-0 lg:pt-28 pb-28 lg:pb-8">
        {/* Breadcrumb Bar & Header Actions (Desktop) */}
        <div className="hidden lg:flex items-center justify-between py-2 mb-4">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link
              href={`/${locale}`}
              className="hover:text-slate-900 transition-colors"
            >
              {t("breadcrumbsHome")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <Link
              href={`/${locale}/entertainment-attraction`}
              className="hover:text-slate-900 transition-colors"
            >
              {t("breadcrumbsEntertainment")}
            </Link>
            {categoryName && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-slate-500 font-semibold">{categoryName}</span>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-slate-900 font-bold truncate max-w-xs">{name}</span>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-500" />
              <span>{t("share")}</span>
            </button>
            <button
              type="button"
              onClick={toggleSave}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium shadow-xs transition-all active:scale-95",
                isSaved
                  ? "border-rose-200 bg-rose-50/70 text-rose-600"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isSaved ? "fill-rose-500 text-rose-500" : "text-slate-500"
                )}
              />
              <span>{isSaved ? t("saved") : t("save")}</span>
            </button>
          </div>
        </div>

        {/* Hero Media Showcase */}
        <div className="relative overflow-hidden rounded-none lg:rounded-3xl bg-slate-900 shadow-sm ring-0 lg:ring-1 lg:ring-slate-900/5">
          <Carousel
            setApi={setCarouselApi}
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-0">
              {galleryImages.map((img, i) => (
                <CarouselItem key={i} className="pl-0">
                  <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden bg-slate-800">
                    <ImageWithFallback
                      src={img}
                      alt={`${name} ${i + 1}`}
                      fill
                      className="object-cover"
                      priority={i === 0}
                      fallbackSrc="/images/hero_things_todo_mobile.png"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Top Floating Mobile Bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 sm:p-4 lg:hidden z-10">
            <Link
              href={`/${locale}/entertainment-attraction`}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95"
              >
                <Share2 className="h-4 w-4 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={toggleSave}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95"
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    isSaved ? "fill-rose-500 text-rose-500" : "text-slate-700"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Indicator Pill */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 backdrop-blur-md z-10">
              {galleryImages.slice(0, 5).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    currentSlide === i ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  )}
                />
              ))}
            </div>
          )}

          {/* View Photos Button */}
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setSelectedGalleryIndex(currentSlide);
                setIsGalleryOpen(true);
              }}
              className="absolute right-3 bottom-3 sm:right-5 sm:bottom-5 inline-flex items-center gap-2 rounded-xl bg-black/50 hover:bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all active:scale-95 shadow-sm z-10"
            >
              <Sparkles className="h-3.5 w-3.5 text-slate-200" />
              <span>
                {t("gallery")} ({galleryImages.length})
              </span>
            </button>
          )}
        </div>

        {/* Main Content 2-Column Grid */}
        <div className="mt-4 sm:mt-6 px-4 sm:px-6 lg:px-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column (col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title & Meta Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  <Ticket className="h-3 w-3" />
                  <span>{categoryName}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {attraction.daily_quota
                      ? t("dailyQuota", { quota: attraction.daily_quota ?? 0 })
                      : t("instantConfirmation")}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  <span>
                    {tickets.length}{" "}
                    {tickets.length === 1
                      ? t("ticketOptionsSingle")
                      : t("ticketOptions", { count: tickets.length })}
                  </span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                {name}
              </h1>

              {/* Location & Reviews */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                  <span>4.9</span>
                  <span className="font-normal text-slate-500">
                    {t("reviews", { count: "1.8k" })}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-slate-600 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span>{locationName}</span>
                </div>
              </div>
            </div>

            {/* Admission Tickets Selection Card */}
            <div
              id="tickets-section"
              className="scroll-mt-20 lg:scroll-mt-28 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-blue-600" />
                    <span>{t("ticketOptionsTitle")}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("ticketOptionsDesc")}
                  </p>
                </div>
              </div>

              {/* Mobile/Tablet Visit Date Selection (lg:hidden) */}
              <div className="lg:hidden mb-5 rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  <span>{t("selectDate")}</span>
                </label>
                <DatePicker
                  date={selectedDate}
                  setDate={setSelectedDate}
                  disabled={isDateDisabled}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-800 shadow-2xs"
                />
              </div>

              {tickets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                  No tickets configured for this attraction.
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((tk) => {
                    const qty = ticketQuantities[tk.id] || 0;
                    const price = Number(tk.price) || 0;

                    return (
                      <div
                        key={tk.id}
                        className={`rounded-2xl border p-4 transition-all duration-200 ${
                          qty > 0
                            ? "border-blue-300 bg-blue-50/20 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-sm sm:text-base font-semibold text-slate-900">
                                {tk.name}
                              </span>
                              {tk.ticket_type && (
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                                  {tk.ticket_type}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500 font-normal">
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5 text-slate-400" />
                                {tk.pax_count
                                  ? t("paxCount", { count: tk.pax_count })
                                  : t("paxCount", { count: 1 })}
                              </span>
                              {tk.min_age != null && (
                                <span>{t("minAge", { age: tk.min_age })}</span>
                              )}
                            </div>

                            {tk.description && (
                              <p className="mt-1.5 text-xs text-slate-600 font-normal leading-relaxed">
                                {tk.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <div className="text-left sm:text-right">
                              <span className="text-base sm:text-lg font-bold text-blue-600">
                                {formatPrice(price)}
                              </span>
                              <span className="text-[10px] font-normal text-slate-400 block">
                                {t("perTicket")}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-xs">
                              <button
                                type="button"
                                onClick={() => handleDecrease(tk.id)}
                                disabled={qty <= 0}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow-xs hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center text-xs font-semibold text-slate-800">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleIncrease(tk.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition-all active:scale-95"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Overview / Description Card */}
            {description && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span>{t("aboutAttraction")}</span>
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {description}
                </div>
              </div>
            )}

            {/* Highlights & Guarantees Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
                {t("ticketInclusions")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{t("trustVerified")}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{t("trustInstant")}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{t("freeCancellation")}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{t("trustSupport")}</span>
                </div>
              </div>
            </div>

            {/* Similar Attractions Grid */}
            {similarAttractions.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      {t("similarAttractions")}
                    </h2>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      {t("similarAttractionsSubtitle")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {similarAttractions.map((sim: any) => (
                    <AttractionCard
                      key={sim.id}
                      attraction={sim}
                      locale={locale}
                      t={t}
                      formatPrice={formatPrice}
                      onViewTickets={() => {}}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Booking Widget (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/50">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <span className="text-xs font-medium text-slate-500 block">{t("startsFrom")}</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {formatPrice(startingPrice)}
                    </span>
                    <span className="text-xs font-normal text-slate-500">{t("perTicket")}</span>
                  </div>
                </div>
                {strikePrice > 0 && (
                  <span className="text-xs font-medium text-slate-400 line-through">
                    {formatPrice(strikePrice)}
                  </span>
                )}
              </div>

              {/* Date of Visit */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  <span>{t("selectDate")}</span>
                </label>
                <DatePicker
                  date={selectedDate}
                  setDate={setSelectedDate}
                  disabled={isDateDisabled}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 text-xs font-medium text-slate-800 transition-colors hover:border-slate-300 hover:bg-white"
                />
              </div>

              {/* Selected Tickets Summary */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 mb-5 space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Tickets</span>
                  <span className="font-semibold text-slate-900">
                    {t("ticketsCount", { count: totalSelectedTickets })}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200/80">
                  <span className="text-xs font-semibold text-slate-700">{t("totalPayment")}</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              {/* Booking CTA Button */}
              <button
                type="button"
                onClick={handleBooking}
                disabled={totalSelectedTickets === 0 || isOverQuota || isBooking}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 transition-all"
              >
                <span>{isBooking ? "Processing..." : t("bookNow")}</span>
              </button>

              {totalSelectedTickets === 0 && (
                <p className="mt-2 text-center text-[11px] font-normal text-slate-500">
                  {t("selectTicketsPrompt")}
                </p>
              )}

              {/* Trust Badges */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>{t("trustVerified")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span>{t("trustInstant")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Footer (Hidden on Mobile & Tablet) */}
      <div className="hidden lg:block mt-16 border-t border-slate-200/80 bg-white">
        <Footer />
      </div>

      {/* Floating Mobile Bottom Booking Bar (lg:hidden) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-500 font-medium block">
              {totalSelectedTickets > 0
                ? `${t("totalPayment")} (${t("ticketsCount", { count: totalSelectedTickets })})`
                : t("startsFrom")}
            </span>
            <span className="text-base font-bold text-blue-600">
              {formatPrice(totalSelectedTickets > 0 ? subtotal : startingPrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (totalSelectedTickets > 0) {
                handleBooking();
              } else {
                const el = document.getElementById("tickets-section");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }
            }}
            disabled={isBooking}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isBooking ? (
              <>
                <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </>
            ) : totalSelectedTickets > 0 ? (
              t("bookNow")
            ) : (
              t("viewTickets")
            )}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          FULLSCREEN PHOTO GALLERY DIALOG
         ══════════════════════════════════════════════════════════ */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent
          showCloseButton={false}
          className="h-screen w-screen max-w-none gap-0 overflow-hidden rounded-none border-none p-0 outline-none lg:h-[90vh] lg:w-[95vw] lg:max-w-[1280px] lg:rounded-3xl"
        >
          <DialogTitle className="sr-only">{name} Gallery</DialogTitle>
          <div className="flex h-full flex-col overflow-hidden bg-slate-950 lg:flex-row">
            {/* Desktop Thumbnails Sidebar */}
            <div className="hidden border-r border-slate-800 bg-slate-900/90 lg:flex lg:w-[360px] lg:flex-col">
              <div className="p-5 border-b border-slate-800">
                <h3 className="text-base font-bold text-white line-clamp-1">{name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {galleryImages.length} {locale === "id" ? "Foto Dokumentasi" : "Photos"}
                </p>
              </div>

              <div className="no-scrollbar flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-2.5">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGalleryIndex(i);
                      }}
                      className={cn(
                        "relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-slate-800 transition-all",
                        selectedGalleryIndex === i
                          ? "ring-3 ring-blue-500 ring-offset-2 ring-offset-slate-900 opacity-100 scale-[1.02]"
                          : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <ImageWithFallback
                        src={img}
                        alt={`Photo ${i + 1}`}
                        fill
                        className="object-cover pointer-events-none"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Full View Stage */}
            <div className="relative flex flex-1 items-center justify-center bg-black">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="absolute top-5 right-5 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-90"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative h-full w-full p-4 lg:p-10 flex items-center justify-center">
                <ImageWithFallback
                  key={selectedGalleryIndex}
                  src={galleryImages[selectedGalleryIndex]}
                  alt={`${name} photo ${selectedGalleryIndex + 1}`}
                  fill
                  className="object-contain select-none"
                  priority
                />

                {/* Photo Counter & Title */}
                <div className="absolute bottom-6 left-6 z-30 flex items-center gap-3 pointer-events-none select-none">
                  <div className="rounded-xl bg-black/60 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                    {selectedGalleryIndex + 1} / {galleryImages.length}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-white/80 drop-shadow-md">
                    {name}
                  </span>
                </div>

                {/* Left/Right Navigation Controls */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous photo"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGalleryIndex((prev) =>
                          prev > 0 ? prev - 1 : galleryImages.length - 1
                        );
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/90 hover:scale-105 active:scale-95 shadow-xl border border-white/20"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next photo"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGalleryIndex((prev) =>
                          prev < galleryImages.length - 1 ? prev + 1 : 0
                        );
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/90 hover:scale-105 active:scale-95 shadow-xl border border-white/20"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EntertainmentDetailPage;
