"use client";

import Icon from "@/components/icon";
import { Footer } from "@/components/layout/traveler-layout/Footer";
import { Navbar } from "@/components/layout/traveler-layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { setHasNewBooking } from "@/store/slices/uiSlice";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useDestinationDetailsLogic } from "./logic";

export const DestinationDetailsPage = () => {
  const {
    destination,
    translation,
    isLoading,
    isBooking,
    formatPrice,
    bookingData,
    // setBookingData,
    handleBooking,
    galleryImages,
    isDateDrawerOpen,
    setIsDateDrawerOpen,
    selectedDate,
    setSelectedDate,
    locale,
    hasNewBooking
  } = useDestinationDetailsLogic();

  const dispatch = useDispatch();

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

  if (!destination || !translation) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Icon name="Frown" className="size-16 text-gray-400" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">Destinasi tidak ditemukan</h2>
        <Link href={`/${locale}`} className="mt-4 text-blue-600 hover:underline">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  const rawPrice = parseFloat(destination.price) || 0;
  const tax = 0; // Removing tax for now to match "Mulai dari" style if needed, or keep it simple
  const total = rawPrice + tax;

  return (
    <div className="relative min-h-screen bg-white pb-32">
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <div className="mx-auto max-w-7xl md:px-8 md:py-8">
        {/* Responsive Image Carousel */}
        <div className="relative">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true
            }}
            className="w-full">
            <CarouselContent className="-ml-0 md:-ml-4">
              {galleryImages.map((img, i) => (
                <CarouselItem key={i} className="pl-0 md:basis-[85%] md:pl-4">
                  <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[21/9] md:rounded-3xl">
                    <Image
                      src={img}
                      alt={`${translation.name} ${i + 1}`}
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
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
              <Link
                href="/my-bookings"
                onClick={() => dispatch(setHasNewBooking(false))}
                className="md:hidden">
                <button className="relative flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm active:scale-95">
                  <Icon name="Ticket" className="size-5 text-gray-900" />
                  {hasNewBooking && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                    </span>
                  )}
                </button>
              </Link>
              <button className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm active:scale-95">
                <Icon name="Heart" className="size-5 text-gray-900" />
              </button>
            </div>
          </div>

          {/* Indicators & Galeri Button */}
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

          <button
            onClick={() => setIsGalleryOpen(true)}
            className="absolute right-4 bottom-4 hidden items-center gap-2 rounded-xl bg-black/40 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-black/60 active:scale-95 md:right-8 md:bottom-8 md:flex md:px-4 md:py-2">
            <Icon name="Image" className="size-4 text-white" />
            <span className="text-xs font-bold text-white md:text-sm">Galeri</span>
          </button>
        </div>

        <div className="mt-6 px-4 md:mt-8 md:px-0">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Content Section */}
            <div className="lg:col-span-2">
              <h1 className="text-2xl font-bold text-gray-900 md:text-4xl">{translation.name}</h1>

              {/* Informational Cards Row - Mobile Style */}
              <div className="mt-4 flex">
                <div className="flex items-center gap-3 rounded-2xl bg-blue-50/50 p-3 px-4">
                  <span className="text-xl font-bold text-gray-900">
                    4.4<span className="text-sm font-bold text-gray-400">/5</span>
                  </span>
                  <div className="flex flex-col border-l border-blue-200 pl-3">
                    <span className="text-xs font-bold text-gray-500">(25RB+ review)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Icon name="MapPin" className="size-5 text-gray-400" />
                    <span className="text-sm font-semibold">{destination.location}</span>
                  </div>
                  <Icon name="ChevronRight" className="size-4 text-gray-300" />
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="pl-7 text-xs font-bold">Indonesia</span>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm leading-relaxed text-gray-600">
                  {translation.description ||
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                </p>
              </div>

              <div className="mt-12">
                <h3 className="text-lg font-bold text-gray-900">Detail Tour.</h3>
                <div className="mt-4 flex flex-wrap gap-8">
                  <div className="flex items-center gap-3">
                    <Icon name="Globe" className="size-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">1 Negara</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="Calendar" className="size-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">1 days</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="Send" className="size-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">5 Keberangkatan</span>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-lg font-bold text-gray-900">Benefits.</h3>
                <ul className="mt-4 space-y-3">
                  {(
                    translation.facilities || ["Fully escorted by an English speaking tour guide."]
                  ).map((benefit: string, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex size-5 items-center justify-center rounded-full bg-green-100">
                        <Icon name="Check" className="size-3 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar / Booking Card - Desktop Only */}
            <div className="hidden lg:col-span-1 lg:block">
              <Card className="sticky top-24 rounded-3xl border-none shadow-xl ring-1 ring-gray-100">
                <CardContent className="px-6 py-5">
                  <h3 className="text-lg font-bold text-gray-900">Booking Info</h3>

                  <div className="mt-6 space-y-4">
                    <DatePicker
                      date={selectedDate}
                      setDate={setSelectedDate}
                      className="h-14 w-full rounded-2xl border-none bg-gray-50 transition-colors hover:bg-gray-100"
                    />
                  </div>

                  <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-500">Subtotal</span>
                      <span className="font-bold text-gray-900">{formatPrice(rawPrice)}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-sm font-medium text-gray-500">Total Price</span>
                      <span className="text-lg font-black text-gray-900">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-4">
                    <Button
                      disabled={isBooking}
                      className="h-12 rounded-2xl bg-blue-600 font-bold text-white hover:bg-blue-700 active:scale-95"
                      onClick={handleBooking}>
                      {isBooking ? "Booking..." : "Pick Date"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-12 rounded-2xl font-bold text-gray-500 hover:text-gray-700">
                      <Icon name="Bookmark" className="mr-2 size-4" />
                      Save Ticket
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
                {formatPrice(rawPrice * 1.2)}
              </span>
              <span className="text-lg font-black text-red-500">{formatPrice(rawPrice)}</span>
            </div>
          </div>
          <Button
            disabled={isBooking}
            className="h-12 flex-1 rounded-2xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-100 active:scale-95"
            onClick={() => setIsDateDrawerOpen(true)}>
            {isBooking ? "Booking..." : "Pick Date"}
          </Button>
        </div>
      </div>

      {/* Date Selection Drawer */}
      <Drawer open={isDateDrawerOpen} onOpenChange={setIsDateDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <div className="mx-auto w-full max-w-md">
            <div className="px-6 pt-8 pb-8">
              <div className="space-y-4">
                <p className="text-sm font-bold text-gray-500">Pilih Tanggal</p>
                <DatePicker date={selectedDate} setDate={setSelectedDate} className="w-full" />
              </div>
              <DrawerTitle />
              <div className="mt-8">
                <div className="flex items-center justify-between rounded-3xl bg-gray-50 p-2">
                  <div className="flex flex-col pl-4">
                    <span className="text-xs font-bold text-gray-500">Total Pembayaran</span>
                    <span className="text-xl font-black text-blue-600">{formatPrice(total)}</span>
                  </div>
                  <Button
                    disabled={isBooking}
                    onClick={handleBooking}
                    className="h-12 rounded-2xl bg-blue-600 px-10 font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95">
                    {isBooking ? "Booking..." : "Konfirmasi"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Advanced Full-screen Image Gallery Dialog */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent
          showCloseButton={false}
          className="h-screen w-screen max-w-none gap-0 overflow-hidden rounded-none border-none p-0 outline-none lg:h-[90vh] lg:w-[95vw] lg:max-w-[1280px] lg:rounded-[32px]">
          <DialogTitle className="sr-only">Galeri Foto {translation.name}</DialogTitle>
          <div className="flex h-full flex-col overflow-hidden bg-white lg:flex-row">
            {/* Left Sidebar - Thumbnails */}
            <div className="hidden border-r border-gray-100 bg-white lg:flex lg:w-[380px] lg:flex-col">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900">Foto & Video</h2>
              </div>

              {/* Thumbnail Grid */}
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

            {/* Right Side - Main Image Display */}
            <div className="relative flex flex-1 items-center justify-center bg-gray-900 lg:bg-[#1a1a1a]">
              {/* Close Button - Desktop (Sticky style in screenshot) */}
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

                {/* Overlay Info (Bottom Left) */}
                <div className="absolute bottom-10 left-10 z-10 flex flex-col gap-2">
                  <div className="w-fit rounded-lg bg-black/40 px-3 py-1 backdrop-blur-md">
                    <span className="text-sm font-bold text-white">
                      {selectedGalleryIndex + 1}/{galleryImages.length}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">
                    {translation.name}
                  </h3>
                </div>

                {/* Navigation Arrows for Main Display */}
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
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};
