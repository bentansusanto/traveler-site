"use client";

import Icon from "@/components/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useGetAllTourQuery } from "@/store/services/book-tour.service";
import { useFindDestinationIdQuery } from "@/store/services/destination.service";
import { useCreatePaymentMutation } from "@/store/services/payment.service";
import { useFindAllTouristQuery } from "@/store/services/tourist.service";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

interface PaymentPageProps {
  orderId: string;
}

const SummaryTourItem = ({ item, locale }: { item: any; locale: string }) => {
  const { data: destinationData } = useFindDestinationIdQuery(item.destination_id);
  const destinationName = useMemo(() => {
    if (!destinationData?.data?.translations) return "Destination";
    const translation = destinationData.data.translations.find((t: any) => t.locale === locale);
    return translation?.name || destinationData.data.translations[0]?.name || "Destination";
  }, [destinationData, locale]);

  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="mt-1 flex flex-col items-center gap-1">
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
        <div className="h-full min-h-[1.5rem] w-px bg-gray-200"></div>
      </div>
      <div>
        <p className="font-medium text-gray-900">{destinationName}</p>
        <p className="text-xs text-gray-500">
          {new Date(item.visit_date).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
        </p>
      </div>
    </div>
  );
};

export const PaymentPage = ({ orderId }: PaymentPageProps) => {
  const locale = useLocale();

  // Fetch Booking Data
  const { data: bookingsData, isLoading: isLoadingBooking } = useGetAllTourQuery(undefined);

  // Fetch Tourist Data
  const { data: touristsData, isLoading: isLoadingTourists } = useFindAllTouristQuery();

  const booking = useMemo(() => {
    const bookings = bookingsData?.datas || bookingsData?.data || [];
    return bookings.find((b: any) => b.id === orderId);
  }, [bookingsData, orderId]);

  const tourists = useMemo(() => {
    // API returns { data: { tourists: [...] } } or { datas: [...] } depending on the endpoint
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

  // Payment state
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Get currency from Redux store (from navbar)
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", idrToUsdRate: 1 / 16000 }
  );
  const selectedCurrency = currentCurrency.code as "IDR" | "USD";

  // Use dynamic exchange rate from Redux store
  const idrToUsdRate = currentCurrency.idrToUsdRate || 1 / 16000;

  // Calculate price in selected currency
  const displayPrice = useMemo(() => {
    if (selectedCurrency === "USD") {
      return totalPrice * idrToUsdRate; // IDR to USD conversion
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
        currency: "IDR", // Always IDR because database stores amount in IDR
        exchange_rate: idrToUsdRate // Send dynamic exchange rate to backend
      }).unwrap();


      // Redirect to PayPal in new tab
      if (result.data?.redirect_url) {
        window.open(result.data.redirect_url, "_blank");
      } else {
        setPaymentError("Gagal mendapatkan URL pembayaran. Silakan coba lagi.");
      }
    } catch (error: any) {
      console.error("Payment creation error:", error);

      // Handle specific error messages
      if (error?.data?.message) {
        setPaymentError(error.data.message);
      } else if (error?.status === 401) {
        setPaymentError("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (error?.status === 404) {
        setPaymentError("Pesanan tidak ditemukan. Silakan coba lagi.");
      } else {
        setPaymentError("Terjadi kesalahan saat membuat pembayaran. Silakan coba lagi.");
      }
    }
  };

  if (isLoadingBooking || isLoadingTourists) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <Icon name="SearchX" className="mb-4 h-16 w-16 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-900">Pesanan tidak ditemukan</h2>
        <p className="text-gray-500">Mohon periksa kembali nomor pesanan Anda.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:px-0">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column - Payment Method */}
          <div className="space-y-6 lg:col-span-8">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900">Metode Pembayaran</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {/* PayPal Option */}
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-orange-500 bg-orange-50 p-4 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-orange-500">
                        <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                      </div>
                      <span className="font-semibold text-gray-900">PayPal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                        alt="PayPal"
                        width={80}
                        height={20}
                        className="h-6 w-auto"
                      />
                    </div>
                  </label>

                  {/* Info Note */}
                  <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm leading-relaxed text-blue-700">
                      Anda akan diarahkan ke situs resmi PayPal untuk menyelesaikan transaksi dengan
                      aman. Pastikan akun PayPal Anda aktif dan saldo mencukupi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {paymentError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <Icon name="AlertCircle" className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{paymentError}</AlertDescription>
              </Alert>
            )}

            {/* Price Detail (Mobile only display adaptation) */}
            <div className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:hidden">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Rincian Harga</h3>
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Person ({tourists.length} orang)</span>
                  <span className="font-medium text-gray-900">
                    {new Intl.NumberFormat(selectedCurrency === "USD" ? "en-US" : "id-ID", {
                      style: "currency",
                      currency: selectedCurrency,
                      minimumFractionDigits: selectedCurrency === "USD" ? 2 : 0
                    }).format(displayPrice)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-900">
                  <span>Total Pembayaran</span>
                  <span className="text-lg text-orange-500">
                    {new Intl.NumberFormat(selectedCurrency === "USD" ? "en-US" : "id-ID", {
                      style: "currency",
                      currency: selectedCurrency,
                      minimumFractionDigits: selectedCurrency === "USD" ? 2 : 0
                    }).format(displayPrice)}
                  </span>
                </div>
              </div>
              <Button
                onClick={handlePayment}
                disabled={isCreatingPayment || !booking}
                className="mt-6 h-12 w-full rounded-xl bg-orange-500 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
                {isCreatingPayment ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Memproses...
                  </>
                ) : (
                  "Bayar Sekarang"
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - Order Details */}
          <div className="space-y-6 lg:col-span-4">
            {/* Ticket Header Style as in Screenshot */}
            <div className="overflow-hidden rounded-xl shadow-sm">
              <div className="bg-blue-500 p-4 text-white">
                <h3 className="text-lg leading-tight font-bold">Detail Pesanan</h3>
                <p className="mt-1 text-xs opacity-90">No. Pesanan {booking.id}</p>
              </div>

              <div className="space-y-6 rounded-b-xl border border-t-0 border-gray-200 bg-white p-6">
                {/* Destination Info */}
                <div>
                  <h4 className="mb-3 font-bold text-gray-900">
                    {booking.country?.name || "Tour Package"}
                  </h4>
                  <div className="space-y-4">
                    {booking.book_tour_items && booking.book_tour_items.length > 0 && (
                      <div className="space-y-0">
                        {(() => {
                          const sortedItems = [...booking.book_tour_items].sort(
                            (a: any, b: any) =>
                              new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
                          );
                          return sortedItems.map((item: any) => (
                            <SummaryTourItem key={item.id} item={item} locale={locale} />
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* People Info */}
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                    <Icon name="Users" className="h-4 w-4 text-gray-400" />
                    Detail Traveler
                  </h4>
                  <div className="space-y-3">
                    {tourists.length > 0 ? (
                      tourists.map((t: any, idx: number) => (
                        <div
                          key={t.id || idx}
                          className="flex items-center gap-3 text-sm text-gray-700">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                            <Icon name="User" className="h-4 w-4" />
                          </div>
                          <span className="font-medium">
                            {t.gender}. {t.name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">Data traveler belum tersedia</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Price Detail for Desktop */}
            <div className="sticky top-6 hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:block">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Rincian Harga</h3>
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Person ({tourists.length} orang)</span>
                  <span className="font-medium text-gray-900">
                    {new Intl.NumberFormat(selectedCurrency === "USD" ? "en-US" : "id-ID", {
                      style: "currency",
                      currency: selectedCurrency,
                      minimumFractionDigits: selectedCurrency === "USD" ? 2 : 0
                    }).format(displayPrice)}
                  </span>
                </div>
                {/* Tax Placeholder if needed, but per previous instruction they were removed from summary.
                      However, for price detail, usually people want to see if there's tax.
                      I'll stick to simple total for now matching subtotal. */}

                <div className="flex justify-between border-t border-gray-100 pt-4 font-bold text-gray-900">
                  <div className="flex flex-col">
                    <span className="text-base">Harga Total</span>
                  </div>
                  <span className="text-xl leading-none text-orange-500">
                    {new Intl.NumberFormat(selectedCurrency === "USD" ? "en-US" : "id-ID", {
                      style: "currency",
                      currency: selectedCurrency,
                      minimumFractionDigits: selectedCurrency === "USD" ? 2 : 0
                    }).format(displayPrice)}
                  </span>
                </div>
              </div>
              <Button
                onClick={handlePayment}
                disabled={isCreatingPayment || !booking}
                className="mt-8 h-14 w-full rounded-xl bg-blue-500 text-[16px] font-bold text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
                {isCreatingPayment ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Memproses...
                  </>
                ) : (
                  "Bayar Sekarang"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
