"use client";

import { Footer } from "@/components/layout/traveler-layout/Footer";
import { Navbar } from "@/components/layout/traveler-layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { cn } from "@/lib/utils";
import {
  Bike,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gauge,
  Heart,
  Info,
  MapPin,
  Minus,
  Palette,
  Plus,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMotorDetailLogic } from "./logic";

export const MotorBikeDetailPage = () => {
  const {
    motor,
    translation,
    isLoading,
    isBooking,
    formatPrice,
    openBookingDrawer,
    rawDailyPrice,
    rawWeeklyPrice,
    rentalDuration,
    setRentalDuration,
    estimatedTotalPrice,
    isWeeklyRateApplicable,
    galleryImages,
    isSaved,
    toggleSave,
    handleShare,
    locale,
    t
  } = useMotorDetailLogic();

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

  // Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">
            {t("loadingDetails") || "Memuat detail motor..."}
          </p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!motor || !translation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50/50 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 mb-4 shadow-xs">
          <Bike className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {t("motorNotFound") || "Motor Tidak Ditemukan"}
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-500 max-w-sm">
          {t("motorNotFoundDesc") || "Motor yang Anda cari tidak tersedia atau tautan salah."}
        </p>
        <Link
          href={`/${locale}/motor-bike`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95">
          <ChevronLeft className="h-4 w-4" />
          <span>{t("backToMotors") || "Kembali ke Daftar Motor"}</span>
        </Link>
      </div>
    );
  }

  const name = translation?.name_motor || "Motorcycle Unit";
  const brandName = motor.merek?.name_merek || "Motorcycle";
  const locationName = motor.state?.name || "Turkey";
  const strikeDailyPrice = rawDailyPrice > 0 ? rawDailyPrice * 1.25 : 0;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 lg:pb-16">
      {/* Desktop Navbar */}
      <div className="hidden lg:block">
        <Navbar />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 lg:pt-28">
        {/* ─── Breadcrumb Bar & Actions Header (Desktop) ─────────────── */}
        <div className="hidden lg:flex items-center justify-between py-2 mb-4">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link
              href={`/${locale}`}
              className="hover:text-slate-900 transition-colors">
              {t("breadcrumbsHome") || "Beranda"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <Link
              href={`/${locale}/motor-bike`}
              className="hover:text-slate-900 transition-colors">
              {t("breadcrumbsMotor") || "Sewa Motor"}
            </Link>
            {locationName && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-slate-500 font-semibold">{locationName}</span>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-slate-900 font-bold truncate max-w-xs">{name}</span>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95">
              <Share2 className="h-3.5 w-3.5 text-slate-500" />
              <span>{t("share") || "Bagikan"}</span>
            </button>
            <button
              type="button"
              onClick={toggleSave}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium shadow-xs transition-all active:scale-95",
                isSaved
                  ? "border-rose-200 bg-rose-50/70 text-rose-600"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              )}>
              <Heart
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isSaved ? "fill-rose-500 text-rose-500" : "text-slate-500"
                )}
              />
              <span>{isSaved ? (t("saved") || "Tersimpan") : (t("save") || "Simpan")}</span>
            </button>
          </div>
        </div>

        {/* ─── Hero Media Showcase ─────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-sm ring-1 ring-slate-900/5">
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: true }}
            className="w-full">
            <CarouselContent className="-ml-0">
              {galleryImages.length > 0 ? (
                galleryImages.map((img, i) => (
                  <CarouselItem key={i} className="pl-0">
                    <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden bg-slate-800">
                      <ImageWithFallback
                        src={img}
                        alt={`${name} ${i + 1}`}
                        fill
                        className="object-cover"
                        priority={i === 0}
                        fallbackSrc="/images/placeholder.jpg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className="pl-0">
                  <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden bg-slate-800 flex items-center justify-center">
                    <Bike className="h-16 w-16 text-slate-600" />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
          </Carousel>

          {/* Top Floating Mobile Navigation Bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 sm:p-4 lg:hidden z-10">
            <Link
              href={`/${locale}/motor-bike`}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95">
                <Share2 className="h-4 w-4 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={toggleSave}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95">
                <Heart
                  className={cn(
                    "h-4 w-4",
                    isSaved ? "fill-rose-500 text-rose-500" : "text-slate-700"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Gallery Indicator Pill & Counter */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 backdrop-blur-md z-10">
              {galleryImages.slice(0, 5).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    current === i ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  )}
                />
              ))}
            </div>
          )}

          {/* View Gallery Button */}
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="absolute right-3 bottom-3 sm:right-5 sm:bottom-5 inline-flex items-center gap-2 rounded-xl bg-black/50 hover:bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all active:scale-95 shadow-sm z-10">
              <Sparkles className="h-3.5 w-3.5 text-slate-200" />
              <span>{t("gallery") || "Lihat Foto"} ({galleryImages.length})</span>
            </button>
          )}
        </div>

        {/* ─── Main Content Grid Layout ──────────────────────────────── */}
        <div className="mt-5 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Motor Details (col-span-8) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Header Title & Badges Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
              {/* Monochromatic / Uniform Badges Row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-slate-700">
                  {brandName}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-xs font-medium text-slate-700">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      motor.is_available ? "bg-emerald-500" : "bg-slate-400"
                    )}
                  />
                  <span>{motor.is_available ? (t("available") || "Tersedia") : (t("unavailable") || "Penuh")}</span>
                </span>

                {motor.engine_cc && (
                  <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-xs font-medium text-slate-700">
                    <span>{motor.engine_cc} cc</span>
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                {name}
              </h1>

              {/* Rating & Location Meta Row - Unified Neutrals */}
              <div className="mt-3.5 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-600 border-t border-slate-100 pt-3.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Star className="h-3.5 w-3.5 fill-slate-400 text-slate-400 shrink-0" />
                  <span>4.9</span>
                  <span className="font-normal text-slate-400">{t("reviews", { count: "1.2k" })}</span>
                </div>

                <span className="h-3 w-px bg-slate-200" />

                <div className="flex items-center gap-1.5 font-medium text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{locationName}</span>
                </div>

                <span className="h-3 w-px bg-slate-200" />

                <div className="flex items-center gap-1.5 font-medium text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{t("verifiedUnit") || "Unit Resmi Terverifikasi"}</span>
                </div>
              </div>
            </div>

            {/* Key Specs Matrix */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Gauge className="h-4 w-4 text-slate-500" />
                <span>{t("specsTitle") || "Spesifikasi Kendaraan"}</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="flex flex-col rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 transition-colors">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    {t("engineCapacity") || "Kapasitas Mesin"}
                  </span>
                  <span className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900">
                    {motor.engine_cc ? `${motor.engine_cc} cc` : "150 cc"}
                  </span>
                </div>

                <div className="flex flex-col rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 transition-colors">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    {t("brandLabel") || "Merek"}
                  </span>
                  <span className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900">
                    {brandName}
                  </span>
                </div>

                <div className="flex flex-col rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 transition-colors">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    {t("locationLabel") || "Lokasi Rental"}
                  </span>
                  <span className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {locationName}
                  </span>
                </div>
              </div>

              {/* Color Variants (if any) */}
              {motor.variants && motor.variants.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mr-1">
                    <Palette className="h-3.5 w-3.5 text-slate-400" />
                    <span>{t("availableColors") || "Warna Tersedia"}:</span>
                  </div>
                  {motor.variants.map((variant: any, idx: number) => (
                    <span
                      key={variant.id || idx}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                      <span>{variant.color}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description Section */}
            {translation.description && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-500" />
                  <span>{t("descriptionTitle") || "Deskripsi Motor"}</span>
                </h2>
                <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {translation.description}
                </div>
              </div>
            )}

            {/* Rental Rates Options Matrix - Clean Neutral Structure */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-3.5 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>{t("rentalRatesTitle") || "Pilihan Paket Tarif Sewa"}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {rawDailyPrice > 0 && (
                  <div className="relative rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 transition-colors hover:border-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        {t("dailyRate") || "Tarif Harian"}
                      </span>
                      <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                        {t("standardRate") || "Standar"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xl font-bold text-slate-900">
                        {formatPrice(rawDailyPrice)}
                      </span>
                      <span className="text-xs font-normal text-slate-500">{t("perDay") || "/ hari"}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {t("dailyRateDesc") || "Fleksibel untuk perjalanan harian dan keliling kota."}
                    </p>
                  </div>
                )}

                {rawWeeklyPrice > 0 && (
                  <div className="relative rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 transition-colors hover:border-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        {t("weeklyRate") || "Tarif Mingguan"}
                      </span>
                      <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                        {t("saveWeekly") || "Hemat Lebih Banyak"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xl font-bold text-slate-900">
                        {formatPrice(rawWeeklyPrice)}
                      </span>
                      <span className="text-xs font-normal text-slate-500">{t("perWeek") || "/ minggu"}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {t("weeklyRateDesc") || "Direkomendasikan untuk liburan panjang dan eksplorasi santai."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Inclusions Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-3.5 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-slate-500" />
                <span>{t("inclusionsTitle") || "Fasilitas Termasuk"}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-200/70 text-slate-700">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium text-slate-800">
                    {t("helmetIncluded") || "2 Helm Standar Bersih"}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-200/70 text-slate-700">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium text-slate-800">
                    {t("raincoatIncluded") || "2 Jas Hujan Berkualitas"}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-200/70 text-slate-700">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium text-slate-800">
                    {t("phoneHolderIncluded") || "Phone Holder Terpasang"}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-200/70 text-slate-700">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium text-slate-800">
                    {t("cleanUnitIncluded") || "Unit Bersih & Siap Pakai"}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Requirements Card - Clean Neutral Styling */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-3.5 flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-500" />
                <span>{t("termsTitle") || "Syarat & Ketentuan Sewa"}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-700">
                <div className="space-y-2.5">
                  <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                    {t("requiredDocsTitle") || "Dokumen yang Diperlukan:"}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      <span>{t("docIdCard") || "Foto Paspor / KTP resmi penyewa asli"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      <span>{t("docDrivingLicense") || "SIM C (Lokal) atau International Driving Permit"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      <span>{t("docAccommodation") || "Bukti reservasi penginapan (Hotel / Villa)"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      <span>{t("minRentalDuration") || "Durasi minimum sewa motor: 2 Hari"}</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                    {t("depositInfo") || "Ketentuan Deposit Jaminan"}:
                  </p>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                      <span className="text-slate-600 font-medium">{t("capacityUnder220") || "Kapasitas ≤ 220cc:"}</span>
                      <span className="font-semibold text-slate-900">500.000 IDR / US$ 34</span>
                    </div>
                    <div className="flex justify-between items-center pt-0.5">
                      <span className="text-slate-600 font-medium">{t("capacityAbove220") || "Kapasitas > 220cc:"}</span>
                      <span className="font-semibold text-slate-900">2.000.000 IDR / US$ 134</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {t("depositNote") || "*Deposit akan dikembalikan secara utuh saat unit motor selesai disewa tanpa kerusakan."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Card (Desktop >= lg) */}
          <div className="hidden lg:block lg:col-span-4">
            <Card className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    {t("bookingCardTitle") || "Ringkasan Sewa"}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        motor.is_available ? "bg-emerald-500" : "bg-slate-400"
                      )}
                    />
                    <span>{motor.is_available ? (t("available") || "Tersedia") : (t("unavailable") || "Penuh")}</span>
                  </span>
                </div>

                {/* Price Display Section */}
                <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
                  <span className="text-xs font-medium text-slate-500">
                    {t("startingFrom") || "Mulai dari"}
                  </span>
                  {strikeDailyPrice > 0 && (
                    <p className="text-xs text-slate-400 font-medium line-through mt-0.5">
                      {formatPrice(strikeDailyPrice)}
                    </p>
                  )}
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {formatPrice(rawDailyPrice)}
                    </span>
                    <span className="text-xs font-normal text-slate-500">{t("perDay") || "/ hari"}</span>
                  </div>
                  {rawWeeklyPrice > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">{t("weeklyRateLabel") || "Tarif Mingguan:"}</span>
                      <span className="font-semibold text-slate-900">
                        {formatPrice(rawWeeklyPrice)} <span className="text-[10px] font-normal text-slate-400">{t("perWeekShort") || "/mgg"}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* ─── Durasi Rental Selector ─────────────────────── */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{t("rentalDuration") || "Durasi Rental"}</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                      {t("daysMinNote") || "Min. 2 hari"}
                    </span>
                  </div>

                  {/* Stepper with Controls */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-1">
                    <button
                      type="button"
                      disabled={rentalDuration <= 2}
                      onClick={() => setRentalDuration((prev) => Math.max(2, prev - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-2xs border border-slate-200/80 transition-all hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:pointer-events-none">
                      <Minus className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-900">
                        {rentalDuration} {t("days") || "Hari"}
                      </span>
                      {rentalDuration >= 7 && (
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          ({Math.floor(rentalDuration / 7)} {t("week") || "Minggu"}{rentalDuration % 7 > 0 ? ` + ${rentalDuration % 7} ${t("days") || "Hari"}` : ""})
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setRentalDuration((prev) => prev + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-2xs border border-slate-200/80 transition-all hover:bg-slate-100 active:scale-95">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Quick Preset Duration Chips */}
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    {[2, 3, 5, 7].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setRentalDuration(days)}
                        className={cn(
                          "rounded-lg py-1 text-[11px] font-semibold border transition-all text-center",
                          rentalDuration === days
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        )}>
                        {days} {t("daysShort") || "Hari"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ─── Price Breakdown Calculation ────────────────── */}
                <div className="rounded-xl bg-slate-50/90 p-3.5 space-y-2 text-xs border border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      {t("subtotal") || "Subtotal"} ({rentalDuration} {t("days") || "hari"})
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatPrice(estimatedTotalPrice)}
                    </span>
                  </div>

                  {isWeeklyRateApplicable && (
                    <div className="flex justify-between items-center text-[11px] text-emerald-600 font-medium">
                      <span>{t("weeklyDiscountApplied") || "Tarif Paket Mingguan"}</span>
                      <span>✓</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>{t("serviceFee") || "Biaya Layanan"}</span>
                    <span className="font-bold text-blue-600">{t("free") || "Gratis"}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{t("totalPayment") || "Total Pembayaran"}</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(estimatedTotalPrice)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <Button
                    type="button"
                    disabled={!motor.is_available || rawDailyPrice === 0 || isBooking}
                    onClick={openBookingDrawer}
                    className="h-11 w-full rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 disabled:opacity-50">
                    {isBooking ? (
                      <>
                        <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>{t("processing") || "Memproses..."}</span>
                      </>
                    ) : (
                      <>
                        <Bike className="mr-2 h-4 w-4" />
                        <span>{!motor.is_available ? (t("unitUnavailable") || "Motor Tidak Tersedia") : (t("bookNow") || "Sewa Sekarang")}</span>
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={toggleSave}
                    className={cn(
                      "flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-all active:scale-95",
                      isSaved
                        ? "border-rose-200 bg-rose-50/60 text-rose-600"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    )}>
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        isSaved ? "fill-rose-500 text-rose-500" : "text-slate-400"
                      )}
                    />
                    <span>{isSaved ? (t("saved") || "Tersimpan") : (t("saveFavorite") || "Simpan Favorit")}</span>
                  </button>
                </div>

                {/* Trust Signals - Uniform Neutral Icons */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{t("instantConfirmDesc") || t("instantConfirm") || "Konfirmasi Instan Tanpa Menunggu"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{t("freeCancelDesc") || t("freeCancel") || "Pembatalan Fleksibel s/d 24 Jam"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{t("support247Desc") || t("support247") || "Bantuan Darurat Roadside 24/7"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ─── Fixed Mobile Bottom Action Bar (< lg) ──────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 pb-safe lg:hidden shadow-lg">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-medium text-slate-500">
              {t("totalPayment") || "Total"} ({rentalDuration} {t("daysShort") || "Hari"})
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-slate-900 truncate">
                {formatPrice(estimatedTotalPrice)}
              </span>
            </div>
          </div>

          <Button
            type="button"
            disabled={!motor.is_available || rawDailyPrice === 0 || isBooking}
            onClick={openBookingDrawer}
            className="h-10 flex-1 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs active:scale-95 disabled:opacity-50">
            {isBooking ? (
              <>
                <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{t("processing") || "Memproses..."}</span>
              </>
            ) : (
              <>
                <Bike className="mr-1.5 h-3.5 w-3.5" />
                <span>{!motor.is_available ? (t("unitUnavailable") || "Tidak Tersedia") : (t("bookNow") || "Sewa Sekarang")}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ─── Full-screen Gallery Dialog Modal ──────────────────────── */}
      {galleryImages.length > 0 && (
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent
            showCloseButton={false}
            className="h-screen w-screen max-w-none gap-0 overflow-hidden rounded-none border-none p-0 outline-none lg:h-[90vh] lg:w-[95vw] lg:max-w-[1280px] lg:rounded-3xl z-[300]">
            <DialogTitle className="sr-only">{t("galleryModalTitle", { name })}</DialogTitle>
            <div className="flex h-full flex-col overflow-hidden bg-white lg:flex-row">
              {/* Left Sidebar - Thumbnail Strip */}
              <div className="hidden border-r border-slate-100 bg-white lg:flex lg:w-[360px] lg:flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{t("gallery") || "Galeri Foto"}</h3>
                    <p className="text-xs text-slate-500">{t("photosAvailable", { count: galleryImages.length })}</p>
                  </div>
                </div>
                <div className="no-scrollbar flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    {galleryImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedGalleryIndex(i)}
                        className={cn(
                          "relative aspect-square overflow-hidden rounded-2xl bg-slate-100 transition-all",
                          selectedGalleryIndex === i
                            ? "ring-4 ring-slate-900 ring-offset-2 opacity-100"
                            : "opacity-70 hover:opacity-100"
                        )}>
                        <ImageWithFallback
                          src={img}
                          alt={`Thumbnail ${i + 1}`}
                          fill
                          className="object-cover"
                          fallbackSrc="/images/placeholder.jpg"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Main Display */}
              <div className="relative flex flex-1 items-center justify-center bg-slate-950">
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(false)}
                  className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95">
                  <X className="h-5 w-5" />
                </button>

                <div className="relative h-full w-full p-4 sm:p-8 flex items-center justify-center">
                  <ImageWithFallback
                    src={galleryImages[selectedGalleryIndex]}
                    alt="Full View"
                    fill
                    className="object-contain"
                    priority
                    fallbackSrc="/images/placeholder.jpg"
                  />

                  {galleryImages.length > 1 && (
                    <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between pointer-events-none">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedGalleryIndex((prev) =>
                            prev > 0 ? prev - 1 : galleryImages.length - 1
                          )
                        }
                        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors active:scale-95">
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedGalleryIndex((prev) =>
                            prev < galleryImages.length - 1 ? prev + 1 : 0
                          )
                        }
                        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors active:scale-95">
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Desktop Footer */}
      <div className="hidden lg:block mt-16">
        <Footer />
      </div>
    </div>
  );
};
