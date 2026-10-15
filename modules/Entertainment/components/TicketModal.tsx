"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import {
  EntertainmentAttraction,
  EntertainmentAttractionTicket
} from "@/store/services/entertainment-attraction.service";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Info,
  MapPin,
  Minus,
  Plus,
  ShieldAlert,
  Sparkles,
  Ticket as TicketIcon,
  Users,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { validateTicketSelection } from "../schema";

interface TicketModalProps {
  attraction: EntertainmentAttraction | null;
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  t: (key: string, params?: Record<string, any>) => string;
  formatPrice: (price: number) => string;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  attraction,
  isOpen,
  onClose,
  locale,
  t,
  formatPrice
}) => {
  const router = useRouter();

  // Selected visit date (default to tomorrow)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });

  const visitDate = useMemo(() => {
    if (!selectedDate) return "";
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset state when attraction changes or modal opens
  useEffect(() => {
    if (attraction) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      setSelectedDate(d);
      setErrorMsg(null);
      // Initialize ticket quantities
      const initial: Record<string, number> = {};
      (attraction.tickets || []).forEach((tk) => {
        initial[tk.id] = 0;
      });
      setTicketQuantities(initial);
    }
  }, [attraction, isOpen]);

  if (!isOpen || !attraction) return null;

  const translation =
    attraction.translations?.find((tr) => tr.language_code === locale) ||
    attraction.translations?.[0];

  const name = translation?.name || "Entertainment Attraction";
  const description = translation?.description || "";
  const image =
    attraction.thumbnail ||
    attraction.images?.[0] ||
    "/images/hero_things_todo_mobile.png";

  const locationState = attraction.state?.name || attraction.state_name || "";
  const locationCountry =
    attraction.country?.name || attraction.country_name || "";
  const locationText = [locationState, locationCountry]
    .filter(Boolean)
    .join(", ") || "Turkey";

  const categoryName =
    attraction.category_entertainment?.name ||
    attraction.category_entertainment_name ||
    t("badge");

  const tickets = attraction.tickets || [];

  // Stepper handlers
  const handleIncrease = (ticketId: string) => {
    setErrorMsg(null);
    setTicketQuantities((prev) => ({
      ...prev,
      [ticketId]: (prev[ticketId] || 0) + 1
    }));
  };

  const handleDecrease = (ticketId: string) => {
    setErrorMsg(null);
    setTicketQuantities((prev) => ({
      ...prev,
      [ticketId]: Math.max(0, (prev[ticketId] || 0) - 1)
    }));
  };

  // Calculations
  const totalSelectedTickets = Object.values(ticketQuantities).reduce(
    (acc, qty) => acc + (qty || 0),
    0
  );

  const subtotal = tickets.reduce((acc, tk) => {
    const qty = ticketQuantities[tk.id] || 0;
    const price = Number(tk.price) || 0;
    return acc + qty * price;
  }, 0);

  const isOverQuota = Boolean(
    attraction.daily_quota &&
      attraction.daily_quota > 0 &&
      totalSelectedTickets > attraction.daily_quota
  );

  // Booking action
  const handleProceedBooking = () => {
    setErrorMsg(null);

    const bookingPayload = {
      attraction_id: attraction.id,
      attraction_name: name,
      booking_date: visitDate,
      items: tickets.map((tk) => ({
        ticket_id: tk.id,
        ticket_name: tk.name,
        unit_price: Number(tk.price) || 0,
        pax_count: tk.pax_count || 1,
        qty: ticketQuantities[tk.id] || 0
      }))
    };

    const validation = validateTicketSelection(bookingPayload, attraction.daily_quota);

    if (!validation.success) {
      const firstError = Object.values(validation.errors || {})[0] || t("selectTicketsPrompt");
      setErrorMsg(firstError);
      return;
    }

    // Save ticket booking draft in sessionStorage for checkout
    const ticketBookingData = {
      attraction: {
        id: attraction.id,
        name,
        category: categoryName,
        thumbnail: image,
        location: locationText
      },
      visit_date: visitDate,
      items: validation.data?.items.filter((item) => item.qty > 0),
      total_tickets: totalSelectedTickets,
      subtotal
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("entertainment_booking_draft", JSON.stringify(ticketBookingData));
    }

    toast.success(`${totalSelectedTickets} tickets selected for ${name}`);
    onClose();

    // Route to booking page or show feedback
    router.push(`/${locale}/tourist`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="relative border-b border-slate-100 bg-slate-50/70 p-4 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/70 text-slate-600 hover:bg-slate-300 transition-colors z-10"
            aria-label={t("close")}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="relative h-20 w-24 sm:h-24 sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-200/60 shadow-xs">
              <ImageWithFallback
                src={image}
                alt={name}
                fill
                className="object-cover"
                fallbackSrc="/images/hero_things_todo_mobile.png"
              />
            </div>

            <div className="flex-1 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-blue-700">
                  {categoryName}
                </span>
                {attraction.daily_quota ? (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-amber-700 border border-amber-200/60">
                    {t("dailyQuota", { quota: attraction.daily_quota })}
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {t("instantConfirmation")}
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {name}
              </h2>

              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 font-medium">
                <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span>{locationText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Visit Date Selection */}
          <div className="rounded-2xl bg-blue-50/50 border border-blue-100/80 p-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>{t("selectDate")}</span>
            </label>
            <DatePicker
              date={selectedDate}
              setDate={setSelectedDate}
              disabled={isDateDisabled}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm font-medium text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Ticket Options List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TicketIcon className="h-4 w-4 text-blue-600" />
                <span>{t("ticketBreakdown")}</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {tickets.length}{" "}
                {tickets.length === 1 ? t("ticketOptionsSingle") : t("ticketOptions", { count: tickets.length })}
              </span>
            </div>

            {tickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                No tickets configured for this attraction yet.
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket: EntertainmentAttractionTicket) => {
                  const qty = ticketQuantities[ticket.id] || 0;
                  const price = Number(ticket.price) || 0;

                  return (
                    <div
                      key={ticket.id}
                      className={`rounded-2xl border p-4 transition-all duration-200 ${
                        qty > 0
                          ? "border-blue-300 bg-blue-50/20 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Ticket Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-slate-900">
                              {ticket.name}
                            </span>
                            {ticket.ticket_type && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                                {ticket.ticket_type}
                              </span>
                            )}
                          </div>

                          {/* Ticket Pax & Age info */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-normal">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                              {ticket.pax_count
                                ? t("paxCount", { count: ticket.pax_count })
                                : t("paxCount", { count: 1 })}
                            </span>
                            {ticket.min_age != null && (
                              <span>
                                {t("minAge", { age: ticket.min_age })}
                              </span>
                            )}
                          </div>

                          {ticket.description && (
                            <p className="mt-1.5 text-xs text-slate-500 font-normal line-clamp-2">
                              {ticket.description}
                            </p>
                          )}
                        </div>

                        {/* Price & Quantity Stepper */}
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="text-left sm:text-right">
                            <span className="text-base font-bold text-blue-600">
                              {formatPrice(price)}
                            </span>
                            <span className="text-[10px] font-normal text-slate-400 block">
                              {t("perTicket")}
                            </span>
                          </div>

                          {/* Stepper Controls */}
                          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-xs">
                            <button
                              type="button"
                              onClick={() => handleDecrease(ticket.id)}
                              disabled={qty <= 0}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow-xs hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-slate-800">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncrease(ticket.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition-all active:scale-95"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Description Section */}
          {description && (
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <h4 className="text-xs font-bold uppercase text-slate-600 mb-1">
                {t("aboutAttraction")}
              </h4>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quota Exceeded Warning */}
          {isOverQuota && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-700 border border-amber-200">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>
                {t("quotaExceeded", { quota: attraction.daily_quota })}
              </span>
            </div>
          )}
        </div>

        {/* Footer Checkout Bar */}
        <div className="border-t border-slate-100 bg-white p-4 sm:p-5 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">
              {t("subtotal")} ({t("ticketsCount", { count: totalSelectedTickets })})
            </span>
            <span className="text-lg sm:text-xl font-bold text-blue-600">
              {formatPrice(subtotal)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleProceedBooking}
            disabled={totalSelectedTickets === 0 || isOverQuota}
            className="rounded-2xl bg-blue-600 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {t("proceedBooking")}
          </button>
        </div>
      </div>
    </div>
  );
};
