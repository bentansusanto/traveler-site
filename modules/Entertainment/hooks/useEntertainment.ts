"use client";

import {
  EntertainmentAttraction,
  useFindAllAttractionsQuery,
  useFindAttractionCategoriesQuery
} from "@/store/services/entertainment-attraction.service";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { EntertainmentFilterValues } from "../schema";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export function useEntertainment() {
  const t = useTranslations("Entertainment");
  const locale = useLocale();

  // Filters State
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<EntertainmentFilterValues["sort"]>("recommended");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Ticket Selection Modal / Drawer state
  const [selectedAttraction, setSelectedAttraction] =
    useState<EntertainmentAttraction | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Currency from Redux
  const currentCurrency = useSelector((state: any) => state.currency) || {
    code: "IDR",
    idrToUsdRate: 16761
  };

  // Categories Query
  const {
    data: categoriesData,
    isLoading: isLoadingCategories
  } = useFindAttractionCategoriesQuery();

  const categories = useMemo(() => {
    return categoriesData?.data || categoriesData?.datas || [];
  }, [categoriesData]);

  // Query Params
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit
    };
    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    if (activeCategoryId && activeCategoryId !== "all") {
      params.category_id = activeCategoryId;
    }
    return params;
  }, [debouncedSearch, activeCategoryId, page, limit]);

  // Attractions Query
  const {
    data: attractionsData,
    isLoading: isLoadingAttractions,
    isFetching: isFetchingAttractions,
    refetch: refetchAttractions
  } = useFindAllAttractionsQuery(queryParams);

  // Raw Attractions
  const rawAttractions: EntertainmentAttraction[] = useMemo(() => {
    return attractionsData?.data || attractionsData?.datas || [];
  }, [attractionsData]);

  const meta = attractionsData?.meta;

  // Sort attractions client-side to ensure smooth UX
  const sortedAttractions = useMemo(() => {
    const list = [...rawAttractions];
    switch (sortBy) {
      case "price_asc":
        return list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      case "price_desc":
        return list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      case "newest":
        return list.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      case "recommended":
      default:
        return list;
    }
  }, [rawAttractions, sortBy]);

  // Format Price with active currency
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

  // Handlers
  const handleCategorySelect = useCallback((catId: string) => {
    setActiveCategoryId(catId);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((sort: EntertainmentFilterValues["sort"]) => {
    setSortBy(sort);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setActiveCategoryId("all");
    setSortBy("recommended");
    setPage(1);
  }, []);

  const handleOpenTicketModal = useCallback((attraction: EntertainmentAttraction) => {
    setSelectedAttraction(attraction);
    setIsTicketModalOpen(true);
  }, []);

  const handleCloseTicketModal = useCallback(() => {
    setIsTicketModalOpen(false);
    setSelectedAttraction(null);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeCategoryId !== "all") count++;
    if (search.trim()) count++;
    if (sortBy !== "recommended") count++;
    return count;
  }, [activeCategoryId, search, sortBy]);

  return {
    t,
    locale,
    search,
    debouncedSearch,
    activeCategoryId,
    sortBy,
    page,
    limit,
    categories,
    isLoadingCategories,
    attractions: sortedAttractions,
    meta,
    isLoading: isLoadingAttractions,
    isFetching: isFetchingAttractions,
    selectedAttraction,
    isTicketModalOpen,
    activeFilterCount,
    formatPrice,
    handleCategorySelect,
    handleSearchChange,
    handleSortChange,
    handleResetFilters,
    handleOpenTicketModal,
    handleCloseTicketModal,
    setPage,
    refetchAttractions
  };
}
