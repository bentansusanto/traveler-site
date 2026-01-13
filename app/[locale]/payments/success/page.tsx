"use client";

import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import { useCapturePaymentMutation } from "@/store/services/payment.service";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const token = searchParams.get("token"); // PayPal order ID

  const [capturePayment, { isLoading }] = useCapturePaymentMutation();
  const [status, setStatus] = useState<"capturing" | "success" | "error">("capturing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {

    if (token) {
      handleCapture();
    } else {
      console.error("No token found in URL");
      setStatus("error");
      setErrorMessage("Token pembayaran tidak ditemukan");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCapture = async () => {
    if (!token) return;

    try {
      const result = await capturePayment(token).unwrap();
      setStatus("success");

      // Redirect to bookings after 3 seconds
      setTimeout(() => {
        router.push(`/${locale}/my-bookings`);
      }, 3000);
    } catch (error: any) {
      console.error("Payment capture error:", error);
      setStatus("error");

      // Handle specific error messages
      if (error?.data?.message) {
        setErrorMessage(error.data.message);
      } else if (error?.status === 404) {
        setErrorMessage("Pembayaran tidak ditemukan");
      } else if (error?.message?.includes("already")) {
        // Payment already captured - treat as success
        setStatus("success");
        setTimeout(() => {
          router.push(`/${locale}/my-bookings`);
        }, 3000);
      } else {
        setErrorMessage("Terjadi kesalahan saat memproses pembayaran");
      }
    }
  };

  const handleRetry = () => {
    setStatus("capturing");
    setErrorMessage("");
    handleCapture();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        {status === "capturing" && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-6 flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Memproses Pembayaran</h2>
            <p className="text-gray-600">
              Mohon tunggu, kami sedang memverifikasi pembayaran Anda...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="rounded-xl border border-green-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Icon name="CheckCircle" className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Pembayaran Berhasil!</h2>
            <p className="mb-6 text-gray-600">
              Terima kasih! Pembayaran Anda telah berhasil diproses.
            </p>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                Anda akan diarahkan ke halaman pesanan dalam beberapa detik...
              </p>
            </div>
            <Button
              onClick={() => router.push(`/${locale}/my-bookings`)}
              className="mt-6 w-full rounded-xl bg-blue-500 font-bold text-white hover:bg-blue-600">
              Lihat Pesanan Saya
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <Icon name="XCircle" className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Pembayaran Gagal</h2>
            <p className="mb-6 text-gray-600">
              {errorMessage || "Terjadi kesalahan saat memproses pembayaran Anda."}
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                disabled={isLoading}
                className="w-full rounded-xl bg-blue-500 font-bold text-white hover:bg-blue-600">
                {isLoading ? "Mencoba lagi..." : "Coba Lagi"}
              </Button>
              <Button
                onClick={() =>
                  router.push(`/${locale}/payments?order_id=${searchParams.get("order_id") || ""}`)
                }
                variant="outline"
                className="w-full rounded-xl border-gray-300 font-bold">
                Kembali ke Pembayaran
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
