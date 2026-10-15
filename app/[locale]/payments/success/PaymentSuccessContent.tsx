"use client";

import { Button } from "@/components/ui/button";
import { useCapturePaymentMutation } from "@/store/services/payment.service";
import {
  ArrowRight,
  Bike,
  Check,
  Compass,
  CreditCard,
  Home,
  Loader2,
  Sparkles,
  XCircle
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("PaymentSuccess");
  const token = searchParams.get("token"); // PayPal order ID

  const [capturePayment, { isLoading }] = useCapturePaymentMutation();
  const [status, setStatus] = useState<"capturing" | "success" | "error">("capturing");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successData, setSuccessData] = useState<any>(null);

  // Multi-currency formatting
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

  useEffect(() => {
    if (token) {
      handleCapture();
    } else {
      console.error("No token found in URL");
      setStatus("error");
      setErrorMessage(t("failedDesc"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCapture = async () => {
    if (!token) return;

    try {
      const result = await capturePayment(token).unwrap();
      setSuccessData(result.data);
      setStatus("success");
    } catch (error: any) {
      console.error("Payment capture error:", error);
      const errorMsg = error?.data?.message || error?.message || "";

      if (
        errorMsg.toLowerCase().includes("already captured") ||
        errorMsg.toLowerCase().includes("completed")
      ) {
        // Payment already captured - treat as success
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(error?.data?.message || t("failedDesc"));
      }
    }
  };

  const handleRetry = () => {
    setStatus("capturing");
    setErrorMessage("");
    handleCapture();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/70 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Loading / Capturing State */}
        {status === "capturing" && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl shadow-slate-200/40">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">{t("processingTitle")}</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              {t("processingDesc")}
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
            {/* Header Success Animation */}
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-xs">
                  <Check className="h-8 w-8 text-emerald-600 stroke-[2.5]" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {t("successTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                {t("successDesc")}
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5 space-y-3">
              {successData?.invoice_code && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t("invoiceNo")}</span>
                  <span className="font-mono font-semibold text-slate-800 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md">
                    {successData.invoice_code}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{t("paymentMethod")}</span>
                <span className="font-medium text-slate-700 capitalize flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                  <span>{successData?.payment_method || "PayPal"}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{t("serviceType")}</span>
                <span className="font-medium text-slate-700">
                  {successData?.service_type === "rent_motor" ? t("motorRental") : t("tourPackage")}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-slate-800">{t("totalPaid")}</span>
                <span className="text-base sm:text-lg font-bold text-blue-600">
                  {formatPrice(successData?.amount || 0)}
                </span>
              </div>
            </div>

            {/* Supporting Service Offerings (Cross-Selling Section) */}
            <div className="space-y-3 pt-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>{t("offeringsTitle")}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t("offeringsSubtitle")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Offering 1: Rental Motor */}
                <Link
                  href={`/${locale}/motor-bike`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 text-left transition-all hover:border-blue-500 hover:shadow-md hover:bg-blue-50/20 active:scale-[0.98]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Bike className="h-4.5 w-4.5" />
                      </div>
                      <span className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        {t("motorRentalBadge")}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {t("motorRentalTitle")}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {t("motorRentalDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-blue-600">
                    <span>Lihat Unit</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>

                {/* Offering 2: Explore More Tours */}
                <Link
                  href={`/${locale}/tour-holiday-religion`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 text-left transition-all hover:border-amber-500 hover:shadow-md hover:bg-amber-50/20 active:scale-[0.98]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <Compass className="h-4.5 w-4.5" />
                      </div>
                      <span className="rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        {t("tourExploreBadge")}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {t("tourExploreTitle")}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {t("tourExploreDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-amber-600">
                    <span>Jelajahi Tour</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <Button
                type="button"
                onClick={() => router.push(`/${locale}/orders`)}
                className="w-full h-11.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-xs sm:text-sm text-white shadow-md shadow-blue-500/15 transition-all active:scale-[0.98]">
                {t("viewOrders")}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/${locale}`)}
                className="w-full h-10.5 rounded-xl border-slate-200 font-medium text-xs sm:text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2">
                <Home className="h-4 w-4 text-slate-500" />
                <span>{t("backHome")}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="rounded-3xl border border-red-100 bg-white p-6 sm:p-8 text-center shadow-xl shadow-red-100/30 space-y-5">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <XCircle className="h-9 w-9 text-red-600" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900">{t("failedTitle")}</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                {errorMessage || t("failedDesc")}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Button
                type="button"
                onClick={handleRetry}
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-blue-600 font-semibold text-xs sm:text-sm text-white hover:bg-blue-700">
                {isLoading ? t("processingTitle") : t("retry")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/${locale}`)}
                className="w-full h-11 rounded-xl border-slate-200 font-medium text-xs sm:text-sm text-slate-700">
                {t("backHome")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
