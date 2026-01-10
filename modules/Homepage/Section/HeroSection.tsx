"use client";

import Icon from "@/components/icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavMenu } from "@/lib/menus/mobile-nav";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const HeroSection = () => {
  const isMobile = useIsMobile();
  return (
    <>
      {isMobile ? (
        <div className="flex flex-col">
          {/* Hero Image Section (Mobile) */}
          <div className="relative h-[280px] w-full overflow-hidden">
            <Image
              src={"/images/bg-hero-mobile.jpg"}
              fill
              className="object-cover"
              alt="Hero Background"
              priority
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-x-0 bottom-12 flex flex-col items-center px-6">
              <h1 className="mb-4 text-center text-xl font-bold text-white">
                Hai kamu,{" "}
                <span className="font-extrabold underline decoration-yellow-400">mau ke mana?</span>
              </h1>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <Search className="size-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rental Mobil di Bali"
                  className="h-11 w-full rounded-full bg-white pr-4 pl-11 text-sm shadow-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Categories Grid (Mobile) */}
          <div className="relative -mt-6 bg-white px-5 pt-6 pb-5">
            <div className="grid grid-cols-4 gap-y-6">
              {NavMenu.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-1.5 transition-transform active:scale-95">
                  <div className="relative flex size-14 items-center justify-center rounded-2xl bg-blue-50/50 hover:bg-blue-100">
                    <Icon name={item.icon || "HelpCircle"} className="size-6 text-blue-600" />
                  </div>
                  <span className="text-center text-[10px] font-medium text-gray-700">
                    {item.page}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Desktop Hero Section (Overlapping Search & Category)
        <div className="relative w-full">
          {/* Hero Background Area */}
          <div className="relative flex min-h-[500px] w-full items-center justify-center pt-20 pb-40">
            {/* Background Image Container */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src="/images/bg-hero-mobile.jpg"
                fill
                className="object-cover"
                alt="Hero Background"
                priority
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center px-5 lg:px-10">
              <div className="flex w-full flex-col items-center text-center">
                <span className="mb-4 block text-sm font-bold tracking-widest text-orange-500 uppercase drop-shadow-md">
                  Exceptional Travel Discoveries
                </span>
                <h1
                  className="mb-8 font-extrabold text-white drop-shadow-2xl"
                  style={{ fontSize: "clamp(2.5rem, 5vw + 1rem, 5rem)" }}>
                  Wonderland of Nature
                </h1>
              </div>
            </div>
          </div>

          {/* Overlapping Container (Search + Category) */}
          <div className="relative z-20 mx-auto -mt-32 w-full max-w-[1000px] px-5 lg:px-10">
            <div className="overflow-hidden rounded-[32px] bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
              {/* Simplified Search Bar (Mobile Style) */}
              <div className="relative m-4">
                <div className="absolute inset-y-0 left-6 flex items-center">
                  <Search className="size-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rental Mobil di Bali"
                  className="h-16 w-full rounded-2xl bg-gray-50 pr-6 pl-14 text-[14px] transition-shadow outline-none focus:ring-4 focus:ring-blue-100 lg:text-[16px]"
                />
                <div className="absolute inset-y-2 right-2 flex items-center">
                  <button className="h-12 rounded-xl bg-blue-600 px-8 font-bold text-white transition-all hover:bg-blue-700 active:scale-95">
                    Search
                  </button>
                </div>
              </div>

              {/* Divider Line */}
              <div className="mx-8 border-t border-gray-100" />

              {/* Categories Part */}
              <div className="flex flex-col items-center gap-6 px-4 py-8 md:gap-8 lg:px-8">
                {/* Row 1: 5 items */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-6 md:gap-x-10 lg:gap-x-12 xl:gap-x-16">
                  {NavMenu.slice(0, 5).map((item, index) => (
                    <CategoryLink key={index} item={item} />
                  ))}
                </div>
                {/* Row 2: Remaining items */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-6 md:gap-x-10 lg:gap-x-12 xl:gap-x-16">
                  {NavMenu.slice(5).map((item, index) => (
                    <CategoryLink key={index} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const CategoryLink = ({ item }: { item: (typeof NavMenu)[0] }) => (
  <Link
    href={item.href}
    className="group flex flex-col items-center justify-center gap-2 transition-transform hover:-translate-y-1 active:scale-95">
    <div className="relative flex size-10 items-center justify-center rounded-xl bg-blue-50/50 text-blue-600 transition-all group-hover:bg-blue-100 md:size-16 lg:size-18 xl:size-20">
      <Icon
        name={item.icon || "HelpCircle"}
        className="size-6 transition-all md:size-8 lg:size-8 xl:size-8"
      />
    </div>
    <span className="max-w-[80px] text-center text-[10px] font-bold text-gray-700 transition-colors group-hover:text-blue-600 md:max-w-[150px] lg:text-[11px] xl:text-xs">
      {item.page}
    </span>
  </Link>
);
