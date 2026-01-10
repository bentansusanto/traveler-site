"use client";

import Icon from "@/components/icon";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useDestinationPageLogic } from "./logic";
import { SearchDrawer } from "./SearchDrawer";
import { SearchModal } from "./SearchModal";

export const DestinationPage = () => {
  const {
    locale,
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
    categories,
    isLoading,
    formatPrice,
    filteredDestinations
  } = useDestinationPageLogic();

  const renderDestinationCard = (item: any, idx: number) => {
    const translation =
      item.translations?.find((t: any) => t.language_code === locale) || item.translations?.[0];
    const name = translation?.name || "Unknown Destination";
    const image = translation?.thumbnail || "/images/placeholder.jpg";
    const rawPrice = parseFloat(item.price) || 0;

    return (
      <Link
        href={`/${locale}/tour-holiday-religion/${translation?.slug || item.id}`}
        key={item.id || idx}
        className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {idx % 2 === 0 && (
            <div className="absolute right-0 bottom-0 rounded-tl-xl bg-red-600 px-3 py-1 text-[10px] font-bold text-white">
              ini BARU murah!
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-sm font-bold text-gray-900 md:text-base">{name}</h3>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 md:text-xs">
            {item.location}
          </p>

          <div className="mt-2 flex items-center gap-1">
            <Icon name="Star" className="size-3 fill-orange-400 text-orange-400" />
            <span className="text-[10px] font-bold text-gray-700 md:text-xs">4.4</span>
            <span className="text-[10px] text-gray-400 md:text-xs">/5 (25.3rb Review)</span>
          </div>

          <div className="mt-auto pt-4">
            <p className="text-[10px] text-gray-400 line-through md:text-xs">
              {formatPrice(rawPrice)}
            </p>
            <p className="text-sm font-bold text-red-600 md:text-lg">{formatPrice(rawPrice)}</p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Section */}
      <div className="relative h-[300px] w-full overflow-hidden md:h-[480px]">
        <Image
          src="/images/hero_things_todo_mobile.png"
          alt="Things To-Do Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top Floating Bar */}
        <div className="absolute inset-x-0 top-5 z-20 flex items-center gap-3 px-5 md:hidden">
          <Link
            href="/"
            prefetch={true}
            className="flex size-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform active:scale-95">
            <Icon name="ChevronLeft" className="size-6 text-gray-800" />
          </Link>
          <div className="relative flex flex-1 items-center">
            <Icon name="Search" className="absolute left-4 z-10 size-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari lokasi atau destinasi"
              readOnly
              onClick={() => setIsDrawerOpen(true)}
              className="h-10 w-full cursor-pointer rounded-2xl bg-white/95 pr-4 pl-12 text-sm font-medium text-gray-600 shadow-lg backdrop-blur-sm transition-all outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Hero Content Wrapper */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 pt-20">
          {/* Desktop/Tablet Centered Content */}
          <div className="hidden w-full max-w-4xl flex-col items-center text-center md:flex">
            <div className="flex items-center gap-6">
              <h1 className="text-4xl font-black tracking-tight text-white lg:text-5xl">
                Things To-Do
              </h1>
              <button className="flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-6 py-2.5 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/30 active:scale-95">
                Lihat semua aktivitas terdekat
                <Icon name="ChevronRight" className="size-3.5" />
              </button>
            </div>

            {/* Desktop Large Search Bar */}
            <div className="mt-8 w-full max-w-2xl px-4 lg:max-w-3xl">
              <div
                className="group relative flex cursor-pointer items-center transition-all"
                onClick={() => setIsModalOpen(true)}>
                <Icon
                  name="Search"
                  className="absolute left-6 size-6 text-gray-400 transition-colors group-focus-within:text-blue-500"
                />
                <input
                  type="text"
                  placeholder="Cari aktivitas atau destinasi"
                  readOnly
                  className="h-16 w-full cursor-pointer rounded-2xl bg-white/95 pr-8 pl-16 text-lg font-medium text-gray-800 shadow-2xl backdrop-blur-sm transition-all outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Mobile Bottom-Left Content */}
          <div className="absolute bottom-10 left-5 flex flex-col items-start md:hidden">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Tour Holiday & Religion
            </h1>
            <button className="mt-3 flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[10px] font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95">
              Lihat semua aktivitas terdekat
              <Icon name="ChevronRight" className="size-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative -mt-4 rounded-t-3xl bg-white p-5 md:mx-auto md:max-w-7xl md:px-8">
        {/* Category Icons Grid */}
        <div className="grid grid-cols-5 gap-x-2 gap-y-8 md:grid-cols-10">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="flex cursor-pointer flex-col items-center gap-2"
              onClick={() => setActiveCategory(cat.name)}>
              <div className="relative">
                <div
                  className={`flex size-14 items-center justify-center rounded-full shadow-sm transition-all hover:scale-110 active:scale-90 md:size-16 ${
                    activeCategory === cat.name
                      ? "bg-blue-600 text-white shadow-blue-200"
                      : "bg-blue-50 text-blue-600"
                  }`}>
                  <Icon name={cat.icon as any} className="size-7 md:size-8" />
                </div>
                {cat.tag && (
                  <span className="absolute -top-1 -right-1 rounded-md bg-red-600 px-1 py-0.5 text-[8px] font-bold text-white md:text-[10px]">
                    {cat.tag}
                  </span>
                )}
              </div>
              <span className="line-clamp-2 text-center text-[10px] leading-tight font-medium text-gray-700 md:text-xs">
                {cat.name}
              </span>
            </div>
          ))}
        </div>

        {/* Promo Header */}
        <div className="mt-12">
          <h2 className="text-lg font-black text-gray-900 md:text-2xl">
            Semua Promo To Do buat Liburanmu
          </h2>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 md:text-sm">
              Makin hemat wujudin liburan impian dengan promo menarik. 🤑
            </p>
            {locationFilter && (
              <button
                onClick={() => setLocationFilter(null)}
                className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:bg-blue-100">
                <Icon name="MapPin" className="size-3.5" />
                Lokasi: {locationFilter}
                <Icon name="X" className="ml-1 size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="mt-6 flex flex-wrap gap-3">
            {["Terbaru", "Promo", "Terlaris"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActivePromoFilter(filter)}
                className={`rounded-xl border px-6 py-2.5 text-xs font-bold transition-all active:scale-95 md:text-sm ${
                  activePromoFilter === filter
                    ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : (
            (() => {
              if (filteredDestinations.length > 0) {
                return (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:gap-8">
                    {filteredDestinations.map((item: any, idx: number) =>
                      renderDestinationCard(item, idx)
                    )}
                  </div>
                );
              }

              return (
                <div className="flex h-64 flex-col items-center justify-center rounded-3xl bg-gray-50 text-center">
                  <Icon name="SearchX" className="size-16 text-gray-300" />
                  <p className="mt-4 text-sm font-medium text-gray-500">
                    Opps! Tidak ada destinasi{" "}
                    {activeCategory !== "Semua Kategori" ? `di kategori "${activeCategory}"` : ""}{" "}
                    ditemukan.
                  </p>
                </div>
              );
            })()
          )}
        </div>
      </div>

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
