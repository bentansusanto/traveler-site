"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  DocumentVisaItem,
  getLocalizedText,
  useFindAllDocumentVisasQuery,
  useFindDocumentVisaCategoriesQuery
} from "@/store/services/document-visa.service";

export const useDocumentVisa = () => {
  const locale = useLocale();
  const t = useTranslations("DocumentVisa");

  // Redux currency
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16000 }
  );
  const selectedCurrency = (currentCurrency?.code as "IDR" | "USD" | "TRY") || "IDR";

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [visaTypeFilter, setVisaTypeFilter] = useState("all");
  const [entryTypeFilter, setEntryTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular"); // popular | price_asc | price_desc | fastest

  // Drawer / Modal States
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Queries
  const { data: visasResponse, isLoading, refetch } = useFindAllDocumentVisasQuery({
    lang: locale
  });
  const { data: categoriesResponse, isLoading: isLoadingCategories } =
    useFindDocumentVisaCategoriesQuery();

  const visas = visasResponse?.data || [];
  const apiCategories = categoriesResponse?.data || [];

  // Compute dynamic categories list from API with live service count
  const categories = useMemo(() => {
    const allCategory = {
      id: "all",
      slug: "all",
      name: t("allCategories"),
      iconName: "LayoutGrid",
      count: visas.length
    };

    if (!apiCategories || apiCategories.length === 0) {
      const defaultCats = [
        { id: "cat_tourist", slug: "tourist-visa", name: t("touristVisa"), iconName: "Compass" },
        { id: "cat_business", slug: "business-visa", name: t("businessVisa"), iconName: "FileCheck2" },
        { id: "cat_umrah", slug: "umrah-visa", name: t("umrahVisa"), iconName: "Sparkles" },
        { id: "cat_study", slug: "study-visa", name: t("studyVisa"), iconName: "GraduationCap" },
        { id: "cat_passport", slug: "passport-services", name: t("passportService"), iconName: "Globe" }
      ];

      const mappedDefaults = defaultCats.map((cat) => {
        const count = visas.filter((v) => {
          if (cat.id === "cat_tourist") return v.visa_type === "tourist";
          if (cat.id === "cat_business") return v.visa_type === "business";
          if (cat.id === "cat_umrah") return v.visa_type === "umrah_hajj";
          if (cat.id === "cat_study") return v.visa_type === "study";
          if (cat.id === "cat_passport") return v.visa_type === "passport_new" || v.visa_type === "passport_renewal";
          return false;
        }).length;
        return { ...cat, count };
      });

      return [allCategory, ...mappedDefaults];
    }

    const mapped = apiCategories.map((cat: any) => {
      const catName = getLocalizedText(cat.name, locale);
      const catId = cat.id || cat.slug;
      const lowerSlug = (cat.slug || "").toLowerCase();
      const lowerName = catName.toLowerCase();

      // Count matching visas
      const count = visas.filter((v) => {
        if (v.category_id && (v.category_id === cat.id || v.category_id === cat.slug)) return true;
        if (v.category?.id && (v.category.id === cat.id || v.category.slug === cat.slug)) return true;
        if ((lowerSlug.includes("tourist") || lowerName.includes("turis")) && v.visa_type === "tourist") return true;
        if ((lowerSlug.includes("business") || lowerName.includes("bisnis") || lowerName.includes("kerja")) && v.visa_type === "business") return true;
        if ((lowerSlug.includes("umrah") || lowerName.includes("umrah") || lowerName.includes("ziarah")) && v.visa_type === "umrah_hajj") return true;
        if ((lowerSlug.includes("study") || lowerName.includes("pelajar") || lowerName.includes("studi")) && v.visa_type === "study") return true;
        if ((lowerSlug.includes("passport") || lowerName.includes("paspor")) && (v.visa_type === "passport_new" || v.visa_type === "passport_renewal")) return true;
        return false;
      }).length;

      let iconName = "FileText";
      if (lowerSlug.includes("tourist") || lowerName.includes("turis") || lowerName.includes("kunjungan")) iconName = "Compass";
      else if (lowerSlug.includes("business") || lowerName.includes("bisnis") || lowerName.includes("kerja")) iconName = "FileCheck2";
      else if (lowerSlug.includes("umrah") || lowerName.includes("umrah") || lowerName.includes("ziarah")) iconName = "Sparkles";
      else if (lowerSlug.includes("study") || lowerName.includes("pelajar") || lowerName.includes("studi")) iconName = "GraduationCap";
      else if (lowerSlug.includes("passport") || lowerName.includes("paspor") || lowerName.includes("official")) iconName = "Globe";

      return {
        id: catId,
        slug: cat.slug,
        name: catName,
        iconName,
        count
      };
    });

    return [allCategory, ...mapped];
  }, [apiCategories, visas, locale, t]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (categoryFilter !== "all") count++;
    if (countryFilter) count++;
    if (visaTypeFilter !== "all") count++;
    if (entryTypeFilter !== "all") count++;
    if (sortBy !== "popular") count++;
    return count;
  }, [searchQuery, categoryFilter, countryFilter, visaTypeFilter, entryTypeFilter, sortBy]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setCategoryFilter("all");
    setCountryFilter(null);
    setVisaTypeFilter("all");
    setEntryTypeFilter("all");
    setSortBy("popular");
  }, []);

  // Format Price in Active Currency
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
        selectedCurrency === "USD" ? "en-US" : selectedCurrency === "TRY" ? "tr-TR" : "id-ID",
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

  // Filter & Sort Logic
  const filteredVisas = useMemo(() => {
    let list = [...visas];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => {
        const trans = item.translations?.find((t) => t.language_code === locale) || item.translations?.[0];
        const title = getLocalizedText(item.title, locale).toLowerCase();
        const transTitle = trans?.title ? getLocalizedText(trans.title, locale).toLowerCase() : "";
        const country = getLocalizedText(item.country_name, locale).toLowerCase();
        const code = (item.country_code || "").toLowerCase();
        const desc = getLocalizedText(item.description, locale).toLowerCase();
        const visaType = (item.visa_type || "").toLowerCase();
        return (
          title.includes(q) ||
          transTitle.includes(q) ||
          country.includes(q) ||
          code.includes(q) ||
          desc.includes(q) ||
          visaType.includes(q)
        );
      });
    }

    // Country filter
    if (countryFilter) {
      const targetCountry = getLocalizedText(countryFilter, locale).toLowerCase();
      list = list.filter((item) => {
        const cName = getLocalizedText(item.country_name, locale).toLowerCase();
        const cCode = (item.country_code || "").toLowerCase();
        return cName === targetCountry || cCode === targetCountry;
      });
    }

    // Category filter
    if (categoryFilter !== "all") {
      list = list.filter((item) => {
        if (
          item.category_id === categoryFilter ||
          item.category?.id === categoryFilter ||
          item.category?.slug === categoryFilter
        ) {
          return true;
        }

        const activeCatObj = categories.find((c) => c.id === categoryFilter);
        const lowerSlug = (activeCatObj?.slug || "").toLowerCase();
        const lowerName = (activeCatObj?.name || "").toLowerCase();

        if (
          categoryFilter === "cat_tourist" ||
          lowerSlug.includes("tourist") ||
          lowerName.includes("turis") ||
          lowerName.includes("kunjungan")
        ) {
          return item.visa_type === "tourist";
        }
        if (
          categoryFilter === "cat_business" ||
          lowerSlug.includes("business") ||
          lowerName.includes("bisnis") ||
          lowerName.includes("kerja")
        ) {
          return item.visa_type === "business";
        }
        if (
          categoryFilter === "cat_umrah" ||
          lowerSlug.includes("umrah") ||
          lowerName.includes("umrah") ||
          lowerName.includes("ziarah")
        ) {
          return item.visa_type === "umrah_hajj";
        }
        if (
          categoryFilter === "cat_study" ||
          lowerSlug.includes("study") ||
          lowerName.includes("pelajar") ||
          lowerName.includes("studi")
        ) {
          return item.visa_type === "study";
        }
        if (
          categoryFilter === "cat_passport" ||
          lowerSlug.includes("passport") ||
          lowerName.includes("paspor")
        ) {
          return (
            item.visa_type === "passport_new" ||
            item.visa_type === "passport_renewal"
          );
        }
        return false;
      });
    }

    // Visa type filter
    if (visaTypeFilter !== "all") {
      list = list.filter((item) => item.visa_type === visaTypeFilter);
    }

    // Entry type filter
    if (entryTypeFilter !== "all") {
      list = list.filter((item) => item.entry_type === entryTypeFilter);
    }

    // Sorting
    switch (sortBy) {
      case "price_asc":
        list.sort((a, b) => a.starting_price - b.starting_price);
        break;
      case "price_desc":
        list.sort((a, b) => b.starting_price - a.starting_price);
        break;
      case "fastest":
        list.sort(
          (a, b) => (a.processing_time_days || 99) - (b.processing_time_days || 99)
        );
        break;
      case "popular":
      default:
        // Keep initial curated order
        break;
    }

    return list;
  }, [visas, searchQuery, countryFilter, categoryFilter, visaTypeFilter, entryTypeFilter, sortBy, locale]);

  return {
    locale,
    t,
    visas,
    categories,
    isLoading,
    refetch,
    filteredVisas,
    activeFilterCount,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    countryFilter,
    setCountryFilter,
    visaTypeFilter,
    setVisaTypeFilter,
    entryTypeFilter,
    setEntryTypeFilter,
    sortBy,
    setSortBy,
    handleResetFilters,
    formatPrice,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    isSearchDrawerOpen,
    setIsSearchDrawerOpen,
    isSearchModalOpen,
    setIsSearchModalOpen
  };
};
