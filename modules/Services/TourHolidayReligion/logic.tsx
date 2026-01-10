"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  useFindAllDestinationQuery,
  useFindCategoryDestinationsQuery
} from "@/store/services/destination.service";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

export const useDestinationPageLogic = () => {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Common");
  const currentCurrency = useSelector((state: any) => state.currency);

  const [activePromoFilter, setActivePromoFilter] = useState("Terbaru");
  const [activeCategory, setActiveCategory] = useState<string>("Semua Kategori");
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch destination data from API
  const { data: response, isLoading: isLoadingDestinations } = useFindAllDestinationQuery();
  const { data: categoryResponse, isLoading: isLoadingCategory } =
    useFindCategoryDestinationsQuery();
  const destinations = response?.data || [];

  const iconMapping: Record<string, string> = {
    culture: "Landmark",
    religion: "Church",
    traveling: "Compass",
    adventure: "Mountain",
    "semua kategori": "LayoutGrid"
  };

  const apiCategories = categoryResponse?.data || [];
  const categories = isLoadingCategory
    ? Array(10).fill({ name: "Loading...", icon: "Loader2", tag: "", color: "" })
    : [
        { name: "Semua Kategori", icon: "LayoutGrid", tag: "", color: "" },
        ...apiCategories.map((cat: any) => ({
          name: cat.name,
          icon: iconMapping[cat.name?.toLowerCase()] || "LayoutGrid",
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

  const filteredDestinations = destinations.filter((item: any) => {
    const categoryMatch =
      activeCategory === "Semua Kategori"
        ? true
        : item.category_destination_name === activeCategory;
    const locationMatch = locationFilter
      ? item.location?.toLowerCase().includes(locationFilter.toLowerCase())
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
    destinations,
    categories,
    isLoading: isLoadingDestinations || isLoadingCategory,
    formatPrice,
    filteredDestinations
  };
};
