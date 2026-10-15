"use client";

import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface ItineraryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: any | null;
  onRemoveItem: (itineraryId: string, itemId: string) => Promise<void>;
  isRemoving?: boolean;
  onUpdateItemDate?: (itineraryId: string, itemId: string, newDate: Date) => Promise<void>;
  isUpdatingDate?: boolean;
  onUpdateItineraryName?: (itineraryId: string, newName: string) => Promise<void>;
  isUpdatingName?: boolean;
}

export const ItineraryDetailModal = ({
  isOpen,
  onClose,
  itinerary,
  onRemoveItem,
  isRemoving = false,
  onUpdateItemDate,
  isUpdatingDate = false,
  onUpdateItineraryName,
  isUpdatingName = false
}: ItineraryDetailModalProps) => {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const t = useTranslations("Itinerary");
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    if (itinerary) {
      setNameInput(itinerary.name || "");
    }
  }, [itinerary]);

  const handleSaveName = async () => {
    if (!nameInput.trim() || !onUpdateItineraryName || !itinerary) return;
    await onUpdateItineraryName(itinerary.id, nameInput.trim());
    setIsEditingName(false);
  };

  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", idrToUsdRate: 1 / 16000 }
  );

  const formatPrice = (rawPrice: number) => {
    let displayPrice = rawPrice;
    if (currentCurrency.code !== "USD") {
      displayPrice = rawPrice * currentCurrency.idrToUsdRate;
    }
    return new Intl.NumberFormat(currentCurrency.code === "IDR" ? "id-ID" : "en-US", {
      style: "currency",
      currency: currentCurrency.code,
      maximumFractionDigits: currentCurrency.code === "IDR" ? 0 : 2
    })
      .format(displayPrice)
      .replace("$", "US$ ");
  };

  if (!itinerary) return null;

  const items = itinerary.items || itinerary.itinerary_items || [];
  const firstItem = items[0];
  const destinationLocation = firstItem?.destination?.location;
  const location =
    itinerary.location ||
    destinationLocation ||
    (itinerary.state?.name
      ? `${itinerary.state.name}, ${itinerary.country?.name || ""}`
      : itinerary.country?.name) ||
    "Turkey";

  const calculatedSubtotal =
    itinerary.subtotal !== undefined
      ? Number(itinerary.subtotal)
      : items.reduce((acc: number, cur: any) => acc + Number(cur.destination?.price || 0), 0);

  const getStatusBadgeClass = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "draft":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ongoing":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Sort items chronologically by visit_date
  const sortedItems = [...items].sort((a: any, b: any) => {
    const dateA = a.visit_date ? new Date(a.visit_date).getTime() : 0;
    const dateB = b.visit_date ? new Date(b.visit_date).getTime() : 0;
    return dateA - dateB;
  });

  const handleDateSelect = async (itemId: string, date?: Date) => {
    if (!date || !onUpdateItemDate) return;
    setOpenPopoverId(null);
    await onUpdateItemDate(itinerary.id, itemId, date);
  };

  // ── Mobile / Tablet View: Bottom Sheet Drawer ─────────────────────────────
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85vh] flex flex-col rounded-t-[28px] bg-white">
          <DrawerHeader className="px-5 py-3.5 border-b border-slate-100 shrink-0 !text-left">
            <div className="flex items-center justify-between gap-3 w-full text-left">
              <div className="min-w-0 flex-1 text-left">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 py-1">
                    <Input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="h-8 text-xs sm:text-sm font-bold border-blue-300 focus:ring-blue-100 rounded-lg px-2"
                      placeholder="Nama Itinerary"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      disabled={isUpdatingName}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95">
                      <Icon name="Check" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(itinerary?.name || "");
                        setIsEditingName(false);
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 active:scale-95">
                      <Icon name="X" className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <DrawerTitle className="text-base font-bold text-slate-900 truncate !text-left">
                      {itinerary?.name || t("tripTo", { location })}
                    </DrawerTitle>
                    {onUpdateItineraryName && (
                      <button
                        type="button"
                        onClick={() => {
                          setNameInput(itinerary?.name || t("tripTo", { location }));
                          setIsEditingName(true);
                        }}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        title="Ubah nama itinerary">
                        <Icon name="Pencil" className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-0.5 !text-left">
                  {t("placesCount", { count: items.length })}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0",
                  getStatusBadgeClass(itinerary.status)
                )}>
                {itinerary.status || "draft"}
              </span>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Summary stat */}
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 p-3.5 border border-blue-100/60 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-300">
                  <Icon name="Compass" className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{t("travelPlanSubtitle")}</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {t("scheduledCount", { count: items.length })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t("totalEstimatedCost")}
                </span>
                <span className="text-base font-black text-blue-600 tracking-tight">
                  {formatPrice(calculatedSubtotal)}
                </span>
              </div>
            </div>

            {/* List items */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t("scheduleListTitle")}
                </h4>
                <span className="text-[11px] font-semibold text-slate-500">{t("sortedByDate")}</span>
              </div>

              {sortedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center">
                  <Icon name="Map" className="size-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">{t("emptyDetail")}</p>
                </div>
              ) : (
                sortedItems.map((item: any, idx: number) => {
                  const dest = item.destination || {};
                  const translation =
                    dest.translations?.find((t: any) => t.language_code === locale) ||
                    dest.translations?.[0];
                  const name = translation?.name || dest.name || "Destinasi Wisata";
                  const image = dest.thumbnail || translation?.thumbnail || "/images/turkey-destination.jpg";
                  const itemPrice = Number(dest.price || 0);
                  const isPopOpen = openPopoverId === item.id;

                  return (
                    <div
                      key={item.id || idx}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                      {/* Number badge */}
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                        {idx + 1}
                      </div>

                      {/* Image */}
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-slate-100">
                        <ImageWithFallback
                          src={image}
                          alt={name}
                          fill
                          className="object-cover"
                          fallbackSrc="/images/turkey-destination.jpg"
                        />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-slate-900 truncate">{name}</h5>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                          {onUpdateItemDate ? (
                            <Popover
                              open={isPopOpen}
                              onOpenChange={(op) => setOpenPopoverId(op ? item.id : null)}>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  disabled={isUpdatingDate}
                                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95 disabled:opacity-50"
                                  title={t("changeDateTooltip")}>
                                  <Icon name="Calendar" className="size-3 text-blue-500 shrink-0" />
                                  <span className="font-medium">
                                    {item.visit_date
                                      ? new Date(item.visit_date).toLocaleDateString(
                                          locale === "id" ? "id-ID" : locale === "tr" ? "tr-TR" : "en-US",
                                          { day: "numeric", month: "short", year: "numeric" }
                                        )
                                      : "Pilih Tanggal"}
                                  </span>
                                  <Icon name="Pencil" className="size-2.5 text-slate-400 ml-0.5" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 z-[300]" align="start">
                                <Calendar
                                  mode="single"
                                  selected={item.visit_date ? new Date(item.visit_date) : undefined}
                                  onSelect={(d) => handleDateSelect(item.id, d)}
                                  disabled={(d) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return d < today;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <Icon name="Calendar" className="size-3 text-slate-400" />
                              {item.visit_date
                                ? new Date(item.visit_date).toLocaleDateString(
                                    locale === "id" ? "id-ID" : locale === "tr" ? "tr-TR" : "en-US",
                                    { day: "numeric", month: "short", year: "numeric" }
                                  )
                                : "-"}
                            </span>
                          )}
                          {itemPrice > 0 && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="font-semibold text-blue-600">
                                {formatPrice(itemPrice)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Delete item button */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(itinerary.id, item.id || item.destination_id)}
                        disabled={isRemoving}
                        className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100 hover:text-red-600 active:scale-95 disabled:opacity-50"
                        title={t("deleteDestTooltip")}>
                        <Icon name="Trash2" className="size-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1 rounded-xl text-xs font-bold h-10">
                {t("closeBtn")}
              </Button>
            </DrawerClose>
            <Link
              href={`/${locale}/book-tour?itinerary_id=${itinerary.id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 h-10 px-4 text-xs font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95">
              <Icon name="CreditCard" className="size-3.5" />
              {t("proceedCheckout")}
            </Link>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // ── Desktop View: Centered Modern Modal (Dialog) ───────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[88vh] w-[95vw] sm:max-w-2xl flex flex-col p-0 overflow-hidden rounded-3xl border border-slate-100 shadow-2xl">
        {/* Modal Header */}
        <DialogHeader className="px-6 py-5 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="h-9 text-base sm:text-lg font-bold border-blue-300 focus:ring-blue-100 rounded-xl px-3"
                      placeholder="Nama Itinerary"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      disabled={isUpdatingName}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95">
                      <Icon name="Check" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(itinerary?.name || "");
                        setIsEditingName(false);
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 active:scale-95">
                      <Icon name="X" className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {itinerary?.name || t("tripTo", { location })}
                    </DialogTitle>
                    {onUpdateItineraryName && (
                      <button
                        type="button"
                        onClick={() => {
                          setNameInput(itinerary?.name || t("tripTo", { location }));
                          setIsEditingName(true);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        title="Ubah nama itinerary">
                        <Icon name="Pencil" className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    getStatusBadgeClass(itinerary.status)
                  )}>
                  {itinerary.status || "draft"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <Icon name="MapPin" className="size-3.5 text-slate-400" />
                <span>{location}</span>
                <span className="text-slate-300">•</span>
                <span>{t("scheduledCount", { count: items.length })}</span>
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <Icon name="X" className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-slate-50/40">
          {/* Top Summary Banner */}
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 p-4 border border-blue-100/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-300">
                <Icon name="Compass" className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {t("travelPlanSubtitle")}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {t("placesCount", { count: items.length })}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {t("totalEstimatedCost")}
              </span>
              <span className="text-xl font-black text-blue-600 tracking-tight">
                {formatPrice(calculatedSubtotal)}
              </span>
            </div>
          </div>

          {/* Destinations Timeline / Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t("scheduleListTitle")}
              </h4>
              <span className="text-xs font-semibold text-slate-500">
                {t("sortedByDate")}
              </span>
            </div>

            {sortedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
                <Icon name="Map" className="size-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">
                  {t("emptyDetail")}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sortedItems.map((item: any, idx: number) => {
                  const dest = item.destination || {};
                  const translation =
                    dest.translations?.find((t: any) => t.language_code === locale) ||
                    dest.translations?.[0];
                  const name = translation?.name || dest.name || "Destinasi Wisata";
                  const image = dest.thumbnail || translation?.thumbnail || "/images/turkey-destination.jpg";
                  const itemPrice = Number(dest.price || 0);
                  const isPopOpen = openPopoverId === item.id;

                  return (
                    <div
                      key={item.id || idx}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:border-blue-100 hover:shadow-md">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Number badge */}
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 shadow-sm">
                          {idx + 1}
                        </div>

                        {/* Image */}
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-slate-100">
                          <ImageWithFallback
                            src={image}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            fallbackSrc="/images/turkey-destination.jpg"
                          />
                        </div>

                        {/* Name & Date */}
                        <div className="min-w-0 flex-1">
                          <h5 className="text-sm font-bold text-slate-900 truncate">
                            {name}
                          </h5>
                          <div className="mt-1 flex items-center gap-2">
                            {onUpdateItemDate ? (
                              <Popover
                                open={isPopOpen}
                                onOpenChange={(op) => setOpenPopoverId(op ? item.id : null)}>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    disabled={isUpdatingDate}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95 disabled:opacity-50"
                                    title={t("changeDateTooltip")}>
                                    <Icon name="Calendar" className="size-3.5 text-blue-500 shrink-0" />
                                    <span className="font-semibold">
                                      {item.visit_date
                                        ? new Date(item.visit_date).toLocaleDateString(
                                            locale === "id" ? "id-ID" : locale === "tr" ? "tr-TR" : "en-US",
                                            { day: "numeric", month: "long", year: "numeric" }
                                          )
                                        : "Pilih Tanggal"}
                                    </span>
                                    <Icon name="Pencil" className="size-3 text-slate-400 ml-0.5" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[300]" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={item.visit_date ? new Date(item.visit_date) : undefined}
                                    onSelect={(d) => handleDateSelect(item.id, d)}
                                    disabled={(d) => {
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);
                                      return d < today;
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <Icon name="Calendar" className="size-3.5 text-slate-400" />
                                {item.visit_date
                                  ? new Date(item.visit_date).toLocaleDateString(
                                      locale === "id" ? "id-ID" : locale === "tr" ? "tr-TR" : "en-US",
                                      { day: "numeric", month: "long", year: "numeric" }
                                    )
                                  : "-"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Price & Remove Button */}
                      <div className="flex items-center gap-4 shrink-0">
                        {itemPrice > 0 && (
                          <span className="text-sm font-bold text-slate-900">
                            {formatPrice(itemPrice)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(itinerary.id, item.id || item.destination_id)}
                          disabled={isRemoving}
                          className="flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:opacity-50"
                          title={t("deleteDestTooltip")}>
                          <Icon name="Trash2" className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-4 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-2xl text-xs font-bold px-6 h-11 border-slate-200 hover:bg-slate-50">
            {t("closeBtn")}
          </Button>

          <Link
            href={`/${locale}/book-tour?itinerary_id=${itinerary.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 h-11 px-7 text-xs font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95">
            <Icon name="CreditCard" className="size-4" />
            {t("proceedCheckout")}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};
