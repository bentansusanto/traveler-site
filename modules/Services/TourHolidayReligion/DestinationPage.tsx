"use client";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronLeft,
  Compass,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FilterDrawer } from "./FilterDrawer";
import { FilterSidebar } from "./FilterSidebar";
import { useDestinationPageLogic } from "./logic";
import { SearchDrawer } from "./SearchDrawer";
import { SearchModal } from "./SearchModal";

export const DestinationPage = () => {
  const {
    locale,
    t,
    sortBy,
    setSortBy,
    activeCategory,
    setActiveCategory,
    isDrawerOpen,
    setIsDrawerOpen,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    isModalOpen,
    setIsModalOpen,
    locationFilter,
    setLocationFilter,
    categories,
    isLoading,
    formatPrice,
    filteredDestinations,
    activeFilterCount,
    handleResetFilters
  } = useDestinationPageLogic();

  const renderDestinationCard = (item: any, idx: number) => {
    const translation =
      item.translations?.find((tr: any) => tr.language_code === locale) || item.translations?.[0];
    const name = translation?.name || item.name || (item.city_name ? `Tour in ${item.city_name}` : "Tour Destination");
    const image = item.thumbnail || translation?.thumbnail || "/images/hero_things_todo_mobile.png";
    const rawPrice = parseFloat(item.price) || 0;
    const strikePrice = rawPrice > 0 ? rawPrice * 1.2 : 0;
    const categoryName = item.category_destination_name || item.category?.name || "Tour";
    const locationName = item.city_name ? `${item.city_name}` : item.location?.split(",")[0] || "Turkey";

    return (
      <Link
        href={`/${locale}/tour-holiday-religion/${translation?.slug || item.id}`}
        key={item.id || idx}
        className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-200/60">
        {/* Image */}
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-100">
          <ImageWithFallback
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fallbackSrc="/images/hero_things_todo_mobile.png"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category Tag on Top-Left */}
          {categoryName && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded-full bg-slate-900/80 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-white backdrop-blur-md shadow-xs border border-white/10">
              {categoryName}
            </div>
          )}

          {/* Location Badge on Top-Right */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 rounded-full bg-white/95 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-slate-800 backdrop-blur-md shadow-xs border border-slate-200/60">
            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500 shrink-0" />
            <span className="truncate max-w-[70px] sm:max-w-[100px]">{locationName}</span>
          </div>
        </div>

        {/* Card Body Info */}
        <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-5">
          {/* Destination Name */}
          <h3 className="line-clamp-2 text-xs sm:text-sm md:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
            {name}
          </h3>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1 sm:gap-1.5 border-b border-slate-100 pb-2 sm:pb-3">
            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-800">4.9</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
              {t("reviews", { count: "1.8k" })}
            </span>
          </div>

          {/* Price & Action Section */}
          <div className="mt-auto pt-2 sm:pt-3 flex items-end justify-between gap-1.5">
            <div className="min-w-0">
              {strikePrice > 0 && (
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 line-through truncate">
                  {formatPrice(strikePrice)}
                </p>
              )}
              <div className="flex items-baseline gap-0.5 sm:gap-1">
                <span className="text-xs sm:text-base md:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {formatPrice(rawPrice)}
                </span>
                <span className="text-[9px] sm:text-[11px] font-medium text-slate-500 shrink-0">
                  {t("perPerson")}
                </span>
              </div>
            </div>

            <span className="inline-flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Hero Banner Section */}
      <div className="relative min-h-[420px] md:min-h-[500px] lg:min-h-[540px] w-full overflow-hidden bg-slate-900 flex flex-col justify-center pt-24 md:pt-32 pb-16 md:pb-20">
        {/* Background Image & Clean Solid Overlay (No Muddy Gradient) */}
        <Image
          src="/images/hero_things_todo_mobile.png"
          alt="Tour Holiday & Religion Hero"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/45" />

        {/* Top Mobile Floating Bar */}
        <div className="absolute inset-x-0 top-4 z-20 flex items-center gap-3 px-4 md:hidden">
          <Link
            href={`/${locale}`}
            prefetch={true}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div
            onClick={() => setIsDrawerOpen(true)}
            className="relative flex flex-1 items-center h-10 cursor-pointer rounded-2xl bg-white/95 px-3.5 shadow-md backdrop-blur-md">
            <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            <span className="text-xs font-medium text-slate-500 truncate">
              {locationFilter ? `${t("locationPrefix")} ${locationFilter}` : t("searchPlaceholder")}
            </span>
          </div>
        </div>

        {/* Hero Content Center Wrapper */}
        <div className="relative mx-auto w-full max-w-7xl px-5 py-8 md:px-8 flex flex-col items-center text-center">
          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md max-w-3xl leading-tight">
            {t("heroTitle")}
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-xs sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed">
            {t("heroSubtitle")}
          </p>

          {/* Desktop Search Bar (Floating Pill - Clean & Non-Duplicated) */}
          <div className="hidden md:block w-full max-w-2xl mt-8">
            <div
              onClick={() => setIsModalOpen(true)}
              className="flex items-center h-14 w-full cursor-pointer rounded-2xl bg-white p-2 shadow-xl shadow-black/25 transition-all hover:shadow-2xl">
              <div className="flex flex-1 items-center px-4">
                <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
                <span className="text-sm font-medium text-slate-500 truncate">
                  {locationFilter ? `${t("locationPrefix")} ${locationFilter}` : t("searchPlaceholder")}
                </span>
              </div>

              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95">
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
                {t("allToursTitle")}
              </h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-100">
                {t("showingResults", { count: filteredDestinations.length })}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
              {t("allToursSubtitle")}
            </p>
          </div>

          {/* Mobile Filter Trigger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50 active:scale-95 transition-all">
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
                className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t("resetAll")}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Layout: Left Sidebar + Right Tour Catalog */}
        <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
          {/* Left Sticky Filter Sidebar (Desktop >= 1024px) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24">
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
            />
          </aside>

          {/* Right Tour Catalog Listing (Desktop & Mobile) */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Active Filter Badges Bar (Quick individual chip removal) */}
            {(activeCategory !== "all" || locationFilter) && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {activeCategory !== "all" && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <Compass className="h-3.5 w-3.5" />
                    <span>{activeCategory}</span>
                    <button
                      type="button"
                      onClick={() => setActiveCategory("all")}
                      className="text-blue-500 hover:text-blue-800 ml-0.5">
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
                      className="text-red-500 hover:text-red-800 ml-0.5">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Tours Grid: 2 columns on Mobile & Tablet, 2-3 columns on Desktop */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-xs space-y-2 sm:space-y-3">
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
            ) : filteredDestinations.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {filteredDestinations.map((item: any, idx: number) =>
                  renderDestinationCard(item, idx)
                )}
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-xs">
                  <Compass className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{t("emptyStateTitle")}</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">
                  {t("emptyStateSubtitle")} {t("emptyStateHint")}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-95">
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{t("resetFilter")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter & Sort Drawer */}
      <FilterDrawer
        open={isFilterDrawerOpen}
        onOpenChange={setIsFilterDrawerOpen}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        activeFilterCount={activeFilterCount}
        handleResetFilters={handleResetFilters}
        totalResults={filteredDestinations.length}
      />

      {/* Search Drawer - Mobile Only */}
      <SearchDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onLocationSelect={setLocationFilter}
      />

      {/* Search Modal - Desktop Only */}
      <SearchModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onLocationSelect={setLocationFilter}
      />
    </div>
  );
};
