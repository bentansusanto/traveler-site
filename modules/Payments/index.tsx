"use client";

import Icon from "@/components/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { MotorItemRow } from "@/components/ui/motor-item-row";
import { useFindTourByIdQuery, useGetAllTourQuery } from "@/store/services/book-tour.service";
import { useFindAllBookMotorsQuery, useFindBookMotorByIdQuery } from "@/store/services/book-motor.service";
import { useGetItineraryByIdQuery } from "@/store/services/itinerary.service";
import { useCreatePaymentMutation } from "@/store/services/payment.service";
import { useFindAllBookersQuery } from "@/store/services/booker.service";
import { useFindBookEntertainmentAttractionByIdQuery } from "@/store/services/book-entertainment-attraction.service";
import { useFindBookDocumentVisaByIdQuery } from "@/store/services/book-document-visa.service";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface PaymentPageProps {
  orderId: string;
}

export const PaymentPage = ({ orderId }: PaymentPageProps) => {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const t = useTranslations("Payment");
  const tItinerary = useTranslations("Itinerary");

  // Currency configuration from Redux store
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16000 }
  );

  const formatPrice = (rawPrice: number) => {
    let displayPrice = Number(rawPrice || 0);
    if (currentCurrency.code !== "USD") {
      const rawRate = Number(currentCurrency.idrToUsdRate);
      const rate =
        rawRate > 1
          ? rawRate
          : rawRate > 0
          ? 1 / rawRate
          : currentCurrency.code === "TRY"
          ? Number(currentCurrency.rates?.TRY) || 47
          : Number(currentCurrency.rates?.IDR) || 16761;
      displayPrice = displayPrice * rate;
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

  // Determine order type from URL parameter (e.g. ?type=document-visa)
  const isTourOrder = !typeParam || typeParam === "tour";
  const isMotorOrder = typeParam === "motor";
  const isEntertainmentOrder = typeParam === "entertainment";
  const isDocumentVisaOrder = typeParam === "document-visa" || typeParam === "visa";

  // 1. Fetch Specific Book Tour (hanya dijalankan jika order adalah Tour)
  const { data: bookTourDetailResponse, isLoading: isLoadingSingleTour } = useFindTourByIdQuery(orderId, {
    skip: !orderId || !isTourOrder
  });

  // 1b. Fetch Specific Book Motor (hanya dijalankan jika order adalah Sewa Motor)
  const { data: bookMotorDetailResponse, isLoading: isLoadingSingleMotor } = useFindBookMotorByIdQuery(orderId, {
    skip: !orderId || !isMotorOrder
  });

  // 1c. Fetch Specific Book Entertainment (hanya dijalankan jika order adalah Tiket Hiburan)
  const { data: bookEntertainmentDetailResponse, isLoading: isLoadingSingleEntertainment } =
    useFindBookEntertainmentAttractionByIdQuery(orderId, {
      skip: !orderId || !isEntertainmentOrder
    });

  // 1d. Fetch Specific Book Document Visa (hanya dijalankan jika order adalah Visa & Dokumen)
  const { data: bookDocumentVisaDetailResponse, isLoading: isLoadingSingleDocumentVisa } =
    useFindBookDocumentVisaByIdQuery(orderId, {
      skip: !orderId || !isDocumentVisaOrder
    });

  // 2. Fetch All Tours & Motors as fallback
  const { data: tourBookingsData, isLoading: isLoadingAllTours } = useGetAllTourQuery(undefined, {
    skip: !orderId || !isTourOrder
  });
  const { data: motorBookingsData, isLoading: isLoadingMotors } = useFindAllBookMotorsQuery(undefined, {
    skip: !orderId || !isMotorOrder
  });
  const { data: bookersData } = useFindAllBookersQuery();

  const booking = useMemo(() => {
    // When type is explicitly specified, only resolve that type — never fall through
    if (typeParam === "document-visa" || typeParam === "visa") {
      if (bookDocumentVisaDetailResponse?.data) {
        return { ...bookDocumentVisaDetailResponse.data, type: "document-visa" };
      }
      return null;
    }

    if (typeParam === "entertainment") {
      if (bookEntertainmentDetailResponse?.data) {
        return { ...bookEntertainmentDetailResponse.data, type: "entertainment" };
      }
      return null; // still loading, don't return wrong type
    }

    if (typeParam === "motor") {
      if (bookMotorDetailResponse?.data) {
        return { ...bookMotorDetailResponse.data, type: "motor" };
      }
      const motorBookings = motorBookingsData?.datas || motorBookingsData?.data || [];
      const motorBooking = motorBookings.find((b: any) => b.id === orderId);
      if (motorBooking) return { ...motorBooking, type: "motor" };
      return null;
    }

    if (typeParam === "tour" || typeParam) {
      // explicit tour type or unknown type — try tour
      if (bookTourDetailResponse?.data) {
        return { ...bookTourDetailResponse.data, type: "tour" };
      }
      return null;
    }

    // No typeParam — auto-detect from responses
    if (bookTourDetailResponse?.data) {
      return { ...bookTourDetailResponse.data, type: "tour" };
    }
    if (bookMotorDetailResponse?.data) {
      return { ...bookMotorDetailResponse.data, type: "motor" };
    }
    if (bookEntertainmentDetailResponse?.data) {
      return { ...bookEntertainmentDetailResponse.data, type: "entertainment" };
    }
    if (bookDocumentVisaDetailResponse?.data) {
      return { ...bookDocumentVisaDetailResponse.data, type: "document-visa" };
    }

    const tourBookings = tourBookingsData?.datas || tourBookingsData?.data || [];
    const tourBooking = tourBookings.find((b: any) => b.id === orderId);
    if (tourBooking) return { ...tourBooking, type: "tour" };

    const motorBookings = motorBookingsData?.datas || motorBookingsData?.data || [];
    const motorBooking = motorBookings.find((b: any) => b.id === orderId);
    if (motorBooking) return { ...motorBooking, type: "motor" };

    return null;
  }, [
    typeParam,
    bookTourDetailResponse,
    bookMotorDetailResponse,
    bookEntertainmentDetailResponse,
    bookDocumentVisaDetailResponse,
    tourBookingsData,
    motorBookingsData,
    orderId
  ]);

  const isMotor = booking?.type === "motor";
  const isEntertainment = booking?.type === "entertainment";
  const isDocumentVisa = booking?.type === "document-visa";
  const isExpired = booking?.status === "expired";
  const isCancelled = booking?.status === "cancelled";
  const isPaid =
    booking?.status === "confirmed" ||
    booking?.status === "completed" ||
    booking?.status === "ongoing";

  // 3. Fetch Itinerary Detail if it's a tour booking
  const itineraryId = booking?.itinerary_id || booking?.itinerary?.id;
  const { data: itineraryResponse, isLoading: isLoadingItinerary } = useGetItineraryByIdQuery(itineraryId!, {
    skip: !itineraryId || (!!typeParam && typeParam !== "tour")
  });

  const itineraryData = itineraryResponse?.data || itineraryResponse || booking?.itinerary;

  // Tourists list from booking
  const tourists = useMemo(() => {
    if (booking?.tourists && Array.isArray(booking.tourists)) {
      return booking.tourists;
    }
    if (booking?.applicants && Array.isArray(booking.applicants)) {
      return booking.applicants.map((app: any) => ({
        ...app,
        name: app.full_name || app.name,
        gender: app.salutation || app.gender
      }));
    }
    return [];
  }, [booking]);

  // Booker data resolution
  const booker = useMemo(() => {
    if (booking?.booker) return booking.booker;
    const allBookers = bookersData?.data || bookersData?.datas || [];
    if (booking?.booker_id) {
      const found = allBookers.find((b: any) => b.id === booking.booker_id);
      if (found) return found;
    }
    return {
      name: booking?.booker_name || booking?.customer?.name || "",
      email: booking?.booker_email || booking?.customer?.email || "",
      phone_number: booking?.booker_phone || booking?.customer?.profile?.phone_number || ""
    };
  }, [booking, bookersData]);

  // Itinerary items resolution
  const itineraryItems = useMemo(() => {
    if (itineraryData?.itinerary_items && Array.isArray(itineraryData.itinerary_items)) {
      return itineraryData.itinerary_items;
    }
    if (booking?.book_tour_items && Array.isArray(booking.book_tour_items)) {
      return booking.book_tour_items;
    }
    return [];
  }, [itineraryData, booking]);

  // Itinerary title
  const itineraryName = useMemo(() => {
    if (isMotor) return "Rental Motor";
    if (isEntertainment) {
      const firstItem = booking?.book_entertainment_attraction_items?.[0];
      return (
        firstItem?.entertainment_attraction_name ||
        (locale === "en" ? "Attraction Tickets" : "Tiket Atraksi & Hiburan")
      );
    }
    if (isDocumentVisa) {
      const visaTitle =
        booking?.document_visa?.translations?.find((tr: any) => tr.language_code === locale)?.title ||
        booking?.document_visa?.title;
      return (
        visaTitle ||
        (locale === "en" ? "Visa & Document Application" : "Pengurusan Dokumen & Visa")
      );
    }
    const items = itineraryItems;
    const firstItem = items?.[0];
    const destinationLocation = firstItem?.destination?.location;
    const loc =
      itineraryData?.location ||
      destinationLocation ||
      (itineraryData?.state?.name
        ? `${itineraryData.state.name}, ${itineraryData.country?.name || ""}`
        : itineraryData?.country?.name) ||
      booking?.country?.name ||
      "Turkey";

    return (
      itineraryData?.name ||
      itineraryData?.title ||
      tItinerary("tripTo", { location: loc })
    );
  }, [isMotor, isEntertainment, isDocumentVisa, itineraryItems, itineraryData, booking, tItinerary, locale]);

  // Total price resolution
  const totalPrice = useMemo(() => {
    if (!booking) return 0;
    if (booking.total !== undefined && booking.total !== null && Number(booking.total) > 0) {
      return Number(booking.total);
    }
    if (isMotor || isDocumentVisa) {
      return parseFloat(booking.total_price || booking.subtotal || "0");
    }
    if (isEntertainment) {
      return Number(booking.subtotal || 0);
    }
    const subtotal = parseFloat(booking.subtotal || itineraryData?.subtotal || "0");
    const count = tourists.length || 1;
    return subtotal * count;
  }, [booking, isMotor, isEntertainment, isDocumentVisa, itineraryData, tourists]);

  // Payment mutation state
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<{ key: string; requestSignature: string } | null>(null);
  const submittingRef = useRef(false);

  // Accordion toggle states
  const [showItineraryAccordion, setShowItineraryAccordion] = useState(true);
  const [showMotorAccordion, setShowMotorAccordion] = useState(true);
  const [showEntertainmentAccordion, setShowEntertainmentAccordion] = useState(true);
  const [showTravelersAccordion, setShowTravelersAccordion] = useState(true);

  const handlePayment = async () => {
    if (!booking || !orderId) return;
    if (isExpired) {
      toast.error(
        locale === "en"
          ? "This booking has expired."
          : "Pemesanan telah kedaluwarsa."
      );
      return;
    }
    if (isCancelled) {
      toast.error(
        locale === "en"
          ? "This booking has been cancelled."
          : "Pemesanan telah dibatalkan."
      );
      return;
    }
    // Synchronous guard: isLoading only updates after a re-render, so a fast
    // double click could otherwise fire two requests.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setPaymentError(null);

    try {
      // One key per payment attempt, tied to the request payload signature. If currency or
      // rate changed since the last attempt, the old key can't be reused (it would
      // 409 on payload mismatch), so a new one is generated.
      const requestSignature = `${orderId}|${currentCurrency.code}|${currentCurrency.idrToUsdRate}`;
      if (idempotencyKeyRef.current?.requestSignature !== requestSignature) {
        idempotencyKeyRef.current = { key: crypto.randomUUID(), requestSignature };
      }

      const paymentData: any = {
        payment_method: "paypal",
        currency: currentCurrency.code || "IDR",
        exchange_rate: currentCurrency.idrToUsdRate || 1 / 16000,
        idempotency_key: idempotencyKeyRef.current.key,
      };

      if (isMotor) {
        paymentData.book_motor_id = orderId;
      } else if (isEntertainment) {
        paymentData.book_entertainment_attraction_id = orderId;
      } else if (isDocumentVisa) {
        paymentData.book_document_visa_id = orderId;
      } else {
        paymentData.book_tour_id = orderId;
      }

      const result = await createPayment(paymentData).unwrap();

      if (result.data?.redirect_url) {
        window.location.href = result.data.redirect_url;
      } else {
        setPaymentError("Gagal mendapatkan tautan pembayaran PayPal. Silakan coba lagi.");
      }
    } catch (error: any) {
      console.error("Payment creation error:", error);
      const isConflict = error?.status === 409;
      // A final server error ends this attempt, so the next click gets a fresh key.
      // Keep the key for network failures (no status) and 409 "still processing",
      // so a retry is deduplicated instead of creating a second payment.
      if (typeof error?.status === "number" && !isConflict) {
        idempotencyKeyRef.current = null;
      }
      const errorMsg = isConflict
        ? locale === "en"
          ? "Your payment is still being processed. Please wait a moment and try again."
          : "Pembayaran Anda sedang diproses. Mohon tunggu sebentar lalu coba lagi."
        : error?.data?.message ||
          error?.message ||
          (error?.status === 401
            ? "Sesi Anda telah berakhir. Silakan login kembali."
            : error?.status === 404
            ? "Pesanan tidak ditemukan. Silakan coba lagi."
            : "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.");
      setPaymentError(errorMsg);
      toast.error(errorMsg);
    } finally {
      submittingRef.current = false;
    }
  };

  const isLoading = isLoadingSingleTour || isLoadingAllTours || isLoadingMotors || isLoadingItinerary;

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-slate-50">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200">
          <Icon name="Loader2" className="h-6 w-6 animate-spin text-blue-600" />
        </div>
        <p className="text-xs font-semibold text-slate-500">Memuat detail pembayaran...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 mb-4 shadow-inner">
          <Icon name="SearchX" className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{t("orderNotFound")}</h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">{t("orderNotFoundDesc")}</p>
        <Button
          onClick={() => router.push(`/${locale}`)}
          className="mt-6 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 px-5 h-10">
          <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
          {t("backToHome")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-6 sm:pt-8">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Top Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/my-bookings`)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-100 active:scale-95">
              <Icon name="ChevronLeft" className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{t("pageTitle")}</h1>
                {isExpired ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {locale === "en" ? "Expired" : "Kedaluwarsa"}
                  </span>
                ) : isCancelled ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                    {locale === "en" ? "Cancelled" : "Dibatalkan"}
                  </span>
                ) : isPaid ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <Icon name="CheckCircle2" className="h-3 w-3 text-emerald-600" />
                    {locale === "en" ? "Paid / Confirmed" : "Sudah Dibayar"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {t("pendingStatus")}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{t("pageSubtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-semibold text-slate-700 shadow-sm">
              <span className="text-slate-400 font-sans">{t("orderCode")}: </span>
              {booking.code || booking.id}
            </span>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: Details & Payment Methods */}
          <div className="space-y-5 lg:col-span-7">
            {/* Notice Banner */}
            {isExpired ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-xs">
                <Icon name="AlertTriangle" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-red-900">
                    {locale === "en" ? "Booking Has Expired" : "Pemesanan Telah Kedaluwarsa"}
                  </p>
                  <p className="text-xs text-red-700 leading-relaxed">
                    {locale === "en"
                      ? "The payment time limit for this booking has expired. According to policy, expired bookings cannot be paid and cannot be rebooked directly. Please select a motor again from our catalog to place a new reservation."
                      : "Batas waktu pembayaran untuk pemesanan ini telah habis (kedaluwarsa). Sesuai ketentuan, pemesanan yang telah kedaluwarsa tidak dapat dibayar lagi. Silakan pilih motor kembali dari katalog untuk melakukan pemesanan baru."}
                  </p>
                </div>
              </div>
            ) : isCancelled ? (
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-xs">
                <Icon name="XCircle" className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {locale === "en"
                    ? "This booking has been cancelled and cannot be paid."
                    : "Pemesanan ini telah dibatalkan dan tidak dapat dibayar lagi."}
                </p>
              </div>
            ) : isPaid ? (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-xs">
                <Icon name="CheckCircle" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  {locale === "en"
                    ? "This booking has already been paid and confirmed."
                    : "Pemesanan ini telah berhasil dibayar dan dikonfirmasi."}
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                <Icon name="Clock" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {t("timerNotice")}
                </p>
              </div>
            )}

            {/* Payment Method Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon name="CreditCard" className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{t("paymentMethod")}</h2>
                  <p className="text-xs text-slate-500">Pilih metode transaksi yang Anda gunakan</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {/* PayPal Option Tile */}
                <div className="relative flex items-center justify-between rounded-2xl border-2 border-blue-600 bg-blue-50/40 p-4 sm:p-5 transition-all shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{t("paypalTitle")}</span>
                        <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Saldo PayPal, Kartu Kredit / Debit Internasional (Visa, Mastercard)
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm">
                    <Image
                      src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                      alt="PayPal"
                      width={70}
                      height={20}
                      className="h-5 w-auto"
                    />
                  </div>
                </div>

                {/* Information Security Note */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex items-start gap-2.5">
                  <Icon name="ShieldCheck" className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t("paypalDesc")}
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {paymentError && (
                <Alert variant="destructive" className="mt-4 rounded-xl border-red-200 bg-red-50">
                  <Icon name="AlertCircle" className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-xs font-semibold text-red-800">
                    {paymentError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Itinerary Destinations Detail Card */}
            {itineraryItems.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowItineraryAccordion(!showItineraryAccordion)}
                  className="flex w-full items-center justify-between px-5 sm:px-6 py-4.5 text-left border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      <Icon name="MapPin" className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{t("itineraryDetails")}</h3>
                      <p className="text-xs text-slate-500">{t("destinationsCount", { count: itineraryItems.length })}</p>
                    </div>
                  </div>
                  <Icon
                    name={showItineraryAccordion ? "ChevronUp" : "ChevronDown"}
                    className="h-4 w-4 text-slate-400"
                  />
                </button>

                {showItineraryAccordion && (
                  <div className="p-5 sm:p-6 space-y-3 divide-y divide-slate-100">
                    {itineraryItems.map((item: any, index: number) => {
                      const destination = item?.destination;
                      const translation =
                        destination?.translations?.find((tr: any) => tr.language_code === locale) ||
                        destination?.translations?.[0];
                      const destName = translation?.name || destination?.name || "Destinasi Wisata";
                      const destLocation = destination?.location || itineraryData?.location || "";
                      const destImage =
                        destination?.thumbnail ||
                        translation?.thumbnail ||
                        "/images/turkey-destination.jpg";

                      return (
                        <div key={item.id || index} className="pt-3 first:pt-0 flex items-center gap-3.5">
                          <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                            <ImageWithFallback
                              src={destImage}
                              alt={destName}
                              fill
                              className="object-cover"
                              fallbackSrc="/images/turkey-destination.jpg"
                            />
                            <div className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-[10px] font-bold text-white shadow">
                              {index + 1}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{destName}</h4>
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
                )}
              </div>
            )}

            {/* Motor Rental Items Detail Card */}
            {isMotor && booking?.book_motor_items && booking.book_motor_items.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowMotorAccordion(!showMotorAccordion)}
                  className="flex w-full items-center justify-between px-5 sm:px-6 py-4.5 text-left border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon name="Bike" className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{locale === "en" ? "Motor Rental Details" : "Rincian Motor Sewa"}</h3>
                      <p className="text-xs text-slate-500">
                        {booking.book_motor_items.length} {locale === "en" ? "units selected" : "unit motor dipilih"}
                      </p>
                    </div>
                  </div>
                  <Icon
                    name={showMotorAccordion ? "ChevronUp" : "ChevronDown"}
                    className="h-4 w-4 text-slate-400"
                  />
                </button>

                {showMotorAccordion && (
                  <div className="p-5 sm:p-6 space-y-3 divide-y divide-slate-100">
                    {booking.book_motor_items.map((item: any, index: number) => (
                      <MotorItemRow
                        key={item.id || index}
                        motorId={item.motor_id || item.motor?.id}
                        qty={item.qty}
                        price={item.price}
                        subtotal={item.subtotal}
                        formatPrice={formatPrice}
                        indexBadge={index + 1}
                        variant="payment"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Entertainment Tickets Detail Card */}
            {isEntertainment && booking?.book_entertainment_attraction_items && booking.book_entertainment_attraction_items.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowEntertainmentAccordion(!showEntertainmentAccordion)}
                  className="flex w-full items-center justify-between px-5 sm:px-6 py-4.5 text-left border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon name="Ticket" className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {locale === "en" ? "Attraction Tickets" : "Rincian Tiket Atraksi"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {booking.book_entertainment_attraction_items.length} {locale === "en" ? "ticket packages" : "paket tiket"}
                        {booking.booking_date && ` · ${booking.booking_date}`}
                      </p>
                    </div>
                  </div>
                  <Icon
                    name={showEntertainmentAccordion ? "ChevronUp" : "ChevronDown"}
                    className="h-4 w-4 text-slate-400"
                  />
                </button>

                {showEntertainmentAccordion && (
                  <div className="p-5 sm:p-6 space-y-3 divide-y divide-slate-100">
                    {booking.book_entertainment_attraction_items.map((item: any, index: number) => (
                      <div key={item.id || index} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{item.ticket_name || "Admission Pass"}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">{item.qty}x @ {formatPrice(item.unit_price)}</p>
                        </div>
                        <span className="font-bold text-blue-600">{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Booker & Traveler Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTravelersAccordion(!showTravelersAccordion)}
                className="flex w-full items-center justify-between px-5 sm:px-6 py-4.5 text-left border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon name="Users" className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{t("bookerDetails")} & {t("travelerDetails")}</h3>
                    <p className="text-xs text-slate-500">{t("travelerUnit", { count: tourists.length || 1 })}</p>
                  </div>
                </div>
                <Icon
                  name={showTravelersAccordion ? "ChevronUp" : "ChevronDown"}
                  className="h-4 w-4 text-slate-400"
                />
              </button>

              {showTravelersAccordion && (
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Booker Details */}
                  {booker?.name && (
                    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        {t("bookerDetails")}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
                        <div>
                          <span className="text-slate-400 text-[11px] block mb-0.5">Nama:</span>
                          <span className="font-semibold text-slate-800 break-words">{booker.name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block mb-0.5">Email:</span>
                          <span className="font-semibold text-slate-800 break-all">{booker.email}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block mb-0.5">Telepon:</span>
                          <span className="font-semibold text-slate-800 break-words">{booker.phone_number || booker.phone || "—"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Travelers List */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t("travelerDetails")}
                    </p>
                    {tourists.length > 0 ? (
                      tourists.map((tItem: any, idx: number) => (
                        <div
                          key={tItem.id || idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3 sm:p-3.5 text-xs shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shrink-0 shadow-xs">
                              {idx + 1}
                            </div>
                            <span className="font-bold text-slate-800">
                              {tItem.gender ? `${tItem.gender}. ` : ""}{tItem.name}
                            </span>
                            {idx === 0 && (
                              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                {locale === "en" ? "Primary" : "Utama"}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            {tItem.passport_number && (
                              <span className="rounded-md bg-slate-50 px-2 py-0.5 border border-slate-200">
                                Paspor: <strong className="text-slate-700">{tItem.passport_number}</strong>
                              </span>
                            )}
                            {tItem.nationality && (
                              <span className="rounded-md bg-slate-50 px-2 py-0.5 border border-slate-200 font-medium text-slate-700">
                                {tItem.nationality}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">Data traveler belum tersedia</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Price Summary & Pay CTA */}
          <div className="space-y-5 lg:col-span-5">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon name="Receipt" className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t("priceSummary")}</h3>
                  <p className="text-xs text-slate-500">Rincian biaya & konfirmasi final</p>
                </div>
              </div>

              {/* Tour / Motor / Entertainment / Visa Snippet */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Icon name={isMotor ? "Bike" : isEntertainment ? "Ticket" : isDocumentVisa ? "FileText" : "MapPin"} className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {isMotor
                      ? (locale === "en" ? "Motor Rental Service" : "Rental Motor")
                      : itineraryName}
                  </p>
                </div>
                {isMotor && booking.start_date && booking.end_date && (
                  <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                    <Icon name="Calendar" className="h-3 w-3" />
                    <span>
                      {new Date(booking.start_date).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", { day: "numeric", month: "short" })} - {new Date(booking.end_date).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </p>
                )}
                {isEntertainment && booking.booking_date && (
                  <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                    <Icon name="Calendar" className="h-3 w-3 text-blue-600" />
                    <span>{locale === "en" ? "Visit Date:" : "Kunjungan:"} {booking.booking_date}</span>
                  </p>
                )}
                {isDocumentVisa && booking.target_travel_date && (
                  <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                    <Icon name="Calendar" className="h-3 w-3 text-blue-600" />
                    <span>
                      {locale === "en" ? "Target Travel Date:" : "Rencana Keberangkatan:"}{" "}
                      {new Date(booking.target_travel_date).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </p>
                )}
                <p className="mt-1 text-[11px] text-slate-400 font-mono">
                  ID: {booking.code || booking.id?.slice(0, 12)}
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>
                    {isMotor
                      ? (locale === "en" ? `Motor Rental (${booking.book_motor_items?.length || 1} unit)` : `Rental Motor (${booking.book_motor_items?.length || 1} unit)`)
                      : isEntertainment
                      ? (locale === "en" ? `Attraction Tickets (${booking.book_entertainment_attraction_items?.length || 1} packages)` : `Tiket Atraksi (${booking.book_entertainment_attraction_items?.length || 1} paket)`)
                      : isDocumentVisa
                      ? (locale === "en" ? `Visa Application (${booking.applicant_count || tourists.length || 1} applicant)` : `Pengajuan Visa (${booking.applicant_count || tourists.length || 1} pemohon)`)
                      : `${t("tourPackage")} (${tourists.length || 1} orang)`}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatPrice(isMotor ? totalPrice : (booking.subtotal || totalPrice))}
                  </span>
                </div>

                {/* Add-ons */}
                {booking.booking_add_ons && booking.booking_add_ons.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {t("addons")} ({booking.booking_add_ons.length})
                    </p>
                    {booking.booking_add_ons.map((addon: any, idx: number) => (
                      <div key={addon.id || idx} className="flex items-center justify-between text-slate-500">
                        <span className="truncate max-w-[200px]">{addon.addon?.name || addon.name || "Add-on"}</span>
                        <span className="font-medium text-slate-700">{formatPrice(addon.price || addon.addon?.price || 0)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Service Fee */}
                <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-100">
                  <span>{t("serviceFee")}</span>
                  <span className="font-bold text-blue-600">{t("free")}</span>
                </div>

                {/* Total */}
                <div className="flex items-baseline justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900">{t("totalPayment")}</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-blue-600">
                      {formatPrice(totalPrice)}
                    </span>
                    <p className="text-[10px] text-slate-400">Termasuk pajak & biaya layanan</p>
                  </div>
                </div>
              </div>

              {/* Pay Button / Expired / Paid Action Button */}
              {isExpired ? (
                <Button
                  type="button"
                  onClick={() => router.push(isMotor ? `/${locale}/motor-bike` : isEntertainment ? `/${locale}/entertainment-attraction` : isDocumentVisa ? `/${locale}/document-visa` : `/${locale}/tours`)}
                  className="h-13 w-full rounded-2xl bg-red-600 text-sm font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5">
                  <Icon name={isMotor ? "Bike" : isEntertainment ? "Ticket" : isDocumentVisa ? "FileText" : "Search"} className="h-4 w-4" />
                  <span>
                    {isMotor
                      ? (locale === "en" ? "Choose Another Motor" : "Pilih Motor Baru")
                      : isEntertainment
                      ? (locale === "en" ? "Explore Attractions" : "Cari Atraksi Lain")
                      : isDocumentVisa
                      ? (locale === "en" ? "Browse Visa Services" : "Pilih Layanan Visa Lain")
                      : (locale === "en" ? "Explore Tours" : "Cari Paket Lain")}
                  </span>
                </Button>
              ) : isPaid ? (
                <Button
                  type="button"
                  onClick={() => router.push(`/${locale}/my-bookings`)}
                  className="h-13 w-full rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5">
                  <Icon name="Receipt" className="h-4 w-4" />
                  <span>{locale === "en" ? "View My Bookings" : "Lihat Pesanan Saya"}</span>
                </Button>
              ) : isCancelled ? (
                <Button
                  type="button"
                  onClick={() => router.push(isMotor ? `/${locale}/motor-bike` : isEntertainment ? `/${locale}/entertainment-attraction` : isDocumentVisa ? `/${locale}/document-visa` : `/${locale}`)}
                  className="h-13 w-full rounded-2xl bg-slate-700 text-sm font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5">
                  <Icon name="ArrowLeft" className="h-4 w-4" />
                  <span>{locale === "en" ? "Back to Browse" : "Kembali Memilih"}</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handlePayment}
                  disabled={isCreatingPayment || !booking}
                  className="h-13 w-full rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5">
                  {isCreatingPayment ? (
                    <>
                      <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                      <span>{t("processing")}</span>
                    </>
                  ) : (
                    <>
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                        alt="PayPal"
                        width={60}
                        height={18}
                        className="h-4 w-auto brightness-0 invert"
                      />
                      <span>{t("payNow")}</span>
                    </>
                  )}
                </Button>
              )}

              {/* Security note */}
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
                <Icon name="ShieldCheck" className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t("securePayment")}</span>
              </div>
            </div>

            {/* Support Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shrink-0">
                <Icon name="Headphones" className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{t("needHelp")}</p>
                <p className="text-[11px] text-slate-500">{t("support247")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
