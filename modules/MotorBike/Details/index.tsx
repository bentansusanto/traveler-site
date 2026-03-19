"use client";

import Icon from "@/components/icon";
import { Footer } from "@/components/layout/traveler-layout/Footer";
import { Navbar } from "@/components/layout/traveler-layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMotorDetailLogic } from "./logic";

export const MotorBikeDetailPage = () => {
  const {
    motor,
    translation,
    isLoading,
    formatPrice,
    openBookingDrawer,
    rawDailyPrice,
    rawWeeklyPrice,
    galleryImages,
    locale
  } = useMotorDetailLogic();

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!motor || !translation) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Icon name="Frown" className="size-16 text-gray-400" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">Motor tidak ditemukan</h2>
        <Link href={`/${locale}/motor-bike`} className="mt-4 text-blue-600 hover:underline">
          Kembali ke daftar motor
        </Link>
      </div>
    );
  }



  return (
    <div className="relative min-h-screen bg-white pb-32">
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <div className="mx-auto max-w-7xl md:px-8 md:py-8">
        {/* Image Carousel */}
        <div className="relative">
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: true }}
            className="w-full">
            <CarouselContent className="-ml-0 md:-ml-4">
              {galleryImages.length > 0 ? (
                galleryImages.map((img, i) => (
                  <CarouselItem key={i} className="pl-0 md:basis-[85%] md:pl-4">
                    <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[21/9] md:rounded-3xl">
                      <Image
                        src={img}
                        alt={`${translation.name_motor} ${i + 1}`}
                        fill
                        className="object-cover"
                        priority={i === 0}
                      />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className="pl-0 md:pl-4">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 md:aspect-[21/9] md:rounded-3xl flex items-center justify-center">
                    <Icon name="Bike" className="size-24 text-gray-300" />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
          </Carousel>

          {/* Overlay Actions */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 md:p-6">
            <button
              onClick={() => window.history.back()}
              className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm active:scale-95">
              <Icon name="ChevronLeft" className="size-6 text-gray-900" />
            </button>
            <div className="flex gap-2">
              <button className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm active:scale-95">
                <Icon name="Heart" className="size-5 text-gray-900" />
              </button>
            </div>
          </div>

          {/* Dot indicators */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 backdrop-blur-sm md:bottom-8">
              {galleryImages.slice(0, 5).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    current === i ? "w-4 bg-white" : "w-1.5 bg-white/50"
                  )}
                />
              ))}
            </div>
          )}

          {galleryImages.length > 1 && (
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="absolute right-4 bottom-4 hidden items-center gap-2 rounded-xl bg-black/40 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-black/60 active:scale-95 md:right-8 md:bottom-8 md:flex md:px-4 md:py-2">
              <Icon name="Image" className="size-4 text-white" />
              <span className="text-xs font-bold text-white md:text-sm">Galeri</span>
            </button>
          )}
        </div>

        <div className="mt-6 px-4 md:mt-8 md:px-0">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Content Section */}
            <div className="lg:col-span-2">
              {/* Title & Brand */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 md:text-4xl">
                    {translation.name_motor}
                  </h1>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    {motor.merek?.name_merek}
                  </p>
                </div>
                <div
                  className={cn(
                    "mt-1 rounded-full px-3 py-1 text-xs font-bold",
                    motor.is_available
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  )}>
                  {motor.is_available ? "Available" : "Unavailable"}
                </div>
              </div>

              {/* Rating */}
              <div className="mt-4 flex">
                <div className="flex items-center gap-3 rounded-2xl bg-blue-50/50 p-3 px-4">
                  <span className="text-xl font-bold text-gray-900">
                    4.8<span className="text-sm font-bold text-gray-400">/5</span>
                  </span>
                  <div className="flex flex-col border-l border-blue-200 pl-3">
                    <span className="text-xs font-bold text-gray-500">(10.2K+ review)</span>
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Icon name="MapPin" className="size-5 text-gray-400" />
                    <span className="text-sm font-semibold">{motor.state?.name || "Indonesia"}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Icon name="Settings" className="size-5 text-gray-400" />
                    <span className="text-sm font-semibold">Engine</span>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{motor.engine_cc} cc</span>
                </div>
                {motor.variants && motor.variants.length > 0 && (
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Icon name="Palette" className="size-5 text-gray-400" />
                      <span className="text-sm font-semibold">Warna Tersedia</span>
                    </div>
                    <div className="flex gap-2">
                      {motor.variants.map((v: any, i: number) => (
                        <span
                          key={i}
                          className="rounded-full border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {v.color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {translation.description && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900">Deskripsi</h3>
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">
                    {translation.description}
                  </p>
                </div>
              )}

              {/* Pricing Options */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900">Harga Sewa Dasar</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {rawDailyPrice > 0 && (
                    <div className="rounded-2xl border-2 border-gray-200 p-4 text-left">
                      <p className="text-xs font-medium text-gray-500">Harian</p>
                      <p className="mt-1 text-base font-black text-gray-900">
                        {formatPrice(rawDailyPrice)}
                        <span className="text-xs font-medium text-gray-400"> / Hari</span>
                      </p>
                    </div>
                  )}
                  {rawWeeklyPrice > 0 && (
                    <div className="rounded-2xl border-2 border-gray-200 p-4 text-left">
                      <p className="text-xs font-medium text-gray-500">Mingguan</p>
                      <p className="mt-1 text-base font-black text-gray-900">
                        {formatPrice(rawWeeklyPrice)}
                        <span className="text-xs font-medium text-gray-400"> / Minggu</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar / Booking Card - Desktop Only */}
            <div className="hidden lg:col-span-1 lg:block">
              <Card className="sticky top-24 rounded-3xl border-none shadow-xl ring-1 ring-gray-100">
                <CardContent className="px-6 py-5">
                  <h3 className="text-lg font-bold text-gray-900">Informasi Booking</h3>

                  <div className="mt-6 flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-500">Mulai dari</span>
                    <span className="text-2xl font-black text-gray-900">
                      {formatPrice(rawDailyPrice)}
                      <span className="text-sm font-bold text-gray-400"> / Hari</span>
                    </span>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-4">
                    <Button
                      disabled={!motor.is_available || rawDailyPrice === 0}
                      onClick={openBookingDrawer}
                      className="h-12 rounded-2xl bg-blue-600 font-bold text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50">
                      {!motor.is_available ? "Motor Tidak Tersedia" : "Pesan Sekarang"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-12 rounded-2xl font-bold text-gray-500 hover:text-gray-700">
                      <Icon name="Bookmark" className="mr-2 size-4" />
                      Simpan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar - Mobile Only */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 bg-white p-4 pb-8 lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div className="flex flex-col">
            <p className="text-[10px] font-medium text-gray-500">Mulai dari</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-medium text-gray-400 line-through">
                {formatPrice(rawDailyPrice * 1.2)}
              </span>
              <span className="text-lg font-black text-red-500">{formatPrice(rawDailyPrice)}</span>
              <span className="text-xs text-gray-400">/hari</span>
            </div>
          </div>
          <Button
            disabled={!motor.is_available}
            className="h-12 flex-1 rounded-2xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
            onClick={openBookingDrawer}>
            {!motor.is_available ? "Tidak Tersedia" : "Pesan Sekarang"}
          </Button>
        </div>
      </div>

      {/* Full-screen Gallery Dialog */}
      {galleryImages.length > 1 && (
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent
            showCloseButton={false}
            className="h-screen w-screen max-w-none gap-0 overflow-hidden rounded-none border-none p-0 outline-none lg:h-[90vh] lg:w-[95vw] lg:max-w-[1280px] lg:rounded-[32px]">
            <DialogTitle className="sr-only">Galeri Foto {translation.name_motor}</DialogTitle>
            <div className="flex h-full flex-col overflow-hidden bg-white lg:flex-row">
              {/* Left Sidebar - Thumbnails */}
              <div className="hidden border-r border-gray-100 bg-white lg:flex lg:w-[380px] lg:flex-col">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900">Foto</h2>
                </div>
                <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-6">
                  <div className="grid grid-cols-2 gap-3">
                    {galleryImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedGalleryIndex(i)}
                        className={cn(
                          "relative aspect-square overflow-hidden rounded-xl bg-gray-100 transition-all",
                          selectedGalleryIndex === i
                            ? "ring-4 ring-blue-500 ring-offset-2"
                            : "opacity-70 hover:opacity-100"
                        )}>
                        <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Main Display */}
              <div className="relative flex flex-1 items-center justify-center bg-gray-900">
                <button
                  onClick={() => setIsGalleryOpen(false)}
                  className="absolute top-6 right-6 z-20 flex size-10 items-center justify-center rounded-xl bg-white shadow-xl transition-all hover:bg-gray-50 active:scale-95">
                  <Icon name="X" className="size-6 text-gray-900" />
                </button>
                <div className="relative h-full w-full">
                  <Image
                    src={galleryImages[selectedGalleryIndex]}
                    alt="Full Image"
                    fill
                    className="object-contain"
                    priority
                  />
                  <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-6">
                    <button
                      onClick={() =>
                        setSelectedGalleryIndex((prev) =>
                          prev > 0 ? prev - 1 : galleryImages.length - 1
                        )
                      }
                      className="flex size-12 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40">
                      <Icon name="ChevronLeft" className="size-8" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedGalleryIndex((prev) =>
                          prev < galleryImages.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="flex size-12 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40">
                      <Icon name="ChevronRight" className="size-8" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};
