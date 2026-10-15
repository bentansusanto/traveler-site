"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  FileText,
  RotateCcw,
  SlidersHorizontal
} from "lucide-react";
import { DocumentVisaCard } from "./components/DocumentVisaCard";
import { DocumentVisaHero } from "./components/DocumentVisaHero";
import { FilterDrawer } from "./FilterDrawer";
import { FilterSidebar } from "./FilterSidebar";
import { useDocumentVisa } from "./hooks/useDocumentVisa";
import { SearchDrawer } from "./SearchDrawer";
import { SearchModal } from "./SearchModal";
import { getLocalizedText } from "@/store/services/document-visa.service";

export const DocumentVisaPage = () => {
  const {
    locale,
    t,
    visas,
    categories,
    isLoading,
    filteredVisas,
    activeFilterCount,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    countryFilter,
    setCountryFilter,
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
  } = useDocumentVisa();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Hero Banner Section */}
      <DocumentVisaHero
        locale={locale}
        onOpenMobileSearch={() => setIsSearchDrawerOpen(true)}
        onOpenDesktopSearch={() => setIsSearchModalOpen(true)}
        countryFilter={countryFilter}
      />

      {/* Main Content Body */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 py-8 md:py-10">
        {/* Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {t("allVisasTitle")}
              </h2>
              <span className="hidden lg:inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-100">
                {t("showingResults", { count: filteredVisas.length })}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
              {t("allVisasSubtitle")}
            </p>
          </div>

          {/* Mobile Filter Trigger Button & Results Badge */}
          <div className="flex flex-wrap items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50 active:scale-95 transition-all">
              <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              <span>{t("openFilter")}</span>
              {activeFilterCount > 0 && (
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100 whitespace-nowrap">
              {t("showingResults", { count: filteredVisas.length })}
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start mt-6">
          {/* Desktop Left Sticky Sidebar */}
          <FilterSidebar
            categories={categories}
            sortBy={sortBy}
            setSortBy={setSortBy}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            countryFilter={countryFilter}
            setCountryFilter={setCountryFilter}
            entryTypeFilter={entryTypeFilter}
            setEntryTypeFilter={setEntryTypeFilter}
            activeFilterCount={activeFilterCount}
            handleResetFilters={handleResetFilters}
          />

          {/* Catalog Grid Area */}
          <section className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Catalog Cards Grid or Loading Skeleton */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-4 space-y-2 sm:space-y-3">
                    <Skeleton className="aspect-[16/11] w-full rounded-xl" />
                    <Skeleton className="h-3 sm:h-4 w-1/3 rounded" />
                    <Skeleton className="h-4 sm:h-5 w-3/4 rounded" />
                    <Skeleton className="h-7 sm:h-8 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredVisas.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {filteredVisas.map((item) => (
                  <DocumentVisaCard
                    key={item.id}
                    item={item}
                    locale={locale}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">{t("emptyTitle")}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md">{t("emptyDesc")}</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all">
                  {t("resetFilterBtn")}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={isFilterDrawerOpen}
        onOpenChange={setIsFilterDrawerOpen}
        categories={categories}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        countryFilter={countryFilter}
        setCountryFilter={setCountryFilter}
        entryTypeFilter={entryTypeFilter}
        setEntryTypeFilter={setEntryTypeFilter}
        activeFilterCount={activeFilterCount}
        handleResetFilters={handleResetFilters}
        totalResults={filteredVisas.length}
      />

      {/* Desktop Search Modal */}
      <SearchModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
        visas={visas}
        onSelectCountry={(c) => setCountryFilter(c)}
      />

      {/* Mobile Search Drawer */}
      <SearchDrawer
        open={isSearchDrawerOpen}
        onOpenChange={setIsSearchDrawerOpen}
        visas={visas}
        onSelectCountry={(c) => setCountryFilter(c)}
      />
    </div>
  );
};
