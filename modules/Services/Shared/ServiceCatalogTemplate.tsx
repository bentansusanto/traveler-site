"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  ChevronLeft,
  Search,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  LayoutGrid,
  Check,
  X,
  Flame,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

export interface ServiceCategory {
  id: string;
  name: string;
  count?: number;
}

export interface ServiceCatalogPageProps {
  serviceName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroImageAlt: string;
  searchPlaceholder: string;
  catalogTitle: string;
  catalogSubtitle: string;
  icon: LucideIcon;
  categories?: ServiceCategory[];
  emptyTitle?: string;
  emptyDesc?: string;
}

export const ServiceCatalogTemplate = ({
  serviceName,
  heroTitle,
  heroSubtitle,
  heroImage,
  heroImageAlt,
  searchPlaceholder,
  catalogTitle,
  catalogSubtitle,
  icon: ServiceIcon,
  categories = [{ id: "all", name: "Semua Kategori", count: 0 }],
  emptyTitle,
  emptyDesc
}: ServiceCatalogPageProps) => {
  const locale = useLocale();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const sortOptions = [
    { id: "latest", label: "Unit Terbaru", icon: Sparkles },
    { id: "price_asc", label: "Harga: Termurah", icon: ArrowDownNarrowWide },
    { id: "price_desc", label: "Harga: Termahal", icon: ArrowUpNarrowWide },
    { id: "popular", label: "Paling Populer", icon: Flame }
  ];

  const activeFilterCount =
    (activeCategory !== "all" ? 1 : 0) + (sortBy !== "latest" ? 1 : 0) + (searchQuery ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setSortBy("latest");
  };

  const isId = locale === "id";

  // Reusable Filter Sidebar Content
  const renderFilterContent = (isMobileDrawer = false) => (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs",
        isMobileDrawer ? "border-none p-0 shadow-none" : ""
      )}
    >
      {/* Header (Desktop only) */}
      {!isMobileDrawer && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isId ? "Filter & Urutkan" : "Filter & Sort"}
              </h3>
              {activeFilterCount > 0 && (
                <span className="text-[11px] font-semibold text-blue-600">
                  {activeFilterCount} {isId ? "filter aktif" : "active"}
                </span>
              )}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{isId ? "Reset" : "Reset All"}</span>
            </button>
          )}
        </div>
      )}

      {/* Sort Section */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {isId ? "Urutkan Berdasarkan" : "Sort By"}
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
                  "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 text-left cursor-pointer",
                  isSelected
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5",
                      isSelected ? "text-white" : "text-slate-400 group-hover:text-blue-600"
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

      {/* Categories Section */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {isId ? "Kategori Pilihan" : "Categories"}
        </label>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {categories.map((cat, i) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={`cat-${cat.id}-${i}`}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all duration-150 text-left cursor-pointer",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold border border-blue-200/80"
                    : "text-slate-700 hover:bg-slate-50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:text-blue-600"
                    )}
                  >
                    {cat.id === "all" ? (
                      <LayoutGrid className="h-3.5 w-3.5" />
                    ) : (
                      <ServiceIcon className="h-3.5 w-3.5" />
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
                    )}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Hero Banner Section */}
      <div className="relative min-h-[380px] md:min-h-[500px] w-full overflow-hidden bg-slate-900 flex flex-col justify-center">
        {/* Background Image & Clean Solid Overlay (Matching MotorBike / Entertainment) */}
        <Image
          src={heroImage}
          alt={heroImageAlt}
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95"
            aria-label="Kembali"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="relative flex flex-1 items-center h-10 rounded-2xl bg-white/95 px-3.5 shadow-md backdrop-blur-md">
            <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-600 ml-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Hero Content Center Wrapper */}
        <div className="relative mx-auto w-full max-w-7xl px-5 pt-20 pb-12 md:pt-36 md:pb-16 md:px-8 flex flex-col items-center text-center">
          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md max-w-3xl leading-tight">
            {heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="mt-4 md:mt-5 text-sm sm:text-base text-slate-200/90 max-w-xl font-normal leading-relaxed">
            {heroSubtitle}
          </p>

          {/* Desktop Search Card Bar */}
          <div className="mt-8 hidden w-full max-w-2xl md:block">
            <div className="flex items-center h-14 w-full rounded-2xl bg-white p-2 shadow-xl shadow-black/25 transition-all hover:shadow-2xl">
              <div className="flex flex-1 items-center px-4">
                <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-slate-400 hover:text-slate-600 mr-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
              >
                <span>{isId ? "Cari" : "Search"}</span>
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
                {catalogTitle}
              </h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-100">
                {isId ? "Menampilkan 0 data" : "Showing 0 items"}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
              {catalogSubtitle}
            </p>
          </div>

          {/* Mobile Filter Trigger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              <span>{isId ? "Filter & Urutkan" : "Filter & Sort"}</span>
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
                className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Layout: Left Sidebar + Right Catalog Content */}
        <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
          {/* Left Sticky Filter Sidebar (Desktop >= 1024px) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24">
            {renderFilterContent(false)}
          </aside>

          {/* Right Catalog Listing Area */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Active Filter Badges Bar */}
            {(activeCategory !== "all" || sortBy !== "latest" || searchQuery) && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {activeCategory !== "all" && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <ServiceIcon className="h-3.5 w-3.5" />
                    <span>{categories.find((c) => c.id === activeCategory)?.name || activeCategory}</span>
                    <button
                      type="button"
                      onClick={() => setActiveCategory("all")}
                      className="text-blue-500 hover:text-blue-800 ml-0.5 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                    <span>&quot;{searchQuery}&quot;</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-slate-400 hover:text-slate-700 ml-0.5 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-rose-600 hover:underline px-2 py-1 cursor-pointer"
                >
                  {isId ? "Reset Semua" : "Reset All"}
                </button>
              </div>
            )}

            {/* Empty State (Matching MotorBike / Entertainment / Tour design) */}
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-xs">
                <ServiceIcon className="h-8 w-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {emptyTitle || (isId ? `Belum Ada Data ${serviceName}` : `No ${serviceName} Available`)}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                {emptyDesc ||
                  (isId
                    ? `Data unit dan katalog untuk ${serviceName} sedang dipersiapkan. Silakan cek kembali dalam waktu dekat.`
                    : `The catalog and units for ${serviceName} are currently being prepared.`)}
              </p>

              {(searchQuery || activeCategory !== "all" || sortBy !== "latest") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{isId ? "Reset Filter" : "Reset Filter"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter & Sort Drawer */}
      <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <DrawerContent className="p-5 max-h-[85vh] rounded-t-3xl">
          <DrawerHeader className="p-0 pb-4 border-b border-slate-100 flex items-center justify-between">
            <DrawerTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              <span>{isId ? "Filter & Urutkan" : "Filter & Sort"}</span>
            </DrawerTitle>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Reset
              </button>
            )}
          </DrawerHeader>

          <div className="py-4 overflow-y-auto no-scrollbar">{renderFilterContent(true)}</div>

          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
            >
              {isId ? "Terapkan Filter" : "Apply Filter"}
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
