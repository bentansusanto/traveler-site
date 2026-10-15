"use client";

import React, { useEffect, useState } from "react";
import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { OrderDocumentVisaValues } from "./schema";
import { format } from "date-fns";
import { enUS, id as idLocale, tr } from "date-fns/locale";

interface ConfirmDocumentVisaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  values: OrderDocumentVisaValues;
  serviceTitle: string;
  countryName?: string;
  packageName: string;
  processingTime?: string | number;
  targetTravelDate?: string;
  totalPriceFormatted: string;
  totalApplicants: number;
  locale: string;
  isPassportService?: boolean;
  isPassportRenewal?: boolean;
  isPassportNew?: boolean;
  isVisaService?: boolean;
  isGeneralDocument?: boolean;
}

const useIsMobileOrTablet = () => {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const check = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobileOrTablet;
};

export const ConfirmDocumentVisaModal: React.FC<ConfirmDocumentVisaModalProps> = ({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  values,
  serviceTitle,
  countryName,
  packageName,
  processingTime,
  targetTravelDate,
  totalPriceFormatted,
  totalApplicants,
  locale,
  isPassportService,
  isPassportRenewal,
  isPassportNew,
  isVisaService,
  isGeneralDocument
}) => {
  const isMobileOrTablet = useIsMobileOrTablet();
  const dateFnsLocale = locale === "id" ? idLocale : locale === "tr" ? tr : enUS;

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const clean = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
      const parts = clean.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(d.getTime())) {
          return format(d, "dd MMM yyyy", { locale: dateFnsLocale });
        }
      }
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return format(d, "dd MMM yyyy", { locale: dateFnsLocale });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "Mr":
        return locale === "id" ? "Tn. (Mr.)" : "Mr.";
      case "Mrs":
        return locale === "id" ? "Ny. (Mrs.)" : "Mrs.";
      case "Ms":
      case "Miss":
      case "female":
        return locale === "id" ? "Nn. (Ms.)" : "Ms.";
      default:
        return gender;
    }
  };

  // Reusable modal body content
  const modalBodyContent = (
    <div className="space-y-4">
      {/* Warning Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 sm:p-4">
        <Icon name="AlertTriangle" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-xs font-bold text-amber-900">
            {locale === "id"
              ? "Pastikan Seluruh Data Sesuai Dokumen / Paspor Asli"
              : "Ensure All Details Match Official Passport / Identity Document"}
          </p>
          <p className="mt-1 text-[11px] sm:text-xs text-amber-800/90 leading-relaxed">
            {locale === "id"
              ? "Data yang telah dikirimkan akan digunakan oleh petugas untuk proses audit, formulir resmi kedutaan, atau pembuatan paspor. Ketidaksesuaian nama, nomor dokumen, atau tanggal lahir dapat menyebabkan penolakan visa."
              : "The submitted details will be directly used by visa officers for audit, embassy submission, or passport issuance. Any discrepancies in name, passport number, or birth date may result in visa rejection or delays."}
          </p>
        </div>
      </div>

      {/* Service & Payment Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 sm:p-4 space-y-3">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 pb-3">
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
              {isPassportService
                ? locale === "id"
                  ? "Layanan Paspor"
                  : "Passport Service"
                : isGeneralDocument
                ? locale === "id"
                  ? "Dokumen & Visa"
                  : "Document Service"
                : locale === "id"
                ? "Pengajuan Visa"
                : "Visa Application"}
            </span>
            <h4 className="text-sm font-bold text-slate-900 truncate">{serviceTitle}</h4>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
              {countryName && (
                <div className="flex items-center gap-1">
                  <Icon name="MapPin" className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span>{countryName}</span>
                </div>
              )}
              {packageName && (
                <div className="flex items-center gap-1">
                  <Icon name="FileText" className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{packageName}</span>
                </div>
              )}
              {processingTime && (
                <div className="flex items-center gap-1">
                  <Icon name="Clock" className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>
                    {processingTime}{" "}
                    {locale === "id" ? "Hari Kerja" : "Business Days"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {locale === "id" ? "Total Biaya" : "Total Fee"}
            </p>
            <p className="text-base font-extrabold text-blue-600">{totalPriceFormatted}</p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              {totalApplicants} {locale === "id" ? "Pemohon" : "Applicant(s)"}
            </p>
          </div>
        </div>

        {targetTravelDate && (
          <div className="flex items-center justify-between text-xs pt-0.5 text-slate-600">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Icon name="Calendar" className="h-3.5 w-3.5 text-slate-400" />
              {locale === "id" ? "Target Keberangkatan" : "Target Travel Date"}:
            </span>
            <span className="font-semibold text-slate-800">
              {formatDateDisplay(targetTravelDate)}
            </span>
          </div>
        )}
      </div>

      {/* Booker Details Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Icon name="UserCircle" className="h-4 w-4 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {locale === "id" ? "Data Kontak Pemesan" : "Booker Contact Details"}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="rounded-xl bg-slate-50 p-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              {locale === "id" ? "Nama Lengkap" : "Full Name"}
            </span>
            <span className="font-bold text-slate-800 block mt-0.5 truncate">
              {values.booker.name || "—"}
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Email
            </span>
            <span className="font-bold text-slate-800 block mt-0.5 truncate">
              {values.booker.email || "—"}
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              {locale === "id" ? "No. WhatsApp" : "Phone / WhatsApp"}
            </span>
            <span className="font-bold text-slate-800 block mt-0.5 truncate">
              {values.booker.phone || "—"}
            </span>
          </div>
        </div>

        {values.note && (
          <div className="rounded-xl bg-slate-50 p-2.5 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              {locale === "id" ? "Catatan Tambahan" : "Additional Notes"}
            </span>
            <span className="text-slate-700 block mt-0.5 whitespace-pre-wrap text-[11px] leading-relaxed">
              {values.note}
            </span>
          </div>
        )}
      </div>

      {/* Applicants Details Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Icon name="Users" className="h-4 w-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {locale === "id"
                ? `Data Pemohon (${values.applicants.length} Orang)`
                : `Applicant Details (${values.applicants.length} Persons)`}
            </h4>
          </div>
        </div>

        <div className="space-y-3">
          {values.applicants.map((app, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 sm:p-3.5 space-y-2.5">
              {/* Applicant Header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/50 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    <span className="text-slate-500 font-semibold mr-1">
                      {getGenderLabel(app.gender)}
                    </span>
                    {app.full_name}
                  </p>
                </div>

                {idx === 0 && (
                  <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[9px] font-bold shrink-0">
                    {locale === "id" ? "Pemohon Utama" : "Primary Applicant"}
                  </span>
                )}
              </div>

              {/* Applicant Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {/* Passport / NIK Number */}
                <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                  <span className="text-[10px] font-medium text-slate-400 block">
                    {isPassportNew
                      ? locale === "id"
                        ? "No. NIK / KTP"
                        : "National ID (NIK)"
                      : locale === "id"
                      ? "Nomor Paspor"
                      : "Passport Number"}
                  </span>
                  <span className="font-bold text-slate-800 block mt-0.5 truncate uppercase">
                    {app.passport_number || "—"}
                  </span>
                </div>

                {/* Nationality */}
                <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                  <span className="text-[10px] font-medium text-slate-400 block">
                    {locale === "id" ? "Kewarganegaraan" : "Nationality"}
                  </span>
                  <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                    {app.nationality || "Indonesia"}
                  </span>
                </div>

                {/* Date of Birth */}
                <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                  <span className="text-[10px] font-medium text-slate-400 block">
                    {locale === "id" ? "Tanggal Lahir" : "Date of Birth"}
                  </span>
                  <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                    {formatDateDisplay(app.birth_date)}
                  </span>
                </div>

                {/* Place of Birth */}
                {app.birth_place && (
                  <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                    <span className="text-[10px] font-medium text-slate-400 block">
                      {locale === "id" ? "Tempat Lahir" : "Place of Birth"}
                    </span>
                    <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                      {app.birth_place}
                    </span>
                  </div>
                )}

                {/* Passport Expiry Date (if applicable) */}
                {(isVisaService || isPassportRenewal) && (
                  <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                    <span className="text-[10px] font-medium text-slate-400 block">
                      {isPassportRenewal
                        ? locale === "id"
                          ? "Masa Berlaku Paspor Lama"
                          : "Old Passport Expiry"
                        : locale === "id"
                        ? "Masa Berlaku Paspor"
                        : "Passport Expiry"}
                    </span>
                    <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                      {formatDateDisplay(app.passport_expiry_date)}
                    </span>
                  </div>
                )}

                {/* Occupation */}
                {app.occupation && (
                  <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                    <span className="text-[10px] font-medium text-slate-400 block">
                      {locale === "id" ? "Pekerjaan" : "Occupation"}
                    </span>
                    <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                      {app.occupation}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Reusable footer action buttons (sejajar / side-by-side)
  const footerActionButtons = (
    <div className="flex flex-row items-center justify-end gap-2 sm:gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting}
        onClick={onClose}
        className="flex-1 sm:flex-none sm:w-auto rounded-xl border-slate-300 text-slate-700 text-xs font-semibold h-11 px-3 sm:px-5 hover:bg-white active:scale-95 transition-all">
        <Icon name="ArrowLeft" className="h-3.5 w-3.5 mr-1 text-slate-400 shrink-0" />
        <span className="truncate">{locale === "id" ? "Periksa Kembali" : "Review / Edit"}</span>
      </Button>

      <Button
        type="button"
        disabled={isSubmitting}
        onClick={onConfirm}
        className="flex-1 sm:flex-none sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-11 px-3 sm:px-6 shadow-md shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 transition-all">
        {isSubmitting ? (
          <>
            <Icon name="Loader2" className="h-4 w-4 animate-spin shrink-0" />
            <span className="truncate">
              {locale === "id" ? "Memproses Data..." : "Processing..."}
            </span>
          </>
        ) : (
          <>
            <Icon name="CreditCard" className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {locale === "id"
                ? "Benar & Lanjut Bayar"
                : "Confirm & Proceed"}
            </span>
          </>
        )}
      </Button>
    </div>
  );

  // ─── Mobile / Tablet: Render as Bottom Drawer ─────────────────────────────
  if (isMobileOrTablet) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && !isSubmitting && onClose()}>
        <DrawerContent
          showHandle={true}
          className="rounded-t-3xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-white border-none shadow-2xl">
          {/* Drawer Header */}
          <DrawerHeader className="border-b border-slate-100 px-5 py-3.5 shrink-0 bg-white text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-4 ring-amber-50/50 shrink-0">
                <Icon name="ShieldAlert" className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DrawerTitle className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {locale === "id"
                    ? "Konfirmasi Data Pengajuan"
                    : "Confirm Application Details"}
                </DrawerTitle>
                <DrawerDescription className="text-xs font-normal text-slate-500 mt-0.5 truncate">
                  {locale === "id"
                    ? "Periksa kembali sebelum melanjutkan ke pembayaran"
                    : "Please review before proceeding to payment"}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          {/* Drawer Body (Scrollable) */}
          <div className="overflow-y-auto px-4 sm:px-6 py-4 flex-1">
            {modalBodyContent}
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-slate-200/80 px-4 sm:px-6 py-3.5 bg-slate-50 shrink-0">
            {footerActionButtons}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // ─── Desktop: Render as Centered Dialog Modal ────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isSubmitting && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl rounded-2xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col bg-white border border-slate-200 shadow-2xl">
        {/* Dialog Header */}
        <DialogHeader className="border-b border-slate-100 px-6 py-4.5 shrink-0 bg-white">
          <DialogTitle className="flex items-center gap-3 text-base font-bold text-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-4 ring-amber-50/50 shrink-0">
              <Icon name="ShieldAlert" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {locale === "id"
                  ? "Konfirmasi Data Pengajuan & Pemohon"
                  : "Confirm Application & Applicant Details"}
              </p>
              <p className="text-xs font-normal text-slate-500 mt-0.5">
                {locale === "id"
                  ? "Periksa kembali data Anda sebelum melanjutkan ke proses pembayaran"
                  : "Please review all details before proceeding to the payment step"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Dialog Body (Scrollable) */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {modalBodyContent}
        </div>

        {/* Dialog Footer */}
        <div className="border-t border-slate-200/80 px-6 py-4 bg-slate-50 shrink-0">
          {footerActionButtons}
        </div>
      </DialogContent>
    </Dialog>
  );
};
