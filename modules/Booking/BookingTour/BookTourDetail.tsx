"use client";

import Icon from "@/components/icon";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { MotorItemRow } from "@/components/ui/motor-item-row";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useUpdateStatusMotorMutation } from "@/store/services/book-motor.service";
import { useGetAllTourQuery, useUpdateStatusTourMutation } from "@/store/services/book-tour.service";
import { useGetItineraryByIdQuery } from "@/store/services/itinerary.service";
import { useFindMotorByIdQuery } from "@/store/services/motor.service";
import { useCancelBookingMutation } from "@/store/services/book-entertainment-attraction.service";
import { useCancelBookDocumentVisaMutation } from "@/store/services/book-document-visa.service";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface BookTourDetailProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any;
  onCancelled?: () => void;
}

export const BookTourDetail = ({ open, setOpen, data, onCancelled }: BookTourDetailProps) => {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const t = useTranslations("MyBooking");
  const tPayment = useTranslations("Payment");

  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [updateStatusTour, { isLoading: isUpdatingTour }] = useUpdateStatusTourMutation();
  const [updateStatusMotor, { isLoading: isUpdatingMotor }] = useUpdateStatusMotorMutation();
  const [cancelEntertainmentBooking, { isLoading: isUpdatingEntertainment }] = useCancelBookingMutation();
  const [cancelVisaBooking, { isLoading: isCancellingVisa }] = useCancelBookDocumentVisaMutation();
  const { refetch: refetchAllTours } = useGetAllTourQuery(undefined);

  const isCancelling = isUpdatingTour || isUpdatingMotor || isUpdatingEntertainment || isCancellingVisa;

  // WhatsApp admin chat URL for Document Visa paid bookings
  const waAdminPhone = "6281234567890"; // Pacific Travelindo official WhatsApp
  const buildVisaWaUrl = (d: any) => {
    const bookingCode = d?.code || d?.id?.slice(0, 10) || "";
    const visaTitle = d?.document_visa_title || d?.document_visa?.title || "Document Visa";
    const applicantCount = d?.applicant_count || 1;
    const waText = encodeURIComponent(
      locale === "id"
        ? `Halo PacificTravelindo, saya ingin mengirimkan dokumen paspor untuk pengajuan ${visaTitle} (Booking ID: ${bookingCode}, ${applicantCount} pemohon). Mohon panduan lebih lanjut.`
        : `Hello PacificTravelindo, I would like to submit passport documents for my ${visaTitle} application (Booking ID: ${bookingCode}, ${applicantCount} applicant(s)). Please guide me through the next steps.`
    );
    return `https://wa.me/${waAdminPhone}?text=${waText}`;
  };

  // Currency configuration from Redux store
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

  /**
   * Extract a string from a potentially multilingual object.
   * Backend may return fields as { en: "...", id: "...", tr: "..." } or just a plain string.
   */
  const getStr = (val: any, fallback = ""): string => {
    if (!val) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "object" && !Array.isArray(val)) {
      return val[locale] || val["en"] || val["id"] || Object.values(val).find((v) => typeof v === "string") as string || fallback;
    }
    return String(val) || fallback;
  };

  const isMotor = data?.type === "motor" || (!!data?.book_motor_items?.length && !data?.document_visa_id);
  const isEntertainment = data?.type === "entertainment" || (!!data?.book_entertainment_attraction_items?.length && !data?.document_visa_id && !data?.book_motor_items?.length);
  // Detect visa booking robustly: by type field OR by visa-specific fields
  const isVisa = data?.type === "visa" || (!!data?.document_visa_id && !data?.itinerary_id && !data?.book_motor_items?.length && !data?.book_entertainment_attraction_items?.length);
  const itineraryId = !isVisa && !isMotor && !isEntertainment ? (data?.itinerary_id || data?.itinerary?.id) : null;

  // Fetch itinerary details if not fully available
  const { data: itineraryResponse } = useGetItineraryByIdQuery(itineraryId!, {
    skip: !itineraryId || !open || isVisa
  });

  const itinerary = itineraryResponse?.data || itineraryResponse || data?.itinerary;

  const itineraryItems = useMemo(() => {
    if (itinerary?.itinerary_items && Array.isArray(itinerary.itinerary_items)) {
      return itinerary.itinerary_items;
    }
    if (data?.book_tour_items && Array.isArray(data.book_tour_items)) {
      return data.book_tour_items;
    }
    return [];
  }, [itinerary, data]);

  const tourists = useMemo(() => {
    if (data?.tourists && Array.isArray(data.tourists)) {
      return data.tourists;
    }
    return [];
  }, [data]);

  // For visa: applicants
  const applicants = useMemo(() => {
    if (isVisa && Array.isArray(data?.applicants)) {
      return data.applicants;
    }
    return [];
  }, [isVisa, data]);

  const booker = data?.booker || {
    name: data?.booker_name || data?.customer?.name || "",
    email: data?.booker_email || data?.customer?.email || "",
    phone: data?.booker_phone || data?.customer?.profile?.phone_number || ""
  };

  const firstMotorItem = data?.book_motor_items?.[0];
  const effectiveMotorId =
    firstMotorItem?.motor_id ||
    firstMotorItem?.motor?.id ||
    data?.motor_id ||
    data?.motor?.id ||
    "";

  const { data: motorRes } = useFindMotorByIdQuery(effectiveMotorId, {
    skip: !isMotor || !effectiveMotorId || !open
  });
  const motorData = motorRes?.data;

  const rentalDuration = useMemo(() => {
    if (!data?.start_date || !data?.end_date) return 1;
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [data?.start_date, data?.end_date]);

  const packageName = useMemo(() => {
    if (isMotor) {
      const motorTrans =
        motorData?.translations?.find((tr: any) => tr.language_code === locale) ||
        motorData?.translations?.[0] ||
        firstMotorItem?.motor?.translations?.find((tr: any) => tr.language_code === locale) ||
        firstMotorItem?.motor?.translations?.[0];
      const motorName =
        getStr(motorTrans?.name_motor) ||
        getStr(motorData?.merek?.name_merek) ||
        getStr(firstMotorItem?.motor?.name_motor) ||
        getStr(firstMotorItem?.motor?.name) ||
        getStr(firstMotorItem?.motor_name) ||
        getStr(data?.motor_name) ||
        getStr(data?.motor?.name);
      if (motorName) return motorName;
      return t("motorRental");
    }
    if (isEntertainment) {
      const attractionName =
        getStr(data?.book_entertainment_attraction_items?.[0]?.entertainment_attraction_name) ||
        getStr(data?.entertainment_attraction?.name) ||
        getStr(data?.entertainment_attraction_name) ||
        getStr(data?.title);
      if (attractionName) return attractionName;
      return locale === "en" ? "Attraction Ticket" : "Tiket Atraksi";
    }
    if (isVisa) {
      return (
        getStr(data?.document_visa_title) ||
        getStr(data?.document_visa?.title) ||
        getStr(data?.package_name) ||
        (locale === "en" ? "Documents & Visa" : "Dokumen & Visa")
      );
    }
    const firstItem = itineraryItems?.[0];
    const destination = firstItem?.destination;
    const destLoc = getStr(destination?.location) || getStr(itinerary?.location);
    return (
      getStr(itinerary?.name) ||
      getStr(itinerary?.title) ||
      (itinerary?.country?.name ? `Trip ke ${getStr(itinerary.country.name)}` : (destLoc ? `Trip ke ${destLoc}` : t("tourPackage")))
    );
  }, [isMotor, isEntertainment, isVisa, firstMotorItem, data, locale, itineraryItems, itinerary, t, getStr]);


  const subtotalValue = typeof data?.subtotal === "string" ? parseFloat(data.subtotal) : (data?.subtotal || 0);
  const totalPrice = Number(
    data?.total_price ||
    data?.total ||
    (isVisa
      ? (data?.unit_price ? data.unit_price * (data?.applicant_count || 1) : subtotalValue)
      : tourists.length > 0 ? subtotalValue * tourists.length : subtotalValue)
  );

  const getStatusBadge = (status: string) => {
    const s = (status || "draft").toLowerCase();
    switch (s) {
      case "pending":
        return { label: tPayment("pendingStatus") || "Pending", bg: "bg-amber-50 text-amber-700 border-amber-200" };
      case "confirmed":
      case "ongoing":
        return { label: "Ongoing", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "paid":
        return { label: "Paid", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "documents_submitted":
        return { label: "Documents Submitted", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "under_review":
        return { label: "Under Review", bg: "bg-amber-50 text-amber-700 border-amber-200" };
      case "revision_required":
        return { label: "Revision Required", bg: "bg-orange-50 text-orange-700 border-orange-200" };
      case "submitted_to_embassy":
        return { label: "Submitted to Embassy", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "appointment_scheduled":
        return { label: "Appointment Scheduled", bg: "bg-purple-50 text-purple-700 border-purple-200" };
      case "approved":
        return { label: "Approved", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "rejected":
        return { label: "Rejected", bg: "bg-rose-50 text-rose-700 border-rose-200" };
      case "completed":
        return { label: "Completed", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "cancelled":
        return { label: "Cancelled", bg: "bg-red-50 text-red-700 border-red-200" };
      case "expired":
        return { label: t("expiredStatus") || "Expired", bg: "bg-rose-50 text-rose-700 border-rose-200" };
      case "draft":
      default:
        return { label: "Draft", bg: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  const handleConfirmCancel = async () => {
    if (!data?.id) return;
    try {
      if (isMotor) {
        await updateStatusMotor({ id: data.id, status: "cancelled" }).unwrap();
      } else if (isEntertainment) {
        await cancelEntertainmentBooking(data.id).unwrap();
      } else if (isVisa) {
        await cancelVisaBooking(data.id).unwrap();
      } else {
        await updateStatusTour({ id: data.id, status: "cancelled" }).unwrap();
      }
      toast.success(t("cancelSuccess"));
      refetchAllTours();
      if (onCancelled) onCancelled();
      setIsCancelAlertOpen(false);
      setOpen(false);
    } catch (err) {
      toast.error(t("cancelFailed"));
    }
  };

  const statusBadge = getStatusBadge(data?.status);
  const statusLower = (data?.status || "draft").toLowerCase();
  const canCancel = ["pending", "draft"].includes(statusLower);
  const canProceed = ["pending", "draft"].includes(statusLower);

  // Determine target link & label for proceed action
  const proceedAction = useMemo(() => {
    if (!data || !canProceed) return null;

    if (isMotor) {
      // If traveler data is not yet provided or status is draft, continue filling details
      if (tourists.length === 0 || statusLower === "draft") {
        return {
          href: `/${locale}/orders/rent-motor?book_motor_id=${data.id}&motor_id=${effectiveMotorId}&duration=${rentalDuration}`,
          label: t("continueBooking")
        };
      }
      return {
        href: `/${locale}/payments?order_id=${data.id}&type=motor`,
        label: t("proceedToPayment")
      };
    }

    if (isEntertainment) {
      if (tourists.length === 0 || statusLower === "draft") {
        return {
          href: `/${locale}/book-entertainment-attraction?book_entertainment_attraction_id=${data.id}`,
          label: t("continueBooking")
        };
      }
      return {
        href: `/${locale}/payments?order_id=${data.id}&type=entertainment`,
        label: t("proceedToPayment")
      };
    }

    if (isVisa) {
      const hasApplicants = Array.isArray(data?.applicants) && data.applicants.length > 0;
      if (!hasApplicants || statusLower === "draft") {
        return {
          href: `/${locale}/orders/document-visa?book_document_visa_id=${data.id}&document_visa_id=${data.document_visa_id || ""}`,
          label: t("continueBooking")
        };
      }
      return {
        href: `/${locale}/payments?order_id=${data.id}&type=document-visa`,
        label: t("proceedToPayment")
      };
    }

    return {
      href: `/${locale}/payments?order_id=${data.id}`,
      label: t("proceedToPayment")
    };
  }, [canProceed, isMotor, isEntertainment, isVisa, tourists.length, data?.applicants, statusLower, locale, data?.id, data?.document_visa_id, effectiveMotorId, rentalDuration, t, data]);

  if (!data) return null;

  // Render Inner Content
  const renderDetailContent = () => (
    <>
      {/* Tour / Service Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-4.5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isMotor ? t("motorRental") : isEntertainment ? (locale === "en" ? "Attraction Ticket" : "Tiket Atraksi") : isVisa ? (locale === "en" ? "Documents & Visa" : "Dokumen & Visa") : t("tourPackage")}
            </span>
            <h3 className="text-base font-bold text-slate-900">{packageName}</h3>
            {isVisa && data.country_name && (
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Icon name="MapPin" className="h-3.5 w-3.5 text-red-500" />
                <span>{getStr(data.country_name)}</span>
              </p>
            )}
            {!isVisa && (itinerary?.country?.name || data.country?.name) && (
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Icon name="MapPin" className="h-3.5 w-3.5 text-red-500" />
                <span>{getStr(itinerary?.country?.name) || getStr(data.country?.name)}</span>
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("totalBill")}</span>
            <p className="text-base font-extrabold text-blue-600 mt-0.5">{formatPrice(totalPrice)}</p>
          </div>
        </div>

        {/* Quick meta row */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3 text-xs">
          <div>
            <span className="text-slate-400 text-[11px]">{t("orderDate")}</span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {data.created_at
                ? new Date(data.created_at).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })
                : "—"}
            </p>
          </div>
          {isVisa ? (
            <div>
              <span className="text-slate-400 text-[11px]">{locale === "en" ? "Applicants" : "Pemohon"}</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {data.applicant_count || applicants.length || 1} {locale === "en" ? "person(s)" : "orang"}
              </p>
            </div>
          ) : (
            <div>
              <span className="text-slate-400 text-[11px]">
                {isMotor ? t("rentalDuration") : t("peopleCount")}
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {isMotor
                  ? t("dayCount", { count: rentalDuration })
                  : t("travelerCount", { count: tourists.length || 1 })}
              </p>
            </div>
          )}
          <div>
            <span className="text-slate-400 text-[11px]">{t("paymentStatus")}</span>
            <p className="font-semibold text-slate-800 mt-0.5 capitalize">{statusBadge.label}</p>
          </div>
        </div>

        {/* Visa: Planned Travel Date */}
        {isVisa && data.target_travel_date && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600">
            <Icon name="Calendar" className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400">{locale === "en" ? "Travel Date:" : "Tanggal Perjalanan:"}</span>
            <span className="font-semibold">
              {new Date(data.target_travel_date).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </span>
          </div>
        )}
      </div>

      {/* Itinerary Destinations Details */}
      {!isMotor && !isEntertainment && !isVisa && itineraryItems.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-4.5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3.5">
            <Icon name="MapPin" className="h-4 w-4 text-red-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t("itineraryPlan", { count: itineraryItems.length })}
            </h4>
          </div>

          <div className="space-y-3 divide-y divide-slate-100">
            {itineraryItems.map((item: any, index: number) => {
              const dest = item.destination;
              const translation =
                dest?.translations?.find((tr: any) => tr.language_code === locale) ||
                dest?.translations?.[0];
              const destName = getStr(translation?.name) || getStr(dest?.name) || "Destinasi Wisata";
              const destLocation = getStr(dest?.location) || getStr(itinerary?.location) || "";
              const destImage =
                dest?.thumbnail ||
                translation?.thumbnail ||
                "/images/turkey-destination.jpg";

              return (
                <div key={item.id || index} className="pt-3 first:pt-0 flex items-center gap-3.5">
                  <div className="relative h-13 w-13 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                    <ImageWithFallback
                      src={destImage}
                      alt={destName}
                      fill
                      className="object-cover"
                      fallbackSrc="/images/turkey-destination.jpg"
                    />
                    <div className="absolute top-1 left-1 flex h-4 w-4 items-center justify-center rounded-md bg-blue-600 text-[9px] font-bold text-white shadow">
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{destName}</h5>
                    {destLocation && (
                      <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                        <Icon name="MapPin" className="h-3 w-3 text-red-500 shrink-0" />
                        <span>{destLocation}</span>
                      </p>
                    )}
                    {item.visit_date && (
                      <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Icon name="Calendar" className="h-3 w-3 shrink-0" />
                        <span>
                          {new Date(item.visit_date).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Entertainment Attraction Packages Details */}
      {isEntertainment && (data.book_entertainment_attraction_items || []).length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-4.5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3.5">
            <Icon name="Ticket" className="h-4 w-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {locale === "en" ? "Ticket Packages" : "Paket Tiket"} ({data.book_entertainment_attraction_items.length})
            </h4>
          </div>
          <div className="space-y-3 divide-y divide-slate-100">
            {data.book_entertainment_attraction_items.map((item: any, idx: number) => {
              const pkgName = getStr(item.package_name) || getStr(item.entertainment_attraction_package?.name) || getStr(item.name) || `Paket ${idx + 1}`;
              const qty = Number(item.qty || item.quantity || 1);
              const price = Number(item.price || 0);
              const subtotal = Number(item.subtotal || price * qty);
              const visitDate = item.visit_date || data.booking_date;

              return (
                <div key={item.id || idx} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{pkgName}</p>
                    {visitDate && (
                      <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Icon name="Calendar" className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>
                          {new Date(visitDate).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </span>
                      </p>
                    )}
                    <span className="text-[11px] text-slate-500 mt-0.5 inline-block">
                      {qty}x @ {formatPrice(price)}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Motor Rental Items Details */}
      {isMotor && (data.book_motor_items || []).length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-4.5 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            {t("motorUnits", { count: data.book_motor_items.length })}
          </h4>
          <div className="space-y-2.5">
            {data.book_motor_items.map((item: any, idx: number) => (
              <MotorItemRow
                key={item.id || idx}
                motorId={item.motor_id || item.motor?.id}
                qty={item.qty}
                price={item.price}
                subtotal={item.subtotal}
                formatPrice={formatPrice}
                variant="detail"
              />
            ))}
          </div>
        </div>
      )}

      {/* Booker & Traveler / Applicant Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-4.5 shadow-sm space-y-4">
        {/* Booker */}
        {booker?.name && (
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{t("bookerDetails")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block mb-0.5">{locale === "en" ? "Name:" : "Nama:"}</span>
                <span className="font-semibold text-slate-800 break-words">{getStr(booker.name)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block mb-0.5">Email:</span>
                <span className="font-semibold text-slate-800 break-all">{getStr(booker.email)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block mb-0.5">{locale === "en" ? "Phone:" : "Telepon:"}</span>
                <span className="font-semibold text-slate-800 break-words">{getStr(booker.phone) || getStr(booker.phone_number) || "—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Visa: Applicants */}
        {isVisa && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {locale === "en" ? `Applicants (${applicants.length})` : `Pemohon (${applicants.length})`}
            </p>
            {applicants.length > 0 ? (
              <div className="space-y-2">
                {applicants.map((applicant: any, idx: number) => (
                  <div
                    key={applicant.id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shrink-0">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-slate-800">
                        {applicant.gender === "male" ? "Mr. " : applicant.gender === "female" ? "Ms. " : ""}{getStr(applicant.full_name) || getStr(applicant.name)}
                      </span>
                      {idx === 0 && (
                        <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700">
                          {locale === "en" ? "Primary" : "Utama"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      {applicant.passport_number && (
                        <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200">
                          {t("passport")}: <strong className="text-slate-700">{getStr(applicant.passport_number)}</strong>
                        </span>
                      )}
                      {applicant.nationality && (
                        <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200">
                          {getStr(applicant.nationality)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                {locale === "en" ? "No applicants yet" : "Belum ada data pemohon"}
              </p>
            )}
          </div>
        )}

        {/* Tour/Motor/Entertainment Travelers */}
        {!isVisa && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t("travelerDetails", { count: tourists.length || 0 })}
            </p>
            {tourists.length > 0 ? (
              <div className="space-y-2">
                {tourists.map((tItem: any, idx: number) => (
                  <div
                    key={tItem.id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shrink-0">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-slate-800">
                        {tItem.gender ? `${getStr(tItem.gender)}. ` : ""}{getStr(tItem.name)}
                      </span>
                      {idx === 0 && (
                        <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700">
                          {t("primaryTraveler")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      {tItem.passport_number && (
                        <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200">
                          {t("passport")}: <strong className="text-slate-700">{getStr(tItem.passport_number)}</strong>
                        </span>
                      )}
                      {tItem.nationality && (
                        <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200">
                          {getStr(tItem.nationality)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">{t("noTraveler")}</p>
            )}
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-4.5 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900/80">{t("priceBreakdown")}</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            {isMotor ? (
              <span>{packageName} ({t("dayCount", { count: rentalDuration })})</span>
            ) : isVisa ? (
              <span>{getStr(data.package_name) || packageName} × {data.applicant_count || applicants.length || 1}</span>
            ) : (
              <span>{t("tourPackage")} ({t("travelerCount", { count: tourists.length || 1 })})</span>
            )}
            <span className="font-semibold text-slate-800">{formatPrice(subtotalValue || totalPrice)}</span>
          </div>

          {data.booking_add_ons && data.booking_add_ons.length > 0 && (
            <div className="space-y-1 pt-1">
              {data.booking_add_ons.map((addon: any) => (
                <div key={addon.id} className="flex items-center justify-between text-slate-600 pl-2">
                  <span className="truncate max-w-[180px]">{getStr(addon.name)}</span>
                  <span className="font-semibold text-slate-800">{formatPrice(addon.price)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-blue-200/60 pt-2 text-sm font-extrabold text-slate-900">
            <span>{t("totalBill")}</span>
            <span className="text-base text-blue-600">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Document Submission Note — Only for paid Visa bookings */}
      {isVisa && statusLower === "paid" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Icon name="FileCheck" className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold text-emerald-800">
                {t("visaDocSubmitNoteTitle")}
              </p>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                {t("visaDocSubmitNote")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Render Footer Buttons
  const renderFooterButtons = () => (
    <div className="shrink-0 border-t border-slate-100 bg-white p-4 sm:px-6 flex items-center justify-between gap-2.5">
      {/* Left: Destructive Action (Cancel) */}
      {canCancel ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsCancelAlertOpen(true)}
          className="rounded-xl text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 sm:px-3 h-10 flex items-center gap-1.5 shrink-0">
          <Icon name="Trash2" className="h-3.5 w-3.5 text-red-500" />
          <span>{t("cancel")}</span>
        </Button>
      ) : (
        <div />
      )}

      {/* Right: Close & Chat Admin (for paid visa) & Checkout/Continue CTAs */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
          className="rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 px-4 h-10">
          {t("close")}
        </Button>

        {/* Chat Admin — Paid Visa only */}
        {isVisa && statusLower === "paid" && (
          <Link
            href={buildVisaWaUrl(data)}
            target="_blank"
            rel="noopener noreferrer">
            <Button
              type="button"
              className="rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 px-4 h-10 flex items-center justify-center gap-1.5">
              <Icon name="MessageSquare" className="h-3.5 w-3.5" />
              <span>{t("visaChatAdminBtn")}</span>
            </Button>
          </Link>
        )}

        {proceedAction && (
          <Link href={proceedAction.href}>
            <Button
              type="button"
              className="rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-200 px-4 sm:px-5 h-10 flex items-center justify-center gap-2">
              <span>{proceedAction.label}</span>
              <Icon name="ArrowRight" className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile View: Bottom Drawer */}
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[92vh] flex flex-col gap-0 rounded-t-3xl border-t border-slate-200 bg-white p-0 shadow-2xl">
            {/* Drawer Header */}
            <DrawerHeader className="shrink-0 border-b border-slate-100 px-5 py-3.5 bg-white text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Icon name="Receipt" className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <DrawerTitle className="text-base font-bold text-slate-900 truncate">{t("modalTitle")}</DrawerTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ID: <span className="font-mono font-semibold text-slate-700">{data.code || data.id}</span>
                    </p>
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
            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto p-4 bg-slate-50/50">
              {renderDetailContent()}
            </div>

            {/* Footer Actions */}
            {renderFooterButtons()}
          </DrawerContent>
        </Drawer>
      ) : (
        /* Desktop View: Modal Dialog */
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent showCloseButton={false} className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-2xl rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-white">
            {/* Header */}
            <DialogHeader className="shrink-0 border-b border-slate-100 px-5 sm:px-6 py-4.5 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Icon name="Receipt" className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="text-base font-bold text-slate-900 truncate">{t("modalTitle")}</DialogTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ID: <span className="font-mono font-semibold text-slate-700">{data.code || data.id}</span>
                    </p>
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
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 space-y-5 overflow-y-auto p-5 sm:p-6 bg-slate-50/50">
              {renderDetailContent()}
            </div>

            {/* Footer Actions */}
            {renderFooterButtons()}
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsCancelAlertOpen(false)}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
              disabled={isCancelling}>
              {isCancelling ? t("cancelling") : t("cancelConfirmBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
