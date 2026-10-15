"use client";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronLeft,
  LayoutGrid,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { AttractionCard } from "./components/AttractionCard";
import { TicketModal } from "./components/TicketModal";
import { FilterDrawer } from "./FilterDrawer";
import { FilterSidebar } from "./FilterSidebar";
import { useEntertainmentPageLogic } from "./logic";
import { SearchDrawer } from "./SearchDrawer";
import { SearchModal } from "./SearchModal";

export const EntertainmentModule: React.FC = () => {
  const {
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
    isLoading,
    formatPrice,
    attractions,
    filteredAttractions,
    activeFilterCount,
    handleResetFilters,
    handleOpenTicketModal,
    handleCloseTicketModal
  } = useEntertainmentPageLogic();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Hero Banner Section (matching MotorBike) */}
      <div className="relative min-h-[380px] md:min-h-[500px] w-full overflow-hidden bg-slate-900 flex flex-col justify-center">
        {/* Background Image & Clean Solid Overlay (Ba Na Hills Vietnam / Bali Entertainment) */}
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1920&q=85&auto=format&fit=crop"
          fallbackSrc="/images/bali-destination.jpg"
          alt="Entertainment & Attractions"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/50" />

        {/* Top Mobile Floating Bar */}
        <div className="absolute inset-x-0 top-4 z-20 flex items-center gap-3 px-4 md:hidden">
          <Link
            href={`/${locale}`}
            prefetch={true}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div
            onClick={() => setIsSearchDrawerOpen(true)}
            className="relative flex flex-1 items-center h-10 cursor-pointer rounded-2xl bg-white/95 px-3.5 shadow-md backdrop-blur-md"
          >
            <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            <span className="text-xs font-medium text-slate-500 truncate">
              {locationFilter
                ? t("locationFilter", { location: locationFilter })
                : searchQuery || t("searchPlaceholder")}
            </span>
          </div>
        </div>

        {/* Hero Content Center Wrapper */}
        <div className="relative mx-auto w-full max-w-7xl px-5 pt-20 pb-12 md:pt-36 md:pb-16 md:px-8 flex flex-col items-center text-center">
          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md max-w-3xl leading-tight">
            {t("heroTitle")}
          </h1>

          {/* Subtitle */}
          <p className="mt-4 md:mt-5 text-sm sm:text-base text-slate-200/90 max-w-xl font-normal leading-relaxed">
            {t("heroSubtitle")}
          </p>

          {/* Desktop Search Card Bar */}
          <div className="mt-8 hidden w-full max-w-2xl md:block">
            <div
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center h-14 w-full cursor-pointer rounded-2xl bg-white p-2 shadow-xl shadow-black/25 transition-all hover:shadow-2xl"
            >
              <div className="flex flex-1 items-center px-4">
                <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
                <span className="text-sm font-medium text-slate-500 truncate">
                  {locationFilter
                    ? t("locationFilter", { location: locationFilter })
                    : searchQuery || t("searchPlaceholder")}
                </span>
              </div>

              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95"
              >
                <span>{t("searchBtn")}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 py-8 md:py-10">
        {/* Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {t("allAttractionsTitle")}
              </h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-100">
                {t("showingResults", { count: filteredAttractions.length })}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
              {t("allAttractionsSubtitle")}
            </p>
          </div>

          {/* Mobile Filter Trigger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50 active:scale-95 transition-all"
            >
              <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              <span>{t("openFilter")}</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t("resetAll")}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Layout: Left Sidebar + Right Attraction Catalog */}
        <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
          {/* Left Sticky Filter Sidebar (Desktop >= 1024px) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24">
            <FilterSidebar
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              instantOnly={instantOnly}
              setInstantOnly={setInstantOnly}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              activeFilterCount={activeFilterCount}
              handleResetFilters={handleResetFilters}
            />
          </aside>

          {/* Right Attraction Catalog Listing (Desktop & Mobile) */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Active Filter Badges Bar (Quick chip removal) */}
            {(activeCategory !== "all" ||
              locationFilter ||
              instantOnly ||
              searchQuery.trim()) && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {activeCategory !== "all" && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <Ticket className="h-3.5 w-3.5" />
                    <span>{activeCategory}</span>
                    <button
                      type="button"
                      onClick={() => setActiveCategory("all")}
                      className="text-blue-500 hover:text-blue-800 ml-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {locationFilter && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                    <span>{locationFilter}</span>
                    <button
                      type="button"
                      onClick={() => setLocationFilter(null)}
                      className="text-red-500 hover:text-red-800 ml-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {instantOnly && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{t("instantOnly")}</span>
                    <button
                      type="button"
                      onClick={() => setInstantOnly(false)}
                      className="text-emerald-500 hover:text-emerald-800 ml-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                    <span>"{searchQuery}"</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-slate-500 hover:text-slate-800 ml-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Catalog Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-2.5 sm:p-4 shadow-xs space-y-2 sm:space-y-3"
                  >
                    <Skeleton className="aspect-[16/11] w-full rounded-xl" />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-12 sm:w-16" />
                        <Skeleton className="h-3 w-14 sm:w-20" />
                      </div>
                      <Skeleton className="h-3.5 sm:h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="pt-2 sm:pt-3 border-t border-slate-100 flex justify-between items-center">
                        <Skeleton className="h-4 sm:h-5 w-16 sm:w-24" />
                        <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAttractions.length === 0 ? (
              <div className="mx-auto max-w-md my-12 text-center rounded-3xl bg-white p-8 sm:p-10 border border-slate-200/80 shadow-xs">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                  <Ticket className="h-8 w-8" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  {t("noResultsTitle")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                  {t("noResultsDesc")}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
                >
                  {t("clearSearch")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {filteredAttractions.map((attraction) => (
                  <AttractionCard
                    key={attraction.id}
                    attraction={attraction}
                    locale={locale}
                    t={t}
                    formatPrice={formatPrice}
                    onViewTickets={handleOpenTicketModal}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Drawer for Mobile & Tablet */}
      <FilterDrawer
        open={isFilterDrawerOpen}
        onOpenChange={setIsFilterDrawerOpen}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        instantOnly={instantOnly}
        setInstantOnly={setInstantOnly}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        activeFilterCount={activeFilterCount}
        handleResetFilters={handleResetFilters}
        totalResults={filteredAttractions.length}
      />

      {/* Mobile Search Drawer */}
      <SearchDrawer
        open={isSearchDrawerOpen}
        onOpenChange={setIsSearchDrawerOpen}
        onSelectSearch={(term) => setSearchQuery(term)}
        onLocationSelect={(loc) => setLocationFilter(loc)}
      />

      {/* Desktop Search Modal */}
      <SearchModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
        onSelectSearch={(term) => setSearchQuery(term)}
        onLocationSelect={(loc) => setLocationFilter(loc)}
      />

      {/* Ticket Selection Modal */}
      <TicketModal
        attraction={selectedAttraction}
        isOpen={isTicketModalOpen}
        onClose={handleCloseTicketModal}
        locale={locale}
        t={t}
        formatPrice={formatPrice}
      />
    </div>
  );
};

export default EntertainmentModule;
