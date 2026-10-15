"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  useFindAllMotorsQuery,
  useFindAllMereksQuery
} from "@/store/services/motor.service";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

export const useMotorBikePageLogic = () => {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("MotorBike");
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16000 }
  );

  const [sortBy, setSortBy] = useState<string>("latest"); // 'latest' | 'price_asc' | 'price_desc' | 'popular'
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [engineCcFilter, setEngineCcFilter] = useState<string>("all"); // 'all' | 'small' | 'medium' | 'large'
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch motor data from API
  const { data: motorResponse, isLoading: isLoadingMotors } = useFindAllMotorsQuery({
    limit: 100
  });
  const { data: merekResponse, isLoading: isLoadingMereks } = useFindAllMereksQuery();

  const motors: any[] = useMemo(() => {
    return motorResponse?.data || motorResponse?.datas || [];
  }, [motorResponse]);

  const apiMereks: any[] = useMemo(() => {
    return merekResponse?.data || merekResponse?.datas || [];
  }, [merekResponse]);

  const categories = useMemo(() => {
    if (isLoadingMereks) {
      return Array.from({ length: 6 }, (_, idx) => ({
        id: `loading-${idx}`,
        name: "Loading...",
        icon: "Bike",
        count: 0
      }));
    }

    const allCount = motors.length;
    const list = [
      {
        id: "all",
        name: t("allBrands"),
        icon: "LayoutGrid",
        count: allCount
      },
      ...apiMereks.map((cat: any) => {
        const brandCount = motors.filter(
          (m: any) =>
            m.merek?.name_merek?.toLowerCase() === cat.name_merek?.toLowerCase() ||
            m.merek_id === cat.id
        ).length;

        return {
          id: cat.name_merek,
          name: cat.name_merek,
          icon: "Bike",
          count: brandCount
        };
      })
    ];

    return list;
  }, [apiMereks, motors, isLoadingMereks, t]);

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

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== "all") count++;
    if (sortBy !== "latest") count++;
    if (availableOnly) count++;
    if (engineCcFilter !== "all") count++;
    if (locationFilter) count++;
    return count;
  }, [activeCategory, sortBy, availableOnly, engineCcFilter, locationFilter]);

  const filteredMotors = useMemo(() => {
    let list = motors.filter((item: any) => {
      // Brand filter
      const categoryMatch =
        activeCategory === "all" || activeCategory === t("allBrands")
          ? true
          : item.merek?.name_merek?.toLowerCase() === activeCategory.toLowerCase() ||
            item.merek_id === activeCategory;

      // Location filter
      const locationMatch = locationFilter
        ? (item.state?.name || item.location || "")
            .toLowerCase()
            .includes(locationFilter.toLowerCase())
        : true;

      // Availability filter
      const availabilityMatch = availableOnly ? item.is_available : true;

      // Engine CC filter
      const cc = item.engine_cc || 0;
      let engineMatch = true;
      if (engineCcFilter === "small") {
        engineMatch = cc <= 125;
      } else if (engineCcFilter === "medium") {
        engineMatch = cc > 125 && cc <= 250;
      } else if (engineCcFilter === "large") {
        engineMatch = cc > 250;
      }

      return categoryMatch && locationMatch && availabilityMatch && engineMatch;
    });

    // Helper to get daily price
    const getDailyPrice = (item: any) => {
      return parseFloat(
        item.motor_prices?.find((p: any) => p.price_type === "daily")?.price ||
          item.prices?.find((p: any) => p.price_type === "daily")?.price ||
          item.motor_prices?.[0]?.price ||
          item.price ||
          0
      );
    };

    // Sorting
    if (sortBy === "price_asc") {
      list = [...list].sort((a: any, b: any) => getDailyPrice(a) - getDailyPrice(b));
    } else if (sortBy === "price_desc") {
      list = [...list].sort((a: any, b: any) => getDailyPrice(b) - getDailyPrice(a));
    } else if (sortBy === "popular") {
      list = [...list].sort((a: any, b: any) => (b.engine_cc || 0) - (a.engine_cc || 0));
    }

    return list;
  }, [motors, activeCategory, locationFilter, availableOnly, engineCcFilter, sortBy, t]);

  const handleResetFilters = () => {
    setActiveCategory("all");
    setSortBy("latest");
    setAvailableOnly(false);
    setEngineCcFilter("all");
    setLocationFilter(null);
  };

  return {
    isMobile,
    locale,
    router,
    t,
    currentCurrency,
    sortBy,
    setSortBy,
    activeCategory,
    setActiveCategory,
    availableOnly,
    setAvailableOnly,
    engineCcFilter,
    setEngineCcFilter,
    isDrawerOpen,
    setIsDrawerOpen,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    isModalOpen,
    setIsModalOpen,
    locationFilter,
    setLocationFilter,
    motors,
    categories,
    isLoading: isLoadingMotors || isLoadingMereks,
    formatPrice,
    filteredMotors,
    activeFilterCount,
    handleResetFilters
  };
};
