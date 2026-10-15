"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import React from "react";
import { EntertainmentFilterValues } from "../schema";

interface EntertainmentFilterBarProps {
  t: (key: string, params?: Record<string, any>) => string;
  totalCount: number;
  sortBy: EntertainmentFilterValues["sort"];
  onSortChange: (sort: EntertainmentFilterValues["sort"]) => void;
  activeFilterCount: number;
  onResetFilters: () => void;
}

export const EntertainmentFilterBar: React.FC<EntertainmentFilterBarProps> = ({
  t,
  totalCount,
  sortBy,
  onSortChange,
  activeFilterCount,
  onResetFilters
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4 border-b border-slate-200/80 mb-6">
      {/* Count & Active Filter Indicator */}
      <div className="flex items-center gap-3">
        <p className="text-xs sm:text-sm font-semibold text-slate-800">
          {totalCount === 1
            ? t("filterResultsCountSingle")
            : t("filterResultsCount", { count: totalCount })}
        </p>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t("resetFilters")}</span>
          </button>
        )}
      </div>

      {/* Sort Select */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <label
          htmlFor="entertainment-sort"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 shrink-0"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
          <span>{t("sortBy")}:</span>
        </label>
        <select
          id="entertainment-sort"
          value={sortBy}
          onChange={(e) =>
            onSortChange(e.target.value as EntertainmentFilterValues["sort"])
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="recommended">{t("sortRecommended")}</option>
          <option value="price_asc">{t("sortPriceLow")}</option>
          <option value="price_desc">{t("sortPriceHigh")}</option>
          <option value="newest">{t("sortNewest")}</option>
        </select>
      </div>
    </div>
  );
};
