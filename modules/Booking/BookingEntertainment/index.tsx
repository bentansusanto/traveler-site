"use client";

import Icon from "@/components/icon";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFindAddOnsByCategoryQuery } from "@/store/services/add-ons.service";
import {
  useFindBookEntertainmentAttractionByIdQuery,
  useUpdateBookingDetailsMutation
} from "@/store/services/book-entertainment-attraction.service";
import {
  useCreateBookerMutation,
  useFindAllBookersQuery
} from "@/store/services/booker.service";
import { useGetUserQuery } from "@/store/services/customer.service";
import { useFindAttractionByIdQuery } from "@/store/services/entertainment-attraction.service";
import { setCurrency } from "@/store/slices/currencySlice";
import { useFormik } from "formik";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { BookerListModal } from "../BookingTour/BookerListModal";
import { ConfirmEntertainmentBookingModal } from "./ConfirmEntertainmentBookingModal";
import { DatePicker } from "@/components/ui/date-picker";
import {
  OrderEntertainmentValues,
  getOrderEntertainmentSchema,
  orderEntertainmentSchema
} from "./schema";

export interface BookedItem {
  ticket_id?: string;
  ticket_name: string;
  qty: number;
  unit_price: number;
  subtotal: number;
}

const parseDateDDMMYYYY = (dateStr?: string): Date | undefined => {
  if (!dateStr) return undefined;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return undefined;
};

