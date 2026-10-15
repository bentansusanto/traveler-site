"use client";

import { cn } from "@/lib/utils";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Bike,
  Check,
  Flame,
  Gauge,
  LayoutGrid,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  X
} from "lucide-react";
import { useTranslations } from "next-intl";

interface FilterSidebarProps {
  categories: any[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  availableOnly: boolean;
  setAvailableOnly: (avail: boolean | ((prev: boolean) => boolean)) => void;
  engineCcFilter: string;
  setEngineCcFilter: (cc: string) => void;
  locationFilter: string | null;
  setLocationFilter: (loc: string | null) => void;
  activeFilterCount: number;
  handleResetFilters: () => void;
  className?: string;
  onApply?: () => void;
  isMobileDrawer?: boolean;
}

export const FilterSidebar = ({
  categories,
  activeCategory,
  setActiveCategory,
  sortBy,
  setSortBy,
  availableOnly,
  setAvailableOnly,
  engineCcFilter,
  setEngineCcFilter,
  locationFilter,
  setLocationFilter,
  activeFilterCount,
  handleResetFilters,
  className,
  onApply,
  isMobileDrawer = false
}: FilterSidebarProps) => {
  const t = useTranslations("MotorBike");

  const sortOptions = [
    { id: "latest", label: t("sortLatest"), icon: Sparkles },
    { id: "price_asc", label: t("sortLowestPrice"), icon: ArrowDownNarrowWide },
    { id: "price_desc", label: t("sortHighestPrice"), icon: ArrowUpNarrowWide },
    { id: "popular", label: t("sortPopular"), icon: Flame }
  ];

  const engineOptions = [
    { id: "all", label: t("allEngineCc") },
    { id: "small", label: t("engineSmall") },
    { id: "medium", label: t("engineMedium") },
    { id: "large", label: t("engineLarge") }
  ];

  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs",
        className
      )}>
      {/* Header with Title and Reset (Desktop only) */}
      {!isMobileDrawer && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t("filterTitle")}</h3>
              {activeFilterCount > 0 && (
                <span className="text-[11px] font-semibold text-blue-600">
                  {activeFilterCount} {t("activeFilters")}
                </span>
              )}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600">
              <RotateCcw className="h-3 w-3" />
              <span>{t("resetAll")}</span>
            </button>
          )}
        </div>
      )}

      {/* Location Filter Tag (if active) */}
      {locationFilter && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-4 w-4 text-red-500 shrink-0" />
              <span className="text-xs font-semibold text-blue-950 truncate">
                {t("locationFilter", { location: locationFilter })}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLocationFilter(null)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Section: Sort By */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t("filterSort")}
        </label>
        <div className="space-y-1.5">
          {sortOptions.map((opt) => {
            const isSelected = sortBy === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSortBy(opt.id)}
                className={cn(
                  "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 text-left",
                  isSelected
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "text-slate-700 hover:bg-slate-100/80"
                )}>
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Section: Brands */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t("filterBrand")}
        </label>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 no-scrollbar">
          {categories.map((cat: any, i: number) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={`cat-${cat.id}-${i}`}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all duration-150 text-left",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold border border-blue-200/80"
                    : "text-slate-700 hover:bg-slate-50 border border-transparent"
                )}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:text-blue-600"
                    )}>
                    {cat.id === "all" ? (
                      <LayoutGrid className="h-3.5 w-3.5" />
                    ) : (
                      <Bike className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="truncate">{cat.name}</span>
                </div>

                {typeof cat.count === "number" && (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                      isActive
                        ? "bg-blue-200/70 text-blue-900"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    )}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Section: Engine CC Capacity */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5 text-slate-400" />
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("filterEngine")}
          </label>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {engineOptions.map((opt) => {
            const isSelected = engineCcFilter === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setEngineCcFilter(opt.id)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition-all text-left",
                  isSelected
                    ? "border-blue-600 bg-blue-50/80 text-blue-700 font-semibold"
                    : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                )}>
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Section: Availability Toggle */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t("filterAvailability")}
        </label>
        <button
          type="button"
          onClick={() => setAvailableOnly((prev) => !prev)}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border p-3 text-xs font-semibold transition-all text-left",
            availableOnly
              ? "border-emerald-500 bg-emerald-50/80 text-emerald-800 shadow-2xs"
              : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          )}>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                availableOnly ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
              )}
            />
            <span>{t("availableOnly")}</span>
          </div>
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-md border text-[11px] font-bold transition-colors",
              availableOnly
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-300 bg-slate-50 text-transparent"
            )}>
            <Check className="h-3 w-3" />
          </span>
        </button>
      </div>
    </div>
  );
};
