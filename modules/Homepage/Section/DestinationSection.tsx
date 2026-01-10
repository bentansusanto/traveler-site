"use client";

import Icon from "@/components/icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFindAllDestinationQuery } from "@/store/services/destination.service";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

export const DestinationSection = () => {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const currentCurrency = useSelector((state: any) => state.currency);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Fetch destination data from API
  const { data: response } = useFindAllDestinationQuery();
  const destinations = response?.data || [];

  // Desktop: Scroll-based carousel
  const maxIndex = Math.max(destinations.length - 4, 0); // Max scroll index (total - visible items)
  const [scrollIndex, setScrollIndex] = useState(0);
  const cardWidth = 320; // Card width + gap (adjust based on your actual card size)

  // Mobile: Scroll position check
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Desktop: Handle next/prev navigation
  const handleNext = () => {
    if (scrollIndex < maxIndex) {
      const newIndex = scrollIndex + 1;
      setScrollIndex(newIndex);
      desktopScrollRef.current?.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth"
      });
    }
  };

  const handlePrev = () => {
    if (scrollIndex > 0) {
      const newIndex = scrollIndex - 1;
      setScrollIndex(newIndex);
      desktopScrollRef.current?.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth"
      });
    }
  };

  // Desktop: Sync scrollIndex with actual scroll position
  useEffect(() => {
    if (!isMobile) {
      const container = desktopScrollRef.current;
      const onScroll = () => {
        const index = Math.round((container?.scrollLeft || 0) / cardWidth);
        setScrollIndex(index);
      };
      container?.addEventListener("scroll", onScroll);
      return () => container?.removeEventListener("scroll", onScroll);
    }
  }, [isMobile, cardWidth]);

  // Mobile: Check scroll position
  const checkScrollPosition = () => {
    if (mobileScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = mobileScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    if (isMobile) {
      checkScrollPosition();
      const container = mobileScrollRef.current;
      if (container) {
        container.addEventListener("scroll", checkScrollPosition);
        return () => container.removeEventListener("scroll", checkScrollPosition);
      }
    }
  }, [isMobile]);

  // Mobile: Scroll function
  const scrollMobile = (direction: "left" | "right") => {
    if (mobileScrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        direction === "left"
          ? mobileScrollRef.current.scrollLeft - scrollAmount
          : mobileScrollRef.current.scrollLeft + scrollAmount;

      mobileScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth"
      });
    }
  };

  const renderDestinationCard = (item: any, idx: number) => {
    const translation =
      item.translations?.find((t: any) => t.language_code === locale) || item.translations?.[0];
    const name = translation?.name || "Unknown Destination";
    const image = translation?.thumbnail || "/images/placeholder.jpg";
    const rawPrice = parseFloat(item.price) || 0;
    let displayPrice = rawPrice;

    // Dynamic conversion using rate from Redux store
    if (currentCurrency.code === "USD") {
      displayPrice = rawPrice * currentCurrency.idrToUsdRate;
    }

    const price = new Intl.NumberFormat(currentCurrency.code === "IDR" ? "id-ID" : "en-US", {
      style: "currency",
      currency: currentCurrency.code,
      maximumFractionDigits: currentCurrency.code === "IDR" ? 0 : 2
    })
      .format(displayPrice)
      .replace("$", "US$ ");

    return (
      <div
        key={item.id || idx}
        className={`group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100/80 bg-white transition-all ${
          isMobile ? "w-[calc(50vw-1.75rem)] flex-shrink-0" : "min-w-[300px]"
        }`}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 220px, (max-width: 1024px) 50vw, 25vw"
            priority={idx < 2}
          />
          {idx % 2 === 0 && (
            <div className="absolute right-0 bottom-0 rounded-tl-xl bg-red-600 px-3 py-1 text-[10px] font-bold text-white">
              ini BARU murah!
            </div>
          )}
        </div>

        {/* Info */}
        <div className={`flex flex-1 flex-col ${isMobile ? "p-3" : "p-4"}`}>
          <h3
            className={`line-clamp-2 font-bold text-gray-900 ${isMobile ? "text-xs" : "text-sm md:text-base"}`}>
            {name}
          </h3>
          <p
            className={`mt-1 flex items-center gap-1 text-gray-500 ${isMobile ? "text-[10px]" : "text-[10px] md:text-xs"}`}>
            {item.location}
          </p>

          <div className="mt-2 flex items-center gap-1">
            <Icon name="Star" className="size-3 fill-orange-400 text-orange-400" />
            <span
              className={`font-bold text-gray-700 ${isMobile ? "text-[10px]" : "text-[10px] md:text-xs"}`}>
              4.4
            </span>
            <span
              className={`text-gray-400 ${isMobile ? "text-[10px]" : "text-[10px] md:text-xs"}`}>
              /5 (25.3rb Review)
            </span>
          </div>

          <div className="mt-auto pt-4">
            <p
              className={`text-gray-400 line-through ${isMobile ? "text-[10px]" : "text-[10px] md:text-xs"}`}>
              {price}
            </p>
            <p className={`font-bold text-red-600 ${isMobile ? "text-sm" : "text-sm md:text-lg"}`}>
              {price}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-3 bg-white px-5 py-5 md:mt-20 md:bg-transparent md:px-8 lg:mx-auto lg:max-w-5xl lg:px-0 xl:max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold md:text-2xl">Our List Destination</h2>
          <p className="text-sm text-gray-500">
            Lorem{" "}
            <span className="rounded bg-blue-500 px-2 py-0.5 text-xs text-white">
              237 Hug + 36 Hug
            </span>{" "}
            amet, consectetur adipisicing elit, sed do eiusmod.
          </p>
        </div>

        {/* Navigation Buttons */}
        {!isMobile ? (
          // Desktop: Scroll-based Navigation
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={scrollIndex <= 0}
              className={`flex size-10 items-center justify-center rounded-full transition-colors ${
                scrollIndex <= 0
                  ? "cursor-not-allowed bg-gray-100 opacity-50"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}>
              <Icon
                name="ChevronLeft"
                className={`size-5 ${scrollIndex <= 0 ? "text-gray-400" : "text-white"}`}
              />
            </button>
            <button
              onClick={handleNext}
              disabled={scrollIndex >= maxIndex}
              className={`flex size-10 items-center justify-center rounded-full transition-colors ${
                scrollIndex >= maxIndex
                  ? "cursor-not-allowed bg-gray-100 opacity-50"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}>
              <Icon
                name="ChevronRight"
                className={`size-5 ${scrollIndex >= maxIndex ? "text-gray-400" : "text-white"}`}
              />
            </button>
          </div>
        ) : (
          // Mobile: Scroll Navigation (hidden on mobile)
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => scrollMobile("left")}
              disabled={!canScrollLeft}
              className={`flex size-10 items-center justify-center rounded-full transition-colors ${
                canScrollLeft
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "cursor-not-allowed bg-gray-100 opacity-50"
              }`}>
              <Icon
                name="ChevronLeft"
                className={`size-5 ${canScrollLeft ? "text-white" : "text-gray-400"}`}
              />
            </button>
            <button
              onClick={() => scrollMobile("right")}
              disabled={!canScrollRight}
              className={`flex size-10 items-center justify-center rounded-full transition-colors ${
                canScrollRight
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "cursor-not-allowed bg-gray-100 opacity-50"
              }`}>
              <Icon
                name="ChevronRight"
                className={`size-5 ${canScrollRight ? "text-white" : "text-gray-400"}`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Destination Cards - Conditional Rendering */}
      {isMobile ? (
        // Mobile View: Horizontal Scroll with Hidden Scrollbar
        <div ref={mobileScrollRef} className="scrollbar-hide mt-6 flex gap-3 overflow-x-auto">
          {destinations.map((item: any, idx: number) => renderDestinationCard(item, idx))}
        </div>
      ) : (
        // Desktop View: Scroll-based Carousel
        <div ref={desktopScrollRef} className="scrollbar-hide mt-6 flex gap-4 overflow-x-auto">
          {destinations.map((item: any, idx: number) => renderDestinationCard(item, idx))}
        </div>
      )}
    </div>
  );
};