export const OrderEntertainmentPage = () => {
  const locale = useLocale();
  const t = useTranslations("OrderEntertainment");
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const bookEntertainmentIdParam = searchParams.get("book_entertainment_id");
  const attractionIdParam = searchParams.get("attraction_id");

  // 1. Fetch Existing BookEntertainment if ID is present
  const {
    data: bookingResponse,
    isLoading: isLoadingBooking,
    refetch: refetchBooking
  } = useFindBookEntertainmentAttractionByIdQuery(bookEntertainmentIdParam!, {
    skip: !bookEntertainmentIdParam
  });
  const bookingData = bookingResponse?.data;

  // 2. Client-side mount & session draft loading to prevent SSR hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const [sessionDraft, setSessionDraft] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = sessionStorage.getItem("entertainment_booking_draft");
      if (raw) {
        setSessionDraft(JSON.parse(raw));
      }
    } catch {}
  }, []);

  // Effective Attraction ID
  const effectiveAttractionId =
    attractionIdParam ||
    bookingData?.book_entertainment_attraction_items?.[0]?.entertainment_attraction_id ||
    sessionDraft?.attraction?.id;

  // 3. Fetch Attraction Details
  const { data: attractionResponse, isLoading: isLoadingAttraction } =
    useFindAttractionByIdQuery(effectiveAttractionId as string, {
      skip: !effectiveAttractionId
    });
  const attraction = attractionResponse?.data;

  const translation =
    attraction?.translations?.find((tr: any) => tr.language_code === locale) ||
    attraction?.translations?.[0];

  const attractionName =
    translation?.name ||
    sessionDraft?.attraction?.name ||
    "Entertainment Attraction";

  const attractionImage =
    attraction?.thumbnail ||
    attraction?.images?.[0] ||
    sessionDraft?.attraction?.thumbnail ||
    "/images/hero_things_todo_mobile.png";

  const locationText =
    [
      attraction?.state?.name || attraction?.state_name,
      attraction?.country?.name || attraction?.country_name
    ]
      .filter(Boolean)
      .join(", ") ||
    sessionDraft?.attraction?.location ||
    "Turkey";

  const visitDateText =
    bookingData?.booking_date ||
    sessionDraft?.visit_date ||
    "-";

  // 4. Booker Information & Account Prefill
  const { data: currentUserData } = useGetUserQuery();
  const { data: bookersData } = useFindAllBookersQuery();
  const [createBooker] = useCreateBookerMutation();
  const [updateBookingDetails, { isLoading: isUpdating }] =
    useUpdateBookingDetailsMutation();

  const accountData = useMemo(() => {
    const user = currentUserData?.data || currentUserData;
    return {
      name: user?.name || user?.full_name || "",
      email: user?.email || "",
      phone: user?.profile?.phone_number || user?.phone_number || ""
    };
  }, [currentUserData]);

  const [useAccountData, setUseAccountData] = useState(true);
  const [selectedBookerId, setSelectedBookerId] = useState<string | null>(null);
  const [isBookerModalOpen, setIsBookerModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSummaryDrawerOpen, setIsSummaryDrawerOpen] = useState(false);

  // Hide sticky bottom bar when the summary card scrolls into view
  const summaryCardRef = useRef<HTMLDivElement>(null);
  const [isSummaryCardVisible, setIsSummaryCardVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const el = summaryCardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Summary card is considered "visible" when its top edge is within the viewport
      setIsSummaryCardVisible(rect.top < window.innerHeight && rect.bottom > 0);
    };

    checkVisibility(); // check on mount
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });
    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, []);

  // 5. Add-ons Query
  const { data: generalAddOnsResponse } = useFindAddOnsByCategoryQuery("general");
  const availableAddOns = useMemo(() => {
    return (
      generalAddOnsResponse?.datas ||
      (Array.isArray(generalAddOnsResponse?.data) ? generalAddOnsResponse.data : [])
    );
  }, [generalAddOnsResponse]);

  // 6. Currency Handling
  const currentCurrency = useSelector(
    (state: any) =>
      state.currency || {
        code: "IDR",
        symbol: "Rp",
        idrToUsdRate: 16761,
        rates: { IDR: 16761, USD: 1, TRY: 47 }
      }
  );

  const activeCurrencyCode =
    locale === "id" ? "IDR" : locale === "tr" ? "TRY" : "USD";

  useEffect(() => {
    if (currentCurrency.code !== activeCurrencyCode) {
      dispatch(setCurrency(activeCurrencyCode));
    }
  }, [locale, activeCurrencyCode, currentCurrency.code, dispatch]);

  const formatPrice = (rawPrice: number) => {
    const effectiveCode =
      locale === "id" ? "IDR" : locale === "tr" ? "TRY" : "USD";
    const rate =
      effectiveCode === "USD"
        ? 1
        : currentCurrency.rates?.[effectiveCode] ||
          (effectiveCode === "IDR"
            ? currentCurrency.idrToUsdRate || 16761
            : 47);

    let displayPrice = Number(rawPrice || 0);
    if (effectiveCode !== "USD") {
      displayPrice = displayPrice * rate;
    }

    return new Intl.NumberFormat(
      effectiveCode === "IDR"
        ? "id-ID"
        : effectiveCode === "TRY"
        ? "tr-TR"
        : "en-US",
      {
        style: "currency",
        currency: effectiveCode,
        maximumFractionDigits: effectiveCode === "IDR" ? 0 : 2
      }
    )
      .format(displayPrice)
      .replace("$", "US$ ");
  };

  // 7. Resolve Booked Items (Tickets)
  const bookedItems: BookedItem[] = useMemo(() => {
    if (
      bookingData?.book_entertainment_attraction_items &&
      bookingData.book_entertainment_attraction_items.length > 0
    ) {
      return bookingData.book_entertainment_attraction_items.map((item: any) => ({
        ticket_id: item.ticket_id,
        ticket_name:
          item.ticket?.name ||
          item.ticket?.translations?.find((t: any) => t.language_code === locale)?.name ||
          item.ticket?.translations?.[0]?.name ||
          "Admission Ticket",
        qty: Number(item.qty) || 1,
        unit_price: Number(item.unit_price) || 0,
        subtotal: (Number(item.qty) || 1) * (Number(item.unit_price) || 0)
      }));
    }

    if (sessionDraft?.items && sessionDraft.items.length > 0) {
      return sessionDraft.items.map((item: any) => ({
        ticket_id: item.ticket_id,
        ticket_name: item.ticket_name || "Admission Ticket",
        qty: Number(item.qty) || 1,
        unit_price: Number(item.unit_price) || 0,
        subtotal: (Number(item.qty) || 1) * (Number(item.unit_price) || 0)
      }));
    }

    return [];
  }, [bookingData, sessionDraft, locale]);

  // Total tickets count
  const totalTicketsCount = useMemo(() => {
    return bookedItems.reduce((acc: number, item: BookedItem) => acc + item.qty, 0);
  }, [bookedItems]);

  // Initial Tourists array mapped to total booked tickets count
  const initialTourists = useMemo(() => {
    const result: Array<{
      gender: string;
      name: string;
      phoneNumber: string;
      nationality: string;
      passportNumber: string;
      birthDate?: string;
      ticket_id?: string;
      ticket_name?: string;
    }> = [];

    bookedItems.forEach((item: BookedItem) => {
      for (let i = 0; i < item.qty; i++) {
        result.push({
          gender: "Mr",
          name: "",
          phoneNumber: "",
          nationality: "Indonesia",
          passportNumber: "",
          birthDate: "",
          ticket_id: item.ticket_id,
          ticket_name: item.ticket_name
        });
      }
    });

    if (result.length === 0) {
      result.push({
        gender: "Mr",
        name: "",
        phoneNumber: "",
        nationality: "Indonesia",
        passportNumber: "",
        birthDate: ""
      });
    }

    return result;
  }, [bookedItems]);

  // 8. Formik Initialization
  const validationSchema = useMemo(() => getOrderEntertainmentSchema(t), [t]);

  const formik = useFormik<OrderEntertainmentValues>({
    initialValues: {
      booker: {
        name: accountData.name || "",
        email: accountData.email || "",
        phone: accountData.phone || ""
      },
      tourists: initialTourists,
      add_ons: []
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = validationSchema.safeParse(values);
      if (!result.success) {
        const errors: any = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path;
          if (path.length > 0) {
            let current = errors;
            for (let i = 0; i < path.length - 1; i++) {
              const p = path[i];
              if (!current[p]) current[p] = typeof p === "number" ? [] : {};
              current = current[p];
            }
            current[path[path.length - 1]] = issue.message;
          }
        });
        return errors;
      }
      return {};
    },
    onSubmit: async (values) => {
      const bookEntertainmentId =
        bookEntertainmentIdParam ||
        bookingData?.id ||
        sessionDraft?.booking_id;

      if (!bookEntertainmentId) {
        toast.error("ID Booking tidak ditemukan. Silakan pesan ulang tiket atraksi.");
        return;
      }

      try {
        let finalBookerId = selectedBookerId;

        if (!finalBookerId) {
          const matchedBooker = (bookersData?.data || []).find(
            (b: any) =>
              b.email?.toLowerCase().trim() ===
              values.booker.email.toLowerCase().trim()
          );

          if (matchedBooker?.id) {
            finalBookerId = matchedBooker.id;
          } else {
            const createBookerRes = await createBooker({
              name: values.booker.name,
              email: values.booker.email,
              phone_number: values.booker.phone
            }).unwrap();

            finalBookerId =
              createBookerRes?.data?.id || createBookerRes?.id;
          }
        }

        const touristsPayload = values.tourists.map((t, idx) => {
          const correspondingItem = bookedItems[idx] || bookedItems[0];
          return {
            gender: t.gender || "Mr",
            name: t.name,
            phone_number: t.phoneNumber || values.booker.phone,
            nationality: t.nationality || "Indonesia",
            passport_number: t.passportNumber,
            birth_date: t.birthDate || undefined,
            ticket_id: t.ticket_id || correspondingItem?.ticket_id
          };
        });

        await updateBookingDetails({
          id: bookEntertainmentId,
          dto: {
            booker_id: finalBookerId || undefined,
            tourists: touristsPayload
          }
        }).unwrap();

        try {
          sessionStorage.removeItem("entertainment_booking_draft");
        } catch {}

        toast.success(t("orderSuccess"));
        setIsConfirmModalOpen(false);

        router.push(
          `/${locale}/payments?order_id=${bookEntertainmentId}&type=entertainment`
        );
      } catch (err: any) {
        console.error("Failed to update booking details:", err);
        const backendMessage =
          err?.data?.message || err?.message || t("orderFailed");
        toast.error(backendMessage);
      }
    }
  });

  // Keep formik booker in sync when user checks/unchecks 'from account'
  useEffect(() => {
    if (useAccountData && (accountData.name || accountData.email)) {
      formik.setFieldValue("booker.name", accountData.name);
      formik.setFieldValue("booker.email", accountData.email);
      formik.setFieldValue("booker.phone", accountData.phone);
    }
  }, [useAccountData, accountData]);

  // Pricing calculations
  const ticketsSubtotal = useMemo(() => {
    return bookedItems.reduce((acc: number, item: BookedItem) => acc + item.subtotal, 0);
  }, [bookedItems]);

  const addOnsSubtotal = useMemo(() => {
    if (!formik.values.add_ons || formik.values.add_ons.length === 0) return 0;
    return formik.values.add_ons.reduce((acc: number, id: string) => {
      const addOn = availableAddOns.find((a: any) => a.id === id);
      return acc + (Number(addOn?.price) || 0);
    }, 0);
  }, [formik.values.add_ons, availableAddOns]);

  const totalPrice = ticketsSubtotal + addOnsSubtotal;

  const handlePreSubmit = async () => {
    const touchedTravelers = formik.values.tourists.map(() => ({
      gender: true,
      name: true,
      phoneNumber: true,
      nationality: true,
      passportNumber: true
    }));

    formik.setTouched({
      booker: { name: true, email: true, phone: true },
      tourists: touchedTravelers
    });

    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      let firstError = t("fillRequiredFields");
      if (errors.booker && typeof errors.booker === "object") {
        firstError = Object.values(errors.booker)[0] as string;
      } else if (errors.tourists && Array.isArray(errors.tourists)) {
        const firstT = errors.tourists.find(Boolean);
        if (firstT && typeof firstT === "object") {
          firstError = Object.values(firstT)[0] as string;
        }
      }
      toast.error(firstError);
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleSelectBookerFromModal = (booker: { name: string; email: string; phone: string }) => {
    setUseAccountData(false);
    formik.setFieldValue("booker.name", booker.name);
    formik.setFieldValue("booker.email", booker.email);
    formik.setFieldValue("booker.phone", booker.phone || "");
  };

  // ─── Summary Content Renderer (Shared between Desktop Sidebar & Mobile Drawer) ──
  const renderSummaryContent = (isDrawer = false) => {
    return (
      <div className="space-y-4">
        {/* Attraction Preview Card */}
        <div className="flex gap-3.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
            <ImageWithFallback
              src={attractionImage}
              alt={attractionName}
              fill
              className="object-cover"
              fallbackSrc="/images/hero_things_todo_mobile.png"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{attractionName}</h4>
            <div className="mt-1 flex items-center gap-1 text-slate-600 text-[11px]">
              <Icon name="MapPin" className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{locationText}</span>
            </div>
          </div>
        </div>

        {/* Visit Date Pill */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-medium">{t("visitDate")}</span>
            <span className="font-bold text-slate-800">{visitDateText}</span>
          </div>
        </div>

        {/* Tickets Breakdown */}
        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t("ticketsLabel", { count: totalTicketsCount })}
          </p>
          <div className="space-y-1.5">
            {bookedItems.map((item: BookedItem, idx: number) => (
              <div key={idx} className="flex justify-between text-slate-600">
                <span className="truncate max-w-[180px]">
                  {item.qty}x {item.ticket_name}
                </span>
                <span className="font-semibold text-slate-800 shrink-0">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>{t("ticketsSubtotal")}</span>
            <span className="font-semibold text-slate-800">{formatPrice(ticketsSubtotal)}</span>
          </div>

          {formik.values.add_ons && formik.values.add_ons.length > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>{t("addonsLabel", { count: formik.values.add_ons.length })}</span>
              <span className="font-semibold text-slate-800">{formatPrice(addOnsSubtotal)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>{t("serviceFee")}</span>
            <span className="font-bold text-blue-600">{t("free")}</span>
          </div>

          <div className="flex items-baseline justify-between border-t border-slate-200 pt-2.5">
            <span className="text-xs font-bold text-slate-900">{t("totalPayment")}</span>
            <span className="text-lg font-extrabold text-blue-600">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* Action Button on Desktop Sidebar */}
        {!isDrawer && (
          <>
            <button
              type="button"
              onClick={handlePreSubmit}
              disabled={isUpdating}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50">
              {isUpdating ? (
                <>
                  <Icon name="Loader2" className="h-3.5 w-3.5 animate-spin" />
                  <span>{t("processing")}</span>
                </>
              ) : (
                <>
                  <Icon name="CreditCard" className="h-4 w-4" />
                  <span>{t("proceedPayment")}</span>
                </>
              )}
            </button>

            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
              <Icon name="ShieldCheck" className="h-3.5 w-3.5" />
              <span>{t("securePayment")}</span>
            </div>
          </>
        )}
      </div>
    );
  };

  if (!isMounted || (isLoadingBooking && !bookingData && !sessionDraft)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">
            {t("processing")}
          </p>
        </div>
      </div>
    );
  }

  if (isMounted && !isLoadingBooking && !bookingData && !sessionDraft) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4">
          <Icon name="Ticket" className="h-8 w-8" />
        </div>
        <h1 className="text-lg font-bold text-slate-900">{t("orderFailed")}</h1>
        <p className="mt-1 text-xs text-slate-500 text-center max-w-sm">
          Pesanan tiket atraksi tidak ditemukan atau sesi telah berakhir.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/entertainment-attraction`)}
          className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95">
          Kembali ke Daftar Atraksi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── Page Header Bar ───────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4 sm:py-5 max-w-7xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 active:scale-95">
              <Icon name="ChevronLeft" className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                {t("pageTitle")}
              </h1>
              <p className="text-xs text-slate-500">
                {t("pageSubtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 pb-28 lg:pb-12 max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ══════════════════════════════════════════════════════════
              LEFT COLUMN (8 cols)
             ══════════════════════════════════════════════════════════ */}
          <div className="space-y-5 lg:col-span-8">
            {/* IMPORTANT INFO BANNER */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 sm:px-4 py-3">
              <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs leading-relaxed text-amber-800">
                <span className="font-semibold">{t("importantNote")} </span>{t("importantBanner")}
              </p>
            </div>

            {/* ── 1. DATA PEMESAN (BOOKER) ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-4 sm:px-6 py-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 shrink-0">
                    <Icon name="UserCircle" className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-900 truncate">{t("bookerHeader")}</h2>
                    <p className="text-xs text-slate-500 truncate sm:whitespace-normal">
                      {t("bookerSubtitle")}
                    </p>
                  </div>
                </div>

                {/* Mode Toggle Pill + Pilih Pemesan button */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBookerModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95">
                    <Icon name="BookUser" className="h-3.5 w-3.5" />
                    {t("selectBooker")}
                  </button>

                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (accountData.name || accountData.email || accountData.phone) {
                          setUseAccountData(true);
                          formik.setFieldValue("booker.name", accountData.name);
                          formik.setFieldValue("booker.email", accountData.email);
                          formik.setFieldValue("booker.phone", accountData.phone);
                        } else {
                          toast.info(t("profileEmpty"));
                        }
                      }}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all ${
                        useAccountData
                          ? "bg-white text-emerald-700 shadow-2xs"
                          : "text-slate-500 hover:text-slate-700"
                      }`}>
                      <Icon name="UserCheck" className="h-3.5 w-3.5" />
                      {t("fromAccount")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUseAccountData(false);
                        formik.setFieldValue("booker.name", "");
                        formik.setFieldValue("booker.email", "");
                        formik.setFieldValue("booker.phone", "");
                      }}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all ${
                        !useAccountData
                          ? "bg-white text-blue-700 shadow-2xs"
                          : "text-slate-500 hover:text-slate-700"
                      }`}>
                      <Icon name="UserPlus" className="h-3.5 w-3.5" />
                      {t("newBooker")}
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
                {useAccountData && (accountData.name || accountData.email) ? (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2">
                    <Icon name="UserCheck" className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <p className="text-xs text-emerald-700 font-medium">
                      {t("accountNotice")}
                    </p>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="booker.name" className="text-xs font-semibold text-slate-700">
                      {t("bookerName")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="booker.name"
                      name="booker.name"
                      placeholder={t("bookerNamePlaceholder")}
                      className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                      value={formik.values.booker.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.errors.booker?.name && formik.touched.booker?.name && (
                      <p className="mt-1 text-xs text-red-500">{formik.errors.booker.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="booker.email" className="text-xs font-semibold text-slate-700">
                      {t("email")} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Icon name="Mail" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="booker.email"
                        name="booker.email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                        value={formik.values.booker.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.errors.booker?.email && formik.touched.booker?.email && (
                      <p className="mt-1 text-xs text-red-500">{formik.errors.booker.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="booker.phone" className="text-xs font-semibold text-slate-700">
                      {t("phone")} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Icon name="Phone" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="booker.phone"
                        name="booker.phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder={t("phonePlaceholder")}
                        className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                        value={formik.values.booker.phone}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          formik.setFieldValue("booker.phone", digitsOnly);
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.errors.booker?.phone && formik.touched.booker?.phone && (
                      <p className="mt-1 text-xs text-red-500">{formik.errors.booker.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. DATA PENGUNJUNG / TRAVELER ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-4 sm:px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 shrink-0">
                    <Icon name="Users" className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{t("travelerHeader")}</h2>
                    <p className="text-xs text-slate-500">
                      {t("travelersAdded", { count: formik.values.tourists.length })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {formik.values.tourists.map((tourist, index) => (
                  <div key={index} className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-2xs">
                          {index + 1}
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {t("travelerTitle", { index: index + 1 })}
                        </span>
                        {index === 0 && (
                          <span className="rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            {t("primaryTag")}
                          </span>
                        )}
                      </div>

                      {tourist.ticket_name && (
                        <span className="rounded-md bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {tourist.ticket_name}
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 block mb-1.5">
                          {t("salutation")} <span className="text-red-500">*</span>
                        </Label>
                        <div className="inline-flex h-10 items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/80 gap-1">
                          {[
                            { value: "Mr", label: "Mr" },
                            { value: "Mrs", label: "Mrs" },
                            { value: "Miss", label: "Ms" }
                          ].map((opt) => {
                            const currentGender = tourist.gender || "Mr";
                            const isSelected = currentGender === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  formik.setFieldValue(`tourists.${index}.gender`, opt.value);
                                  formik.setFieldTouched(`tourists.${index}.gender`, true, false);
                                }}
                                className={cn(
                                  "h-8 min-w-[70px] sm:min-w-[80px] px-3.5 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 active:scale-95 flex items-center justify-center",
                                  isSelected
                                    ? "bg-blue-600 text-white shadow-sm shadow-blue-300/40"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                                )}>
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                        {formik.errors.tourists?.[index] &&
                          (formik.errors.tourists[index] as any).gender && (
                            <p className="mt-1 text-xs text-red-500">
                              {(formik.errors.tourists[index] as any).gender}
                            </p>
                          )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor={`tourists.${index}.name`} className="text-xs font-semibold text-slate-700">
                            {t("fullName")} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`tourists.${index}.name`}
                            name={`tourists.${index}.name`}
                            placeholder={t("fullNamePlaceholder")}
                            className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                            value={tourist.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          <p className="mt-1 text-[11px] text-slate-400">{t("fullNameHint")}</p>
                          {formik.errors.tourists?.[index] &&
                            (formik.errors.tourists[index] as any).name && (
                              <p className="mt-1 text-xs text-red-500">
                                {(formik.errors.tourists[index] as any).name}
                              </p>
                            )}
                        </div>

                        <div>
                          <Label htmlFor={`tourists.${index}.phoneNumber`} className="text-xs font-semibold text-slate-700">
                            {t("phone")} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`tourists.${index}.phoneNumber`}
                            name={`tourists.${index}.phoneNumber`}
                            type="tel"
                            inputMode="numeric"
                            placeholder={t("phonePlaceholder")}
                            className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                            value={tourist.phoneNumber}
                            onChange={(e) => {
                              const digitsOnly = e.target.value.replace(/\D/g, "");
                              formik.setFieldValue(`tourists.${index}.phoneNumber`, digitsOnly);
                            }}
                            onBlur={formik.handleBlur}
                          />
                          <p className="mt-1 text-[11px] text-slate-400">{t("phoneHint")}</p>
                          {formik.errors.tourists?.[index] &&
                            (formik.errors.tourists[index] as any).phoneNumber && (
                              <p className="mt-1 text-xs text-red-500">
                                {(formik.errors.tourists[index] as any).phoneNumber}
                              </p>
                            )}
                        </div>

                        <div>
                          <Label htmlFor={`tourists.${index}.passportNumber`} className="text-xs font-semibold text-slate-700">
                            {t("passportNumber")} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`tourists.${index}.passportNumber`}
                            name={`tourists.${index}.passportNumber`}
                            placeholder={t("passportPlaceholder")}
                            className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                            value={tourist.passportNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          {formik.errors.tourists?.[index] &&
                            (formik.errors.tourists[index] as any).passportNumber && (
                              <p className="mt-1 text-xs text-red-500">
                                {(formik.errors.tourists[index] as any).passportNumber}
                              </p>
                            )}
                        </div>

                        <div>
                          <Label htmlFor={`tourists.${index}.nationality`} className="text-xs font-semibold text-slate-700">
                            {t("nationality")} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`tourists.${index}.nationality`}
                            name={`tourists.${index}.nationality`}
                            placeholder="Indonesia"
                            className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                            value={tourist.nationality}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          {formik.errors.tourists?.[index] &&
                            (formik.errors.tourists[index] as any).nationality && (
                              <p className="mt-1 text-xs text-red-500">
                                {(formik.errors.tourists[index] as any).nationality}
                              </p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                          <Label htmlFor={`tourists.${index}.birthDate`} className="text-xs font-semibold text-slate-700">
                            {t("birthDate")}
                          </Label>
                          <div className="mt-1.5">
                            <DatePicker
                              date={parseDateDDMMYYYY(tourist.birthDate)}
                              setDate={(selectedDate) => {
                                if (selectedDate) {
                                  const day = String(selectedDate.getDate()).padStart(2, "0");
                                  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
                                  const year = selectedDate.getFullYear();
                                  formik.setFieldValue(`tourists.${index}.birthDate`, `${day}-${month}-${year}`);
                                } else {
                                  formik.setFieldValue(`tourists.${index}.birthDate`, "");
                                }
                                formik.setFieldTouched(`tourists.${index}.birthDate`, true, true);
                              }}
                              placeholder={t("selectBirthDate")}
                              captionLayout="dropdown"
                              startMonth={new Date(1920, 0)}
                              endMonth={new Date()}
                              defaultMonth={parseDateDDMMYYYY(tourist.birthDate) || new Date(2000, 0)}
                              disabled={(d) => d > new Date() || d < new Date(1910, 0, 1)}
                              className="h-10 rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-100"
                            />
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400">{t("birthDateHint")}</p>
                          {formik.errors.tourists?.[index] &&
                            (formik.errors.tourists[index] as any).birthDate && (
                              <p className="mt-1 text-xs text-red-500">
                                {(formik.errors.tourists[index] as any).birthDate}
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 3. ADD-ONS ── */}
            {availableAddOns.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 sm:px-6 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 shrink-0">
                    <Icon name="Sparkles" className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{t("addonsHeader")}</h2>
                    <p className="text-xs text-slate-500">{t("addonsSubtitle")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 p-4 sm:p-6 sm:grid-cols-2">
                  {availableAddOns.map((addOn: any) => {
                    const isSelected = formik.values.add_ons?.includes(addOn.id);
                    return (
                      <div
                        key={addOn.id}
                        onClick={() => {
                          const current = formik.values.add_ons || [];
                          if (current.includes(addOn.id)) {
                            formik.setFieldValue(
                              "add_ons",
                              current.filter((id) => id !== addOn.id)
                            );
                          } else {
                            formik.setFieldValue("add_ons", [...current, addOn.id]);
                          }
                        }}
                        className={`relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? "border-blue-400 bg-blue-50 shadow-xs shadow-blue-100"
                            : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/40"
                        }`}>
                        {isSelected && (
                          <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                            <Icon name="Check" className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div className="flex items-center gap-2.5">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => {}}
                            className="pointer-events-none"
                          />
                          <span className="text-xs font-bold text-slate-800">{addOn.name}</span>
                        </div>
                        {addOn.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2">{addOn.description}</p>
                        )}
                        <p className="text-xs font-semibold text-blue-600">{formatPrice(Number(addOn.price) || 0)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT COLUMN (4 cols) - Sticky Summary Card (Desktop)
             ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4">
            <div ref={summaryCardRef} className="sticky top-24 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Icon name="Receipt" className="h-4 w-4 text-blue-600" />
                  {t("summaryHeader")}
                </h3>
                <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <Icon name="CheckCircle2" className="h-3 w-3" />
                  {t("instantShort")}
                </span>
              </div>
              <div className="p-5">{renderSummaryContent(false)}</div>
            </div>
          </div>
        </div>
      </div>

      {!isSummaryCardVisible && (
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 lg:hidden shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div
            onClick={() => setIsSummaryDrawerOpen(true)}
            className="cursor-pointer min-w-0 flex-1">
            <p className="text-[11px] text-slate-500 font-medium">{t("totalPayment")}</p>
            <div className="flex items-center gap-1 text-blue-600 font-bold text-base">
              <span>{formatPrice(totalPrice)}</span>
              <Icon name="ChevronUp" className="h-4 w-4 text-slate-400" />
            </div>
          </div>
          <button
            type="button"
            onClick={handlePreSubmit}
            disabled={isUpdating}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 shrink-0">
            {isUpdating ? (
              <>
                <Icon name="Loader2" className="h-3.5 w-3.5 animate-spin" />
                <span>{t("processing")}</span>
              </>
            ) : (
              <>
                <Icon name="CreditCard" className="h-4 w-4" />
                <span>{t("proceedPayment")}</span>
              </>
            )}
          </button>
        </div>
      </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MOBILE BOTTOM DRAWER (Summary Detail)
         ══════════════════════════════════════════════════════════ */}
      <Drawer open={isSummaryDrawerOpen} onOpenChange={setIsSummaryDrawerOpen}>
        <DrawerContent className="max-h-[85vh] px-4 pb-8">
          <DrawerHeader className="text-left px-0 pt-4 pb-2">
            <DrawerTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Icon name="Receipt" className="h-4 w-4 text-blue-600" />
                {t("summaryHeader")}
              </span>
              <DrawerClose asChild>
                <button className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <Icon name="X" className="h-4 w-4" />
                </button>
              </DrawerClose>
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto mt-2 pr-1">
            {renderSummaryContent(true)}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Booker Selection Modal */}
      <BookerListModal
        open={isBookerModalOpen}
        onClose={() => setIsBookerModalOpen(false)}
        onSelect={handleSelectBookerFromModal}
      />

      {/* Confirmation Modal */}
      <ConfirmEntertainmentBookingModal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={formik.submitForm}
        isSubmitting={isUpdating}
        values={formik.values}
        totalPrice={totalPrice}
        formatPrice={formatPrice}
        attractionName={attractionName}
        visitDate={visitDateText}
      />
    </div>
  );
};

export const BookingEntertainmentPage = OrderEntertainmentPage;
