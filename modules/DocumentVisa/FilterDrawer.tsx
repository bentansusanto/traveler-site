"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Check,
  Compass,
  FileCheck2,
  Flame,
  Globe,
  LayoutGrid,
  MapPin,
  RotateCcw,
  Sparkles,
  X,
  Zap
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getCategoryIcon } from "./components/category-icons";

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: any[];
  sortBy: string;
  setSortBy: (sort: string) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  countryFilter: string | null;
  setCountryFilter: (country: string | null) => void;
  entryTypeFilter: string;
  setEntryTypeFilter: (entry: string) => void;
  activeFilterCount: number;
  handleResetFilters: () => void;
  totalResults: number;
}

export const FilterDrawer = ({
  open,
  onOpenChange,
  categories: categoriesProp,
  sortBy,
  setSortBy,
  categoryFilter,
  setCategoryFilter,
  countryFilter,
  setCountryFilter,
  entryTypeFilter,
  setEntryTypeFilter,
  activeFilterCount,
  handleResetFilters,
  totalResults
}: FilterDrawerProps) => {
  const t = useTranslations("DocumentVisa");

  const sortOptions = [
    { id: "popular", label: t("sortPopular"), icon: Flame },
    { id: "price_asc", label: t("sortPriceAsc"), icon: ArrowDownNarrowWide },
    { id: "price_desc", label: t("sortPriceDesc"), icon: ArrowUpNarrowWide },
    { id: "fastest", label: t("sortFastest"), icon: Zap }
  ];

  const defaultCategories = [
    { id: "all", label: t("allCategories"), iconName: "LayoutGrid" },
    { id: "cat_tourist", label: t("touristVisa"), iconName: "Compass" },
    { id: "cat_business", label: t("businessVisa"), iconName: "FileCheck2" },
    { id: "cat_umrah", label: t("umrahVisa"), iconName: "Sparkles" },
    { id: "cat_passport", label: t("passportService"), iconName: "Globe" }
  ];

  const categories = categoriesProp && categoriesProp.length > 0 ? categoriesProp : defaultCategories;

  const entryTypes = [
    { id: "all", label: t("allEntryTypes") },
    { id: "single_entry", label: t("singleEntry") },
    { id: "multiple_entry", label: t("multipleEntry") }
  ];

  const popularCountries = [
    { name: "Japan", code: "JP" },
    { name: "Schengen / Europe", code: "EU" },
    { name: "United States", code: "US" },
    { name: "Saudi Arabia", code: "SA" },
    { name: "Australia", code: "AU" },
    { name: "South Korea", code: "KR" },
    { name: "Turkey", code: "TR" },
    { name: "Indonesia", code: "ID" }
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88vh] rounded-t-3xl border-slate-200 bg-white p-0 flex flex-col focus:outline-none">
        {/* Header Bar */}
        <DrawerHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-3.5 text-left shrink-0">
          <div className="flex items-center gap-2">
            <DrawerTitle className="text-base font-bold text-slate-900">
              {t("filterTitle")}
            </DrawerTitle>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-colors">
                <RotateCcw className="h-3 w-3" />
                <span>{t("resetAll")}</span>
              </button>
            )}

            <DrawerClose className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95 transition-all">
              <X className="h-4 w-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Scrollable Filter Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-left">
          {/* Section: Sort By */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("sortBy")}
            </h4>
            <div className="space-y-1">
              {sortOptions.map((opt) => {
                const isActive = sortBy === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all text-left",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    )}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} />
                      <span>{opt.label}</span>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Categories */}
          <div className="space-y-2.5 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("categories")}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat: any) => {
                const isActive = categoryFilter === cat.id;
                const Icon = typeof cat.icon === "function" ? cat.icon : getCategoryIcon(cat.iconName || cat.icon);
                const label = cat.name || cat.label;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                      isActive
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 border border-slate-200/80"
                    )}>
                    <Icon className={cn("h-3.5 w-3.5", isActive ? "text-white" : "text-slate-400")} />
                    <span>{label}</span>
                    {typeof cat.count === "number" && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 text-[10px] font-bold ml-0.5",
                          isActive ? "bg-white/25 text-white" : "bg-slate-200/70 text-slate-600"
                        )}>
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Countries */}
          <div className="space-y-2.5 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t("popularDestinations")}
              </h4>
              {countryFilter && (
                <button
                  type="button"
                  onClick={() => setCountryFilter(null)}
                  className="text-[11px] font-semibold text-rose-600">
                  Hapus
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {popularCountries.map((c) => {
                const isActive = countryFilter?.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCountryFilter(isActive ? null : c.name)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all text-left",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                        : "bg-slate-50 text-slate-700 border border-slate-200/60"
                    )}>
                    <MapPin className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Entry Type */}
          <div className="space-y-2.5 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("entryType")}
            </h4>
            <div className="grid grid-cols-1 gap-1">
              {entryTypes.map((et) => {
                const isActive = entryTypeFilter === et.id;
                return (
                  <button
                    key={et.id}
                    type="button"
                    onClick={() => setEntryTypeFilter(et.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all text-left",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    )}>
                    <span>{et.label}</span>
                    {isActive && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Apply Button */}
        <div className="border-t border-slate-100 bg-white p-4 shrink-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-2xl bg-blue-600 py-3 text-center text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/30 active:scale-98 transition-all">
            {t("applyFiltersWithCount", { count: totalResults })}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
