"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  EntertainmentAttraction,
  useFindAllAttractionsQuery,
  useFindAttractionCategoriesQuery
} from "@/store/services/entertainment-attraction.service";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";

export const useEntertainmentPageLogic = () => {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Entertainment");

  const currentCurrency = useSelector(
    (state: any) =>
      state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16761 }
  );

  // Filter States
  const [sortBy, setSortBy] = useState<string>("popular"); // 'popular' | 'price_asc' | 'price_desc' | 'latest'
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [instantOnly, setInstantOnly] = useState<boolean>(false);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & Drawers States
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] =
    useState<EntertainmentAttraction | null>(null);

  // Queries
  const { data: attractionResponse, isLoading: isLoadingAttractions } =
    useFindAllAttractionsQuery({
      limit: 100
    });

  const { data: categoryResponse, isLoading: isLoadingCategories } =
    useFindAttractionCategoriesQuery();

  const attractions: EntertainmentAttraction[] = useMemo(() => {
    return attractionResponse?.data || attractionResponse?.datas || [];
  }, [attractionResponse]);

  const apiCategories = useMemo(() => {
    return categoryResponse?.data || categoryResponse?.datas || [];
  }, [categoryResponse]);

  // Categories with counts matching MotorBike pattern
  const categories = useMemo(() => {
    if (isLoadingCategories) {
      return Array.from({ length: 6 }, (_, idx) => ({
        id: `loading-${idx}`,
        name: "Loading...",
        icon: "Ticket",
        count: 0
      }));
    }

    const allCount = attractions.length;
    const list = [
      {
        id: "all",
        name: t("allBrands"),
        icon: "LayoutGrid",
        count: allCount
      },
      ...apiCategories.map((cat: any) => {
        const catCount = attractions.filter((a: any) => {
          const aCatName =
            a.category_entertainment?.name || a.category_entertainment_name;
          const aCatId =
            a.category_entertainment?.id || a.category_entertainment_id;
          return (
            aCatName?.toLowerCase() === cat.name?.toLowerCase() ||
            aCatId === cat.id
          );
        }).length;

        return {
          id: cat.id || cat.name,
          name: cat.name,
          icon: "Ticket",
          count: catCount
        };
      })
    ];

    return list;
  }, [apiCategories, attractions, isLoadingCategories, t]);

  // Currency Formatter
  const formatPrice = useCallback(
    (rawPrice: number) => {
      let displayPrice = Number(rawPrice || 0);
      if (currentCurrency.code !== "USD") {
        displayPrice = displayPrice * (currentCurrency.idrToUsdRate || 1);
      }

      const localeCode =
        currentCurrency.code === "IDR"
          ? "id-ID"
          : currentCurrency.code === "TRY"
          ? "tr-TR"
          : "en-US";

      return new Intl.NumberFormat(localeCode, {
        style: "currency",
        currency: currentCurrency.code,
        maximumFractionDigits: currentCurrency.code === "IDR" ? 0 : 2
      })
        .format(displayPrice)
        .replace("$", "US$ ");
    },
    [currentCurrency]
  );

  // Filtered & Sorted Attractions
  const filteredAttractions = useMemo(() => {
    let result = [...attractions];

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((item: any) => {
        const itemCatName =
          item.category_entertainment?.name || item.category_entertainment_name;
        const itemCatId =
          item.category_entertainment?.id || item.category_entertainment_id;
        return (
          itemCatName?.toLowerCase() === activeCategory.toLowerCase() ||
          itemCatId === activeCategory
        );
      });
    }

    // Location filter
    if (locationFilter) {
      const locTerm = locationFilter.toLowerCase();
      result = result.filter((item: any) => {
        const stateName = (item.state?.name || item.state_name || "").toLowerCase();
        const countryName = (item.country?.name || item.country_name || "").toLowerCase();
        return stateName.includes(locTerm) || countryName.includes(locTerm);
      });
    }

    // Instant confirmation only
    if (instantOnly) {
      result = result.filter((item: any) => !item.daily_quota || item.daily_quota > 0);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item: any) => {
        const translation =
          item.translations?.find((tr: any) => tr.language_code === locale) ||
          item.translations?.[0];
        const name = (translation?.name || "").toLowerCase();
        const desc = (translation?.description || "").toLowerCase();
        const cat = (
          item.category_entertainment?.name ||
          item.category_entertainment_name ||
          ""
        ).toLowerCase();
        const state = (item.state?.name || item.state_name || "").toLowerCase();
        const country = (item.country?.name || item.country_name || "").toLowerCase();

        return (
          name.includes(q) ||
          desc.includes(q) ||
          cat.includes(q) ||
          state.includes(q) ||
          country.includes(q)
        );
      });
    }

    // Sorting
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case "price_desc":
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case "latest":
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "popular":
      default:
        // Keep default order
        break;
    }

    return result;
  }, [attractions, activeCategory, locationFilter, instantOnly, searchQuery, sortBy, locale]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== "all") count++;
    if (locationFilter) count++;
    if (instantOnly) count++;
    if (searchQuery.trim()) count++;
    if (sortBy !== "popular") count++;
    return count;
  }, [activeCategory, locationFilter, instantOnly, searchQuery, sortBy]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setActiveCategory("all");
    setLocationFilter(null);
    setInstantOnly(false);
    setSearchQuery("");
    setSortBy("popular");
  }, []);

  const handleOpenTicketModal = useCallback((attraction: EntertainmentAttraction) => {
    setSelectedAttraction(attraction);
    setIsTicketModalOpen(true);
  }, []);

  const handleCloseTicketModal = useCallback(() => {
    setIsTicketModalOpen(false);
    setSelectedAttraction(null);
  }, []);

  return {
    isMobile,
    locale,
    router,
    t,
    sortBy,
    setSortBy,
    activeCategory,
    setActiveCategory,
    instantOnly,
    setInstantOnly,
    locationFilter,
    setLocationFilter,
    searchQuery,
    setSearchQuery,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    isSearchDrawerOpen,
    setIsSearchDrawerOpen,
    isSearchModalOpen,
    setIsSearchModalOpen,
    isTicketModalOpen,
    selectedAttraction,
    categories,
    isLoading: isLoadingAttractions || isLoadingCategories,
    formatPrice,
    attractions,
    filteredAttractions,
    activeFilterCount,
    handleResetFilters,
    handleOpenTicketModal,
    handleCloseTicketModal
  };
};
