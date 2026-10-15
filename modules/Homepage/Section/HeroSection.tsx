"use client";

import Icon from "@/components/icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavMenu } from "@/lib/menus/mobile-nav";
import { useTranslations } from "next-intl";
import { X, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HomeSearch } from "@/components/ui/home-search";

export const HeroSection = () => {
  const isMobile = useIsMobile();
  const t = useTranslations("HomePage.Hero");
  const [isServicesDrawerOpen, setIsServicesDrawerOpen] = useState(false);

  return (
    <>
      {isMobile ? (
        <>
          <div className="relative flex min-h-[520px] w-full flex-col items-center justify-center pt-24 pb-12">
            {/* Background Image Container */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src="/images/bg-hero-mobile.jpg"
                fill
                className="object-cover"
                alt="Hero Background"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/50 to-slate-950/80" />
            </div>

            <div className="relative z-10 mx-auto flex w-full flex-col items-center px-4">
              <div className="mb-6 flex w-full flex-col items-center text-center">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-500/15 px-3 py-1 text-[11px] font-bold tracking-wider text-orange-400 backdrop-blur-md uppercase mb-3 shadow-xs">
                  <Sparkles className="h-3 w-3 text-orange-400" />
                  <span>{t("tagline")}</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
                  {t("mobileTitle1")} <br />
                  <span className="text-orange-400">{t("mobileTitle2")}</span>
                </h1>
                <p className="mt-2 text-xs sm:text-sm font-medium text-slate-200 drop-shadow-sm max-w-xs">
                  {t("mobileSubtitle")}
                </p>
              </div>

              {/* Mobile Search Bar */}
              <div className="w-full max-w-sm">
                <HomeSearch isMobile />
              </div>

              {/* Mobile Categories - Glass Grid (3x2) */}
              <div className="w-full mt-8 px-2">
                <div className="grid grid-cols-3 gap-3">
                  {NavMenu.slice(0, 5).map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="group flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 shadow-sm transition-all duration-200 active:scale-95 active:bg-white/20">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-white/20 text-white transition-transform group-hover:scale-110">
                        <Icon name={item.icon || "HelpCircle"} className="size-5" />
                      </div>
                      <span className="text-center text-[11px] font-semibold text-white line-clamp-1">
                        {item.page}
                      </span>
                    </Link>
                  ))}
                  {/* Lainnya (Others) Button */}
                  <button
                    type="button"
                    onClick={() => setIsServicesDrawerOpen(true)}
                    className="group flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 shadow-sm transition-all duration-200 active:scale-95 active:bg-white/20 outline-none">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-white/20 text-white transition-transform group-hover:scale-110">
                      <Icon name="Grip" className="size-5" />
                    </div>
                    <span className="text-center text-[11px] font-semibold text-white line-clamp-1">
                      {t("more")}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Services Drawer */}
          {isServicesDrawerOpen && (
            <div className="fixed inset-0 z-[100] flex flex-col justify-end">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsServicesDrawerOpen(false)}
              />
              <div className="relative z-10 w-full animate-in slide-in-from-bottom-full duration-300 rounded-t-3xl bg-white p-6 pb-12 shadow-2xl">
                <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900">{t("allServices")}</h3>
                  <button
                    onClick={() => setIsServicesDrawerOpen(false)}
                    className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                    <X className="size-4" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-y-5 gap-x-3">
                  {NavMenu.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setIsServicesDrawerOpen(false)}
                      className="flex flex-col items-center gap-2 group">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105 shadow-xs">
                        <Icon name={item.icon || "HelpCircle"} className="size-5" />
                      </div>
                      <span className="text-center text-[11px] font-semibold text-slate-700 leading-tight">
                        {item.page}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // Desktop Hero Section
        <div className="relative w-full">
          <div className="relative flex min-h-[640px] w-full flex-col items-center justify-center pt-32 pb-24">
            {/* High-Resolution Landscape Background */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src="/images/bg-hero-mobile.jpg"
                fill
                className="object-cover"
                alt="Hero Background"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/40 to-slate-950/80" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 sm:px-6 lg:px-8">
              <div className="flex w-full flex-col items-center text-center">
                {/* Modern Frosted Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/15 px-4 py-1.5 backdrop-blur-md mb-5 shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">
                    {t("tagline")}
                  </span>
                </div>

                {/* Primary Heading */}
                <h1 className="mb-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md max-w-3xl leading-tight">
                  {t("title")}
                </h1>

                {/* Subtitle */}
                <p className="mb-10 text-sm sm:text-base md:text-lg text-slate-200/90 font-normal max-w-2xl text-center leading-relaxed">
                  {t("mobileSubtitle")}
                </p>
              </div>

              {/* Modern Search & Categories Container */}
              <div className="w-full max-w-3xl">
                <HomeSearch />

                {/* Categories - Minimalist Frosted Chips */}
                <div className="mt-8 flex flex-wrap justify-center gap-3 px-2">
                  {NavMenu.map((item, index) => (
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
    className="group flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-md border border-white/20 transition-all duration-200 hover:bg-white hover:text-slate-900 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 active:scale-95">
    <Icon
      name={item.icon || "HelpCircle"}
      className="size-4 text-white transition-colors group-hover:text-blue-600"
    />
    <span className="text-xs font-semibold text-white transition-colors group-hover:text-slate-900">
      {item.page}
    </span>
  </Link>
);
