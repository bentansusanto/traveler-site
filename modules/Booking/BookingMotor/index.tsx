"use client";

import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFindAddOnsByCategoryQuery } from "@/store/services/add-ons.service";
import {
  useCreateBookMotorMutation,
  useFindBookMotorByIdQuery,
  useUpdateBookMotorMutation
} from "@/store/services/book-motor.service";
import { useGetUserQuery } from "@/store/services/customer.service";
import { useFindMotorByIdQuery } from "@/store/services/motor.service";
import { setCurrency } from "@/store/slices/currencySlice";
import { differenceInDays } from "date-fns";
import { useFormik } from "formik";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { BookerListModal } from "../BookingTour/BookerListModal";
import { ConfirmMotorBookingModal } from "./ConfirmMotorBookingModal";
import { getOrderRentMotorSchema, orderRentMotorSchema, OrderRentMotorValues } from "./schema";

export const OrderRentMotorPage = () => {
  const locale = useLocale();
  const t = useTranslations("OrderRentMotor");
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const motorIdParam = searchParams.get("motor_id");
  const bookMotorIdParam = searchParams.get("book_motor_id");
  const durationParam = parseInt(searchParams.get("duration") || "2", 10);
  const initialDuration = isNaN(durationParam) || durationParam < 1 ? 2 : durationParam;

  // 1. Fetch Existing BookMotor if book_motor_id is in query
  const { data: bookMotorResponse, isLoading: isLoadingBookMotor } = useFindBookMotorByIdQuery(
    bookMotorIdParam!,
    { skip: !bookMotorIdParam }
  );
  const bookMotorData = bookMotorResponse?.data || bookMotorResponse;

  // Resolve active motor ID
  const effectiveMotorId =
    motorIdParam ||
    bookMotorData?.book_motor_items?.[0]?.motor_id ||
    bookMotorData?.book_motor_items?.[0]?.motor?.id;

  // 2. Fetch Motor details
  const { data: motorResponse, isLoading: isLoadingMotor } = useFindMotorByIdQuery(
    effectiveMotorId as string,
    { skip: !effectiveMotorId }
  );
  const motor = motorResponse?.data;
  const translation =
    motor?.translations?.find((t: any) => t.language_code === locale) ||
    motor?.translations?.find((t: any) => t.language_code === "en") ||
    motor?.translations?.[0];

  const motorName = translation?.name_motor || "Motorcycle Unit";

  // 3. Add-ons
  const { data: motorAddOnsResponse } = useFindAddOnsByCategoryQuery("motor");
  const { data: generalAddOnsResponse } = useFindAddOnsByCategoryQuery("general");

  const availableAddOns = useMemo(() => {
    const motorAddOnList =
      motorAddOnsResponse?.datas ||
      (Array.isArray(motorAddOnsResponse?.data) ? motorAddOnsResponse.data : []);
    const generalAddOnList =
      generalAddOnsResponse?.datas ||
      (Array.isArray(generalAddOnsResponse?.data) ? generalAddOnsResponse.data : []);

    return [...motorAddOnList, ...generalAddOnList];
  }, [motorAddOnsResponse, generalAddOnsResponse]);

  // Mutations
  const [createBookMotor, { isLoading: isCreating }] = useCreateBookMotorMutation();
  const [updateBookMotor, { isLoading: isUpdating }] = useUpdateBookMotorMutation();
  const isSubmitting = isCreating || isUpdating;

  // Currency Handling
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16000 }
  );

  const activeCurrencyCode = locale === "id" ? "IDR" : locale === "tr" ? "TRY" : "USD";

  useEffect(() => {
    if (currentCurrency.code !== activeCurrencyCode) {
      dispatch(setCurrency(activeCurrencyCode));
    }
  }, [locale, activeCurrencyCode, currentCurrency.code, dispatch]);

  const formatPrice = (rawPrice: number) => {
    const effectiveCode = locale === "id" ? "IDR" : locale === "tr" ? "TRY" : "USD";
    const rate =
      effectiveCode === "USD"
        ? 1
        : currentCurrency.rates?.[effectiveCode] ||
          (effectiveCode === "IDR" ? currentCurrency.idrToUsdRate || 16761 : 47);

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

  // Logged-in Customer Data
  const { data: currentUserData } = useGetUserQuery();
  const accountData = useMemo(() => {
    const user = currentUserData?.data || currentUserData;
    return {
      name: user?.name || user?.full_name || "",
      email: user?.email || "",
      phone: user?.profile?.phone_number || user?.phone_number || ""
    };
  }, [currentUserData]);

  // UI States
  const [useAccountData, setUseAccountData] = useState(true);
  const [bookerModalOpen, setBookerModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSummaryDrawerOpen, setIsSummaryDrawerOpen] = useState(false);

  // Form Initial Dates
  const initialStartDate = useMemo(() => {
    if (bookMotorData?.start_date) return new Date(bookMotorData.start_date);
    return new Date();
  }, [bookMotorData]);

  const initialEndDate = useMemo(() => {
    if (bookMotorData?.end_date) return new Date(bookMotorData.end_date);
    return new Date(initialStartDate.getTime() + initialDuration * 24 * 60 * 60 * 1000);
  }, [bookMotorData, initialStartDate, initialDuration]);

  // Formik Configuration
  const validationSchema = useMemo(() => getOrderRentMotorSchema(t), [t]);

  const formik = useFormik<OrderRentMotorValues>({
    enableReinitialize: true,
    initialValues: {
      booker: {
        name: accountData.name || "",
        email: accountData.email || "",
        phone: accountData.phone || ""
      },
      tourists: [
        {
          gender: "Mr",
          name: accountData.name || "",
          nationality: "Indonesia",
          passport_number: "",
          phone_number: accountData.phone || ""
        }
      ],
      start_date: initialStartDate,
      end_date: initialEndDate,
      add_ons: []
    },
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
      if (!effectiveMotorId) return;

      const formatDateDDMMYYYY = (date: Date) => {
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();
        return `${d}-${m}-${y}`;
      };

      try {
        const payload = {
          items: [
            {
              motor_id: effectiveMotorId,
              qty: 1
            }
          ],
          tourists: values.tourists.map((t) => ({
            name: t.name,
            gender: t.gender,
            nationality: t.nationality,
            passport_number: t.passport_number,
            phone_number: t.phone_number
          })),
          start_date: formatDateDDMMYYYY(values.start_date),
          end_date: formatDateDDMMYYYY(values.end_date),
          add_ons: values.add_ons
        };

        let bookingId = bookMotorIdParam;

        if (bookingId) {
          // Update existing booking with full customer & driver data
          const updateRes = await updateBookMotor({ id: bookingId, data: payload }).unwrap();
          bookingId = updateRes.data?.id || bookingId;
        } else {
          // Create new booking
          const createRes = await createBookMotor(payload).unwrap();
          bookingId = createRes.data?.id;
        }

        toast.success(t("orderSuccess"));

        setIsConfirmModalOpen(false);

        if (bookingId) {
          router.push(`/${locale}/payments?order_id=${bookingId}&type=motor`);
        } else {
          router.push(`/${locale}/my-bookings`);
        }
      } catch (error: any) {
        console.warn("Order rent motor failed:", error);
        toast.error(error?.data?.message || t("orderFailed"));
      }
    }
  });

  // Calculate Rental Duration
  const rentalDays = useMemo(() => {
    if (!formik.values.start_date || !formik.values.end_date) return 0;
    const diff = differenceInDays(formik.values.end_date, formik.values.start_date);
    return Math.max(diff, 1);
  }, [formik.values.start_date, formik.values.end_date]);

  const durationBreakdown = useMemo(() => {
    if (rentalDays < 7) {
      return t("daysCount", { count: rentalDays });
    }
    const weeks = Math.floor(rentalDays / 7);
    const remainingDays = rentalDays % 7;

    if (remainingDays === 0) {
      return t("weeksCount", { count: weeks });
    }
    return t("weeksAndDaysCount", { weeks, days: remainingDays });
  }, [rentalDays, t]);

  // Price Calculations
  const prices = motor?.motor_prices || motor?.prices || [];
  const dailyPrice = prices.find((p: any) => p.price_type === "daily")?.price || 0;
  const weeklyPrice = prices.find((p: any) => p.price_type === "weekly")?.price || 0;

  const isWeeklyApplicable = rentalDays >= 7 && Number(weeklyPrice) > 0;

  const motorBasePrice = useMemo(() => {
    if (!motor) return 0;
    const weeks = Math.floor(rentalDays / 7);
    const remainingDays = rentalDays % 7;

    return isWeeklyApplicable
      ? weeks * Number(weeklyPrice) + remainingDays * Number(dailyPrice)
      : rentalDays * Number(dailyPrice);
  }, [motor, rentalDays, isWeeklyApplicable, weeklyPrice, dailyPrice]);

  const addOnsTotalPrice = useMemo(() => {
    return (formik.values.add_ons || []).reduce((acc, id) => {
      const addOn = availableAddOns.find((a) => a.id === id);
      return acc + (Number(addOn?.price) || 0);
    }, 0);
  }, [formik.values.add_ons, availableAddOns]);

  const totalPrice = motorBasePrice + addOnsTotalPrice;

  // Add / Remove Renter Helper
  const addRenter = () => {
    formik.setFieldValue("tourists", [
      ...formik.values.tourists,
      {
        gender: "Mr",
        name: "",
        nationality: "Indonesia",
        passport_number: "",
        phone_number: ""
      }
    ]);
  };

  const removeRenter = (index: number) => {
    if (formik.values.tourists.length <= 1) return;
    formik.setFieldValue(
      "tourists",
      formik.values.tourists.filter((_, idx) => idx !== index)
    );
  };

  const handlePreSubmit = () => {
    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length > 0) {
        formik.handleSubmit();
        const firstErrorKey = Object.keys(errors)[0];
        toast.error(t("formIncomplete", { field: firstErrorKey }));
      } else {
        setIsConfirmModalOpen(true);
      }
    });
  };

  if (isLoadingMotor || isLoadingBookMotor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">{t("loadingDetails")}</p>
        </div>
      </div>
    );
  }

  if (!motor && !bookMotorData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4">
          <Icon name="Bike" className="h-8 w-8" />
        </div>
        <h1 className="text-lg font-bold text-slate-900">{t("orderNotFound")}</h1>
        <p className="mt-1 text-xs text-slate-500 text-center max-w-sm">
          {t("orderNotFoundDesc")}
        </p>
        <Button onClick={() => router.push(`/${locale}/motor-bike`)} className="mt-5 rounded-xl text-xs font-semibold">
          {t("backToCatalog")}
        </Button>
      </div>
    );
  }

  // ─── Summary Content Renderer (Shared between Desktop Sidebar & Mobile Drawer) ──
  const renderSummaryContent = (isDrawer = false) => {
    return (
      <div className="space-y-4">
        {/* Motor Preview Card */}
        <div className="flex gap-3.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
            <img
              src={motor?.thumbnail || "/images/placeholder.jpg"}
              alt={motorName}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{motorName}</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {motor?.merek?.name_merek || "Motor"} • {motor?.engine_cc ? `${motor.engine_cc}cc` : "150cc"}
            </p>
            <div className="mt-1 flex items-center gap-1 text-slate-600 text-[11px]">
              <Icon name="MapPin" className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{motor?.state?.name || "Turkey"}</span>
            </div>
          </div>
        </div>

        {/* Rental Period Pill */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-medium">{t("rentalPeriod")}</span>
            <span className="font-bold text-slate-800">
              {durationBreakdown}
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-600 pt-1 border-t border-slate-100">
            <span>
              {formik.values.start_date.toLocaleDateString(locale === "id" ? "id-ID" : locale === "tr" ? "tr-TR" : "en-US", {
                day: "numeric",
                month: "short"
              })}
            </span>
            <span className="text-slate-300">→</span>
            <span>
              {formik.values.end_date.toLocaleDateString(locale === "id" ? "id-ID" : locale === "tr" ? "tr-TR" : "en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
            </span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>{t("rentalRate", { days: rentalDays })}</span>
            <span className="font-semibold text-slate-800">{formatPrice(motorBasePrice)}</span>
          </div>

          {isWeeklyApplicable && (
            <div className="flex justify-between text-[11px] text-emerald-600 font-medium">
              <span>{t("weeklyDiscountApplied")}</span>
              <span>✓</span>
            </div>
          )}

          {formik.values.add_ons && formik.values.add_ons.length > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>{t("addonsCount", { count: formik.values.add_ons.length })}</span>
              <span className="font-semibold text-slate-800">{formatPrice(addOnsTotalPrice)}</span>
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
              disabled={isSubmitting}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50">
              {isSubmitting ? (
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
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3.5">
              <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="text-xs leading-relaxed text-amber-800">
                <span className="font-semibold">{t("rentalRequirements")} </span>
                {t("rentalRequirementsDesc")}
              </div>
            </div>

            {/* ── 1. DATA PEMESAN (BOOKER) ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-4 sm:px-6 py-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 shrink-0">
                    <Icon name="UserCircle" className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-900">{t("bookerHeader")}</h2>
                    <p className="text-xs text-slate-500">
                      {t("bookerSubtitle")}
                    </p>
                  </div>
                </div>

                {/* Mode Toggle Pill + Pilih Pemesan button */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBookerModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95">
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
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
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
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
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
                      className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs focus:border-blue-400 focus:ring-blue-100"
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
                        className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-xs focus:border-blue-400 focus:ring-blue-100"
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
                        className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-xs focus:border-blue-400 focus:ring-blue-100"
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

            {/* ── 2. DATA PENGENDARA / PENYEWA (RENTER) ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-4 sm:px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 shrink-0">
                    <Icon name="Users" className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{t("renterHeader")}</h2>
                    <p className="text-xs text-slate-500">
                      {t("rentersCount", { count: formik.values.tourists.length })}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addRenter}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100 active:scale-95 w-full sm:w-auto shrink-0">
                  <Icon name="Plus" className="h-3 w-3" />
                  {t("addRenter")}
                </button>
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
                          {t("renterTitle", { index: index + 1 })}
                        </span>
                        {index === 0 && (
                          <span className="rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            {t("primary")}
                          </span>
                        )}
                      </div>

                      {formik.values.tourists.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRenter(index)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors">
                          <Icon name="Trash2" className="h-3.5 w-3.5" />
                          <span>{t("remove")}</span>
                        </button>
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
                            {t("renterName")} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`tourists.${index}.name`}
                            name={`tourists.${index}.name`}
                            placeholder={t("renterNamePlaceholder")}
                            className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs focus:border-blue-400 focus:ring-blue-100"
                            value={tourist.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          {formik.errors.tourists?.[index] &&
                            (formik.errors.tourists[index] as any).name && (
                              <p className="mt-1 text-xs text-red-500">
                                {(formik.errors.tourists[index] as any).name}
                              </p>
                            )}
                        </div>

                        <div>
                          <Label htmlFor={`tourists.${index}.phone_number`} className="text-xs font-semibold text-slate-700">
                            {t("renterPhone")} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`tourists.${index}.phone_number`}
                            name={`tourists.${index}.phone_number`}
                            type="tel"
                            inputMode="numeric"
                            placeholder={t("renterPhonePlaceholder")}
                            className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs focus:border-blue-400 focus:ring-blue-100"
                            value={tourist.phone_number}
                            onChange={(e) => {
                              const digitsOnly = e.target.value.replace(/\D/g, "");
                              formik.setFieldValue(`tourists.${index}.phone_number`, digitsOnly);
                            }}
                            onBlur={formik.handleBlur}
                          />
                          {formik.errors.tourists?.[index] &&
                            (formik.errors.tourists[index] as any).phone_number && (
                              <p className="mt-1 text-xs text-red-500">
                                {(formik.errors.tourists[index] as any).phone_number}
                              </p>
                            )}
                        </div>

                        <div>
                          <Label htmlFor={`tourists.${index}.passport_number`} className="text-xs font-semibold text-slate-700">
                            {t("idCardOrPassport")} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`tourists.${index}.passport_number`}
                            name={`tourists.${index}.passport_number`}
                            placeholder={t("idCardOrPassportPlaceholder")}
                            className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs focus:border-blue-400 focus:ring-blue-100"
                            value={tourist.passport_number}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          {formik.errors.tourists?.[index] &&
                            (formik.errors.tourists[index] as any).passport_number && (
                              <p className="mt-1 text-xs text-red-500">
                                {(formik.errors.tourists[index] as any).passport_number}
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
                            placeholder={t("nationalityPlaceholder")}
                            className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-xs focus:border-blue-400 focus:ring-blue-100"
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 3. DURASI & TANGGAL RENTAL ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 sm:px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 shrink-0">
                  <Icon name="Calendar" className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{t("periodHeader")}</h2>
                  <p className="text-xs text-slate-500">{t("periodSubtitle")}</p>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">{t("startDate")}</Label>
                    <DatePicker
                      date={formik.values.start_date}
                      setDate={(date) => {
                        if (date) {
                          formik.setFieldValue("start_date", date);
                          if (date >= formik.values.end_date) {
                            formik.setFieldValue("end_date", new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000));
                          }
                        }
                      }}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">{t("endDate")}</Label>
                    <DatePicker
                      date={formik.values.end_date}
                      setDate={(date) => date && formik.setFieldValue("end_date", date)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between rounded-xl bg-blue-50/70 border border-blue-100 px-4 py-3 text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <Icon name="Clock" className="h-4 w-4 text-blue-600" />
                    <span className="text-slate-700 font-medium">
                      {t("totalDuration")} <strong className="text-blue-700 font-bold">{durationBreakdown}</strong>
                    </span>
                  </div>
                  {isWeeklyApplicable && (
                    <span className="rounded-md bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {t("weeklyPackageActive")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── 4. LAYANAN TAMBAHAN (ADD-ONS) ── */}
            {availableAddOns.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 sm:px-6 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 shrink-0">
                    <Icon name="Sparkles" className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{t("addonsHeader")}</h2>
                    <p className="text-xs text-slate-500">
                      {t("addonsSubtitle")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 p-4 sm:p-6 sm:grid-cols-2">
                  {availableAddOns.map((addOn) => {
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
                            : "border-slate-200 bg-slate-50/60 hover:border-blue-200 hover:bg-blue-50/40"
                        }`}>
                        {isSelected && (
                          <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                            <Icon name="Check" className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div className="flex items-center gap-2.5">
                          <Checkbox
                            id={addOn.id}
                            checked={isSelected}
                            onCheckedChange={() => {}}
                            className="pointer-events-none"
                          />
                          <p className="text-xs font-semibold text-slate-800">{addOn.name}</p>
                        </div>
                        {addOn.description && (
                          <p className="ml-6 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                            {addOn.description}
                          </p>
                        )}
                        <div className="ml-6">
                          <span className={`text-xs font-bold ${isSelected ? "text-blue-600" : "text-slate-700"}`}>
                            {formatPrice(addOn.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT COLUMN — BOOKING SUMMARY (Desktop lg+)
             ══════════════════════════════════════════════════════════ */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
                    <Icon name="Receipt" className="h-4 w-4 text-slate-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{t("summaryHeader")}</h3>
                </div>

                <div className="p-5">{renderSummaryContent(false)}</div>
              </div>

              {/* Support Card */}
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <Icon name="Headphones" className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{t("needHelp")}</p>
                    <p className="text-[11px] text-slate-500">{t("support247")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Fixed Mobile Bottom Action Bar (< lg) ──────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          {/* Price & Summary Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsSummaryDrawerOpen(true)}
            className="flex flex-col text-left transition-opacity hover:opacity-80 active:scale-95">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="text-[10px] font-medium leading-none">{t("totalLabel")}</span>
              <span className="flex items-center gap-0.5 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                {t("details")}
                <Icon name="ChevronUp" className="h-3 w-3" />
              </span>
            </div>
            <span className="mt-0.5 text-base font-bold leading-tight text-blue-600">
              {formatPrice(totalPrice)}
            </span>
          </button>

          {/* Proceed Button */}
          <button
            type="button"
            onClick={handlePreSubmit}
            disabled={isSubmitting}
            className="flex h-10 flex-1 max-w-[200px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50">
            {isSubmitting ? (
              <>
                <Icon name="Loader2" className="h-3.5 w-3.5 animate-spin" />
                <span className="truncate">{t("processing")}</span>
              </>
            ) : (
              <>
                <Icon name="CreditCard" className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t("payNow")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Mobile Summary Drawer (< lg) ───────────────────────────── */}
      <Drawer open={isSummaryDrawerOpen} onOpenChange={setIsSummaryDrawerOpen}>
        <DrawerContent className="max-h-[85vh] p-0 z-50">
          <DrawerHeader className="border-b border-slate-100 px-5 py-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Receipt" className="h-4 w-4 text-slate-600" />
                <DrawerTitle className="text-sm font-bold text-slate-900">
                  {t("summaryHeader")}
                </DrawerTitle>
              </div>
              <DrawerClose className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
                <Icon name="X" className="h-4 w-4" />
              </DrawerClose>
            </div>
            <DrawerDescription className="sr-only">
              {t("drawerDescription")}
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto p-5 pb-8">
            {renderSummaryContent(true)}

            <button
              type="button"
              onClick={() => {
                setIsSummaryDrawerOpen(false);
                handlePreSubmit();
              }}
              disabled={isSubmitting}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 disabled:opacity-50">
              <Icon name="CreditCard" className="h-4 w-4" />
              <span>{t("proceedPayment")}</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* ─── Booker Selection Modal ─────────────────────────────────── */}
      <BookerListModal
        open={bookerModalOpen}
        onClose={() => setBookerModalOpen(false)}
        onSelect={(selected) => {
          setUseAccountData(false);
          formik.setFieldValue("booker.name", selected.name);
          formik.setFieldValue("booker.email", selected.email);
          formik.setFieldValue("booker.phone", selected.phone);
        }}
      />

      {/* ─── Confirmation Alert Modal ───────────────────────────────── */}
      <ConfirmMotorBookingModal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => formik.handleSubmit()}
        isSubmitting={isSubmitting}
        values={formik.values}
        totalPrice={totalPrice}
        formatPrice={formatPrice}
        motorName={motorName}
        durationText={`${durationBreakdown} (${formik.values.start_date.toLocaleDateString(
          locale === "id" ? "id-ID" : locale === "tr" ? "tr-TR" : "en-US",
          { day: "numeric", month: "short" }
        )} - ${formik.values.end_date.toLocaleDateString(locale === "id" ? "id-ID" : locale === "tr" ? "tr-TR" : "en-US", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })})`}
      />
    </div>
  );
};

export const BookingMotorPage = OrderRentMotorPage;
