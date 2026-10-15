"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { DocumentVisaItem, getLocalizedText } from "@/store/services/document-visa.service";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  MapPin,
  MessageSquare,
  Package,
  ShieldCheck,
  Sparkles,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface DocumentVisaDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visa: DocumentVisaItem | null;
  locale: string;
  formatPrice: (price: number) => string;
}

export const DocumentVisaDetailModal = ({
  open,
  onOpenChange,
  visa,
  locale,
  formatPrice
}: DocumentVisaDetailModalProps) => {
  const t = useTranslations("DocumentVisa");

  if (!visa) return null;

  const translation =
    visa.translations?.find((tr) => tr.language_code === locale) ||
    visa.translations?.[0];

  const title = getLocalizedText(translation?.title || visa.title, locale) || "Layanan Visa";
  const description = getLocalizedText(translation?.description || visa.description, locale);
  const countryName = getLocalizedText(visa.country_name || (visa as any).country?.name, locale) || "International";
  const validity = getLocalizedText(visa.validity, locale);
  const processingTime = getLocalizedText(visa.processing_time, locale);
  const submissionProcess = getLocalizedText(
    translation?.submission_process ||
    visa.submission_process ||
    "1. Konsultasi & Pengiriman Berkas -> 2. Verifikasi & Pengecekan Dokumen -> 3. Booking Slot / Submit Aplikasi -> 4. Visa Disetujui.",
    locale
  );

  // Pre-filled WhatsApp link
  const waPhone = "6281234567890"; // Pacific Travelindo official WhatsApp hotline
  const waText = encodeURIComponent(
    `Halo PacificTravelindo, saya ingin konsultasi dan mengajukan layanan ${title} (${countryName}). Mohon info persyaratan lengkap dan jadwal terdekat.`
  );
  const waUrl = `https://wa.me/${waPhone}?text=${waText}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-slate-200">
        {/* Modal Top Banner with Image */}
        <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-slate-900">
          <Image
            src={visa.thumbnail || "/images/placeholder.jpg"}
            alt={title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Close Button */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/75 transition-all">
            <X className="h-5 w-5" />
          </button>

          {/* Banner Floating Metadata */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                <MapPin className="h-3 w-3 text-white" />
                <span>{countryName}</span>
              </span>
              {processingTime && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
                  <Clock className="h-3 w-3 text-amber-300" />
                  <span>{processingTime}</span>
                </span>
              )}
            </div>

            <DialogTitle className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight">
              {title}
            </DialogTitle>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Key Quick Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-left">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                {t("startsFrom")}
              </span>
              <p className="text-base font-extrabold text-blue-600 mt-0.5">
                {formatPrice(visa.starting_price)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-left">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                {t("validity")}
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                {validity || (locale === "id" ? "Sesuai Kebijakan" : "As per policy")}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-left">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                {t("interviewRequired")}
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1">
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

            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-left">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                {t("biometricRequired")}
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                {visa.is_biometric_required
                  ? (locale === "id" ? "Wajib Hadir VFS" : "In-Person VFS")
                  : "Digital Online"}
              </p>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t("aboutService")}
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {description}
              </p>
            </div>
          )}

          {/* Requirements Checklist */}
          {visa.requirements && visa.requirements.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                <FileCheck className="h-4 w-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {t("requirementsTitle")}
                </h4>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {visa.requirements.map((req: any, idx: number) => {
                  const reqText = getLocalizedText(
                    typeof req === "string" ? req : req.title || req.name || req.description,
                    locale
                  );
                  return (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{reqText}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Inclusions / Facilities */}
          {visa.inclusions && visa.inclusions.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {t("inclusionsTitle")}
                </h4>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {visa.inclusions.map((inc: any, idx: number) => {
                  const incText = getLocalizedText(inc, locale);
                  return (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                      <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{incText}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Packages breakdown (if any) */}
          {visa.packages && visa.packages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {t("packagesTitle")}
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visa.packages.map((pkg: any) => {
                  const pkgName = getLocalizedText(pkg.name, locale);
                  const pkgDesc = pkg.description ? getLocalizedText(pkg.description, locale) : undefined;
                  return (
                    <div
                      key={pkg.id}
                      className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900">{pkgName}</h5>
                          <span className="text-xs font-extrabold text-blue-600 shrink-0">
                            {formatPrice(pkg.total_price)}
                          </span>
                        </div>
                        {pkgDesc && (
                          <p className="text-[11px] text-slate-500 mt-1">{pkgDesc}</p>
                        )}
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
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

          {/* Workflow Steps */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              {t("processTitle")}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {submissionProcess}
            </p>
          </div>
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200/80 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">{t("startsFrom")}</span>
            <span className="text-lg sm:text-xl font-extrabold text-blue-600">
              {formatPrice(visa.starting_price)}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-initial rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              {t("closeModal")}
            </button>

            <Link
              href={`/${locale}/documents-visa/${visa.slug || visa.id}`}
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors">
              <span>{t("viewFullPage")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 sm:px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95">
              <MessageSquare className="h-4 w-4" />
              <span>{t("consultNow")}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
