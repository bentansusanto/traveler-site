"use client";
import Icon from "@/components/icon";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useFindTourByIdQuery } from "@/store/services/book-tour.service";
import { useCancelPaymentMutation, useFindAllPaymentQuery } from "@/store/services/payment.service";
import { Calendar, Loader2, MapPin, Wallet, XCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

// Reuse and adapt TourItemDetail for consistency
const TourItemDetail = ({
  item,
  dayNumber,
  locale
}: {
  item: any;
  dayNumber: number;
  locale: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const translation =
    item?.destination?.translations?.find((tr: any) => tr.language_code === locale) ||
    item?.destination?.translations?.[0];

  return (
    <div className="relative border-l-2 border-blue-300 pl-6">
      <div className="absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2 border-blue-500 bg-white"></div>
      <div className="pb-6">
        <div className="flex flex-col">
          {/* Header - Interactive for Accordion */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="-ml-3 w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="mb-1 text-[10px] font-bold tracking-wider text-blue-500 uppercase">
                  Day {dayNumber}
                </div>
                <h4 className="mb-1 text-sm font-bold text-gray-900">
                  {translation?.name || "Destination"}
                </h4>

                <div className="flex flex-col gap-1">
                  {item.destination?.location && (
                    <p className="flex items-center text-[11px] text-gray-500">
                      <MapPin className="mr-1 h-3 w-3 text-gray-400" />
                      {item.destination.location}
                    </p>
                  )}
                  <p className="flex items-center text-[11px] text-gray-400">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(item.visit_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
              </div>

              {/* Chevron icon */}
              <Icon
                name="ChevronDown"
                className={cn(
                  "mt-1 h-5 w-5 flex-shrink-0 text-gray-400 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </div>
          </button>

          {/* Expandable Detail Tour Content */}
          {isExpanded && translation?.detail_tour && translation.detail_tour.length > 0 && (
            <div className="mt-3 rounded-lg border border-blue-100/50 bg-blue-50/50 p-4">
              <p className="mb-3 text-[11px] font-bold text-blue-800">Detail Rencana Perjalanan:</p>
              <ul className="space-y-3">
                {translation.detail_tour.map((detail: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-[11px] text-gray-700">
                    <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Icon name={detail} className="h-2.5 w-2.5" />
                    </div>
                    <span className="leading-relaxed capitalize">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OrderDetailModal = ({
  open,
  onOpenChange,
  payment
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any;
}) => {
  const locale = useLocale();
  const { data: tourResponse, isLoading } = useFindTourByIdQuery(payment?.book_tour_id, {
    skip: !open || !payment?.book_tour_id
  });
  const [cancelPayment, { isLoading: isCancelling }] = useCancelPaymentMutation();
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const tourData = tourResponse?.data;

  // Currency formatting
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", idrToUsdRate: 1 / 16000 }
  );

  const formatPrice = (amount: number, currencyCode: string) => {
    const validCurrency = currencyCode || "IDR";
    const isUSD = validCurrency === "USD";
    return new Intl.NumberFormat(isUSD ? "en-US" : "id-ID", {
      style: "currency",
      currency: validCurrency,
      minimumFractionDigits: isUSD ? 2 : 0,
      maximumFractionDigits: isUSD ? 2 : 0
    }).format(amount);
  };

  const handleCancelPayment = async () => {
    try {
      const result = await cancelPayment(payment.id).unwrap();
      toast.success("Payment cancelled successfully");
      setShowCancelAlert(false);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to cancel payment");
    }
  };

  // Check if payment can be cancelled (only pending/failed status)
  const canCancel =
    payment?.status?.toLowerCase() === "pending" || payment?.status?.toLowerCase() === "failed";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] flex-col p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-b p-6">
            <DialogTitle>Detail Pesanan</DialogTitle>
          </DialogHeader>

          <div className="shrink-0 space-y-4 border-b bg-gray-50/30 p-6">
            {/* Payment Info Card */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-gray-900">Informasi Pembayaran</h3>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice:</span>
                  <span className="font-mono font-medium text-blue-600">
                    {payment?.invoice_code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Metode:</span>
                  <span className="font-medium capitalize">{payment?.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                      payment?.status?.toLowerCase() === "success"
                        ? "bg-green-100 text-green-700"
                        : payment?.status?.toLowerCase() === "cancelled"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                    )}>
                    {payment?.status}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2">
                  <span className="font-semibold text-gray-900">Total Dibayar:</span>
                  <span className="font-bold text-blue-600">
                    {formatPrice(payment?.amount, payment?.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tour Status Summary Card */}
            {tourData && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-900">Booking Status</span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 capitalize">
                    {tourData.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 pb-24">
            {/* Tour Detail Itinerary */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : tourData ? (
              <div className="space-y-6">
                {/* Itinerary Section Card */}
                <div className="rounded-xl border border-gray-100 p-4">
                  <h3 className="mb-4 text-sm font-bold text-gray-900">
                    Detail Itinerary ({tourData.book_tour_items?.length || 0} Destinasi)
                  </h3>
                  <div className="space-y-0">
                    {[...(tourData.book_tour_items || [])]
                      .sort((a: any, b: any) => {
                        const dateA = new Date(a.visit_date).getTime();
                        const dateB = new Date(b.visit_date).getTime();
                        if (dateA !== dateB) return dateA - dateB;
                        const seqA = new Date(a.created_at || 0).getTime();
                        const seqB = new Date(b.created_at || 0).getTime();
                        return seqA - seqB;
                      })
                      .map((item: any, idx: number) => (
                        <TourItemDetail
                          key={item.id}
                          item={item}
                          dayNumber={idx + 1}
                          locale={locale}
                        />
                      ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Fixed Bottom Cancel Button */}
          {canCancel && (
            <div className="fixed right-0 bottom-0 left-0 border-t bg-white p-4 shadow-lg sm:relative sm:border-t-0 sm:shadow-none">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowCancelAlert(true)}
                disabled={isCancelling}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Payment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Alert */}
      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Payment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this payment? This action cannot be undone. Your
              booking will be reset to draft status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>No, Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPayment}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700">
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Payment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const OrderPageMobile = () => {
  const { data: paymentsResponse, isLoading, error } = useFindAllPaymentQuery();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Currency formatting for the main list
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", idrToUsdRate: 1 / 16000 }
  );
  const selectedCurrency = currentCurrency.code as "IDR" | "USD";
  const idrToUsdRate = currentCurrency.idrToUsdRate || 1 / 16000;

  const payments = paymentsResponse?.data || paymentsResponse?.datas || [];

  const handleOpenDetail = (payment: any) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  const formatPrice = (amount: number, currencyCode: string) => {
    const validCurrency = currencyCode || "IDR";
    const isUSD = validCurrency === "USD";
    return new Intl.NumberFormat(isUSD ? "en-US" : "id-ID", {
      style: "currency",
      currency: validCurrency,
      minimumFractionDigits: isUSD ? 2 : 0,
      maximumFractionDigits: isUSD ? 2 : 0
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s === "succes" || s === "success")
      return { label: "Success", color: "bg-green-100 text-green-700" };
    if (s === "failed") return { label: "Failed", color: "bg-red-100 text-red-700" };
    return { label: status, color: "bg-yellow-100 text-yellow-700" };
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-center border-b bg-white px-4 py-4 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
      </div>

      {/* Tabs Placeholder (to match screenshot visual) */}
      <div className="flex border-b bg-white">
        <button className="flex-1 border-b-2 border-blue-600 px-4 py-3 text-sm font-bold text-blue-600">
          Success
        </button>
        <button className="flex-1 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-500">
          History
        </button>
      </div>

      <div className="flex-1 space-y-4 p-4">
        {isLoading ? (
          /* Skeletons */
          [1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Wallet className="mb-4 h-16 w-16 text-gray-200" />
            <h3 className="text-lg font-semibold text-gray-900">Belum ada pesanan</h3>
            <p className="text-sm text-gray-500">Transaksi Anda akan muncul di sini</p>
          </div>
        ) : (
          payments.map((payment: any) => {
            const statusCfg = getStatusConfig(payment.status);
            return (
              <div
                key={payment.id}
                className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all active:scale-[0.98]">
                {/* Decoration */}
                <div className="absolute top-0 right-0 h-16 w-16 translate-x-8 -translate-y-8 rounded-full bg-blue-50 opacity-50" />

                {/* Card Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                      Invoice Code
                    </p>
                    <h3 className="font-mono text-sm font-bold text-blue-600">
                      {payment.invoice_code}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("px-2.5 py-0.5 text-[10px] font-bold", statusCfg.color)}>
                      {statusCfg.label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => handleOpenDetail(payment)}>
                      <Icon name="Eye" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Method</p>
                    <p className="text-sm font-semibold text-gray-700 capitalize">
                      {payment.payment_method}
                    </p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Amount</p>
                    <p className="text-base font-black text-gray-900">
                      {formatPrice(payment.amount, payment.currency)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      <OrderDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        payment={selectedPayment}
      />

      {/* Bottom Navbar */}
      <MobileBottomNavbar />
    </div>
  );
};
