"use client";

import { useCreateBookMotorMutation } from "@/store/services/book-motor.service";
import { useFindMotorByIdQuery } from "@/store/services/motor.service";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export const useMotorDetailLogic = () => {
  const params = useParams();
  const id = params.id as string;
  const locale = useLocale();
  const t = useTranslations("MotorBike");
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16000 }
  );
  const isLoggedIn = useSelector((state: any) => state.auth?.isLoggedIn || false);
  const router = useRouter();

  const { data: response, isLoading } = useFindMotorByIdQuery(id, {
    skip: !id
  });

  const [createBookMotor, { isLoading: isBooking }] = useCreateBookMotorMutation();

  const motor = response?.data;
  const translation =
    motor?.translations?.find((tr: any) => tr.language_code === locale) ||
    motor?.translations?.find((tr: any) => tr.language_code === "en") ||
    motor?.translations?.[0];

  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);
  const [rentalDuration, setRentalDuration] = useState<number>(2);
  const [isSaved, setIsSaved] = useState(false);

  // Auth guard: redirect to login if not authenticated
  const handleBookingGuard = () => {
    if (!isLoggedIn) {
      toast.error(
        t("loginToBook") ||
          (locale === "id"
            ? "Silakan login terlebih dahulu untuk melanjutkan pemesanan."
            : locale === "tr"
            ? "Rezervasyona devam etmek için lütfen önce giriş yapın."
            : "Please log in first to continue booking.")
      );
      router.push(`/${locale}/login`);
      return false;
    }
    return true;
  };

  const handleRentNow = async () => {
    if (!handleBookingGuard()) return;

    const targetMotorId = motor?.id || id;
    if (!targetMotorId) return;

    const startDate = selectedStartDate || new Date();
    const endDate = new Date(startDate.getTime() + rentalDuration * 24 * 60 * 60 * 1000);

    const formatDateStr = (date: Date) => {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${d}-${m}-${y}`;
    };

    try {
      const res = await createBookMotor({
        items: [
          {
            motor_id: targetMotorId,
            qty: 1
          }
        ],
        start_date: formatDateStr(startDate),
        end_date: formatDateStr(endDate)
      }).unwrap();

      const bookingId = res.data?.id;

      toast.success(
        t("bookingCreated") ||
          (locale === "id"
            ? "Pesanan rental motor berhasil dibuat!"
            : locale === "tr"
            ? "Motosiklet rezervasyonu oluşturuldu!"
            : "Motorcycle booking created successfully!")
      );

      router.push(
        `/${locale}/orders/rent-motor?book_motor_id=${bookingId}&motor_id=${targetMotorId}&duration=${rentalDuration}`
      );
    } catch (error: any) {
      console.warn("Create book motor failed:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        (locale === "id"
          ? "Gagal memproses rental motor. Silakan coba lagi."
          : "Failed to process motor booking. Please try again.");
      toast.error(errorMessage);
    }
  };

  const toggleSave = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    toast.success(
      nextSaved
        ? t("saveSuccess") ||
            (locale === "id"
              ? "Disimpan ke favorit"
              : locale === "tr"
              ? "Favorilere eklendi"
              : "Saved to wishlist")
        : t("removeSuccess") ||
            (locale === "id"
              ? "Dihapus dari favorit"
              : locale === "tr"
              ? "Favorilerden kaldırıldı"
              : "Removed from wishlist")
    );
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareTitle =
      translation?.name_motor ||
      (locale === "id"
        ? "Detail Motor"
        : locale === "tr"
        ? "Motosiklet Detayı"
        : "Motorcycle Details");

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl
        });
        return;
      } catch {}
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast.success(
        t("linkCopied") ||
          (locale === "id"
            ? "Tautan berhasil disalin!"
            : locale === "tr"
            ? "Bağlantı panoya kopyalandı!"
            : "Link copied to clipboard!")
      );
    }
  };

  // Get prices with fallback
  const prices = motor?.motor_prices || motor?.prices || [];
  const dailyPrice = prices.find((p: any) => p.price_type === "daily");
  const weeklyPrice = prices.find((p: any) => p.price_type === "weekly");
  const rawDailyPrice = dailyPrice ? parseFloat(String(dailyPrice.price)) : 0;
  const rawWeeklyPrice = weeklyPrice ? parseFloat(String(weeklyPrice.price)) : 0;

  const formatPrice = (rawPrice: number) => {
    let displayPrice = Number(rawPrice || 0);
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

  const getGalleryImages = () => {
    if (!motor) return [];
    const images: string[] = [];
    if (motor.thumbnail) images.push(motor.thumbnail);
    return images;
  };

  const weeks = Math.floor(rentalDuration / 7);
  const remainingDays = rentalDuration % 7;
  const isWeeklyRateApplicable = rentalDuration >= 7 && rawWeeklyPrice > 0;

  const estimatedTotalPrice = isWeeklyRateApplicable
    ? weeks * rawWeeklyPrice + remainingDays * rawDailyPrice
    : rentalDuration * rawDailyPrice;

  return {
    motor,
    translation,
    isLoading,
    isBooking,
    isLoggedIn,
    formatPrice,
    handleRentNow,
    openBookingDrawer: handleRentNow,
    selectedStartDate,
    setSelectedStartDate,
    selectedEndDate,
    setSelectedEndDate,
    rentalDuration,
    setRentalDuration,
    estimatedTotalPrice,
    isWeeklyRateApplicable,
    rawDailyPrice,
    rawWeeklyPrice,
    galleryImages: getGalleryImages(),
    isSaved,
    toggleSave,
    handleShare,
    locale,
    t
  };
};
