"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const popularDestination = [
  {
    location: "Indonesia",
    searchKey: "Indonesia",
    image: "bali-destination.jpg"
  },
  {
    location: "Switzerland",
    searchKey: "Switzerland",
    image: "swiss-destination.jpg"
  },
  {
    location: "Turkey",
    searchKey: "Turkey",
    image: "turkey-destination.jpg"
  },
  {
    location: "Europe",
    searchKey: "Europe",
    image: "eropa-destination.jpg"
  }
];

export const PopularDestination = () => {
  const t = useTranslations("HomePage.Popular");
  const locale = useLocale();

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
      {/* Section Header */}
      <div className="mx-auto flex flex-col items-center text-center space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1 text-xs font-bold text-orange-600 border border-orange-200/80 uppercase tracking-wider">
          <Compass className="h-3.5 w-3.5 text-orange-500" />
          <span>{t("badge")}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          {t("title")}
        </h2>
        <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
          {t("description")}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="scrollbar-hide mt-10 flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {popularDestination.map((list, idx) => (
          <Link
            key={idx}
            href={`/${locale}/tour-holiday-religion?search=${encodeURIComponent(list.searchKey)}`}
            className="group relative aspect-[4/5] w-[250px] sm:w-[280px] md:w-full flex-shrink-0 overflow-hidden rounded-3xl bg-slate-100 border border-slate-200/70 shadow-xs hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-1.5 transition-all duration-500">
            <Image
              src={`/images/${list.image}`}
              alt={list.location}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 70vw, (max-width: 1024px) 45vw, 25vw"
              priority={idx < 2}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-95" />

            {/* Bottom Content */}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold mb-1">
                  <MapPin className="size-3.5" />
                  <span>{t("explore")}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md tracking-tight group-hover:text-sky-200 transition-colors">
                  {list.location}
                </h3>
              </div>
              <div className="flex size-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 transition-all duration-300 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:scale-110 shadow-sm">
                <ArrowRight className="size-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
