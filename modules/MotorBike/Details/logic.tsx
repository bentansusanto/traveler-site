"use client";

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
  const t = useTranslations("Common");
  const currentCurrency = useSelector((state: any) => state.currency);
  const isLoggedIn = useSelector((state: any) => state.auth?.isLoggedIn || false);
  const router = useRouter();

  const { data: response, isLoading } = useFindMotorByIdQuery(id, {
    skip: !id
  });

  const motor = response?.data;
  const translation =
    motor?.translations?.find((tr: any) => tr.language_code === locale) ||
    motor?.translations?.[0];

  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);
  const [isBooking, setIsBooking] = useState(false);

  // Auth guard: redirect to login if not authenticated
  const handleBookingGuard = () => {
    if (!isLoggedIn) {
      toast.error("Silakan login terlebih dahulu untuk melanjutkan booking.");
      router.push(`/${locale}/login`);
      return false;
    }
    return true;
  };

  const openBookingDrawer = () => {
    if (!handleBookingGuard()) return;
    router.push(`/${locale}/orders/rent-motor?motor_id=${id}`);
  };

  // Get prices with fallback
  const prices = motor?.motor_prices || motor?.prices || [];
  const dailyPrice = prices.find((p: any) => p.price_type === "daily");
  const weeklyPrice = prices.find((p: any) => p.price_type === "weekly");
  const rawDailyPrice = dailyPrice ? parseFloat(String(dailyPrice.price)) : 0;
  const rawWeeklyPrice = weeklyPrice ? parseFloat(String(weeklyPrice.price)) : 0;

  const formatPrice = (rawPrice: number) => {
    let displayPrice = rawPrice;
    if (currentCurrency.code === "USD") {
      displayPrice = rawPrice * currentCurrency.idrToUsdRate;
    }

    return new Intl.NumberFormat(currentCurrency.code === "IDR" ? "id-ID" : "en-US", {
      style: "currency",
      currency: currentCurrency.code,
      maximumFractionDigits: currentCurrency.code === "IDR" ? 0 : 2
    })
      .format(displayPrice)
      .replace("$", "US$ ");
  };

  const getGalleryImages = () => {
    if (!motor) return [];
    const images: string[] = [];
    if (motor.thumbnail) images.push(motor.thumbnail);
    return images;
  };

  return {
    motor,
    translation,
    isLoading,
    isBooking,
    setIsBooking,
    isLoggedIn,
    formatPrice,
    openBookingDrawer,
    selectedStartDate,
    setSelectedStartDate,
    selectedEndDate,
    setSelectedEndDate,
    rawDailyPrice,
    rawWeeklyPrice,
    galleryImages: getGalleryImages(),
    locale,
    t
  };
};
