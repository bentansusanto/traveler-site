"use client";

import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { OrderEntertainmentValues } from "./schema";

interface ConfirmEntertainmentBookingModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  values: OrderEntertainmentValues;
  totalPrice: number;
  formatPrice: (price: number) => string;
  attractionName: string;
  visitDate: string;
}

export const ConfirmEntertainmentBookingModal = ({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  values,
  totalPrice,
  formatPrice,
  attractionName,
  visitDate
}: ConfirmEntertainmentBookingModalProps) => {
  const t = useTranslations("OrderEntertainment");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isSubmitting && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xl rounded-2xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <DialogHeader className="border-b border-slate-100 px-6 py-4.5 shrink-0 bg-white">
          <DialogTitle className="flex items-center gap-2.5 text-base font-bold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Icon name="ShieldAlert" className="h-4 w-4" />
            </div>
            <span>{t("confirmModalTitle")}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {/* Warning Banner */}
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
            <Icon name="AlertTriangle" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-xs font-bold text-amber-900">
                {t("confirmModalWarningTitle")}
              </p>
              <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                {t("confirmModalWarningDesc")}
              </p>
            </div>
          </div>

          {/* Attraction & Visit Date Summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Icon name="MapPin" className="h-4 w-4 text-red-500 shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{attractionName}</p>
                <p className="text-xs font-bold text-slate-900">{t("visitDate")} {visitDate}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{t("totalLabel")}</p>
              <p className="text-xs font-bold text-blue-600">{formatPrice(totalPrice)}</p>
            </div>
          </div>

          {/* Booker Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Icon name="UserCircle" className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t("confirmBookerSummary")}
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-2.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t("bookerName")}</p>
                <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{values.booker.name || "—"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t("email")}</p>
                <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{values.booker.email || "—"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t("phone")}</p>
                <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{values.booker.phone || "—"}</p>
              </div>
            </div>
          </div>

          {/* Traveler Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Icon name="Users" className="h-4 w-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t("confirmTravelerSummary")} ({values.tourists.length})
                </h4>
              </div>
            </div>

            <div className="space-y-2.5">
              {values.tourists.map((tourist, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {tourist.gender ? `${tourist.gender}. ` : ""}{tourist.name}
                        {index === 0 && (
                          <span className="ml-2 rounded-full bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[9px] font-semibold">
                            {t("primaryTag")}
                          </span>
                        )}
                        {tourist.ticket_name && (
                          <span className="ml-2 rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                            {tourist.ticket_name}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {tourist.phoneNumber || values.booker.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-600 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                    <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200/80">
                      <span className="text-slate-400 font-medium">{t("passportLabel")}: </span>
                      <span className="font-bold text-slate-800">{tourist.passportNumber || "—"}</span>
                    </div>
                    <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200/80">
                      <span className="font-semibold text-slate-700">{tourist.nationality || "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/70 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border-slate-200 text-slate-700 text-xs font-semibold h-10 px-4 hover:bg-white active:scale-95">
            {t("confirmCheckBackBtn")}
          </Button>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-10 px-5 shadow-md shadow-blue-200 active:scale-95 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <Icon name="Loader2" className="h-3.5 w-3.5 animate-spin" />
                <span>{t("processing")}</span>
              </>
            ) : (
              <>
                <Icon name="CreditCard" className="h-3.5 w-3.5" />
                <span>{t("confirmProceedBtn")}</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
