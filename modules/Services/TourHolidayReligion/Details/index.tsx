"use client";

import { Footer } from "@/components/layout/traveler-layout/Footer";
import { Navbar } from "@/components/layout/traveler-layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { cn } from "@/lib/utils";
import { setHasNewBooking } from "@/store/slices/uiSlice";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  X,
  Zap
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useDestinationDetailsLogic } from "./logic";

export const DestinationDetailsPage = () => {
  const t = useTranslations("TourHoliday");
  const locale = useLocale();
  const dispatch = useDispatch();

  const {
    destination,
    translation,
    isLoading,
    isBooking,
    formatPrice,
    handleBooking,
    galleryImages,
    isDateDrawerOpen,
    setIsDateDrawerOpen,
    selectedDate,
    setSelectedDate,
    isDateDisabled,
    isSaved,
    toggleSave,
    handleShare,
    hasNewBooking
  } = useDestinationDetailsLogic();

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (!destination || !translation) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
          <MapPin className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          {locale === "id"
            ? "Destinasi tidak ditemukan"
            : locale === "tr"
            ? "Destinasyon bulunamadı"
            : "Destination not found"}
        </h2>
        <Link
          href={`/${locale}/tour-holiday-religion`}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700">
          <ChevronLeft className="h-4 w-4" />
          <span>
            {locale === "id"
              ? "Kembali ke Katalog Tur"
              : locale === "tr"
              ? "Tur Listesine Dön"
              : "Back to Tour Catalog"}
          </span>
        </Link>
      </div>
    );
  }

  const rawPrice = parseFloat(destination.price) || 0;
  const total = rawPrice;

  const locationDisplay =
    destination.city_name || destination.location?.split(",")[0] || "Turkey";

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Desktop Navbar */}
      <div className="hidden lg:block">
        <Navbar />
      </div>

      {/* ══════════════════════════════════════════════════════════
          MOBILE VIEW (< lg): Full Screen App Experience
         ══════════════════════════════════════════════════════════ */}
      <div className="flex min-h-screen flex-col bg-white pb-24 lg:hidden">
        {/* Mobile Hero Carousel */}
        <div className="relative w-full overflow-hidden bg-slate-900">
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: true }}
            className="w-full">
            <CarouselContent className="-ml-0">
              {galleryImages.map((img, i) => (
                <CarouselItem key={i} className="pl-0">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <ImageWithFallback
                      src={img}
                      alt={`${translation.name} ${i + 1}`}
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Floating Mobile Header Actions */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
            <button
              onClick={() => window.history.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md transition-all active:scale-90">
              <ChevronLeft className="h-5 w-5 text-slate-800" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md transition-all active:scale-90">
                <Share2 className="h-4 w-4 text-slate-800" />
              </button>
              <button
                onClick={toggleSave}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md transition-all active:scale-90">
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isSaved ? "fill-rose-500 text-rose-500" : "text-slate-800"
                  )}
                />
              </button>
              <Link
                href={`/${locale}/itineraries`}
                onClick={() => dispatch(setHasNewBooking(false))}>
                <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md transition-all active:scale-90">
                  <Ticket className="h-4 w-4 text-slate-800" />
                  {hasNewBooking && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
                    </span>
                  )}
                </button>
              </Link>
            </div>
          </div>

          {/* Counter pill on bottom right */}
          <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <ImageIcon className="h-3 w-3" />
            <span>
              {current + 1} / {galleryImages.length}
            </span>
          </div>
        </div>

        {/* Mobile Main Info */}
        <div className="px-5 pt-5 pb-8 space-y-6">
          {/* Title & Rating */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-snug">
              {translation.name}
            </h1>

            <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1 font-bold text-slate-900">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>4.9</span>
                <span className="text-slate-400 font-normal">{t("reviews", { count: "2.4k" })}</span>
              </div>
              <span className="h-3 w-px bg-slate-200" />
              <div className="flex items-center gap-1 text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-700">{destination.location || locationDisplay}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-slate-100 pt-5">
            <h2 className="text-base font-bold text-slate-900">{t("aboutTour")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {translation.description ||
                "Nikmati keindahan pemandangan spektakuler, situs warisan budaya bersejarah, dan petualangan tak terlupakan bersama pemandu profesional dan fasilitas perjalanan premium."}
            </p>
          </div>

          {/* Benefits */}
          <div className="border-t border-slate-100 pt-5">
            <h2 className="text-base font-bold text-slate-900">{t("benefits")}</h2>
            <ul className="mt-3 space-y-2.5">
              {(
                translation.facilities || [
                  "Pemandu wisata profesional berbahasa Inggris",
                  "Transportasi AC VIP pulang-pergi",
                  "Tiket masuk destinasi & atraksi utama",
                  "Asuransi perjalanan resmi selama tur"
                ]
              ).map((benefit: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100/60">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span className="leading-snug">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Detail Tour & Itinerary */}
          {translation.detail_tour && translation.detail_tour.length > 0 && (
            <div className="border-t border-slate-100 pt-5">
              <h2 className="text-base font-bold text-slate-900">{t("detailTour")}</h2>
              <div className="mt-4 space-y-4">
                {translation.detail_tour.map((item: string, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-xs ring-4 ring-blue-50">
                        {index + 1}
                      </div>
                      {index < translation.detail_tour.length - 1 && (
                        <div className="my-1 w-0.5 flex-1 bg-slate-200" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex-1 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-xs leading-relaxed text-slate-700",
                        index < translation.detail_tour.length - 1 ? "pb-3" : "pb-3"
                      )}>
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Mobile Bottom Bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-5 py-3 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] backdrop-blur-md">
          <div className="mx-auto flex max-w-md items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium text-slate-400">{t("startFrom")}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(total)}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {t("perPersonShort")}
                </span>
              </div>
            </div>
            <Button
              onClick={() => setIsDateDrawerOpen(true)}
              className="h-11 flex-1 rounded-2xl bg-blue-600 font-bold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95">
              <Calendar className="mr-1.5 h-4 w-4" />
              <span>{t("selectTravelDate")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          DESKTOP VIEW (lg+)
         ══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block">
        <main className="mx-auto max-w-7xl px-8 pt-28 pb-20">
          {/* Breadcrumbs Navigation */}
          <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link
              href={`/${locale}`}
              className="transition-colors hover:text-slate-900">
              {t("breadcrumbsHome")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <Link
              href={`/${locale}/tour-holiday-religion`}
              className="transition-colors hover:text-slate-900">
              {t("breadcrumbsTour")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-slate-500 font-semibold">{locationDisplay}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="truncate max-w-[280px] text-slate-800 font-bold">
              {translation.name}
            </span>
          </nav>

          {/* Desktop Title & Meta Header */}
          <div className="mb-6 flex items-start justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                {translation.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-600 pt-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>4.9</span>
                  <span className="text-slate-400 font-normal">
                    {t("reviews", { count: "2.4k" })}
                  </span>
                </div>
                <span className="h-3.5 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5 text-slate-700">
                  <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="font-semibold">{destination.location || locationDisplay}</span>
                </div>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95">
                <Share2 className="h-3.5 w-3.5 text-slate-600" />
                <span>{t("share")}</span>
              </button>
              <button
                type="button"
                onClick={toggleSave}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold shadow-xs transition-all active:scale-95",
                  isSaved
                    ? "border-rose-200 bg-rose-50/60 text-rose-600"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                )}>
                <Heart
                  className={cn(
                    "h-3.5 w-3.5 transition-colors",
                    isSaved ? "fill-rose-500 text-rose-500" : "text-slate-600"
                  )}
                />
                <span>{isSaved ? t("saved") : t("save")}</span>
              </button>
            </div>
          </div>

          {/* Desktop Photo Presentation (Modern Mosaic Grid or Full Hero) */}
          <div className="relative mb-10 overflow-hidden rounded-3xl shadow-sm ring-1 ring-slate-900/5">
            {galleryImages.length >= 5 ? (
              <div className="grid grid-cols-4 gap-2.5 bg-slate-100 aspect-[21/9]">
                {/* Large primary photo */}
                <div
                  onClick={() => {
                    setSelectedGalleryIndex(0);
                    setIsGalleryOpen(true);
                  }}
                  className="group relative col-span-2 row-span-2 cursor-pointer overflow-hidden bg-slate-200">
                  <ImageWithFallback
                    src={galleryImages[0]}
                    alt={translation.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                </div>

                {/* 4 smaller photos */}
                {galleryImages.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedGalleryIndex(idx + 1);
                      setIsGalleryOpen(true);
                    }}
                    className="group relative cursor-pointer overflow-hidden bg-slate-200">
                    <ImageWithFallback
                      src={img}
                      alt={`${translation.name} ${idx + 2}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative w-full aspect-[21/9] bg-slate-900">
                <Carousel
                  setApi={setApi}
                  opts={{ align: "start", loop: true }}
                  className="w-full h-full">
                  <CarouselContent className="-ml-0 h-full">
                    {galleryImages.map((img, i) => (
                      <CarouselItem key={i} className="pl-0 h-full">
                        <div className="relative aspect-[21/9] w-full overflow-hidden">
                          <ImageWithFallback
                            src={img}
                            alt={`${translation.name} ${i + 1}`}
                            fill
                            className="object-cover"
                            priority={i === 0}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            )}

            {/* View All Photos Trigger Button */}
            <button
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="absolute bottom-5 right-5 z-10 flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 text-xs font-bold text-slate-900 shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:bg-white hover:shadow-xl active:scale-95">
              <ImageIcon className="h-4 w-4 text-slate-700" />
              <span>{t("viewAllPhotos", { count: galleryImages.length })}</span>
            </button>
          </div>

          {/* Desktop Content Grid (Main 8 cols + Sticky Booking Card 4 cols) */}
          <div className="grid grid-cols-12 gap-10 items-start">
            {/* Left Content Column (8 cols) */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Description Section */}
              <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900">{t("aboutTour")}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {translation.description ||
                    "Nikmati keindahan pemandangan spektakuler, situs warisan budaya bersejarah, dan petualangan tak terlupakan bersama pemandu profesional dan fasilitas perjalanan premium."}
                </p>
              </div>

              {/* Benefits & Inclusions */}
              <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">{t("benefits")}</h2>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100/60 px-2.5 py-1 rounded-lg">
                    {t("includedTitle")}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(
                    translation.facilities || [
                      "Pemandu wisata profesional berbahasa Inggris",
                      "Transportasi AC VIP pulang-pergi",
                      "Tiket masuk destinasi & atraksi utama",
                      "Asuransi perjalanan resmi selama tur"
                    ]
                  ).map((benefit: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs font-medium text-slate-800">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100/60">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detail Tour & Itinerary Timeline */}
              {translation.detail_tour && translation.detail_tour.length > 0 && (
                <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xs">
                  <h2 className="text-lg font-bold text-slate-900">{t("detailTour")}</h2>
                  <p className="mt-1 text-xs text-slate-400">{t("itinerarySchedule")}</p>

                  <div className="mt-6 space-y-6">
                    {translation.detail_tour.map((item: string, index: number) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-50">
                            {index + 1}
                          </div>
                          {index < translation.detail_tour.length - 1 && (
                            <div className="my-1.5 w-0.5 flex-1 bg-slate-200" />
                          )}
                        </div>
                        <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                          <p className="text-sm leading-relaxed text-slate-700">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sticky Booking Sidebar (4 cols) */}
            <div className="col-span-12 lg:col-span-4">
              <Card className="sticky top-24 rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  {/* Price Header */}
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {t("startFrom")}
                      </p>
                      <span className="rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                        Hemat 15%
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-900 tracking-tight">
                        {formatPrice(rawPrice)}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {t("perPersonShort")}
                      </span>
                      <span className="text-xs font-medium text-slate-300 line-through ml-auto">
                        {formatPrice(rawPrice * 1.15)}
                      </span>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Travel Date Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      <span>{t("selectTravelDate")}</span>
                    </label>
                    <DatePicker
                      date={selectedDate}
                      setDate={setSelectedDate}
                      disabled={isDateDisabled}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 text-xs font-medium text-slate-800 transition-colors hover:border-slate-300 hover:bg-white"
                    />
                  </div>

                  {/* Price Calculation Breakdown */}
                  <div className="rounded-2xl bg-slate-50/90 p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>{t("subtotal")}</span>
                      <span className="font-semibold text-slate-800">{formatPrice(rawPrice)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{t("serviceFee")}</span>
                      <span className="font-bold text-blue-700">{t("free")}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">{t("totalPayment")}</span>
                      <span className="text-xl font-bold text-blue-600">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* CTA Actions */}
                  <div className="space-y-3">
                    <Button
                      disabled={isBooking}
                      onClick={handleBooking}
                      className="h-12 w-full rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95">
                      {isBooking ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>{t("booking")}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4" />
                          <span>{t("addToItinerary")}</span>
                        </div>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={toggleSave}
                      className={cn(
                        "h-11 w-full rounded-2xl border text-xs font-bold transition-colors active:scale-95",
                        isSaved
                          ? "border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100/60"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}>
                      <Heart
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSaved ? "fill-rose-500 text-rose-500" : "text-slate-500"
                        )}
                      />
                      <span>{isSaved ? t("saved") : t("saveTicket")}</span>
                    </Button>
                  </div>

                  {/* Trust & Guarantee Badges - Uniform Palette */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span>{t("trustSecurity")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span>{t("flexiblePolicy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span>{t("support247")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* ══════════════════════════════════════════════════════════
          MOBILE DATE & BOOKING DRAWER
         ══════════════════════════════════════════════════════════ */}
      <Drawer open={isDateDrawerOpen} onOpenChange={setIsDateDrawerOpen}>
        <DrawerContent className="max-h-[92vh] rounded-t-[32px] p-0 focus:outline-none">
          <DrawerTitle className="px-6 pt-3 text-base font-bold text-slate-900">
            {t("bookingInfo")}
          </DrawerTitle>

          <div className="px-6 py-4 space-y-5 overflow-y-auto max-h-[75vh]">
            {/* Tour Title Preview */}
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                <ImageWithFallback
                  src={galleryImages[0]}
                  alt={translation.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900">{translation.name}</p>
                <p className="text-[11px] font-semibold text-blue-600">
                  {formatPrice(rawPrice)} {t("perPersonShort")}
                </p>
              </div>
            </div>

            {/* Travel Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <span>{t("selectTravelDate")}</span>
              </label>
              <DatePicker
                date={selectedDate}
                setDate={setSelectedDate}
                disabled={isDateDisabled}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold"
              />
            </div>

            {/* Price Summary */}
            <div className="rounded-2xl bg-slate-50 p-3.5 text-xs space-y-1.5 border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>{t("subtotal")}</span>
                <span className="font-semibold text-slate-800">{formatPrice(rawPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t("serviceFee")}</span>
                <span className="font-bold text-blue-700">{t("free")}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold">
                <span className="text-slate-900">{t("totalPayment")}</span>
                <span className="text-lg font-bold text-blue-600">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Submit Action */}
            <Button
              disabled={isBooking}
              onClick={handleBooking}
              className="h-12 w-full rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-xs active:scale-95">
              {isBooking ? t("booking") : t("confirm")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* ══════════════════════════════════════════════════════════
          FULLSCREEN PHOTO GALLERY DIALOG
         ══════════════════════════════════════════════════════════ */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent
          showCloseButton={false}
          className="h-screen w-screen max-w-none gap-0 overflow-hidden rounded-none border-none p-0 outline-none lg:h-[90vh] lg:w-[95vw] lg:max-w-[1280px] lg:rounded-3xl">
          <DialogTitle className="sr-only">{translation.name} Gallery</DialogTitle>
          <div className="flex h-full flex-col overflow-hidden bg-slate-950 lg:flex-row">
            {/* Desktop Thumbnails Sidebar */}
            <div className="hidden border-r border-slate-800 bg-slate-900/90 lg:flex lg:w-[360px] lg:flex-col">
              <div className="p-5 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">{translation.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {galleryImages.length} {locale === "id" ? "Foto Dokumentasi" : "Photos"}
                </p>
              </div>

              <div className="no-scrollbar flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-2.5">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedGalleryIndex(i)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-xl bg-slate-800 transition-all",
                        selectedGalleryIndex === i
                          ? "ring-3 ring-blue-500 ring-offset-2 ring-offset-slate-900"
                          : "opacity-60 hover:opacity-100"
                      )}>
                      <ImageWithFallback
                        src={img}
                        alt={`Photo ${i + 1}`}
                        fill
                        className="object-cover"
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
                className="absolute top-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-90">
                <X className="h-5 w-5" />
              </button>

              <div className="relative h-full w-full p-4 lg:p-10 flex items-center justify-center">
                <ImageWithFallback
                  src={galleryImages[selectedGalleryIndex]}
                  alt={translation.name}
                  fill
                  className="object-contain"
                  priority
                />

                {/* Photo Counter & Title */}
                <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3">
                  <div className="rounded-xl bg-black/60 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                    {selectedGalleryIndex + 1} / {galleryImages.length}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-white/80 drop-shadow-md">
                    {translation.name}
                  </span>
                </div>

                {/* Left/Right Navigation Controls */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedGalleryIndex((prev) =>
                          prev > 0 ? prev - 1 : galleryImages.length - 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-90">
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedGalleryIndex((prev) =>
                          prev < galleryImages.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-90">
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
