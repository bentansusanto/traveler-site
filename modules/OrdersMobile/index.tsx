"use client";

import { MobileBottomNavbar } from "@/components/layout/traveler-layout/MobileBottomNavbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription
} from "@/components/ui/drawer";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { MotorItemRow } from "@/components/ui/motor-item-row";
import { cn } from "@/lib/utils";
import { useFindTourByIdQuery } from "@/store/services/book-tour.service";
import { useFindBookMotorByIdQuery } from "@/store/services/book-motor.service";
import { useGetItineraryByIdQuery } from "@/store/services/itinerary.service";
import { useFindBookEntertainmentAttractionByIdQuery } from "@/store/services/book-entertainment-attraction.service";
import { useFindBookDocumentVisaByIdQuery } from "@/store/services/book-document-visa.service";
import { useFindAllBookersQuery } from "@/store/services/booker.service";
import { useCancelPaymentMutation, useFindAllPaymentQuery } from "@/store/services/payment.service";
import {
  ArrowRight,
  Bike,
  Calendar,
  ChevronDown,
  CreditCard,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Receipt,
  RotateCcw,
  Sparkles,
  Ticket,
  Trash2,
  User,
  Users
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

// Detail Itinerary Item Accordion for Tour
const TourItemDetail = ({
  item,
  dayNumber,
  startDate,
  locale
}: {
  item: any;
  dayNumber: number;
  startDate?: string | Date | null;
  locale: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const translation =
    item?.destination?.translations?.find((tr: any) => tr.language_code === locale) ||
    item?.destination?.translations?.[0];
  const destName = translation?.name || item?.destination?.name || item?.name || "Destinasi Wisata";
  const destLocation = item?.destination?.location || item?.location || "";
  const destImage =
    item?.destination?.thumbnail ||
    translation?.thumbnail ||
    item?.thumbnail ||
    "/images/turkey-destination.jpg";

  // Calculate visit date
  const visitDate = useMemo(() => {
    if (item?.visit_date) {
      return new Date(item.visit_date);
    }
    if (startDate) {
      const base = new Date(startDate);
      if (!isNaN(base.getTime())) {
        base.setDate(base.getDate() + (dayNumber - 1));
        return base;
      }
    }
    return null;
  }, [item?.visit_date, startDate, dayNumber]);

  const formattedDate = visitDate
    ? visitDate.toLocaleDateString(locale === "en" ? "en-US" : locale === "tr" ? "tr-TR" : "id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : null;

  return (
    <div className="relative border-l-2 border-blue-200 pl-4 sm:pl-5 pb-5 last:pb-1">
      {/* Node Dot */}
      <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-blue-500 bg-white shadow-xs" />
      
      <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
        {/* Header with Sequence and Date */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
              {locale === "en" ? `Day ${dayNumber}` : `Hari ke-${dayNumber}`}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              #{dayNumber}
            </span>
          </div>

          {formattedDate && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>{formattedDate}</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left transition-colors flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
              <ImageWithFallback
                src={destImage}
                alt={destName}
                fill
                className="object-cover"
                fallbackSrc="/images/turkey-destination.jpg"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                {destName}
              </h4>
              {destLocation && (
                <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                  <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                  <span>{destLocation}</span>
                </p>
              )}
            </div>
          </div>

          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition-transform mt-1",
              isExpanded && "rotate-180 text-blue-600"
            )}
          />
        </button>

        {/* Expandable Activity Details */}
        {isExpanded && translation?.detail_tour && translation.detail_tour.length > 0 && (
          <div className="mt-2.5 rounded-lg border border-blue-100 bg-blue-50/40 p-2.5 text-xs space-y-1.5">
            <p className="text-[11px] font-semibold text-blue-900 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>{locale === "en" ? "Destination Activities:" : "Aktivitas Destinasi:"}</span>
            </p>
            <ul className="space-y-1">
              {translation.detail_tour.map((detail: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span className="capitalize leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Safe date formatting helper for various formats (DD-MM-YYYY, YYYY-MM-DD, ISO, etc.)
const formatDateSafe = (rawDate?: string | Date | null, locale = "en") => {
  if (!rawDate) return null;
  if (rawDate instanceof Date) {
    if (!isNaN(rawDate.getTime())) {
      return rawDate.toLocaleDateString(locale === "en" ? "en-US" : locale === "tr" ? "tr-TR" : "id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }
    return null;
  }
  const str = String(rawDate).trim();
  const ddmmyyyy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(str);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString(locale === "en" ? "en-US" : locale === "tr" ? "tr-TR" : "id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }
  }
  const dateObj = new Date(str);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toLocaleDateString(locale === "en" ? "en-US" : locale === "tr" ? "tr-TR" : "id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }
  return str;
};

// Order Detail Bottom Drawer
const OrderDetailDrawer = ({
  open,
  onOpenChange,
  payment
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any;
}) => {
  const locale = useLocale();
  const t = useTranslations("Orders");

  const isDocumentVisa = payment?.service_type === "document_visa" || Boolean(payment?.book_document_visa_id);
  const isMotor = (payment?.service_type === "rent_motor" || Boolean(payment?.book_motor_id)) && !isDocumentVisa;
  const isEntertainment = (payment?.service_type === "entertainment" || Boolean(payment?.book_entertainment_attraction_id)) && !isDocumentVisa;
  const isTour = (payment?.service_type === "tour" || Boolean(payment?.book_tour_id)) && !isDocumentVisa && !isMotor && !isEntertainment;

  // Fetch book tour data
  const { data: tourResponse, isLoading: isLoadingTour } = useFindTourByIdQuery(
    payment?.book_tour_id,
    { skip: !open || !payment?.book_tour_id }
  );
  const tourData = tourResponse?.data || tourResponse;

  // Fetch book motor data
  const { data: motorResponse, isLoading: isLoadingMotor } = useFindBookMotorByIdQuery(
    payment?.book_motor_id,
    { skip: !open || !payment?.book_motor_id }
  );
  const motorData = motorResponse?.data || motorResponse;

  // Fetch book entertainment data
  const { data: entertainmentResponse, isLoading: isLoadingEntertainment } =
    useFindBookEntertainmentAttractionByIdQuery(
      payment?.book_entertainment_attraction_id,
      { skip: !open || !payment?.book_entertainment_attraction_id }
    );
  const entertainmentData: any = entertainmentResponse?.data || entertainmentResponse;

  // Fetch book document visa data
  const { data: documentVisaResponse, isLoading: isLoadingDocumentVisa } =
    useFindBookDocumentVisaByIdQuery(
      payment?.book_document_visa_id,
      { skip: !open || !payment?.book_document_visa_id }
    );
  const documentVisaData: any =
    documentVisaResponse?.data || documentVisaResponse || payment?.book_document_visa;

  // Fetch full itinerary with items
  const itineraryId = tourData?.itinerary_id || tourData?.itinerary?.id;
  const { data: itineraryResponse, isLoading: isLoadingItinerary } = useGetItineraryByIdQuery(
    itineraryId!,
    { skip: !itineraryId || !open }
  );
  const itinerary = itineraryResponse?.data || itineraryResponse || tourData?.itinerary;

  // Extract combined itinerary items
  const itineraryItems = useMemo(() => {
    if (itinerary?.itinerary_items && Array.isArray(itinerary.itinerary_items) && itinerary.itinerary_items.length > 0) {
      return itinerary.itinerary_items;
    }
    if (tourData?.book_tour_items && Array.isArray(tourData.book_tour_items) && tourData.book_tour_items.length > 0) {
      return tourData.book_tour_items;
    }
    return [];
  }, [itinerary, tourData]);

  const [cancelPayment, { isLoading: isCancelling }] = useCancelPaymentMutation();
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const attractionTitle = useMemo(() => {
    return (
      entertainmentData?.book_entertainment_attraction_items?.[0]?.entertainment_attraction_name ||
      entertainmentData?.entertainment_attraction?.name ||
      entertainmentData?.entertainment_attraction_name ||
      entertainmentData?.title ||
      ""
    );
  }, [entertainmentData]);

  const visitDateFormatted = useMemo(() => {
    return formatDateSafe(entertainmentData?.booking_date || entertainmentData?.visit_date, locale);
  }, [entertainmentData?.booking_date, entertainmentData?.visit_date, locale]);

  const { data: bookersData } = useFindAllBookersQuery(undefined, { skip: !open });

  const booker = useMemo(() => {
    if (documentVisaData?.booker && (documentVisaData.booker.name || documentVisaData.booker.email)) {
      return documentVisaData.booker;
    }
    if (documentVisaData?.booker_name || documentVisaData?.booker_email) {
      return {
        name: documentVisaData.booker_name,
        email: documentVisaData.booker_email,
        phone_number: documentVisaData.booker_phone || documentVisaData.booker_phone_number
      };
    }
    if (entertainmentData?.booker && (entertainmentData.booker.name || entertainmentData.booker.email)) {
      return entertainmentData.booker;
    }
    if (entertainmentData?.pemesan && (entertainmentData.pemesan.name || entertainmentData.pemesan.email)) {
      return entertainmentData.pemesan;
    }
    if (tourData?.booker && (tourData.booker.name || tourData.booker.email)) {
      return tourData.booker;
    }
    if (tourData?.pemesan && (tourData.pemesan.name || tourData.pemesan.email)) {
      return tourData.pemesan;
    }
    if (motorData?.booker && (motorData.booker.name || motorData.booker.email)) {
      return motorData.booker;
    }
    if (motorData?.pemesan && (motorData.pemesan.name || motorData.pemesan.email)) {
      return motorData.pemesan;
    }

    const bookerId =
      documentVisaData?.booker_id ||
      entertainmentData?.booker_id ||
      entertainmentData?.pemesan_id ||
      tourData?.booker_id ||
      tourData?.pemesan_id ||
      motorData?.booker_id ||
      motorData?.pemesan_id ||
      payment?.booker_id;

    if (bookerId && bookersData) {
      const allBookers = bookersData?.data || bookersData?.datas || [];
      const found = allBookers.find((b: any) => b.id === bookerId);
      if (found) return found;
    }

    if (payment?.booker) return payment.booker;
    if (payment?.customer) {
      return {
        name: payment.customer.name || payment.customer.full_name,
        email: payment.customer.email,
        phone_number: payment.customer.profile?.phone_number || payment.customer.phone_number
      };
    }

    return null;
  }, [documentVisaData, entertainmentData, tourData, motorData, bookersData, payment]);

  const tourists: any[] = useMemo(() => {
    if (isDocumentVisa && documentVisaData?.applicants && documentVisaData.applicants.length > 0) {
      return documentVisaData.applicants;
    }
    if (isEntertainment && entertainmentData?.tourists && entertainmentData.tourists.length > 0) {
      return entertainmentData.tourists;
    }
    if (isTour && tourData?.tourists && tourData.tourists.length > 0) {
      return tourData.tourists;
    }
    if (isMotor && motorData?.tourists && motorData.tourists.length > 0) {
      return motorData.tourists;
    }
    if (payment?.tourists && payment.tourists.length > 0) {
      return payment.tourists;
    }
    return [];
  }, [isDocumentVisa, isEntertainment, isTour, isMotor, documentVisaData, entertainmentData, tourData, motorData, payment]);

  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16000 }
  );

  const formatPrice = (rawPrice: number) => {
    let displayPrice = Number(rawPrice || 0);
    if (currentCurrency.code !== "USD") {
      displayPrice = displayPrice * (currentCurrency.idrToUsdRate || 1);
    }
    return new Intl.NumberFormat(
      currentCurrency.code === "IDR"
        ? "id-ID"
        : currentCurrency.code === "TRY"
        ? "tr-TR"
        : "en-US",
      {
        style: "currency",
        currency: currentCurrency.code,
        maximumFractionDigits: currentCurrency.code === "IDR" ? 0 : 2
      }
    )
      .format(displayPrice)
      .replace("$", "US$ ");
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "success" || s === "succes" || s === "completed" || s === "paid") {
      return { label: "Success", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (s === "pending") {
      return { label: "Pending", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    if (s === "cancelled" || s === "failed") {
      return { label: s === "cancelled" ? "Cancelled" : "Failed", bg: "bg-red-50 text-red-700 border-red-200" };
    }
    return { label: status || "Draft", bg: "bg-slate-50 text-slate-700 border-slate-200" };
  };

  const handleCancelPayment = async () => {
    try {
      await cancelPayment(payment.id).unwrap();
      toast.success("Payment cancelled successfully");
      setShowCancelAlert(false);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to cancel payment");
    }
  };

  const canCancel =
    payment?.status?.toLowerCase() === "pending" || payment?.status?.toLowerCase() === "failed";

  if (!payment) return null;
  const statusBadge = getStatusBadge(payment.status);
  const startDate = tourData?.visit_date || tourData?.start_date || tourData?.created_at || payment?.created_at;

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh] flex flex-col gap-0 rounded-t-3xl border-t border-slate-200 bg-white p-0 shadow-2xl">
          {/* Left-Aligned Drawer Header */}
          <DrawerHeader className="shrink-0 border-b border-slate-100 px-5 py-4 bg-white text-left">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <Receipt className="h-5 w-5" />
                </div>
                <div className="min-w-0 text-left">
                  <DrawerTitle className="text-base font-bold text-slate-900 truncate text-left">
                    {t("modalTitle")}
                  </DrawerTitle>
                  <DrawerDescription className="text-xs text-slate-500 mt-0.5 text-left">
                    {t("invoiceCode")}:{" "}
                    <span className="font-mono font-semibold text-slate-700">
                      {payment.invoice_code}
                    </span>
                  </DrawerDescription>
                </div>
              </div>

              <div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shrink-0",
                    statusBadge.bg
                  )}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {statusBadge.label}
                </span>
              </div>
            </div>
          </DrawerHeader>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 space-y-4 overflow-y-auto p-4 bg-slate-50/60">
            {/* Payment Summary Box */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5">
                {t("paymentInfo")}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block mb-0.5">{t("paymentMethod")}</span>
                  <p className="font-medium text-slate-800 capitalize flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                    <span>{payment.payment_method || "Online Payment"}</span>
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block mb-0.5">{t("paymentDate")}</span>
                  <p className="font-medium text-slate-800">
                    {payment.created_at
                      ? new Date(payment.created_at).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">{t("totalPaid")}</span>
                <span className="text-base font-bold text-blue-600">
                  {formatPrice(payment.amount)}
                </span>
              </div>
            </div>

            {/* Tour / Service Details */}
            {isTour && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      {t("itineraryPlan", { count: itineraryItems.length })}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {itinerary?.name || itinerary?.title || tourData?.itinerary?.name || "Tour Package"}
                    </p>
                  </div>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100">
                    {tourData?.status || "Confirmed"}
                  </span>
                </div>

                {/* Timeline Items */}
                {isLoadingTour || isLoadingItinerary ? (
                  <div className="flex items-center justify-center p-6 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : itineraryItems.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    {locale === "en" ? "No itinerary schedule available" : "Rencana perjalanan tidak tersedia"}
                  </div>
                ) : (
                  <div className="pt-1 space-y-1">
                    {itineraryItems.map((item: any, idx: number) => (
                      <TourItemDetail
                        key={item.id || idx}
                        item={item}
                        dayNumber={idx + 1}
                        startDate={startDate}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Motor Rental Details */}
            {isMotor && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Bike className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        {locale === "en" ? "Motor Rental Details" : "Layanan Sewa Motor"}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {(motorData?.book_motor_items || []).length} {locale === "en" ? "units selected" : "unit motor dipilih"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100 capitalize">
                    {motorData?.status || "Ongoing"}
                  </span>
                </div>

                {isLoadingMotor ? (
                  <div className="flex items-center justify-center p-6 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : (motorData?.book_motor_items || []).length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    {locale === "en" ? "No motor details available" : "Rincian motor tidak tersedia"}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {motorData.book_motor_items.map((item: any, idx: number) => (
                      <MotorItemRow
                        key={item.id || idx}
                        motorId={item.motor_id || item.motor?.id}
                        qty={item.qty}
                        price={item.price}
                        subtotal={item.subtotal}
                        formatPrice={formatPrice}
                        variant="drawer"
                      />
                    ))}

                    {/* Rental Duration Banner */}
                    {motorData?.start_date && motorData?.end_date && (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 space-y-1">
                        <div className="flex items-center gap-2 font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span>{locale === "en" ? "Rental Period:" : "Periode Sewa:"}</span>
                        </div>
                        <p className="text-[11px] text-blue-700 pl-5.5">
                          {new Date(motorData.start_date).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}{" "}
                          -{" "}
                          {new Date(motorData.end_date).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    )}

                    {/* Add-ons if any */}
                    {motorData?.booking_add_ons && motorData.booking_add_ons.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {locale === "en" ? "Add-ons" : "Layanan Tambahan"} ({motorData.booking_add_ons.length})
                        </p>
                        {motorData.booking_add_ons.map((addon: any) => (
                          <div key={addon.id} className="flex items-center justify-between text-xs text-slate-600 pl-2">
                            <span className="truncate">{addon.name}</span>
                            <span className="font-semibold text-slate-800">{formatPrice(addon.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rider Information if any */}
                    {motorData?.tourists && motorData.tourists.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {locale === "en" ? "Rider Information" : "Data Pengendara"} ({motorData.tourists.length})
                        </p>
                        {motorData.tourists.map((tItem: any, tIdx: number) => (
                          <div
                            key={tItem.id || tIdx}
                            className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white p-2 text-xs">
                            <span className="font-semibold text-slate-800">
                              {tItem.name}
                            </span>
                            {tItem.passport_number && (
                              <span className="font-mono text-[11px] text-slate-500">
                                {tItem.passport_number}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Entertainment Attraction Details */}
            {isEntertainment && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                      <Ticket className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        {locale === "en" ? "Attraction Tickets" : "Tiket Atraksi"}
                      </h4>
                      {attractionTitle ? (
                        <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                          {attractionTitle}
                        </p>
                      ) : null}
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {(entertainmentData?.book_entertainment_attraction_items || []).length}{" "}
                        {locale === "en" ? "ticket package(s)" : "paket tiket"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100 capitalize shrink-0">
                    {entertainmentData?.status || "Confirmed"}
                  </span>
                </div>

                {isLoadingEntertainment ? (
                  <div className="flex items-center justify-center p-6 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : (entertainmentData?.book_entertainment_attraction_items || []).length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    {locale === "en" ? "No ticket details available" : "Rincian tiket tidak tersedia"}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {entertainmentData.book_entertainment_attraction_items.map((item: any, idx: number) => {
                      const itemAttraction = item.entertainment_attraction_name || attractionTitle;
                      return (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs gap-3">
                          <div className="min-w-0 flex-1">
                            {itemAttraction && (
                              <p className="text-[11px] font-semibold text-blue-600 truncate mb-0.5 flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-blue-500 shrink-0" />
                                <span>{itemAttraction}</span>
                              </p>
                            )}
                            <p className="font-bold text-xs text-slate-800 truncate">
                              {item.ticket_name || `Ticket ${idx + 1}`}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {locale === "en" ? "Qty" : "Jumlah"}: {item.qty}
                            </p>
                          </div>
                          <p className="font-bold text-slate-900 shrink-0">
                            {formatPrice(item.subtotal || item.unit_price * item.qty || 0)}
                          </p>
                        </div>
                      );
                    })}

                    {/* Visit date if available */}
                    {visitDateFormatted && (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold">
                          {locale === "en" ? "Visit Date:" : "Tanggal Kunjungan:"}
                        </span>
                        <span className="font-medium">{visitDateFormatted}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Document Visa Details */}
            {isDocumentVisa && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        {locale === "en" ? "Document & Visa Details" : "Layanan Dokumen & Visa"}
                      </h4>
                      <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                        {documentVisaData?.document_visa_title ||
                          (documentVisaData?.country_name
                            ? `Visa ${documentVisaData.country_name}`
                            : "Document & Visa Application")}
                      </p>
                      {documentVisaData?.country_name && (
                        <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                          <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                          <span>{documentVisaData.country_name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100 capitalize shrink-0">
                    {documentVisaData?.status
                      ? String(documentVisaData.status).replace(/_/g, " ")
                      : "Confirmed"}
                  </span>
                </div>

                {isLoadingDocumentVisa ? (
                  <div className="flex items-center justify-center p-6 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Items / Packages List */}
                    {documentVisaData?.items && documentVisaData.items.length > 0 ? (
                      documentVisaData.items.map((item: any, idx: number) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-slate-800 truncate">
                              {item.package_name || documentVisaData?.package_name || `Visa Package`}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {locale === "en" ? "Qty" : "Jumlah"}: {item.qty} {locale === "en" ? "applicant(s)" : "pemohon"} × {formatPrice(item.unit_price)}
                            </p>
                          </div>
                          <p className="font-bold text-slate-900 shrink-0">
                            {formatPrice(item.subtotal || item.unit_price * item.qty || 0)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-800 truncate">
                            {documentVisaData?.package_name || "Visa Package"}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {locale === "en" ? "Applicant(s)" : "Jumlah Pemohon"}: {documentVisaData?.applicant_count || 1}
                          </p>
                        </div>
                        <p className="font-bold text-slate-900 shrink-0">
                          {formatPrice(documentVisaData?.total_price || payment.amount)}
                        </p>
                      </div>
                    )}

                    {/* Target Travel Date Banner */}
                    {documentVisaData?.target_travel_date && (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold">
                          {locale === "en" ? "Target Travel Date:" : "Target Keberangkatan:"}
                        </span>
                        <span className="font-medium">
                          {formatDateSafe(documentVisaData.target_travel_date, locale)}
                        </span>
                      </div>
                    )}

                    {/* Processing Time */}
                    {documentVisaData?.processing_time_days ? (
                      <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2.5 text-xs text-slate-700">
                        <span className="text-slate-500">
                          {locale === "en" ? "Estimated Processing:" : "Estimasi Proses:"}
                        </span>
                        <span className="font-semibold">
                          {documentVisaData.processing_time_days} {locale === "en" ? "working days" : "hari kerja"}
                        </span>
                      </div>
                    ) : null}

                    {/* Notes / Special Request */}
                    {documentVisaData?.note ? (
                      <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs space-y-1">
                        <span className="font-semibold text-slate-600 block text-[11px]">
                          {locale === "en" ? "Notes / Special Requests:" : "Catatan Khusus:"}
                        </span>
                        <p className="text-slate-700 leading-relaxed italic">{documentVisaData.note}</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Booker Information */}
            {booker && (booker.name || booker.email || booker.phone_number || booker.phone) && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    {locale === "en" ? "Booker Information" : "Data Pemesan"}
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  {booker.name && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">{locale === "en" ? "Name" : "Nama"}</span>
                      <span className="font-semibold text-slate-800">{booker.name}</span>
                    </div>
                  )}
                  {booker.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">{locale === "en" ? "Email" : "Email"}</span>
                      <span className="font-semibold text-slate-800 break-all">{booker.email}</span>
                    </div>
                  )}
                  {(booker.phone_number || booker.phone) && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">{locale === "en" ? "Phone" : "No. Telepon"}</span>
                      <span className="font-semibold text-slate-800">{booker.phone_number || booker.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tourist / Visitor / Applicant Details */}
            {tourists && tourists.length > 0 && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      {isDocumentVisa
                        ? locale === "en"
                          ? "Applicant Details"
                          : "Data Pemohon Visa"
                        : isEntertainment
                        ? locale === "en"
                          ? "Visitor Details"
                          : "Data Pengunjung"
                        : locale === "en"
                        ? "Traveler Details"
                        : "Data Wisatawan"}
                    </h4>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {tourists.length}{" "}
                    {locale === "en"
                      ? isDocumentVisa
                        ? tourists.length === 1
                          ? "applicant"
                          : "applicants"
                        : isEntertainment
                        ? tourists.length === 1
                          ? "visitor"
                          : "visitors"
                        : tourists.length === 1
                        ? "person"
                        : "people"
                      : "orang"}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {tourists.map((tItem: any, tIdx: number) => {
                    const tBirthDate = formatDateSafe(tItem.birth_date, locale);
                    const applicantName = tItem.full_name || tItem.name || "";
                    return (
                      <div
                        key={tItem.id || tIdx}
                        className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shrink-0">
                              {tIdx + 1}
                            </span>
                            <span className="font-bold text-slate-800">
                              {tItem.gender ? `${tItem.gender}. ` : ""}{applicantName}
                            </span>
                          </div>
                          {tIdx === 0 ? (
                            <span className="rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                              {locale === "en" ? "Primary" : "Utama"}
                            </span>
                          ) : tItem.status ? (
                            <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 capitalize">
                              {String(tItem.status).replace(/_/g, " ")}
                            </span>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/50 text-[11px]">
                          {(tItem.passport_number || tItem.passportNumber) && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">
                                {locale === "en" ? "ID / Passport" : "No. Identitas / Paspor"}
                              </span>
                              <span className="font-mono font-medium text-slate-700">
                                {tItem.passport_number || tItem.passportNumber}
                              </span>
                            </div>
                          )}
                          {tItem.nationality && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">
                                {locale === "en" ? "Nationality" : "Kewarganegaraan"}
                              </span>
                              <span className="font-medium text-slate-700">{tItem.nationality}</span>
                            </div>
                          )}
                          {(tItem.phone_number || tItem.phoneNumber) && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">
                                {locale === "en" ? "Phone" : "No. Telepon"}
                              </span>
                              <span className="font-medium text-slate-700">
                                {tItem.phone_number || tItem.phoneNumber}
                              </span>
                            </div>
                          )}
                          {tBirthDate && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">
                                {locale === "en" ? "Date of Birth" : "Tanggal Lahir"}
                              </span>
                              <span className="font-medium text-slate-700">{tBirthDate}</span>
                            </div>
                          )}
                          {tItem.occupation && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">
                                {locale === "en" ? "Occupation" : "Pekerjaan"}
                              </span>
                              <span className="font-medium text-slate-700 capitalize">{tItem.occupation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="shrink-0 border-t border-slate-100 bg-white p-4 flex items-center justify-between gap-3">
            {canCancel ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCancelAlert(true)}
                disabled={isCancelling}
                className="rounded-xl text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 h-10 flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t("cancelPayment")}</span>
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 px-5 h-10">
              {t("close")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Cancel Confirmation Alert */}
      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>{t("cancelKeepBtn")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPayment}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700 text-white font-medium">
              {isCancelling ? t("cancelling") : t("cancelConfirmBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const OrderPageMobile = () => {
  const locale = useLocale();
  const t = useTranslations("Orders");

  const { data: paymentsResponse, isLoading } = useFindAllPaymentQuery();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "success" | "history">("all");

  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16000 }
  );

  const payments: any[] = paymentsResponse?.data || paymentsResponse?.datas || [];

  // Filter based on active tab
  const filteredPayments = useMemo(() => {
    return payments.filter((p: any) => {
      const s = (p.status || "").toLowerCase();
      if (activeTab === "all") return true;
      if (activeTab === "success") {
        return s === "success" || s === "succes" || s === "completed" || s === "paid";
      }
      if (activeTab === "history") {
        return s === "failed" || s === "cancelled" || s === "expired";
      }
      return true;
    });
  }, [payments, activeTab]);

  const handleOpenDetail = (payment: any) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  const formatPrice = (rawPrice: number) => {
    let displayPrice = Number(rawPrice || 0);
    if (currentCurrency.code !== "USD") {
      displayPrice = displayPrice * (currentCurrency.idrToUsdRate || 1);
    }
    return new Intl.NumberFormat(
      currentCurrency.code === "IDR"
        ? "id-ID"
        : currentCurrency.code === "TRY"
        ? "tr-TR"
        : "en-US",
      {
        style: "currency",
        currency: currentCurrency.code,
        maximumFractionDigits: currentCurrency.code === "IDR" ? 0 : 2
      }
    )
      .format(displayPrice)
      .replace("$", "US$ ");
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "success" || s === "succes" || s === "completed" || s === "paid") {
      return { label: "Success", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (s === "pending") {
      return { label: "Pending", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    if (s === "cancelled" || s === "failed") {
      return { label: s === "cancelled" ? "Cancelled" : "Failed", bg: "bg-red-50 text-red-700 border-red-200" };
    }
    return { label: status || "Draft", bg: "bg-slate-50 text-slate-700 border-slate-200" };
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70 pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-md px-4 py-3.5 shadow-xs">
        <h1 className="text-base font-bold text-slate-900">{t("title")}</h1>
        <span className="text-xs font-semibold text-slate-400">
          {filteredPayments.length} {filteredPayments.length === 1 ? "Order" : "Orders"}
        </span>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex bg-white px-4 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex-1 py-3 text-xs font-semibold border-b-2 transition-all",
            activeTab === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}>
          {t("allTab")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("success")}
          className={cn(
            "flex-1 py-3 text-xs font-semibold border-b-2 transition-all",
            activeTab === "success"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}>
          {t("successTab")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 py-3 text-xs font-semibold border-b-2 transition-all",
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}>
          {t("historyTab")}
        </button>
      </div>

      {/* Orders List Content */}
      <div className="flex-1 space-y-3.5 p-4">
        {isLoading ? (
          // Skeleton Loaders
          [1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white p-4 shadow-sm border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 rounded bg-slate-200"></div>
                <div className="h-5 w-16 rounded-full bg-slate-200"></div>
              </div>
              <div className="h-5 w-3/4 rounded bg-slate-200"></div>
              <div className="h-8 w-full rounded-xl bg-slate-100"></div>
              <div className="h-10 w-full rounded-xl bg-slate-200"></div>
            </div>
          ))
        ) : filteredPayments.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-xs">
              <Ticket className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">{t("emptyTitle")}</h3>
            <p className="text-xs text-slate-500 max-w-xs">{t("emptyDesc")}</p>
          </div>
        ) : (
          // Payment / Order Cards
          filteredPayments.map((payment: any) => {
            const statusBadge = getStatusBadge(payment.status);
            const isPending =
              payment.status?.toLowerCase() === "pending" ||
              payment.status?.toLowerCase() === "failed";

            return (
              <div
                key={payment.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 transition-all hover:border-slate-300">
                {/* Card Header: Invoice & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                      {payment.invoice_code || payment.id.slice(0, 15)}
                    </span>
                    {payment.service_type === "document_visa" || Boolean(payment.book_document_visa_id) ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                        <FileText className="h-3 w-3" />
                        <span>{locale === "en" ? "Document Visa" : "Dokumen Visa"}</span>
                      </span>
                    ) : payment.service_type === "rent_motor" || Boolean(payment.book_motor_id) ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                        <Bike className="h-3 w-3" />
                        <span>{locale === "en" ? "Motor Rental" : "Rental Motor"}</span>
                      </span>
                    ) : payment.service_type === "entertainment" || Boolean(payment.book_entertainment_attraction_id) ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                        <Ticket className="h-3 w-3" />
                        <span>{locale === "en" ? "Attraction Ticket" : "Tiket Atraksi"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                        <MapPin className="h-3 w-3" />
                        <span>{locale === "en" ? "Tour Package" : "Paket Tour"}</span>
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold shrink-0",
                      statusBadge.bg
                    )}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {statusBadge.label}
                  </span>
                </div>

                {/* Meta Row: Method & Date */}
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-2.5 text-xs text-slate-600 border border-slate-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <CreditCard className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="truncate capitalize font-medium text-slate-700">
                      {payment.payment_method || "PayPal"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium text-slate-700">
                      {payment.created_at
                        ? new Date(payment.created_at).toLocaleDateString(
                            locale === "en" ? "en-US" : "id-ID",
                            { day: "numeric", month: "short", year: "numeric" }
                          )
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Price & Action Row */}
                <div className="border-t border-slate-100 pt-3 flex items-end justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {t("totalPaid")}
                    </span>
                    <p className="text-base font-bold text-blue-600 leading-none">
                      {formatPrice(payment.amount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetail(payment)}
                      className="h-8.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 px-3 flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                      <span>{t("viewDetails")}</span>
                    </Button>

                    {isPending && (() => {
                      const payType = payment.service_type === "document_visa" || Boolean(payment.book_document_visa_id)
                        ? "document-visa"
                        : payment.service_type === "rent_motor" || Boolean(payment.book_motor_id)
                        ? "motor"
                        : payment.service_type === "entertainment" || Boolean(payment.book_entertainment_attraction_id)
                        ? "entertainment"
                        : "tour";
                      const payId = payment.service_type === "document_visa" || Boolean(payment.book_document_visa_id)
                        ? (payment.book_document_visa_id || payment.id)
                        : payment.id;
                      return (
                        <Link href={`/${locale}/payments?order_id=${payId}&type=${payType}`}>
                          <Button
                            type="button"
                            size="sm"
                            className="h-8.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs px-3.5 flex items-center gap-1">
                            <span>Bayar</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        payment={selectedPayment}
      />

      {/* Bottom Navigation */}
      <MobileBottomNavbar />
    </div>
  );
};
