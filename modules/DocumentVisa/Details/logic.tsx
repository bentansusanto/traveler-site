"use client";

import {
  DocumentVisaItem,
  DocumentVisaPackage,
  getLocalizedText,
  useFindAllDocumentVisasQuery,
  useFindDocumentVisaByIdQuery,
  useFindDocumentVisaBySlugQuery
} from "@/store/services/document-visa.service";
import { useCreateBookDocumentVisaMutation } from "@/store/services/book-document-visa.service";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export const useDocumentVisaDetailLogic = () => {
  const params = useParams();
  const rawSlug = (params?.slug as string) || "";
  const slug = decodeURIComponent(rawSlug);
  const locale = useLocale();
  const t = useTranslations("DocumentVisa");
  const router = useRouter();

  // Redux Currency
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16000 }
  );
  const selectedCurrency = (currentCurrency?.code as "IDR" | "USD" | "TRY") || "IDR";

  // 1. Fetch by Slug
  const {
    data: slugResponse,
    isLoading: isLoadingSlug,
    error: slugError
  } = useFindDocumentVisaBySlugQuery({ slug, lang: locale }, { skip: !slug });

  const isNotFoundBySlug =
    !isLoadingSlug && (!slugResponse?.data || Boolean(slugError));

  // 2. Fallback Fetch by ID if slug not found
  const {
    data: idResponse,
    isLoading: isLoadingId
  } = useFindDocumentVisaByIdQuery(
    { id: slug, lang: locale },
    { skip: !isNotFoundBySlug }
  );

  const visa: DocumentVisaItem | undefined =
    slugResponse?.data || idResponse?.data;
  const isLoading = isLoadingSlug || (isNotFoundBySlug && isLoadingId);

  // 3. Translation
  const translation =
    visa?.translations?.find((tr) => tr.language_code === locale) ||
    visa?.translations?.find((tr) => tr.language_code === "en") ||
    visa?.translations?.[0];

  // 4. Localized text properties
  const rawTitle =
    getLocalizedText(translation?.title || visa?.title, locale) ||
    (locale === "id" ? "Layanan Pengurusan Visa" : "Visa Processing Service");
  // Remove "(Single Entry)" and "(Multiple Entry)" from the detail page title as requested by user
  const title = rawTitle.replace(/\s*\((?:Single|Multiple)\s*Entry\)/gi, "").trim();

  const description = getLocalizedText(
    translation?.description || visa?.description,
    locale
  );
  const countryName =
    getLocalizedText(visa?.country_name || (visa as any)?.country?.name, locale) ||
    "International";
  const validity =
    (visa?.validity ? getLocalizedText(visa.validity, locale) : undefined) ||
    (visa?.validity_days
      ? locale === "id"
        ? `${visa.validity_days} Hari`
        : `${visa.validity_days} Days`
      : undefined);
  const firstPkgDays = visa?.packages?.[0]?.processing_time_days || visa?.processing_time_days;
  const processingTime =
    (visa?.processing_time ? getLocalizedText(visa.processing_time, locale) : undefined) ||
    (firstPkgDays
      ? locale === "id"
        ? `${firstPkgDays} Hari Kerja`
        : `${firstPkgDays} Business Days`
      : undefined);
  const submissionProcess = getLocalizedText(
    translation?.submission_process || visa?.submission_process,
    locale
  );
  const termsConditions = getLocalizedText(
    translation?.terms_conditions || visa?.terms_conditions,
    locale
  );

  // 5. Gallery Images
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (visa?.thumbnail) list.push(visa.thumbnail);
    if (Array.isArray(visa?.images)) {
      visa.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ["/images/placeholder.jpg"];
  }, [visa]);

  // 6. Selected Package State
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");

  useEffect(() => {
    if (visa?.packages && visa.packages.length > 0) {
      if (!selectedPackageId || !visa.packages.some((p) => p.id === selectedPackageId)) {
        setSelectedPackageId(visa.packages[0].id);
      }
    }
  }, [visa, selectedPackageId]);

  const selectedPackage: DocumentVisaPackage | undefined = useMemo(() => {
    if (!visa?.packages || visa.packages.length === 0) return undefined;
    return (
      visa.packages.find((p) => p.id === selectedPackageId) || visa.packages[0]
    );
  }, [visa, selectedPackageId]);

  // 7. Price Formatting in Active Currency
  const formatPrice = useCallback(
    (rawPrice: number) => {
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
    },
    [selectedCurrency, currentCurrency]
  );

  const activePrice = selectedPackage
    ? selectedPackage.total_price
    : visa?.starting_price || 0;

  // 8. Booking Form State (Travel Date & Applicant Quantity)
  const [selectedTravelDate, setSelectedTravelDate] = useState<Date | undefined>(undefined);
  const [applicantQty, setApplicantQty] = useState<number>(1);
  const [createBooking, { isLoading: isBooking }] = useCreateBookDocumentVisaMutation();

  const totalBookingPrice = activePrice * applicantQty;

  const handleBooking = async () => {
    if (!visa?.id) {
      toast.error(locale === "id" ? "Data visa belum tersedia" : "Visa data not available");
      return;
    }
    if (!selectedPackage?.id) {
      toast.error(
        locale === "id"
          ? "Silakan pilih salah satu opsi paket visa terlebih dahulu"
          : "Please select a visa package option first"
      );
      return;
    }
    if (!selectedTravelDate) {
      toast.error(
        locale === "id"
          ? "Silakan pilih tanggal rencana perjalanan/keberangkatan terlebih dahulu"
          : "Please select your planned travel date first"
      );
      return;
    }

    try {
      const formattedDate = format(selectedTravelDate, "yyyy-MM-dd");
      const res = await createBooking({
        document_visa_id: visa.id,
        package_id: selectedPackage.id,
        target_travel_date: formattedDate,
        applicant_count: applicantQty,
        qty: applicantQty
      }).unwrap();

      const bookingId = (res as any)?.data?.id || (res as any)?.id;
      if (bookingId) {
        toast.success(
          locale === "id"
            ? "Pesanan berhasil dibuat! Mengalihkan ke pengisian data pemohon..."
            : "Booking created! Redirecting to applicant form..."
        );
        router.push(
          `/${locale}/orders/document-visa?book_document_visa_id=${bookingId}&document_visa_id=${visa.id}`
        );
      } else {
        toast.error("Gagal mendapatkan ID pesanan.");
      }
    } catch (err: any) {
      console.error("Failed to create document visa booking:", err);
      toast.error(
        err?.data?.message ||
          err?.message ||
          (locale === "id"
            ? "Gagal membuat pemesanan visa. Silakan coba lagi."
            : "Failed to book visa. Please try again.")
      );
    }
  };

  // 9. Save / Favorite state
  const [isSaved, setIsSaved] = useState(false);
  const saveKey = `favorite_visa_${visa?.id || slug}`;

  useEffect(() => {
    if (typeof window !== "undefined" && visa?.id) {
      setIsSaved(localStorage.getItem(saveKey) === "true");
    }
  }, [visa?.id, saveKey]);

  const toggleSave = useCallback(() => {
    const next = !isSaved;
    setIsSaved(next);
    if (next) {
      localStorage.setItem(saveKey, "true");
      toast.success(t("saved"));
    } else {
      localStorage.removeItem(saveKey);
    }
  }, [isSaved, saveKey, t]);

  // 10. Share action
  const handleShare = useCallback(() => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("linkCopied"));
    }
  }, [t]);

  // 11. WhatsApp Consultation URL
  const waPhone = "6281234567890"; // Pacific Travelindo official WhatsApp hotline
  const pkgNameStr = selectedPackage
    ? getLocalizedText(selectedPackage.name, locale)
    : "";
  const waText = encodeURIComponent(
    `Halo PacificTravelindo, saya ingin konsultasi dan mengajukan ${title} (${countryName})${
      pkgNameStr ? ` - Paket ${pkgNameStr}` : ""
    }. Mohon info estimasi jadwal janji temu dan persyaratan berkas lengkapnya.`
  );
  const waUrl = `https://wa.me/${waPhone}?text=${waText}`;

  // 12. Similar Visas (Related Services)
  const { data: allVisasResponse } = useFindAllDocumentVisasQuery({ lang: locale });
  const similarVisas = useMemo(() => {
    const all = allVisasResponse?.data || [];
    return all.filter((item) => item.id !== visa?.id).slice(0, 3);
  }, [allVisasResponse, visa?.id]);

  return {
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
  };
};
