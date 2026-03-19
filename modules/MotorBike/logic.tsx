"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  useFindAllMotorsQuery,
  useFindAllMereksQuery
} from "@/store/services/motor.service";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

export const useMotorBikePageLogic = () => {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Common");
  const currentCurrency = useSelector((state: any) => state.currency);

  const [activePromoFilter, setActivePromoFilter] = useState("Terbaru");
  const [activeCategory, setActiveCategory] = useState<string>("Semua Merek");
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch motor data from API
  const { data: motorResponse, isLoading: isLoadingMotors } = useFindAllMotorsQuery();
  const { data: merekResponse, isLoading: isLoadingMereks } = useFindAllMereksQuery();
  const motors = motorResponse?.data || [];

  const apiMereks = merekResponse?.data || [];
  const categories = isLoadingMereks
    ? Array(10).fill({ name: "Loading...", icon: "Loader2", tag: "", color: "" })
    : [
        { name: "Semua Merek", icon: "LayoutGrid", tag: "", color: "" },
        ...apiMereks.map((cat: any) => ({
          name: cat.name_merek,
          icon: "Bike", // Default icon for all motor brands
          tag: "",
          color: ""
        }))
      ].slice(0, 10);

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

  const filteredMotors = motors.filter((item: any) => {
    const categoryMatch =
      activeCategory === "Semua Merek"
        ? true
        : item.merek?.name_merek === activeCategory;
    const locationMatch = locationFilter
      ? item.state?.name?.toLowerCase().includes(locationFilter.toLowerCase())
      : true;
    return categoryMatch && locationMatch;
  });

  return {
    isMobile,
    locale,
    router,
    t,
    currentCurrency,
    activePromoFilter,
    setActivePromoFilter,
    activeCategory,
    setActiveCategory,
    isDrawerOpen,
    setIsDrawerOpen,
    isModalOpen,
    setIsModalOpen,
    locationFilter,
    setLocationFilter,
    motors,
    categories,
    isLoading: isLoadingMotors || isLoadingMereks,
    formatPrice,
    filteredMotors
  };
};
