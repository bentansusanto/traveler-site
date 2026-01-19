"use client";

import Icon from "@/components/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useGetAllTourQuery } from "@/store/services/book-tour.service";
import { useFindDestinationIdQuery } from "@/store/services/destination.service";
import { useCreatePaymentMutation } from "@/store/services/payment.service";
import { useFindAllTouristQuery } from "@/store/services/tourist.service";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

interface MobilePaymentPageProps {
  orderId: string;
}

const ItineraryItem = ({ item, locale, index }: { item: any; locale: string; index: number }) => {
  const { data: destinationData } = useFindDestinationIdQuery(item.destination_id);
  const [isExpanded, setIsExpanded] = useState(false);

  const destination = item?.destination || destinationData?.data;
  const translation =
    destination?.translations?.find((tr: any) => tr.language_code === locale) ||
    destination?.translations?.[0];

  return (
    <div className="relative border-l-2 border-blue-300 pl-6">
      {/* Timeline dot */}
      <div className="absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2 border-blue-500 bg-white"></div>

      {/* Itinerary item */}
      <div className="pb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="-ml-3 w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="mb-1 text-[10px] font-bold tracking-wider text-blue-500 uppercase">
                Day {index + 1}
              </div>
              <h4 className="mb-1 text-sm font-bold text-gray-900">
                {translation?.name || "Destination"}
              </h4>
              <div className="flex flex-col gap-1">
                {destination?.location && (
                  <p className="flex items-center text-[11px] text-gray-500">
                    <Icon name="MapPin" className="mr-1 h-3.5 w-3.5 text-gray-400" />
                    {destination.location}
                  </p>
                )}
                <p className="flex items-center text-[11px] text-gray-400">
                  <Icon name="Calendar" className="mr-1 h-3.5 w-3.5" />
                  {new Date(item.visit_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {isExpanded && translation?.detail_tour && translation.detail_tour.length > 0 && (
          <div className="mt-3 rounded-lg border border-blue-100/50 bg-blue-50/50 p-4">
            <p className="mb-3 text-xs font-bold text-blue-800">Detail Rencana Perjalanan:</p>
            <ul className="space-y-2">
              {translation.detail_tour.map((detail: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <span className="text-[8px] font-bold">{idx + 1}</span>
                  </div>
                  <span className="leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export const MobilePaymentPage = ({ orderId }: MobilePaymentPageProps) => {
  const locale = useLocale();
  const router = useRouter();

  const { data: bookingsData, isLoading: isLoadingBooking } = useGetAllTourQuery(undefined);
  const { data: touristsData, isLoading: isLoadingTourists } = useFindAllTouristQuery();

  const booking = useMemo(() => {
    const bookings = bookingsData?.datas || bookingsData?.data || [];
    return bookings.find((b: any) => b.id === orderId);
  }, [bookingsData, orderId]);

  const tourists = useMemo(() => {
    const data = touristsData?.data || touristsData?.datas;
    const touristList = Array.isArray(data?.tourists)
      ? data.tourists
      : Array.isArray(data)
        ? data
        : [];
    return touristList.filter((t: any) => t.book_tour_id === orderId);
  }, [touristsData, orderId]);

  const totalPrice = useMemo(() => {
    const subtotal = parseFloat(booking?.subtotal || "0");
    const count = tourists.length || 0;
    return subtotal * count;
  }, [booking, tourists]);

  const [showItinerary, setShowItinerary] = useState(false);
  const [showTravelers, setShowTravelers] = useState(false);
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", idrToUsdRate: 1 / 16000 }
  );
  const selectedCurrency = currentCurrency.code as "IDR" | "USD";
  const idrToUsdRate = currentCurrency.idrToUsdRate || 1 / 16000;

  const displayPrice = useMemo(() => {
    if (selectedCurrency === "USD") {
      return totalPrice * idrToUsdRate;
    }
    return totalPrice;
  }, [totalPrice, selectedCurrency, idrToUsdRate]);

  const handlePayment = async () => {
    if (!booking || !orderId) return;
    setPaymentError(null);

    try {
      const result = await createPayment({
        book_tour_id: orderId,
        payment_method: "paypal",
        currency: "IDR",
        exchange_rate: idrToUsdRate
      }).unwrap();

      if (result.data?.redirect_url) {
        window.location.href = result.data.redirect_url;
      } else {
        setPaymentError("Gagal mendapatkan URL pembayaran. Silakan coba lagi.");
      }
    } catch (error: any) {
      if (error?.data?.message) {
        setPaymentError(error.data.message);
      } else {
        setPaymentError("Terjadi kesalahan saat membuat pembayaran. Silakan coba lagi.");
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(selectedCurrency === "USD" ? "en-US" : "id-ID", {
      style: "currency",
      currency: selectedCurrency,
      minimumFractionDigits: selectedCurrency === "USD" ? 2 : 0
    }).format(amount);
  };

  if (isLoadingBooking || isLoadingTourists) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <Icon name="SearchX" className="mb-4 h-16 w-16 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-900">Pesanan tidak ditemukan</h2>
        <p className="text-gray-500">Mohon periksa kembali nomor pesanan Anda.</p>
      </div>
    );
  }

  const firstItem = booking.book_tour_items?.[0];
  const translation =
    firstItem?.destination?.translations?.find((tr: any) => tr.language_code === locale) ||
    firstItem?.destination?.translations?.[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <button onClick={() => router.back()} className="p-1">
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
        <span className="text-sm font-medium text-blue-600">10sn</span>
      </div>

      {/* Content */}
      <div className="space-y-4 p-4">
        {/* Tour Summary Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
              {translation?.thumbnail && (
                <Image
                  width={100}
                  height={100}
                  src={translation.thumbnail}
                  alt={translation?.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="mb-2 font-bold text-gray-900">{translation?.name || "Tour"}</h3>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Icon name="MapPin" className="h-3.5 w-3.5" />
                  <span>{firstItem?.destination?.location || "Location"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Calendar" className="h-3.5 w-3.5" />
                  <span>
                    {new Date(firstItem?.visit_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long"
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Itinerary Section (Collapsible) */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <button
            onClick={() => setShowItinerary(!showItinerary)}
            className="flex w-full items-center justify-between p-4">
            <h3 className="font-bold text-gray-900">
              Detail Itinerary ({booking.book_tour_items?.length || 0} Destinasi)
            </h3>
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${
                showItinerary ? "rotate-180" : ""
              }`}
            />
          </button>
          {showItinerary && (
            <div className="border-t p-4">
              <div className="space-y-0">
                {booking.book_tour_items?.map((item: any, index: number) => (
                  <ItineraryItem key={item.id} item={item} locale={locale} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Travelers Section (Collapsible) */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <button
            onClick={() => setShowTravelers(!showTravelers)}
            className="flex w-full items-center justify-between p-4">
            <h3 className="font-bold text-gray-900">Detail Traveler ({tourists.length} Orang)</h3>
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${
                showTravelers ? "rotate-180" : ""
              }`}
            />
          </button>
          {showTravelers && (
            <div className="space-y-3 border-t p-4">
              {tourists.map((tourist: any, idx: number) => (
                <div key={tourist.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <Icon name="User" className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {tourist.gender}. {tourist.name}
                      </p>
                      <p className="text-xs text-gray-500">Traveler {idx + 1}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Passport:</p>
                      <p className="font-medium text-gray-900">{tourist.passport_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Nationality:</p>
                      <p className="font-medium text-gray-900">{tourist.nationality}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method - PayPal Only */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 font-bold text-gray-900">Payment Method</h3>
          <div className="rounded-lg border-2 border-orange-500 bg-orange-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500">
                  <Icon name="Check" className="h-3 w-3 text-white" />
                </div>
                <span className="font-semibold text-gray-900">PayPal</span>
              </div>
              <div className="h-6">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                  alt="PayPal"
                  className="h-full w-auto"
                />
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs leading-relaxed text-blue-700">
              Anda akan diarahkan ke situs resmi PayPal untuk menyelesaikan transaksi dengan aman.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {paymentError && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <Icon name="AlertCircle" className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{paymentError}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed right-0 bottom-0 left-0 border-t bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(displayPrice)}</p>
          </div>
          <Button
            onClick={handlePayment}
            disabled={isCreatingPayment}
            className="h-12 rounded-full bg-blue-600 px-8 text-base font-bold hover:bg-blue-700">
            {isCreatingPayment ? "Processing..." : "Pay"}
          </Button>
        </div>
      </div>
    </div>
  );
};
