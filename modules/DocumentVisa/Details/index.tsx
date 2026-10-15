"use client";

import { Footer } from "@/components/layout/traveler-layout/Footer";
import { Navbar } from "@/components/layout/traveler-layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { cn } from "@/lib/utils";
import { getLocalizedText } from "@/store/services/document-visa.service";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Minus,
  Package,
  Plus,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { enUS, id as idLocale } from "date-fns/locale";
import { DocumentVisaCard } from "../components/DocumentVisaCard";
import { useDocumentVisaDetailLogic } from "./logic";

export const DocumentVisaDetailPage: React.FC = () => {
  const {
    locale,
    t,
    slug,
    visa,
    translation,
    title,
    description,
    countryName,
    validity,
    processingTime,
    submissionProcess,
    termsConditions,
    galleryImages,
    selectedPackageId,
    setSelectedPackageId,
    selectedPackage,
    selectedTravelDate,
    setSelectedTravelDate,
    applicantQty,
    setApplicantQty,
    totalBookingPrice,
    isBooking,
    handleBooking,
    activePrice,
    formatPrice,
    isSaved,
    toggleSave,
    handleShare,
    waUrl,
    similarVisas,
    isLoading
  } = useDocumentVisaDetailLogic();

  // Carousel & Gallery State
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [isMobileConsultationDrawerOpen, setIsMobileConsultationDrawerOpen] = useState(false);
  const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Auto-expand calendar when drawer opens if no travel date is selected yet
  useEffect(() => {
    if (isBookingDrawerOpen && !selectedTravelDate) {
      setIsDatePickerOpen(true);
    }
  }, [isBookingDrawerOpen, selectedTravelDate]);

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
            {locale === "id"
              ? "Memuat rincian layanan visa..."
              : locale === "tr"
              ? "Vize detayları yükleniyor..."
              : "Loading visa details..."}
          </p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!visa) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50/50 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-xs">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{t("visaNotFound")}</h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-500 max-w-sm">
          {t("visaNotFoundDesc")}
        </p>
        <Link
          href={`/${locale}/documents-visa`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95">
          <ChevronLeft className="h-4 w-4" />
          <span>{t("backToCatalog")}</span>
        </Link>
      </div>
    );
  }

  // Steps decomposition
  const workflowSteps = [
    {
      step: 1,
      title: locale === "id" ? "Konsultasi & Pengumpulan Berkas" : "Document Consultation & Audit",
      desc:
        locale === "id"
          ? "Konsultasikan profil perjalanan Anda dan kirimkan berkas dokumen untuk diperiksa kelengkapannya oleh spesialis visa kami."
          : "Consult on your itinerary and submit required documents for early review and pre-assessment by our visa specialists."
    },
    {
      step: 2,
      title: locale === "id" ? "Verifikasi & Pengisian Formulir Resmi" : "Form Submission & Compliance",
      desc:
        locale === "id"
          ? "Pengecekan mendalam terhadap keabsahan dokumen, penerjemahan resmi tersumpah (bila diperlukan), dan pengisian formulir resmi kedubes."
          : "In-depth document verification, certified translation handling (if needed), and precise embassy portal form completion."
    },
    {
      step: 3,
      title: locale === "id" ? "Booking Slot Janji Temu & Penyerahan" : "Embassy Slot Booking & Lodgement",
      desc:
        locale === "id"
          ? "Penjadwalan slot resmi di VFS / TLScontact / Kedutaan Besar serta pendampingan briefing berkas untuk wawancara/biometrik."
          : "Securing official appointment dates at VFS / TLScontact / Embassy centers, including interview briefing & checklist guides."
    },
    {
      step: 4,
      title: locale === "id" ? "Penerbitan Visa & Pengambilan Paspor" : "Visa Approval & Passport Pick-up",
      desc:
        locale === "id"
          ? "Update berkala progres pengajuan visa via WhatsApp hingga paspor dengan visa resmi diterima kembali dengan aman."
          : "Real-time tracking of consular processing until your visa is issued and passport safely handed over to you."
    }
  ];

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
        <div className="relative w-full overflow-hidden bg-slate-100">
          <Carousel
            setApi={setCarouselApi}
            opts={{ align: "start", loop: true }}
            className="w-full">
            <CarouselContent className="-ml-0">
              {galleryImages.map((img, i) => (
                <CarouselItem key={i} className="pl-0">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <ImageWithFallback
                      src={img}
                      alt={`${title} - foto ${i + 1}`}
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Floating Mobile Header Actions */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
            <Link
              href={`/${locale}/documents-visa`}
              prefetch={true}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95">
              <ChevronLeft className="h-5 w-5" />
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95">
                <Share2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={toggleSave}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95">
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isSaved ? "fill-rose-500 text-rose-500" : "text-slate-800"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Floating Photo Counter Badge */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md border border-white/20">
            <ImageIcon className="h-3 w-3" />
            <span>
              {currentSlide + 1} / {galleryImages.length}
            </span>
          </div>

          {/* Country Floating Pill */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-blue-600/95 px-3 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-md">
            <MapPin className="h-3 w-3" />
            <span>{countryName}</span>
          </div>
        </div>

        {/* Mobile Body Content */}
        <div className="p-4 sm:p-5 space-y-6">
          {/* Title & Entry Type */}
          <div>
            {processingTime && (
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200/60">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span>{processingTime}</span>
                </span>
              </div>
            )}

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              {title}
            </h1>
          </div>

          {/* Mobile Quick Info Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t("startsFrom")}
              </span>
              <p className="text-sm font-extrabold text-blue-600 mt-0.5">
                {formatPrice(visa.starting_price)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t("validity")}
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                {validity || (locale === "id" ? "Sesuai Kebijakan" : "As per policy")}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t("interviewRequired")}
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {visa.is_interview_required ? (
                  <span className="text-amber-600">
                    {locale === "id" ? "Perlu Wawancara" : "Interview Required"}
                  </span>
                ) : (
                  <span className="text-emerald-600">
                    {locale === "id" ? "Tanpa Wawancara" : "No Interview"}
                  </span>
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t("biometricRequired")}
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {visa.is_biometric_required
                  ? (locale === "id" ? "Wajib Hadir VFS" : "In-Person VFS")
                  : "Digital Online"}
              </p>
            </div>
          </div>

          {/* Mobile Packages Section */}
          {visa.packages && visa.packages.length > 0 && (
            <div className="space-y-3 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span>{t("selectPackage")}</span>
                </h3>
              </div>
              <div className="space-y-2.5">
                {visa.packages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  const pkgName = getLocalizedText(pkg.name, locale);
                  const pkgDesc = pkg.description
                    ? getLocalizedText(pkg.description, locale)
                    : undefined;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={cn(
                        "rounded-2xl border p-3.5 transition-all cursor-pointer",
                        isSelected
                          ? "border-blue-600 bg-blue-50/30 ring-2 ring-blue-600/10 shadow-xs"
                          : "border-slate-200 bg-white"
                      )}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300"
                            )}>
                            {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {pkgName}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-blue-600 shrink-0">
                          {formatPrice(pkg.total_price)}
                        </span>
                      </div>
                      {pkgDesc && (
                        <p className="mt-1 text-[11px] text-slate-500 pl-6">{pkgDesc}</p>
                      )}
                      <div className="mt-2.5 flex items-center justify-between pl-6 text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                        <span>
                          {locale === "id"
                            ? `Proses: ${pkg.processing_time_days} Hari Kerja`
                            : `Processing: ${pkg.processing_time_days} Business Days`}
                        </span>
                        <span>
                          {locale === "id"
                            ? `Biaya Kedubes: ${formatPrice(pkg.embassy_fee)}`
                            : `Embassy Fee: ${formatPrice(pkg.embassy_fee)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mobile Travel Date & Applicant Quantity Trigger Card */}
          <div
            onClick={() => setIsBookingDrawerOpen(true)}
            className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {locale === "id" ? "Rencana Keberangkatan & Pemohon" : "Travel Date & Applicants"}
                </p>
                <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                  {selectedTravelDate
                    ? new Date(selectedTravelDate).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })
                    : (locale === "id" ? "Pilih tanggal keberangkatan" : "Select travel date")}
                  {" · "}
                  {applicantQty} {locale === "id" ? "Pemohon" : `Applicant${applicantQty > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 shrink-0 pl-2">
              {selectedTravelDate ? (locale === "id" ? "Ubah" : "Change") : (locale === "id" ? "Pilih" : "Select")}
            </span>
          </div>

          {/* Description */}
          {description && (
            <div className="space-y-2 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                {t("aboutService")}
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 font-normal">
                {description}
              </p>
            </div>
          )}

          {/* Requirements Checklist */}
          {visa.requirements && visa.requirements.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                <FileCheck className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {t("requirementsTitle")}
                </h3>
              </div>
              <ul className="space-y-2">
                {visa.requirements.map((req: any, idx: number) => {
                  const reqText = getLocalizedText(
                    typeof req === "string" ? req : req.title || req.name || req.description,
                    locale
                  );
                  return (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{reqText}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Inclusions */}
          {visa.inclusions && visa.inclusions.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {t("inclusionsTitle")}
                </h3>
              </div>
              <ul className="space-y-2">
                {visa.inclusions.map((inc: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{getLocalizedText(inc, locale)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Workflow Steps */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>{t("processTitle")}</span>
            </h3>
            <div className="space-y-3 mt-3">
              {workflowSteps.map((st) => (
                <div key={st.step} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-xs">
                    {st.step}
                  </div>
                  <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                    <h5 className="font-bold text-slate-900">{st.title}</h5>
                    <p className="mt-1 text-slate-600 leading-relaxed font-normal">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Mobile/Tablet Bottom Bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] backdrop-blur-md pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 sm:gap-4">
            {/* Left: Chat Support & Total Price */}
            <div className="flex items-center gap-3 min-w-0">
              {/* WhatsApp Consultation / Chat Button */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={locale === "id" ? "Konsultasi via WhatsApp" : "Consult via WhatsApp"}
                className="group flex flex-col items-center justify-center h-11 min-w-[3.25rem] px-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 transition-all active:scale-95 shrink-0 shadow-2xs"
              >
                <MessageSquare className="h-4.5 w-4.5 text-emerald-600 transition-transform group-hover:scale-110" />
                <span className="text-[10px] font-bold text-slate-600 group-hover:text-emerald-700 leading-none mt-1">
                  {locale === "id" ? "Chat" : "Chat"}
                </span>
              </a>

              {/* Subtle Divider */}
              <div className="h-8 w-px bg-slate-200/90 shrink-0" />

              {/* Total Price Block */}
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  {locale === "id"
                    ? `Total (${applicantQty} Pemohon)`
                    : `Total (${applicantQty} Applicant${applicantQty > 1 ? "s" : ""})`}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base sm:text-xl font-extrabold text-blue-600 leading-tight">
                    {formatPrice(totalBookingPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Primary Booking Action */}
            <Button
              type="button"
              onClick={() => setIsBookingDrawerOpen(true)}
              className="h-11 sm:h-12 px-5 sm:px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all active:scale-95 shrink-0"
            >
              <span>{locale === "id" ? "Booking Sekarang" : "Book Now"}</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            MOBILE & TABLET TRAVEL DATE & APPLICANTS DRAWER (< lg)
           ══════════════════════════════════════════════════════════ */}
        <Drawer open={isBookingDrawerOpen} onOpenChange={setIsBookingDrawerOpen}>
          <DrawerContent className="max-h-[92vh] rounded-t-[32px] p-0 focus:outline-none">
            {/* Header: Title + Close Button */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-3.5">
              <div className="min-w-0 pr-3">
                <DrawerTitle className="text-base font-bold text-slate-900 leading-tight">
                  {locale === "id" ? "Rencana Keberangkatan & Pemohon" : "Travel Date & Applicants"}
                </DrawerTitle>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {title} {selectedPackage ? `· ${selectedPackage.name}` : ""}
                </p>
              </div>
              <DrawerClose asChild>
                <button
                  type="button"
                  className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shrink-0 active:scale-95"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </DrawerClose>
            </div>

            {/* Scrollable Body Content */}
            <div className="px-5 sm:px-6 py-4 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Package Selector */}
              {visa.packages && visa.packages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-blue-600" />
                    <span>{locale === "id" ? "Pilihan Paket Pengurusan" : "Processing Package"}</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {visa.packages.map((pkg: any) => {
                      const isSelected = selectedPackageId === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                            isSelected
                              ? "border-blue-600 bg-blue-50/60 shadow-xs"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={cn(
                                "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-colors",
                                isSelected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 bg-white"
                              )}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <p className={cn("text-xs font-bold truncate", isSelected ? "text-blue-900" : "text-slate-900")}>
                                {pkg.name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {locale === "id"
                                  ? `Proses: ${pkg.processing_time_days} Hari Kerja`
                                  : `Processing: ${pkg.processing_time_days} Business Days`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 pl-2">
                            <span className={cn("text-xs font-extrabold", isSelected ? "text-blue-600" : "text-slate-700")}>
                              {formatPrice(pkg.total_price)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              /{locale === "id" ? "pemohon" : "applicant"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Travel Date Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    <span>
                      {locale === "id" ? "Tanggal Rencana Perjalanan" : "Planned Travel Date"}
                    </span>
                    <span className="text-red-500">*</span>
                  </label>
                  {selectedTravelDate && (
                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen((prev) => !prev)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {isDatePickerOpen
                        ? (locale === "id" ? "Tutup Kalender" : "Close Calendar")
                        : (locale === "id" ? "Ubah Tanggal" : "Change Date")}
                    </button>
                  )}
                </div>

                {/* Date Trigger Card */}
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen((prev) => !prev)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all active:scale-[0.99]",
                    selectedTravelDate
                      ? "border-blue-200 bg-blue-50/40 text-slate-900"
                      : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100/60",
                    isDatePickerOpen && "border-blue-500 bg-white ring-2 ring-blue-500/20 shadow-xs"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        selectedTravelDate
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200/80 text-slate-600"
                      )}
                    >
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      {selectedTravelDate ? (
                        <>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                            {locale === "id" ? "Tanggal Keberangkatan" : "Selected Departure"}
                          </p>
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {new Date(selectedTravelDate).toLocaleDateString(
                              locale === "id" ? "id-ID" : "en-US",
                              {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              }
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs font-medium text-slate-500">
                          {locale === "id" ? "Pilih tanggal keberangkatan" : "Select travel date"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {selectedTravelDate && !isDatePickerOpen && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                        {locale === "id" ? "Terpilih" : "Confirmed"}
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-slate-400 transition-transform duration-200",
                        isDatePickerOpen && "rotate-180 text-blue-600"
                      )}
                    />
                  </div>
                </button>

                {/* Inline Expandable Calendar Container */}
                {isDatePickerOpen && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs space-y-2.5 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="flex justify-center w-full">
                      <CalendarPicker
                        mode="single"
                        selected={selectedTravelDate}
                        onSelect={(date) => {
                          setSelectedTravelDate(date);
                          if (date) {
                            setIsDatePickerOpen(false);
                          }
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        locale={locale === "id" ? idLocale : enUS}
                        className="rounded-xl border border-slate-100 bg-slate-50/30 p-2 w-full max-w-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 px-1">
                      <span className="text-[10px] text-slate-400">
                        {locale === "id"
                          ? "Pilih tanggal keberangkatan di atas"
                          : "Tap a date above to confirm"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(false)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        {locale === "id" ? "Tutup" : "Close"}
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-slate-400">
                  {locale === "id"
                    ? "Perkiraan tanggal tiba di negara tujuan atau tanggal mulai aktifnya visa"
                    : "Estimated arrival date in the destination country or visa start date"}
                </p>
              </div>

              {/* Applicant Counter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                    <span>{locale === "id" ? "Jumlah Pemohon" : "Applicant Quantity"}</span>
                  </label>
                  <span className="text-xs font-semibold text-slate-500">
                    {applicantQty} {locale === "id" ? "Pemohon" : `Applicant${applicantQty > 1 ? "s" : ""}`}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  <div className="pl-1">
                    <p className="text-xs font-bold text-slate-800">
                      {locale === "id" ? "Jumlah Paspor / Pemohon" : "Number of People / Passports"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {locale === "id" ? "Maksimal 20 pemohon per pesanan" : "Max 20 applicants per booking"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setApplicantQty((prev) => Math.max(1, prev - 1))}
                      disabled={applicantQty <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-2xs active:scale-95"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-slate-900">
                      {applicantQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setApplicantQty((prev) => Math.min(20, prev + 1))}
                      disabled={applicantQty >= 20}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-2xs active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Breakdown Preview */}
              <div className="rounded-2xl bg-slate-50/80 p-3.5 text-xs space-y-2 border border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>
                    {selectedPackage?.name || "Paket Visa"} ({formatPrice(activePrice)} × {applicantQty})
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatPrice(totalBookingPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{locale === "id" ? "Audit & Verifikasi Lengkap Berkas" : "Document Audit & Pre-Check"}</span>
                  <span className="font-bold text-emerald-600">
                    {locale === "id" ? "Termasuk" : "Included"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-blue-50/40 rounded-xl p-2.5 border border-blue-100/60">
                <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                  {locale === "id"
                    ? "Data pemohon dan dokumen paspor diisi pada langkah berikutnya"
                    : "Applicant passport details and document uploads are entered on the next step"}
                </span>
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="border-t border-slate-100 bg-white px-5 sm:px-6 py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] flex items-center justify-between gap-3 shadow-[0_-6px_20px_rgba(0,0,0,0.04)]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                  {locale === "id"
                    ? `Total (${applicantQty} Pemohon)`
                    : `Total (${applicantQty} Applicant${applicantQty > 1 ? "s" : ""})`}
                </span>
                <span className="text-lg sm:text-xl font-black text-blue-600 leading-tight">
                  {formatPrice(totalBookingPrice)}
                </span>
              </div>

              <Button
                type="button"
                onClick={() => {
                  if (!selectedTravelDate) {
                    setIsDatePickerOpen(true);
                    toast.error(
                      locale === "id"
                        ? "Silakan pilih tanggal rencana perjalanan terlebih dahulu"
                        : "Please select your planned travel date first"
                    );
                    return;
                  }
                  handleBooking();
                }}
                disabled={isBooking}
                className="h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all active:scale-95 shrink-0"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    <span>{locale === "id" ? "Memproses..." : "Processing..."}</span>
                  </>
                ) : (
                  <>
                    <span>{locale === "id" ? "Lanjutkan Pemesanan" : "Continue to Book"}</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
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
              href={`/${locale}/documents-visa`}
              className="transition-colors hover:text-slate-900">
              {t("breadcrumbsVisa")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-slate-500 font-semibold">{countryName}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="truncate max-w-[320px] text-slate-800 font-bold">
              {title}
            </span>
          </nav>

          {/* Desktop Title & Header Info */}
          <div className="mb-6 flex items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                  <MapPin className="h-3.5 w-3.5 text-red-500" />
                  <span>{countryName}</span>
                </span>
                {processingTime && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200/60">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    <span>{processingTime}</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                {title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-slate-600 pt-1">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{t("trustBadge1")}</span>
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

          {/* Desktop Photo Gallery Presentation (Aspect 21/9 Mosaic Grid) */}
          <div className="relative mb-10 overflow-hidden rounded-3xl shadow-sm ring-1 ring-slate-900/5">
            {galleryImages.length >= 4 ? (
              <div className="grid grid-cols-4 gap-2.5 bg-slate-100 aspect-[21/9]">
                {/* Large Primary Photo */}
                <div
                  onClick={() => {
                    setSelectedGalleryIndex(0);
                    setIsGalleryOpen(true);
                  }}
                  className="group relative col-span-2 row-span-2 cursor-pointer overflow-hidden bg-slate-200">
                  <ImageWithFallback
                    src={galleryImages[0]}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                </div>

                {/* Smaller Supporting Photos */}
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
                      alt={`${title} ${idx + 2}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => {
                  setSelectedGalleryIndex(0);
                  setIsGalleryOpen(true);
                }}
                className="group relative w-full aspect-[21/9] cursor-pointer overflow-hidden bg-slate-100">
                <ImageWithFallback
                  src={galleryImages[0]}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              </div>
            )}

            {/* View All Photos Trigger */}
            <button
              type="button"
              onClick={() => {
                setSelectedGalleryIndex(0);
                setIsGalleryOpen(true);
              }}
              className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-xs font-bold text-slate-800 shadow-md backdrop-blur-md transition-all hover:bg-white active:scale-95">
              <ImageIcon className="h-4 w-4 text-slate-600" />
              <span>{t("photosAvailable", { count: galleryImages.length })}</span>
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════
              2-Column Responsive Desktop Body Grid
             ══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left Main Content Column (8 cols) */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* 1. Quick Facts Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    {t("startsFrom")}
                  </span>
                  <p className="text-lg font-extrabold text-blue-600 mt-1">
                    {formatPrice(visa.starting_price)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    {t("validity")}
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {validity || (locale === "id" ? "Sesuai Kebijakan" : "As per policy")}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    {t("interviewRequired")}
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {visa.is_interview_required ? (
                      <span className="text-amber-600">
                        {locale === "id" ? "Perlu Wawancara" : "Interview Required"}
                      </span>
                    ) : (
                      <span className="text-emerald-600">
                        {locale === "id" ? "Tanpa Wawancara" : "No Interview"}
                      </span>
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    {t("biometricRequired")}
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {visa.is_biometric_required
                      ? (locale === "id" ? "Wajib Hadir VFS" : "In-Person VFS")
                      : "Digital Online"}
                  </p>
                </div>
              </div>

              {/* 2. Processing Packages Selection (if available) */}
              {visa.packages && visa.packages.length > 0 && (
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {t("selectPackage")}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {locale === "id"
                            ? "Pilih opsi kecepatan dan spesifikasi paket sesuai jadwal perjalanan Anda"
                            : "Select your preferred processing speed and package options"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {visa.packages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id;
                      const pkgName = getLocalizedText(pkg.name, locale);
                      const pkgDesc = pkg.description
                        ? getLocalizedText(pkg.description, locale)
                        : undefined;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={cn(
                            "rounded-2xl border p-4.5 transition-all cursor-pointer flex flex-col justify-between",
                            isSelected
                              ? "border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/10 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                          )}>
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={cn(
                                    "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-colors",
                                    isSelected
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-slate-300"
                                  )}>
                                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                                <h4 className="text-sm font-bold text-slate-900">{pkgName}</h4>
                              </div>
                              <span className="text-sm font-extrabold text-blue-600 shrink-0">
                                {formatPrice(pkg.total_price)}
                              </span>
                            </div>

                            {pkgDesc && (
                              <p className="mt-2 text-xs text-slate-500 pl-7 leading-relaxed font-normal">
                                {pkgDesc}
                              </p>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 pl-7">
                            <span>
                              {locale === "id"
                                ? `Estimasi: ${pkg.processing_time_days} Hari Kerja`
                                : `Estimated: ${pkg.processing_time_days} Business Days`}
                            </span>
                            <span>
                              {locale === "id"
                                ? `Kedubes: ${formatPrice(pkg.embassy_fee)}`
                                : `Embassy Fee: ${formatPrice(pkg.embassy_fee)}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Description Section */}
              {description && (
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span>{t("aboutService")}</span>
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {description}
                  </p>
                </div>
              )}

              {/* 4. Requirements Checklist */}
              {visa.requirements && visa.requirements.length > 0 && (
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FileCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {t("requirementsTitle")}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {locale === "id"
                          ? "Persiapkan berkas berikut untuk kelancaran verifikasi dokumen Anda"
                          : "Prepare the following documents for seamless verification"}
                      </p>
                    </div>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {visa.requirements.map((req: any, idx: number) => {
                      const reqText = getLocalizedText(
                        typeof req === "string" ? req : req.title || req.name || req.description,
                        locale
                      );
                      return (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs sm:text-sm font-medium text-slate-700">
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{reqText}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* 5. Inclusions / Services Benefits */}
              {visa.inclusions && visa.inclusions.length > 0 && (
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {t("inclusionsTitle")}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Layanan komprehensif dari PacificTravelindo yang Anda dapatkan
                      </p>
                    </div>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {visa.inclusions.map((inc: any, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs sm:text-sm font-medium text-slate-700">
                        <Sparkles className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{getLocalizedText(inc, locale)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 6. Step-by-Step Workflow Process */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {t("processTitle")}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Alur transparan dan pendampingan terstruktur hingga permohonan visa selesai
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  {workflowSteps.map((st, i) => (
                    <div key={st.step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-xs ring-4 ring-blue-50">
                          {st.step}
                        </div>
                        {i < workflowSteps.length - 1 && (
                          <div className="my-1.5 w-0.5 flex-1 bg-slate-200" />
                        )}
                      </div>
                      <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 pb-4.5">
                        <h5 className="text-sm font-bold text-slate-900">{st.title}</h5>
                        <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {st.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. Guarantees & Trust Signals */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      Official Assistance
                    </span>
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                      {t("guaranteeTitle")}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                        {t("guarantee1")}
                      </h5>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-normal">
                        Menghindari risiko penolakan akibat kesalahan berkas atau formulir.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                        {t("guarantee2")}
                      </h5>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-normal">
                        Slot janji temu resmi langsung terkoneksi dengan jadwal keberangkatan.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                        {t("guarantee3")}
                      </h5>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-normal">
                        Konsultasi 1-on-1 bersama tim berpengalaman hingga paspor diterima kembali.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                        {t("guarantee4")}
                      </h5>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-normal">
                        Seluruh data identitas dan dokumen pemohon terenkripsi aman.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Frequently Asked Questions (FAQ) */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{t("faqTitle")}</h3>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                        Q
                      </span>
                      <span>{t("faq1Q")}</span>
                    </h5>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pl-7">
                      {t("faq1A")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                        Q
                      </span>
                      <span>{t("faq2Q")}</span>
                    </h5>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pl-7">
                      {t("faq2A")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                        Q
                      </span>
                      <span>{t("faq3Q")}</span>
                    </h5>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pl-7">
                      {t("faq3A")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sticky Column (4 cols) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-5">
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
                {/* Header Price Section */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    {selectedPackage ? t("selectedPackage") : t("startsFrom")}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
                      {formatPrice(activePrice)}
                    </span>
                  </div>
                  {selectedPackage && (
                    <span className="mt-1 inline-block text-xs font-semibold text-slate-700">
                      {locale === "id" ? "Paket:" : "Package:"} {getLocalizedText(selectedPackage.name, locale)}
                    </span>
                  )}
                </div>

                {/* Package Quick Selector List in Sticky Box */}
                {visa.packages && visa.packages.length > 1 && (
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      {locale === "id" ? "Pilihan Paket" : "Available Packages"}
                    </span>
                    <div className="space-y-1.5">
                      {visa.packages.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all text-left",
                              isSelected
                                ? "bg-blue-50 text-blue-700 border border-blue-200 font-bold"
                                : "bg-slate-50 text-slate-700 border border-slate-200/60 hover:bg-slate-100"
                            )}>
                            <span className="truncate pr-2">
                              {getLocalizedText(pkg.name, locale)}
                            </span>
                            <span className="shrink-0 text-blue-600">
                              {formatPrice(pkg.total_price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Travel Date Picker */}
                <div className="space-y-1.5 border-t border-slate-100 pt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    <span>{locale === "id" ? "Tanggal Rencana Perjalanan" : "Planned Travel Date"}</span>
                  </label>
                  <DatePicker
                    date={selectedTravelDate}
                    setDate={setSelectedTravelDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    placeholder={locale === "id" ? "Pilih tanggal keberangkatan" : "Select departure date"}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-2xs"
                  />
                </div>

                {/* Applicant Quantity Stepper */}
                <div className="space-y-1.5 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                      <span>{locale === "id" ? "Jumlah Pemohon (Applicant)" : "Applicant Quantity"}</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {applicantQty} {locale === "id" ? "Orang" : "Person(s)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-2">
                    <span className="text-xs text-slate-600 pl-2">
                      {locale === "id" ? "Berapa pemohon yang didaftarkan?" : "How many applicants?"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setApplicantQty((prev) => Math.max(1, prev - 1))}
                        disabled={applicantQty <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-2xs"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-slate-900">
                        {applicantQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setApplicantQty((prev) => Math.min(20, prev + 1))}
                        disabled={applicantQty >= 20}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-2xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Total Price Summary */}
                <div className="border-t border-slate-100 pt-4 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {locale === "id" ? "Total Biaya" : "Total Price"}
                    </span>
                    <span className="text-2xl font-black text-blue-600">
                      {formatPrice(totalBookingPrice)}
                    </span>
                  </div>
                  {applicantQty > 1 && (
                    <p className="text-right text-[11px] text-slate-400">
                      ({formatPrice(activePrice)} × {applicantQty} {locale === "id" ? "pemohon" : "applicants"})
                    </p>
                  )}
                </div>

                {/* Feature checklist */}
                <div className="space-y-2.5 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      {locale === "id"
                        ? "Konsultasi 1-on-1 via WhatsApp Resmi"
                        : "1-on-1 Official WhatsApp Consultation"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      {locale === "id"
                        ? "Audit & Verifikasi Lengkap Berkas"
                        : "Complete Document Audit & Pre-Check"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      {locale === "id"
                        ? "Booking Slot Janji Temu Resmi Kedubes"
                        : "Official Embassy Slot Scheduling"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      {locale === "id"
                        ? "Update Real-time Progres Pengajuan"
                        : "Real-time Application Status Updates"}
                    </span>
                  </div>
                </div>

                {/* Primary CTA & Secondary WhatsApp Buttons */}
                <div className="pt-2 space-y-2.5">
                  <Button
                    type="button"
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/30 transition-all hover:shadow-lg active:scale-98 h-12"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>{locale === "id" ? "Memproses Pemesanan..." : "Processing Booking..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{locale === "id" ? "Booking Visa Sekarang" : "Book Visa Now"}</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-50/50 hover:bg-emerald-100 py-2.5 text-xs font-bold text-emerald-700 transition-all active:scale-98"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{locale === "id" ? "Konsultasi Cepat via WhatsApp" : "Quick Consultation via WhatsApp"}</span>
                    <ExternalLink className="h-3 w-3 text-emerald-600 ml-0.5" />
                  </a>

                  <p className="text-center text-[11px] text-slate-400 pt-0.5">
                    {locale === "id"
                      ? "Konfirmasi instan & pengisian data pemohon di langkah berikutnya"
                      : "Instant confirmation & applicant form on the next step"}
                  </p>
                </div>
              </div>

              {/* Consultation Info Box */}
              <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-5 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>{t("consultationWhatsApp")}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {t("consultationDesc")}
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              Similar Related Visas Section
             ══════════════════════════════════════════════════════ */}
          {similarVisas.length > 0 && (
            <div className="mt-16 pt-12 border-t border-slate-200/80 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {t("similarVisasTitle")}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {t("similarVisasSubtitle")}
                  </p>
                </div>
                <Link
                  href={`/${locale}/documents-visa`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">
                  <span>{locale === "id" ? "Lihat Semua Layanan" : "View All Services"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {similarVisas.map((item) => (
                  <DocumentVisaCard
                    key={item.id}
                    item={item}
                    locale={locale}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════
          FULLSCREEN PHOTO GALLERY DIALOG
         ══════════════════════════════════════════════════════════ */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent
          showCloseButton={false}
          className="h-screen w-screen max-w-none gap-0 overflow-hidden rounded-none border-none p-0 outline-none lg:h-[90vh] lg:w-[95vw] lg:max-w-[1280px] lg:rounded-3xl">
          <DialogTitle className="sr-only">{title} Gallery</DialogTitle>
          <div className="flex h-full flex-col overflow-hidden bg-slate-950 lg:flex-row">
            {/* Desktop Thumbnails Sidebar */}
            <div className="hidden border-r border-slate-800 bg-slate-900/90 lg:flex lg:w-[360px] lg:flex-col">
              <div className="p-5 border-b border-slate-800">
                <h3 className="text-base font-bold text-white line-clamp-1">{title}</h3>
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
                      )}>
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
                className="absolute top-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-90">
                <X className="h-5 w-5" />
              </button>

              <div className="relative h-full w-full p-4 lg:p-10 flex items-center justify-center">
                <ImageWithFallback
                  src={galleryImages[selectedGalleryIndex]}
                  alt={title}
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
                    {title}
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

      {/* Desktop Footer */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};
