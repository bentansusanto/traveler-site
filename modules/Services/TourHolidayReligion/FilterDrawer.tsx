"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { RotateCcw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { FilterSidebar } from "./FilterSidebar";

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: any[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  locationFilter: string | null;
  setLocationFilter: (loc: string | null) => void;
  activeFilterCount: number;
  handleResetFilters: () => void;
  totalResults?: number;
}

export const FilterDrawer = ({
  open,
  onOpenChange,
  categories,
  activeCategory,
  setActiveCategory,
  sortBy,
  setSortBy,
  locationFilter,
  setLocationFilter,
  activeFilterCount,
  handleResetFilters,
  totalResults
}: FilterDrawerProps) => {
  const t = useTranslations("TourHoliday");

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88vh] rounded-t-3xl border-slate-200 bg-white p-0 flex flex-col focus:outline-none">
        {/* Clean Header Bar */}
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
        <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
          <FilterSidebar
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            activeFilterCount={activeFilterCount}
            handleResetFilters={handleResetFilters}
            className="border-0 p-0 shadow-none bg-transparent"
            isMobileDrawer={true}
          />
        </div>

        {/* Sticky Mobile Bottom CTA Bar */}
        <div className="border-t border-slate-100 bg-white p-4 shrink-0 shadow-lg">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-600/25 active:scale-98 transition-transform">
            <span>{t("applyFilter")}</span>
            {typeof totalResults === "number" && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-extrabold">
                ({totalResults})
              </span>
            )}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
