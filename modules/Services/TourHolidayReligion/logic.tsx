"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  useFindAllDestinationQuery,
  useFindCategoryDestinationsQuery
} from "@/store/services/destination.service";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

export const useDestinationPageLogic = () => {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("TourHoliday");
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16000 }
  );

  const [sortBy, setSortBy] = useState<string>("latest"); // 'latest' | 'price_asc' | 'price_desc' | 'popular'
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch destination data from API
  const { data: response, isLoading: isLoadingDestinations } = useFindAllDestinationQuery();
  const { data: categoryResponse, isLoading: isLoadingCategory } =
    useFindCategoryDestinationsQuery();
  
  const destinations: any[] = useMemo(() => {
    return (response as any)?.data || (response as any)?.datas || [];
  }, [response]);

  const apiCategories: any[] = useMemo(() => {
    return (categoryResponse as any)?.data || (categoryResponse as any)?.datas || [];
  }, [categoryResponse]);

  const categories = useMemo(() => {
    if (isLoadingCategory) {
      return Array.from({ length: 5 }, (_, idx) => ({
        id: `loading-${idx}`,
        name: "Loading...",
        icon: "Compass",
        count: 0
      }));
    }

    const allCount = destinations.length;
    const list = [
      {
        id: "all",
        name: t("allCategories"),
        icon: "LayoutGrid",
        count: allCount
      },
      ...apiCategories.map((cat: any) => {
        const catName = cat.name || cat.category_destination_name || "";
        const count = destinations.filter(
          (d: any) =>
            d.category_destination_name?.toLowerCase() === catName.toLowerCase() ||
            d.category_destination_id === cat.id ||
            d.category_id === cat.id
        ).length;

        let iconName = "Compass";
        const lower = catName.toLowerCase();
        if (lower.includes("religi") || lower.includes("religion") || lower.includes("church")) {
          iconName = "Church";
        } else if (lower.includes("culture") || lower.includes("budaya") || lower.includes("heritage")) {
          iconName = "Landmark";
        } else if (lower.includes("adventure") || lower.includes("petualang") || lower.includes("mountain")) {
          iconName = "Mountain";
        } else if (lower.includes("travel") || lower.includes("wisata")) {
          iconName = "Compass";
        }

        return {
          id: catName,
          name: catName,
          icon: iconName,
          count: count
        };
      })
    ];

    return list;
  }, [apiCategories, destinations, isLoadingCategory, t]);

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
    if (locationFilter) count++;
    return count;
  }, [activeCategory, sortBy, locationFilter]);

  const filteredDestinations = useMemo(() => {
    let list = destinations.filter((item: any) => {
      const categoryMatch =
        activeCategory === "all" || activeCategory === t("allCategories")
          ? true
          : item.category_destination_name?.toLowerCase() === activeCategory.toLowerCase() ||
            item.category_destination_id === activeCategory;

      const locationMatch = locationFilter
        ? (item.location || item.city_name || item.state?.name || "")
            .toLowerCase()
            .includes(locationFilter.toLowerCase())
        : true;

      return categoryMatch && locationMatch;
    });

    // Sorting
    if (sortBy === "price_asc") {
      list = [...list].sort((a: any, b: any) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (sortBy === "price_desc") {
      list = [...list].sort((a: any, b: any) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (sortBy === "popular") {
      list = [...list].sort((a: any, b: any) => (b.rating || 4.9) - (a.rating || 4.9));
    } else {
      // Default: Latest
      list = [...list].sort((a: any, b: any) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
    }

    return list;
  }, [destinations, activeCategory, locationFilter, sortBy, t]);

  const handleResetFilters = () => {
    setActiveCategory("all");
    setSortBy("latest");
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
    isDrawerOpen,
    setIsDrawerOpen,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    isModalOpen,
    setIsModalOpen,
    locationFilter,
    setLocationFilter,
    destinations,
    categories,
    isLoading: isLoadingDestinations || isLoadingCategory,
    formatPrice,
    filteredDestinations,
    activeFilterCount,
    handleResetFilters
  };
};
