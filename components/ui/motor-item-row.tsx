"use client";

import React from "react";
import { useLocale } from "next-intl";
import { useFindMotorByIdQuery } from "@/store/services/motor.service";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { cn } from "@/lib/utils";
import Icon from "@/components/icon";

export interface MotorItemRowProps {
  motorId?: string;
  qty?: number;
  price?: number;
  subtotal?: number;
  formatPrice?: (price: number) => string;
  indexBadge?: number;
  variant?: "drawer" | "payment" | "detail" | "compact";
  className?: string;
}

export function useMotorSummary(motorId?: string) {
  const locale = useLocale();
  const { data: motorRes, isLoading } = useFindMotorByIdQuery(motorId || "", {
    skip: !motorId
  });
  const motor = motorRes?.data;
  const translation =
    motor?.translations?.find((tr) => tr.language_code === locale) ||
    motor?.translations?.[0];
  const motorName =
    translation?.name_motor || motor?.merek?.name_merek || "Motor Rental";
  const motorThumbnail = motor?.thumbnail || "/images/turkey-destination.jpg";
  const engineCc = motor?.engine_cc;

  return {
    motor,
    motorName,
    motorThumbnail,
    engineCc,
    isLoading
  };
}

export const MotorItemRow: React.FC<MotorItemRowProps> = ({
  motorId,
  qty = 1,
  price = 0,
  subtotal,
  formatPrice,
  indexBadge,
  variant = "drawer",
  className
}) => {
  const { motorName, motorThumbnail, engineCc, isLoading } = useMotorSummary(motorId);

  const totalAmount = subtotal !== undefined ? subtotal : price * qty;
  const formattedSubtotal = formatPrice ? formatPrice(totalAmount) : `$${totalAmount}`;

  if (isLoading) {
    if (variant === "compact") {
      return (
        <div className={cn("flex justify-between items-center text-sm animate-pulse", className)}>
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-12 bg-slate-200 rounded" />
        </div>
      );
    }

    return (
      <div className={cn("flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 animate-pulse", className)}>
        <div className="h-14 w-14 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex justify-between items-center text-sm", className)}>
        <span className="text-gray-600 truncate mr-2">{motorName}</span>
        <span className="font-medium shrink-0">{qty} unit</span>
      </div>
    );
  }

  if (variant === "payment") {
    return (
      <div className={cn("pt-3 first:pt-0 flex items-center gap-3.5", className)}>
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
          <ImageWithFallback
            src={motorThumbnail}
            alt={motorName}
            fill
            className="object-cover"
            fallbackSrc="/images/turkey-destination.jpg"
          />
          {typeof indexBadge === "number" && (
            <div className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-[10px] font-bold text-white shadow">
              {indexBadge}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{motorName}</h4>
          {engineCc ? (
            <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
              <Icon name="Gauge" className="h-3 w-3 text-slate-400 shrink-0" />
              <span>{engineCc} CC</span>
            </p>
          ) : null}
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
            {qty} unit &bull; {formattedSubtotal}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={cn("flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs border border-slate-100", className)}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
            <ImageWithFallback
              src={motorThumbnail}
              alt={motorName}
              fill
              className="object-cover"
              fallbackSrc="/images/turkey-destination.jpg"
            />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 truncate">{motorName}</p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {qty} unit {engineCc ? `• ${engineCc} CC` : ""}
            </p>
          </div>
        </div>
        <span className="font-semibold text-blue-600 shrink-0 ml-2">{formattedSubtotal}</span>
      </div>
    );
  }

  // Default: drawer
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3",
        className
      )}>
      <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white">
        <ImageWithFallback
          src={motorThumbnail}
          alt={motorName}
          fill
          className="object-cover"
          fallbackSrc="/images/turkey-destination.jpg"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h5 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
          {motorName}
        </h5>
        {engineCc ? (
          <p className="text-[11px] text-slate-500 mt-0.5">
            {engineCc} CC
          </p>
        ) : null}
        <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
          {qty} unit &bull; {formattedSubtotal}
        </p>
      </div>
    </div>
  );
};

export default MotorItemRow;
