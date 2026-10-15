"use client";

import Icon from "@/components/icon";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import {
  useFindBookDocumentVisaByIdQuery,
  useUpdateBookDocumentVisaDetailsMutation
} from "@/store/services/book-document-visa.service";
import {
  useCreateBookerMutation,
  useFindAllBookersQuery
} from "@/store/services/booker.service";
import { useGetUserQuery } from "@/store/services/customer.service";
import {
  getLocalizedText,
  useFindDocumentVisaByIdQuery
} from "@/store/services/document-visa.service";
import { useFormik } from "formik";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { BookerListModal } from "../BookingTour/BookerListModal";
import { ConfirmDocumentVisaModal } from "./ConfirmDocumentVisaModal";
import {
  ApplicantFormValues,
  OrderDocumentVisaValues,
  getOrderDocumentVisaSchema
} from "./schema";

export const OrderDocumentVisaPage = () => {
  const locale = useLocale();
  const t = useTranslations("DocumentVisa");
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookDocumentVisaIdParam = searchParams.get("book_document_visa_id");
  const documentVisaIdParam = searchParams.get("document_visa_id");

  // Redux Currency
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16000 }
  );
  const selectedCurrency = (currentCurrency?.code as "IDR" | "USD" | "TRY") || "IDR";

  const formatPrice = (rawPrice: number) => {
    let finalAmount = Number(rawPrice) || 0;
    if (selectedCurrency === "IDR") {
      const rawRate = Number(currentCurrency?.idrToUsdRate);
      const rate =
        rawRate > 1
          ? rawRate
          : rawRate > 0
          ? 1 / rawRate
          : Number(currentCurrency?.rates?.IDR) || 16761;
      finalAmount = finalAmount * rate;
    } else if (selectedCurrency === "TRY") {
      const rate =
        currentCurrency?.code === "TRY" && Number(currentCurrency?.idrToUsdRate) > 1
          ? Number(currentCurrency?.idrToUsdRate)
          : Number(currentCurrency?.rates?.TRY) || 47;
      finalAmount = finalAmount * rate;
    }

    return new Intl.NumberFormat(
      selectedCurrency === "USD"
        ? "en-US"
        : selectedCurrency === "TRY"
        ? "tr-TR"
        : "id-ID",
      {
        style: "currency",
        currency: selectedCurrency,
        minimumFractionDigits: selectedCurrency === "USD" ? 2 : 0,
        maximumFractionDigits: selectedCurrency === "USD" ? 2 : 0
      }
    ).format(finalAmount || 0);
  };

  const parseDateString = (str?: string): Date | undefined => {
    if (!str) return undefined;
    if (str.includes("-") && str.split("-")[0].length === 2) {
      const [d, m, y] = str.split("-");
      const parsed = new Date(Number(y), Number(m) - 1, Number(d));
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const formatDateToYYYYMMDD = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 1. Fetch Existing Booking Data
  const {
    data: bookingResponse,
    isLoading: isLoadingBooking,
    refetch: refetchBooking
  } = useFindBookDocumentVisaByIdQuery(bookDocumentVisaIdParam!, {
    skip: !bookDocumentVisaIdParam
  });
  const bookingData = bookingResponse?.data;

  // 2. Client-side mount & session draft loading
  const [isMounted, setIsMounted] = useState(false);
  const [sessionDraft, setSessionDraft] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = sessionStorage.getItem("document_visa_booking_draft");
      if (raw) {
        setSessionDraft(JSON.parse(raw));
      }
    } catch {}
  }, []);

  // Effective Visa ID
  const effectiveVisaId =
    documentVisaIdParam ||
    bookingData?.document_visa_id ||
    sessionDraft?.visa_id;

  // 3. Fetch Visa Master Details
  const { data: visaResponse, isLoading: isLoadingVisa } =
    useFindDocumentVisaByIdQuery(
      { id: effectiveVisaId as string, lang: locale },
      { skip: !effectiveVisaId }
    );
  const visa = visaResponse?.data;

  // 4. Booker Information & Account Prefill
  const { data: currentUserData } = useGetUserQuery();
  const { data: bookersData } = useFindAllBookersQuery();
  const [createBooker] = useCreateBookerMutation();
  const [updateBookingDetails, { isLoading: isUpdating }] =
    useUpdateBookDocumentVisaDetailsMutation();

  const accountData = useMemo(() => {
    const user = currentUserData?.data;
    if (!user) return { name: "", email: "", phone: "" };
    return {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone_number || ""
    };
  }, [currentUserData]);

  const [useAccountData, setUseAccountData] = useState(false);
  const [isBookerModalOpen, setIsBookerModalOpen] = useState(false);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Applicant Count calculation
  const applicantCount =
    bookingData?.applicant_count ||
    sessionDraft?.applicant_count ||
    1;

  // Package calculation
  const selectedPackage =
    visa?.packages?.find((p: any) => p.id === bookingData?.package_id) ||
    (bookingData as any)?.package ||
    sessionDraft?.package ||
    visa?.packages?.[0];

  const unitPrice =
    Number(bookingData?.unit_price) ||
    Number(selectedPackage?.total_price) ||
    Number(visa?.starting_price) ||
    0;

  const totalPrice = unitPrice * applicantCount;

  const visaTitle =
    getLocalizedText(visa?.title, locale) ||
    bookingData?.document_visa_title ||
    sessionDraft?.visa_title ||
    "Document & Visa Service";

  const countryName =
    getLocalizedText(visa?.country_name, locale) ||
    bookingData?.country_name ||
    sessionDraft?.country_name ||
    "International";

  const thumbnail =
    visa?.thumbnail ||
    sessionDraft?.thumbnail ||
    "/images/placeholder.jpg";

  const travelDateText =
    bookingData?.target_travel_date ||
    sessionDraft?.target_travel_date ||
    "-";

  // Dynamic Document Type Detection
  const visaType = visa?.visa_type || (bookingData as any)?.document_visa?.visa_type || "";
  const categorySlug = (
    visa?.category?.slug ||
    (bookingData as any)?.document_visa?.category?.slug ||
    (bookingData as any)?.category_slug ||
    ""
  ).toLowerCase();
  const documentTitle = String(
    visa?.title ||
    bookingData?.document_visa_title ||
    (bookingData as any)?.document_visa?.title ||
    ""
  ).toLowerCase();

  const isPassportNew =
    visaType === "passport_new" ||
    ((categorySlug === "passport" || documentTitle.includes("paspor") || documentTitle.includes("passport")) &&
      (documentTitle.includes("baru") || documentTitle.includes("new") || documentTitle.includes("pertama")));

  const isPassportRenewal =
    visaType === "passport_renewal" ||
    ((categorySlug === "passport" || documentTitle.includes("paspor") || documentTitle.includes("passport")) &&
      (documentTitle.includes("perpanjang") || documentTitle.includes("renewal") || documentTitle.includes("habis") || documentTitle.includes("ganti")));

  const isPassportService = isPassportNew || isPassportRenewal || categorySlug === "passport" || documentTitle.includes("paspor") || documentTitle.includes("passport");

  const isGeneralDocument =
    categorySlug === "legalisation" ||
    categorySlug === "sworn-translator" ||
    categorySlug === "travel-insurance" ||
    visaType === "other" ||
    documentTitle.includes("legalisir") ||
    documentTitle.includes("legalisasi") ||
    documentTitle.includes("terjemah") ||
    documentTitle.includes("asuransi") ||
    documentTitle.includes("penerjemah");

  const isVisaService = !isPassportService && !isGeneralDocument;

  // Build default applicants array
  const initialApplicants: ApplicantFormValues[] = useMemo(() => {
    const existing = bookingData?.applicants;
    if (Array.isArray(existing) && existing.length > 0) {
      return existing.map((app: any) => ({
        full_name: app.full_name || "",
        gender:
          app.gender === "Mrs"
            ? "Mrs"
            : app.gender === "Ms" || app.gender === "Miss" || app.gender === "female"
            ? "Ms"
            : "Mr",
        nationality: app.nationality || "Indonesia",
        passport_number: app.passport_number || "",
        birth_date: app.birth_date ? String(app.birth_date).split("T")[0] : "",
        birth_place: app.birth_place || "",
        passport_issue_date: app.passport_issue_date ? String(app.passport_issue_date).split("T")[0] : "",
        passport_expiry_date: app.passport_expiry_date ? String(app.passport_expiry_date).split("T")[0] : "",
        occupation: app.occupation || ""
      }));
    }
    return Array.from({ length: applicantCount }).map(() => ({
      full_name: "",
      gender: "Mr",
      nationality: "Indonesia",
      passport_number: "",
      birth_date: "",
      birth_place: "",
      passport_issue_date: "",
      passport_expiry_date: "",
      occupation: ""
    }));
  }, [bookingData?.applicants, applicantCount]);

  // Formik Form Handling
  const formik = useFormik<OrderDocumentVisaValues>({
    enableReinitialize: true,
    initialValues: {
      booker: {
        id: bookingData?.booker_id || "",
        name: bookingData?.booker_name || "",
        email: bookingData?.booker_email || "",
        phone: bookingData?.booker_phone || ""
      },
      target_travel_date: bookingData?.target_travel_date || sessionDraft?.target_travel_date || "",
      note: bookingData?.note || "",
      shipping_address: bookingData?.shipping_address || "",
      applicants: initialApplicants
    },
    validate: (values) => {
      const result = getOrderDocumentVisaSchema(locale, {
        visaType,
        categorySlug,
        title: documentTitle
      }).safeParse(values);
      if (!result.success) {
        const errors: any = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path;
          if (path.length > 0) {
            let current = errors;
            for (let i = 0; i < path.length - 1; i++) {
              const p = path[i];
              if (!current[p]) current[p] = typeof p === "number" ? [] : {};
              current = current[p];
            }
            current[path[path.length - 1]] = issue.message;
          }
        });
        return errors;
      }
      return {};
    },
    onSubmit: async (values) => {
      if (!bookDocumentVisaIdParam) {
        toast.error("ID booking tidak ditemukan");
        return;
      }

      try {
        // 1. If booker has no id and not using existing booker, create or save booker
        let finalBookerId = values.booker.id;
        if (!finalBookerId && values.booker.name && values.booker.email && values.booker.phone) {
          try {
            const created = await createBooker({
              name: values.booker.name,
              email: values.booker.email,
              phone_number: values.booker.phone
            }).unwrap();
            finalBookerId = created?.data?.id;
          } catch {
            // non-blocking fallback
          }
        }

        // 2. Call PATCH /book-document-visas/:id to update Booker and Applicants
        await updateBookingDetails({
          id: bookDocumentVisaIdParam,
          body: {
            booker_id: finalBookerId || undefined,
            booker: {
              id: finalBookerId || undefined,
              name: values.booker.name,
              email: values.booker.email,
              phone_number: values.booker.phone
            },
            target_travel_date: values.target_travel_date
              ? values.target_travel_date.split("T")[0]
              : undefined,
            note: values.note ? values.note.trim() : undefined,
            shipping_address: values.shipping_address
              ? values.shipping_address.trim()
              : undefined,
            applicants: values.applicants.map((app) => ({
              full_name: app.full_name.trim(),
              gender:
                app.gender === "Mrs"
                  ? "Mrs"
                  : app.gender === "Ms" || app.gender === "Miss" || app.gender === "female"
                  ? "Ms"
                  : "Mr",
              nationality: app.nationality ? app.nationality.trim() : "Indonesia",
              passport_number: app.passport_number ? app.passport_number.trim() : undefined,
              birth_date: app.birth_date ? app.birth_date.split("T")[0] : undefined,
              birth_place: app.birth_place ? app.birth_place.trim() : undefined,
              passport_issue_date: app.passport_issue_date
                ? app.passport_issue_date.split("T")[0]
                : undefined,
              passport_expiry_date: app.passport_expiry_date
                ? app.passport_expiry_date.split("T")[0]
                : undefined,
              occupation: app.occupation ? app.occupation.trim() : undefined
            }))
          }
        }).unwrap();

        toast.success(
          locale === "id"
            ? "Data pengajuan visa berhasil disimpan!"
            : "Visa application details saved successfully!"
        );

        setIsConfirmModalOpen(false);

        // 3. Direct to Payment Page
        router.push(
          `/${locale}/payments?order_id=${bookDocumentVisaIdParam}&type=document-visa`
        );
      } catch (err: any) {
        console.error("Save visa order details failed:", err);
        const errMsg =
          err?.data?.message ||
          err?.message ||
          (locale === "id"
            ? "Gagal menyimpan rincian pemohon visa. Silakan periksa kembali formulir."
            : "Failed to save visa applicant details. Please check the form.");
        toast.error(errMsg);
      }
    }
  });

  const handleOpenConfirmModal = async () => {
    // Touch booker fields and all applicants fields
    const touchedApplicants = formik.values.applicants.map(() => ({
      full_name: true,
      gender: true,
      nationality: true,
      passport_number: true,
      birth_date: true,
      birth_place: true,
      passport_issue_date: true,
      passport_expiry_date: true,
      occupation: true
    }));

    formik.setTouched({
      booker: { name: true, email: true, phone: true },
      applicants: touchedApplicants
    });

    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      let firstErrorMessage =
        locale === "id"
          ? "Mohon lengkapi seluruh data yang wajib diisi."
          : "Please complete all required fields.";

      if (errors.booker && typeof errors.booker === "object") {
        firstErrorMessage = Object.values(errors.booker)[0] as string;
      } else if (errors.applicants && Array.isArray(errors.applicants)) {
        const firstAppError = errors.applicants.find(Boolean);
        if (firstAppError && typeof firstAppError === "object") {
          firstErrorMessage = Object.values(firstAppError)[0] as string;
        }
      }
      toast.error(firstErrorMessage);
      return;
    }

    setIsMobileSummaryOpen(false);
    setIsConfirmModalOpen(true);
  };

  // Automatically prefill account data if booker empty and user logged in
  useEffect(() => {
    if (
      !formik.values.booker.name &&
      accountData.name &&
      accountData.email &&
      !useAccountData
    ) {
      setUseAccountData(true);
      formik.setFieldValue("booker.name", accountData.name);
      formik.setFieldValue("booker.email", accountData.email);
      formik.setFieldValue("booker.phone", accountData.phone);
    }
  }, [accountData, formik.values.booker.name, useAccountData]);

  const renderSummaryContent = (isDrawer = false) => {
    const pkgName = selectedPackage ? getLocalizedText(selectedPackage.name, locale) : "Standard";
    return (
      <div className="space-y-4">
        {/* Visa Preview Card */}
        <div className="flex gap-3.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
            <ImageWithFallback
              src={thumbnail}
              alt={visaTitle}
              fill
              className="object-cover"
              fallbackSrc="/images/placeholder.jpg"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{visaTitle}</h4>
            <div className="mt-1 flex items-center gap-1 text-slate-600 text-[11px]">
              <Icon name="MapPin" className="h-3 w-3 text-red-500 shrink-0" />
              <span className="truncate">{countryName}</span>
            </div>
            {selectedPackage?.processing_time_days && (
              <div className="mt-1 flex items-center gap-1 text-slate-500 text-[10px]">
                <Icon name="Clock" className="h-3 w-3 text-blue-600 shrink-0" />
                <span>
                  {locale === "id"
                    ? `${selectedPackage.processing_time_days} Hari Kerja`
                    : `${selectedPackage.processing_time_days} Business Days`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Travel Date Pill */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-medium">
              {locale === "id" ? "Tanggal Keberangkatan:" : "Target Travel Date:"}
            </span>
            <span className="font-bold text-slate-800">{travelDateText}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-100">
            <span className="font-medium">
              {locale === "id" ? "Paket Layanan:" : "Selected Package:"}
            </span>
            <span className="font-bold text-blue-700">{pkgName}</span>
          </div>
        </div>

        {/* Applicants Breakdown */}
        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {locale === "id"
              ? `Jumlah Pemohon (${applicantCount} Orang)`
              : `Applicants Quantity (${applicantCount} Persons)`}
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span className="truncate max-w-[180px]">
                {applicantCount}x {pkgName}
              </span>
              <span className="font-semibold text-slate-800 shrink-0">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>
              {locale === "id" ? "Biaya Paket x Pemohon" : "Package Price x Qty"}
            </span>
            <span className="font-semibold text-slate-800">
              {formatPrice(unitPrice)} x {applicantCount}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>
              {locale === "id" ? "Verifikasi & Audit Dokumen" : "Document Audit & Check"}
            </span>
            <span className="font-bold text-emerald-600">
              {locale === "id" ? "Gratis" : "Included"}
            </span>
          </div>

          <div className="flex items-baseline justify-between border-t border-slate-200 pt-2.5">
            <span className="text-xs font-bold text-slate-900">
              {locale === "id" ? "Total Pembayaran" : "Total Payment"}
            </span>
            <span className="text-lg font-extrabold text-blue-600">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>

        {/* Action Button on Desktop Sidebar */}
        {!isDrawer && (
          <>
            <button
              type="button"
              onClick={handleOpenConfirmModal}
              disabled={isUpdating}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50">
              {isUpdating ? (
                <>
                  <Icon name="Loader2" className="h-3.5 w-3.5 animate-spin" />
                  <span>
                    {locale === "id" ? "Menyimpan Data..." : "Saving Details..."}
                  </span>
                </>
              ) : (
                <>
                  <Icon name="CreditCard" className="h-4 w-4" />
                  <span>
                    {locale === "id"
                      ? "Lanjut ke Pembayaran"
                      : "Proceed to Payment"}
                  </span>
                </>
              )}
            </button>

            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
              <Icon name="ShieldCheck" className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                {locale === "id"
                  ? "Verifikasi & Transaksi Aman 100%"
                  : "100% Secure & Verified Transaction"}
              </span>
            </div>
          </>
        )}
      </div>
    );
  };

  if (!isMounted || (isLoadingBooking && !bookingData && !sessionDraft)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">
            {locale === "id" ? "Memuat data pesanan visa..." : "Loading visa order..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 lg:pb-16">
      {/* ─── Top Header Bar ───────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4 sm:py-5 max-w-7xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 active:scale-95">
              <Icon name="ChevronLeft" className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                {isPassportService
                  ? locale === "id"
                    ? "Lengkapi Data Pemesan & Pemohon Paspor"
                    : "Complete Booker & Passport Applicant Details"
                  : isGeneralDocument
                  ? locale === "id"
                    ? "Lengkapi Data Pemesan & Pemilik Dokumen"
                    : "Complete Booker & Document Details"
                  : locale === "id"
                  ? "Lengkapi Data Pemesan & Pemohon Visa"
                  : "Complete Booker & Visa Applicant Details"}
              </h1>
              <p className="text-xs text-slate-500">
                {isPassportNew
                  ? locale === "id"
                    ? "Pastikan identitas sesuai e-KTP / Akta Kelahiran yang berlaku"
                    : "Please ensure all details match your official ID / Birth Certificate"
                  : isPassportRenewal
                  ? locale === "id"
                    ? "Pastikan identitas sesuai dokumen paspor lama Anda"
                    : "Please ensure all details match your current passport"
                  : isGeneralDocument
                  ? locale === "id"
                    ? "Pastikan identitas sesuai dokumen resmi yang akan diproses"
                    : "Please ensure details match the official documents to be processed"
                  : locale === "id"
                  ? "Pastikan identitas sesuai dokumen paspor resmi yang berlaku"
                  : "Please ensure all details match the official valid passports"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 max-w-7xl">
        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* ══════════════════════════════════════════════════════════
                LEFT COLUMN (8 cols)
               ══════════════════════════════════════════════════════════ */}
            <div className="space-y-6 lg:col-span-8">
              {/* Notice Banner */}
              <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p className="text-xs leading-relaxed text-blue-900 font-normal">
                  <span className="font-bold">
                    {locale === "id" ? "Penting: " : "Important: "}
                  </span>
                  {locale === "id"
                    ? `Anda mengajukan visa untuk ${applicantCount} pemohon. Lengkapi formulir di bawah ini dengan nama lengkap, nomor paspor, dan tanggal lahir sesuai buku paspor pemohon.`
                    : `You are applying for ${applicantCount} applicant(s). Please fill out all full names, passport numbers, and dates accurately as shown on their passports.`}
                </p>
              </div>

              {/* ── 1. DATA PEMESAN (BOOKER) ── */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 shrink-0">
                      <Icon name="UserCircle" className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        {locale === "id" ? "Data Pemesan (Kontak Utama)" : "Booker Contact Details"}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {locale === "id"
                          ? "Informasi ini digunakan untuk konfirmasi & penerimaan dokumen"
                          : "This contact will receive all updates and visa documents"}
                      </p>
                    </div>
                  </div>

                  {/* Booker Quick Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBookerModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95">
                      <Icon name="BookUser" className="h-3.5 w-3.5" />
                      <span>{locale === "id" ? "Pilih Pemesan" : "Select Booker"}</span>
                    </button>

                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (accountData.name || accountData.email || accountData.phone) {
                            setUseAccountData(true);
                            formik.setFieldValue("booker.name", accountData.name);
                            formik.setFieldValue("booker.email", accountData.email);
                            formik.setFieldValue("booker.phone", accountData.phone);
                          } else {
                            toast.info(
                              locale === "id"
                                ? "Data profil akun belum tersedia"
                                : "No profile data found in account"
                            );
                          }
                        }}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all ${
                          useAccountData
                            ? "bg-white text-emerald-700 shadow-2xs"
                            : "text-slate-500 hover:text-slate-700"
                        }`}>
                        <Icon name="UserCheck" className="h-3.5 w-3.5" />
                        <span>{locale === "id" ? "Dari Akun" : "From Account"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUseAccountData(false);
                          formik.setFieldValue("booker.name", "");
                          formik.setFieldValue("booker.email", "");
                          formik.setFieldValue("booker.phone", "");
                        }}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all ${
                          !useAccountData
                            ? "bg-white text-blue-700 shadow-2xs"
                            : "text-slate-500 hover:text-slate-700"
                        }`}>
                        <Icon name="UserPlus" className="h-3.5 w-3.5" />
                        <span>{locale === "id" ? "Data Baru" : "New Contact"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-4 sm:px-6 py-5 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="booker.name" className="text-xs font-semibold text-slate-700">
                        {locale === "id" ? "Nama Pemesan" : "Booker Full Name"}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="booker.name"
                        name="booker.name"
                        placeholder={locale === "id" ? "Contoh: Budi Santoso" : "e.g. John Doe"}
                        className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                        value={formik.values.booker.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.errors.booker?.name && formik.touched.booker?.name && (
                        <p className="mt-1 text-xs text-red-500">{formik.errors.booker.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="booker.email" className="text-xs font-semibold text-slate-700">
                        {locale === "id" ? "Email Kontak" : "Email Address"}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1.5">
                        <Icon name="Mail" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="booker.email"
                          name="booker.email"
                          type="email"
                          placeholder="name@email.com"
                          className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                          value={formik.values.booker.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      {formik.errors.booker?.email && formik.touched.booker?.email && (
                        <p className="mt-1 text-xs text-red-500">{formik.errors.booker.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="booker.phone" className="text-xs font-semibold text-slate-700">
                        {locale === "id" ? "Nomor WhatsApp / HP" : "WhatsApp / Phone Number"}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1.5">
                        <Icon name="Phone" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="booker.phone"
                          name="booker.phone"
                          type="tel"
                          inputMode="numeric"
                          placeholder="081234567890"
                          className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                          value={formik.values.booker.phone}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            formik.setFieldValue("booker.phone", digits);
                          }}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      {formik.errors.booker?.phone && formik.touched.booker?.phone && (
                        <p className="mt-1 text-xs text-red-500">{formik.errors.booker.phone}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="note" className="text-xs font-semibold text-slate-700">
                        {locale === "id"
                          ? "Catatan Tambahan untuk Petugas Visa (Opsional)"
                          : "Additional Notes or Inquiries for Visa Officer (Optional)"}
                      </Label>
                      <textarea
                        id="note"
                        name="note"
                        rows={3}
                        placeholder={
                          locale === "id"
                            ? "Tuliskan catatan khusus atau preferensi terkait pengajuan berkas..."
                            : "Add any special instructions or travel itinerary notes..."
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-100 focus:outline-none"
                        value={formik.values.note || ""}
                        onChange={formik.handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2. DATA PEMOHON VISA / DOKUMEN (APPLICANTS) ── */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 sm:px-6 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 shrink-0">
                    <Icon
                      name={isPassportService ? "BookOpen" : isGeneralDocument ? "FileCheck" : "Users"}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      {isPassportService
                        ? locale === "id"
                          ? "Data Pemohon Paspor"
                          : "Passport Applicant Information"
                        : isGeneralDocument
                        ? locale === "id"
                          ? "Data Pemohon / Pemilik Dokumen"
                          : "Document Applicant Information"
                        : locale === "id"
                        ? "Data Pemohon Visa"
                        : "Visa Applicants Information"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isPassportService
                        ? locale === "id"
                          ? `Diisi lengkap sesuai ${applicantCount} pemohon paspor yang didaftarkan`
                          : `Complete details for all ${applicantCount} passport applicant(s)`
                        : isGeneralDocument
                        ? locale === "id"
                          ? `Diisi lengkap sesuai ${applicantCount} pemohon / pemilik berkas`
                          : `Complete details for all ${applicantCount} applicant(s)`
                        : locale === "id"
                        ? `Diisi lengkap sesuai ${applicantCount} pemohon yang didaftarkan`
                        : `Complete details for all ${applicantCount} applicant(s)`}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {formik.values.applicants.map((applicant, index) => {
                    const applicantErrors = (formik.errors.applicants?.[index] || {}) as any;
                    const applicantTouched = (formik.touched.applicants?.[index] || {}) as any;

                    return (
                      <div key={index} className="px-4 sm:px-6 py-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-2xs">
                              {index + 1}
                            </div>
                            <span className="text-xs font-bold text-slate-800">
                              {isPassportService
                                ? locale === "id"
                                  ? `Pemohon Paspor ${index + 1}`
                                  : `Passport Applicant ${index + 1}`
                                : isGeneralDocument
                                ? locale === "id"
                                  ? `Pemohon / Pemilik ${index + 1}`
                                  : `Applicant / Owner ${index + 1}`
                                : locale === "id"
                                ? `Pemohon ${index + 1}`
                                : `Applicant ${index + 1}`}
                            </span>
                            {index === 0 && (
                              <span className="rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                {locale === "id" ? "Pemohon Utama" : "Primary Applicant"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Applicant Form Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {/* Salutation / Gender */}
                          <div className="sm:col-span-2">
                            <Label className="text-xs font-semibold text-slate-700 block mb-1.5">
                              {locale === "id" ? "Titel / Jenis Kelamin" : "Title / Gender"}{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <div className="inline-flex h-9 items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 gap-1">
                              {[
                                { value: "Mr", label: "Mr. (Laki-laki)" },
                                { value: "Mrs", label: "Mrs. (Perempuan)" },
                                { value: "Ms", label: "Ms. (Nona)" }
                              ].map((opt) => {
                                const isSelected =
                                  applicant.gender === opt.value ||
                                  (opt.value === "Ms" && applicant.gender === "Miss");
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      formik.setFieldValue(`applicants.${index}.gender`, opt.value);
                                    }}
                                    className={cn(
                                      "h-7 px-3 rounded-lg text-xs font-semibold transition-all",
                                      isSelected
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                                    )}>
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Full Name */}
                          <div className="sm:col-span-2">
                            <Label
                              htmlFor={`applicants.${index}.full_name`}
                              className="text-xs font-semibold text-slate-700">
                              {isPassportNew
                                ? locale === "id"
                                  ? "Nama Lengkap (Sesuai e-KTP / Akta Kelahiran)"
                                  : "Full Name (as in Official ID / Birth Certificate)"
                                : isPassportRenewal
                                ? locale === "id"
                                  ? "Nama Lengkap (Sesuai Paspor Lama)"
                                  : "Full Name (as in Current Passport)"
                                : isGeneralDocument
                                ? locale === "id"
                                  ? "Nama Lengkap Pemohon / Pemilik Dokumen"
                                  : "Full Name of Applicant / Document Owner"
                                : locale === "id"
                                ? "Nama Lengkap (Sesuai Paspor Asli)"
                                : "Full Name (as in Official Passport)"}{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`applicants.${index}.full_name`}
                              name={`applicants.${index}.full_name`}
                              placeholder={
                                locale === "id"
                                  ? "Contoh: MUHAMMAD ALI"
                                  : "e.g. JOHNATHAN SMITH"
                              }
                              className="mt-1.5 h-10 uppercase rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                              value={applicant.full_name}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            {applicantErrors.full_name && applicantTouched.full_name && (
                              <p className="mt-1 text-xs text-red-500">
                                {applicantErrors.full_name}
                              </p>
                            )}
                          </div>

                          {/* Passport Number / NIK */}
                          <div>
                            <Label
                              htmlFor={`applicants.${index}.passport_number`}
                              className="text-xs font-semibold text-slate-700">
                              {isPassportNew
                                ? locale === "id"
                                  ? "Nomor NIK / KTP"
                                  : "National ID Number (NIK)"
                                : isPassportRenewal
                                ? locale === "id"
                                  ? "Nomor Paspor Lama"
                                  : "Current / Old Passport Number"
                                : isGeneralDocument
                                ? locale === "id"
                                  ? "Nomor Identitas / Paspor (Opsional)"
                                  : "ID / Passport Number (Optional)"
                                : locale === "id"
                                ? "Nomor Paspor"
                                : "Passport Number"}{" "}
                              {!isGeneralDocument && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                              id={`applicants.${index}.passport_number`}
                              name={`applicants.${index}.passport_number`}
                              placeholder={
                                isPassportNew
                                  ? "3171xxxxxxxxxxxx"
                                  : isPassportRenewal
                                  ? "C1234567"
                                  : isGeneralDocument
                                  ? "3171xxxxxxxxxxxx / C1234567"
                                  : "C1234567"
                              }
                              className="mt-1.5 h-10 uppercase rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                              value={applicant.passport_number}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            {applicantErrors.passport_number && applicantTouched.passport_number && (
                              <p className="mt-1 text-xs text-red-500">
                                {applicantErrors.passport_number}
                              </p>
                            )}
                            {isPassportNew && (
                              <p className="mt-1 text-[10px] text-slate-400">
                                {locale === "id"
                                  ? "NIK diperlukan untuk verifikasi & pendaftaran antrean paspor baru"
                                  : "National ID is required for new passport appointment"}
                              </p>
                            )}
                          </div>

                          {/* Nationality */}
                          <div>
                            <Label
                              htmlFor={`applicants.${index}.nationality`}
                              className="text-xs font-semibold text-slate-700">
                              {locale === "id" ? "Kewarganegaraan" : "Nationality"}{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`applicants.${index}.nationality`}
                              name={`applicants.${index}.nationality`}
                              placeholder="Indonesia"
                              className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                              value={applicant.nationality}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            {applicantErrors.nationality && applicantTouched.nationality && (
                              <p className="mt-1 text-xs text-red-500">
                                {applicantErrors.nationality}
                              </p>
                            )}
                          </div>

                          {/* Birth Date */}
                          <div>
                            <Label
                              htmlFor={`applicants.${index}.birth_date`}
                              className="text-xs font-semibold text-slate-700">
                              {isPassportNew
                                ? locale === "id"
                                  ? "Tanggal Lahir (Sesuai Akta / KTP)"
                                  : "Date of Birth (as in ID / Certificate)"
                                : locale === "id"
                                ? "Tanggal Lahir"
                                : "Date of Birth"}{" "}
                              {isPassportNew && <span className="text-red-500">*</span>}
                            </Label>
                            <DatePicker
                              date={parseDateString(applicant.birth_date)}
                              setDate={(selectedDate) => {
                                formik.setFieldValue(
                                  `applicants.${index}.birth_date`,
                                  selectedDate ? formatDateToYYYYMMDD(selectedDate) : ""
                                );
                                formik.setFieldTouched(`applicants.${index}.birth_date`, true, true);
                              }}
                              placeholder={locale === "id" ? "Pilih tanggal lahir" : "Select date of birth"}
                              captionLayout="dropdown"
                              startMonth={new Date(1920, 0)}
                              endMonth={new Date()}
                              defaultMonth={parseDateString(applicant.birth_date) || new Date(2000, 0)}
                              reverseYears={true}
                              disabled={(d) => d > new Date() || d < new Date(1910, 0, 1)}
                              dateFormat="dd MMM yyyy"
                              className="mt-1.5 h-10 w-full justify-start rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm font-normal text-slate-800 hover:bg-slate-100/70"
                            />
                            {applicantErrors.birth_date && applicantTouched.birth_date && (
                              <p className="mt-1 text-xs text-red-500">
                                {applicantErrors.birth_date}
                              </p>
                            )}
                          </div>

                          {/* Birth Place */}
                          <div>
                            <Label
                              htmlFor={`applicants.${index}.birth_place`}
                              className="text-xs font-semibold text-slate-700">
                              {isPassportNew
                                ? locale === "id"
                                  ? "Tempat Lahir (Sesuai Akta / KTP)"
                                  : "Place of Birth (as in ID / Certificate)"
                                : locale === "id"
                                ? "Tempat Lahir"
                                : "Place of Birth"}{" "}
                              {isPassportNew && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                              id={`applicants.${index}.birth_place`}
                              name={`applicants.${index}.birth_place`}
                              placeholder={locale === "id" ? "Contoh: Jakarta" : "e.g. Istanbul"}
                              className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                              value={applicant.birth_place || ""}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            {applicantErrors.birth_place && applicantTouched.birth_place && (
                              <p className="mt-1 text-xs text-red-500">
                                {applicantErrors.birth_place}
                              </p>
                            )}
                          </div>

                          {/* Passport Expiry Date - only shown for Visa or Passport Renewal */}
                          {(isVisaService || isPassportRenewal) && (
                            <div>
                              <Label
                                htmlFor={`applicants.${index}.passport_expiry_date`}
                                className="text-xs font-semibold text-slate-700">
                                {isPassportRenewal
                                  ? locale === "id"
                                    ? "Masa Berlaku Paspor Lama"
                                    : "Old Passport Expiry Date"
                                  : locale === "id"
                                  ? "Masa Berlaku Paspor"
                                  : "Passport Expiry Date"}
                              </Label>
                              <DatePicker
                                date={parseDateString(applicant.passport_expiry_date)}
                                setDate={(selectedDate) => {
                                  formik.setFieldValue(
                                    `applicants.${index}.passport_expiry_date`,
                                    selectedDate ? formatDateToYYYYMMDD(selectedDate) : ""
                                  );
                                  formik.setFieldTouched(`applicants.${index}.passport_expiry_date`, true, true);
                                }}
                                placeholder={locale === "id" ? "Pilih masa berlaku" : "Select expiry date"}
                                captionLayout="dropdown"
                                startMonth={new Date(new Date().getFullYear() - 5, 0)}
                                endMonth={new Date(new Date().getFullYear() + 25, 11)}
                                defaultMonth={
                                  parseDateString(applicant.passport_expiry_date) ||
                                  new Date(new Date().getFullYear() + 5, new Date().getMonth())
                                }
                                dateFormat="dd MMM yyyy"
                                className="mt-1.5 h-10 w-full justify-start rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm font-normal text-slate-800 hover:bg-slate-100/70"
                              />
                            </div>
                          )}

                          {/* Occupation */}
                          <div className={!isVisaService && !isPassportRenewal ? "sm:col-span-2" : ""}>
                            <Label
                              htmlFor={`applicants.${index}.occupation`}
                              className="text-xs font-semibold text-slate-700">
                              {locale === "id" ? "Pekerjaan / Jabatan" : "Occupation"}
                            </Label>
                            <Input
                              id={`applicants.${index}.occupation`}
                              name={`applicants.${index}.occupation`}
                              placeholder={locale === "id" ? "Contoh: Karyawan Swasta" : "e.g. Engineer"}
                              className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                              value={applicant.occupation || ""}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                RIGHT COLUMN (4 cols) — Sticky Summary on Desktop
               ══════════════════════════════════════════════════════════ */}
            <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-4">
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 mb-4">
                  {locale === "id" ? "Ringkasan Pengajuan" : "Application Summary"}
                </h3>
                {renderSummaryContent(false)}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ── Fixed Mobile Bottom Bar & Summary Drawer ───────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white px-4 py-3 shadow-lg lg:hidden">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
              {locale === "id" ? "Total Bayar" : "Total Fee"}
            </span>
            <span className="text-base font-extrabold text-blue-600">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileSummaryOpen(true)}
              className="flex h-11 px-3 items-center justify-center rounded-xl border border-slate-200 text-xs font-bold text-slate-700 active:scale-95">
              <Icon name="FileText" className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleOpenConfirmModal}
              disabled={isUpdating}
              className="flex-1 flex h-11 px-5 items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-600/25 active:scale-95 disabled:opacity-50">
              {isUpdating ? (
                <>
                  <Icon name="Loader2" className="h-3.5 w-3.5 animate-spin" />
                  <span>{locale === "id" ? "Menyimpan..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Icon name="CreditCard" className="h-4 w-4" />
                  <span>{locale === "id" ? "Lanjut Bayar" : "Pay Now"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Summary Drawer */}
      <Drawer open={isMobileSummaryOpen} onOpenChange={setIsMobileSummaryOpen}>
        <DrawerContent className="p-4 max-h-[85vh] overflow-y-auto">
          <DrawerHeader className="px-0 pb-3">
            <DrawerTitle className="text-sm font-bold text-slate-900">
              {locale === "id" ? "Rincian Biaya Visa" : "Visa Fee Breakdown"}
            </DrawerTitle>
          </DrawerHeader>
          {renderSummaryContent(true)}
        </DrawerContent>
      </Drawer>

      {/* Booker Selection Modal */}
      <BookerListModal
        open={isBookerModalOpen}
        onClose={() => setIsBookerModalOpen(false)}
        onSelect={(booker: { name: string; email: string; phone: string }) => {
          formik.setFieldValue("booker.name", booker.name);
          formik.setFieldValue("booker.email", booker.email);
          formik.setFieldValue("booker.phone", booker.phone);
          setUseAccountData(false);
          setIsBookerModalOpen(false);
        }}
      />

      {/* Confirmation Modal before Payment */}
      <ConfirmDocumentVisaModal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => formik.handleSubmit()}
        isSubmitting={isUpdating}
        values={formik.values}
        serviceTitle={visaTitle}
        countryName={countryName}
        packageName={selectedPackage ? getLocalizedText(selectedPackage.name, locale) : "Standard"}
        processingTime={selectedPackage?.processing_time_days}
        targetTravelDate={formik.values.target_travel_date}
        totalPriceFormatted={formatPrice(totalPrice)}
        totalApplicants={applicantCount}
        locale={locale}
        isPassportService={isPassportService}
        isPassportRenewal={isPassportRenewal}
        isPassportNew={isPassportNew}
        isVisaService={isVisaService}
        isGeneralDocument={isGeneralDocument}
      />
    </div>
  );
};
