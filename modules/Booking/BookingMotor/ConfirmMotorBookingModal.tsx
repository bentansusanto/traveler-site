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
import { OrderRentMotorValues } from "./schema";

interface ConfirmMotorBookingModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  values: OrderRentMotorValues;
  totalPrice: number;
  formatPrice: (price: number) => string;
  motorName: string;
  durationText: string;
}

export const ConfirmMotorBookingModal = ({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  values,
  totalPrice,
  formatPrice,
  motorName,
  durationText
}: ConfirmMotorBookingModalProps) => {
  const t = useTranslations("OrderRentMotor");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isSubmitting && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xl rounded-2xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
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
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                {t("confirmModalWarningDesc")}
              </p>
            </div>
          </div>

          {/* Motor & Duration Summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{t("motorUnit")}</span>
              <span className="text-xs font-bold text-slate-900">{motorName}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
              <span className="text-xs font-semibold text-slate-500">{t("durationAndPeriod")}</span>
              <span className="text-xs font-bold text-blue-600">{durationText}</span>
            </div>
          </div>

          {/* Booker Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              <Icon name="UserCircle" className="h-4 w-4 text-emerald-600" />
              <span>{t("confirmBookerSummary")}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">{t("bookerName")}</span>
                <span className="font-semibold text-slate-800">{values.booker.name || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">{t("email")}</span>
                <span className="font-semibold text-slate-800 break-all">{values.booker.email || "-"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 text-[11px] block">{t("phone")}</span>
                <span className="font-semibold text-slate-800">{values.booker.phone || "-"}</span>
              </div>
            </div>
          </div>

          {/* Renters Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Icon name="Users" className="h-4 w-4 text-blue-600" />
                <span>{t("confirmRenterSummary")}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {t("peopleCount", { count: values.tourists.length })}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {values.tourists.map((renter, idx) => (
                <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-semibold text-slate-800 truncate">
                      {renter.gender ? `${renter.gender}. ` : ""}{renter.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {t("idCardOrPassport")}: {renter.passport_number || "-"} • {renter.nationality || "-"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-500">{renter.phone_number || "-"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="flex items-center justify-between rounded-xl bg-blue-50/80 px-4 py-3 border border-blue-100">
            <span className="text-xs font-bold text-slate-700">{t("totalPayment")}</span>
            <span className="text-base font-extrabold text-blue-600">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 px-6 py-4 bg-white flex flex-col sm:flex-row gap-2.5 justify-end shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
            className="h-10 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 border-slate-200">
            {t("confirmCheckBackBtn")}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="h-10 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 disabled:opacity-50">
            {isSubmitting ? (
              <>
                <Icon name="Loader2" className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                <span>{t("processing")}</span>
              </>
            ) : (
              <>
                <Icon name="CreditCard" className="mr-1.5 h-3.5 w-3.5" />
                <span>{t("confirmProceedBtn")}</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
