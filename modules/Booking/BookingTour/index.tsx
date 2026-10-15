"use client";

import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useCreateTourMutation, useFindTourByIdQuery, useUpdateTourMutation } from "@/store/services/book-tour.service";
import { useGetItineraryByIdQuery } from "@/store/services/itinerary.service";
import { useFindDestinationIdQuery } from "@/store/services/destination.service";
import { useFindAddOnsByCategoryQuery } from "@/store/services/add-ons.service";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { useCreateTouristMutation, useFindAllTouristQuery } from "@/store/services/tourist.service";
import { useGetUserQuery } from "@/store/services/customer.service";
import { useFormik } from "formik";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrency } from "@/store/slices/currencySlice";
import { toast } from "sonner";
import { getOrderTourSchema, orderTourSchema, OrderTourValues } from "./schema";
import { BookerListModal } from "./BookerListModal";
import { ConfirmBookingModal } from "./ConfirmBookingModal";

interface OrderTourPageProps {
  itineraryId?: string;
  bookTourId?: string;
}

const SummaryTourItem = ({
  item,
  locale,
  index,
  formatPrice
}: {
  item: any;
  locale: string;
  index: number;
  formatPrice: (price: number) => string;
}) => {
  const destinationId = item.destination_id || item.destination?.id;
  const { data: destinationData } = useFindDestinationIdQuery(destinationId, { skip: !destinationId });

  const destinationName = useMemo(() => {
    if (item.destination?.name) return item.destination.name;
    if (!destinationData?.data?.translations) return "Destinasi Tour";
    const translation = destinationData.data.translations.find(
      (t: any) => t.locale === locale || t.language_code === locale
    );
    return translation?.name || destinationData.data.translations[0]?.name || "Destinasi Tour";
  }, [item, destinationData, locale]);

  const price = Number(item.destination?.price || destinationData?.data?.price || 0);

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center pt-1 shrink-0">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-sm shadow-blue-200">
          {index + 1}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{destinationName}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {item.visit_date
            ? new Date(item.visit_date).toLocaleDateString(
                locale === "id" ? "id-ID" : locale === "tr" ? "tr-TR" : "en-US",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                }
              )
            : "-"}
        </p>
      </div>
      {price > 0 && (
        <p className="shrink-0 text-xs font-semibold text-blue-600">
          {formatPrice(price)}
        </p>
      )}
    </div>
  );
};

export const OrderTourPage = ({ itineraryId: rawItineraryId, bookTourId: rawBookTourId }: OrderTourPageProps) => {
  const locale = useLocale();
  const t = useTranslations("OrderTour");
  const tItinerary = useTranslations("Itinerary");
  const router = useRouter();
  const [createTour, { isLoading: isCreatingTour }] = useCreateTourMutation();
  const [updateTour, { isLoading: isUpdatingTour }] = useUpdateTourMutation();

  const targetItineraryId = rawItineraryId || rawBookTourId;

  const dispatch = useDispatch();

  // Currency configuration from Redux
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16000 }
  );

  // Sync currency automatically with active locale
  const activeCurrencyCode = locale === "id" ? "IDR" : locale === "tr" ? "TRY" : "USD";

  useEffect(() => {
    if (currentCurrency.code !== activeCurrencyCode) {
      dispatch(setCurrency(activeCurrencyCode));
    }
  }, [locale, activeCurrencyCode, currentCurrency.code, dispatch]);

  const formatPrice = (rawPrice: number) => {
    // Determine effective currency based on active locale
    const effectiveCode = locale === "id" ? "IDR" : locale === "tr" ? "TRY" : "USD";
    const rate =
      effectiveCode === "USD"
        ? 1
        : currentCurrency.rates?.[effectiveCode] ||
          (effectiveCode === "IDR" ? (currentCurrency.idrToUsdRate || 16761) : 47);

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

  // 1. Fetch Itinerary Detail by ID
  const { data: itineraryResponse, isLoading: isLoadingItinerary } = useGetItineraryByIdQuery(
    targetItineraryId!,
    { skip: !targetItineraryId }
  );

  // 2. Fetch BookTour Detail if rawBookTourId is provided
  const { data: bookTourResponse, isLoading: isLoadingBookTour } = useFindTourByIdQuery(
    rawBookTourId!,
    { skip: !rawBookTourId }
  );

  const itineraryData = itineraryResponse?.data || itineraryResponse;
  const bookTourData = bookTourResponse?.data || bookTourResponse;

  const tourItems = useMemo(() => {
    if (itineraryData?.itinerary_items && itineraryData.itinerary_items.length > 0) {
      return itineraryData.itinerary_items;
    }
    if (bookTourData?.book_tour_items && bookTourData.book_tour_items.length > 0) {
      return bookTourData.book_tour_items;
    }
    if (bookTourData?.itinerary?.itinerary_items && bookTourData.itinerary.itinerary_items.length > 0) {
      return bookTourData.itinerary.itinerary_items;
    }
    return [];
  }, [itineraryData, bookTourData]);

  const itineraryName = useMemo(() => {
    const itinerary = itineraryData || bookTourData?.itinerary;
    const items = tourItems;
    const firstItem = items?.[0];
    const destinationLocation = firstItem?.destination?.location;
    const loc =
      itinerary?.location ||
      destinationLocation ||
      (itinerary?.state?.name
        ? `${itinerary.state.name}, ${itinerary.country?.name || ""}`
        : itinerary?.country?.name) ||
      bookTourData?.country?.name ||
      "Turkey";

    return (
      itinerary?.name ||
      itinerary?.title ||
      tItinerary("tripTo", { location: loc })
    );
  }, [itineraryData, bookTourData, tourItems, tItinerary]);

  const activeId = useMemo(() => {
    return itineraryData?.id || bookTourData?.id || targetItineraryId;
  }, [itineraryData, bookTourData, targetItineraryId]);

  const isLoadingBookings = isLoadingItinerary || isLoadingBookTour;

  // Current logged-in customer data (for pre-filling booker form)
  const { data: currentUserData } = useGetUserQuery();

  // Derived account data for booker pre-fill
  const accountData = useMemo(() => {
    const user = currentUserData?.data || currentUserData;
    return {
      name: user?.name || user?.full_name || "",
      email: user?.email || "",
      phone: user?.profile?.phone_number || user?.phone_number || ""
    };
  }, [currentUserData]);

  // Toggle: true = use account data (read-only display), false = manual input
  const [useAccountData, setUseAccountData] = useState(true);
  // Controls the "Pilih Pemesan" modal
  const [bookerModalOpen, setBookerModalOpen] = useState(false);
  // Controls the Confirmation Alert modal before payment
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // Controls the Mobile/Tablet Summary Drawer
  const [isSummaryDrawerOpen, setIsSummaryDrawerOpen] = useState(false);

  // Fetch existing tourists for pre-population
  const { data: touristsData } = useFindAllTouristQuery();
  const { data: tourAddOnsResponse } = useFindAddOnsByCategoryQuery("tour");
  const { data: generalAddOnsResponse } = useFindAddOnsByCategoryQuery("general");

  const availableAddOns = useMemo(() => {
    const tourAddOnList = tourAddOnsResponse?.datas || (Array.isArray(tourAddOnsResponse?.data) ? tourAddOnsResponse.data : []);
    const generalAddOnList = generalAddOnsResponse?.datas || (Array.isArray(generalAddOnsResponse?.data) ? generalAddOnsResponse.data : []);
    return [...tourAddOnList, ...generalAddOnList];
  }, [tourAddOnsResponse, generalAddOnsResponse]);

  const hasPopulated = useRef(false);

  const initialTourists = useMemo(() => {
    const data = touristsData?.data || touristsData?.datas;
    const touristList = Array.isArray(data?.tourists)
      ? data.tourists
      : Array.isArray(data)
        ? data
        : [];
    const matching = touristList.filter((t: any) => t.book_tour_id === targetItineraryId);

    if (matching.length > 0) {
      return matching.map((t: any) => ({
        gender: t.gender || "Mr",
        name: t.name || "",
        phoneNumber: t.phone_number || "",
        nationality: t.nationality || "",
        passportNumber: t.passport_number || ""
      }));
    }

    return [
      {
        gender: "Mr",
        name: "",
        phoneNumber: "",
        nationality: "",
        passportNumber: ""
      }
    ];
  }, [touristsData, targetItineraryId]);

  const validationSchema = useMemo(() => getOrderTourSchema(t), [t]);

  const formik = useFormik<OrderTourValues>({
    initialValues: {
      booker: {
        name: "",
        email: "",
        phone: ""
      },
      tourists: initialTourists,
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
      try {
        const payload: any = {
          itinerary_id: targetItineraryId,
          booker_name: values.booker.name,
          booker_email: values.booker.email,
          booker_phone: values.booker.phone,
          add_ons: values.add_ons || [],
          tourists: values.tourists.map((t) => ({
            name: t.name,
            gender: t.gender,
            phone_number: t.phoneNumber,
            nationality: t.nationality,
            passport_number: t.passportNumber ? t.passportNumber.trim().replace(/\s+/g, '') : ""
          }))
        };

        const res = await createTour(payload).unwrap();
        const createdBookingId = res?.data?.id || res?.id;

        toast.success("Berhasil membuat pemesanan tour!");
        setIsConfirmModalOpen(false);

        setTimeout(() => {
          router.push(`/${locale}/payments?order_id=${createdBookingId || targetItineraryId}`);
        }, 1200);
      } catch (error: any) {
        toast.error(error?.data?.message || "Gagal membuat pemesanan tour");
      }
    }
  });

  const handlePreSubmit = async () => {
    // Touch all fields to reveal validation errors
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
      let firstErrorMessage = t("fillRequiredFields");
      if (errors.booker && typeof errors.booker === "object") {
        firstErrorMessage = Object.values(errors.booker)[0] as string;
      } else if (errors.tourists && Array.isArray(errors.tourists)) {
        const firstTouristError = errors.tourists.find(Boolean);
        if (firstTouristError && typeof firstTouristError === "object") {
          firstErrorMessage = Object.values(firstTouristError)[0] as string;
        }
      }
      toast.error(firstErrorMessage);
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Sync booker form values whenever mode or account data changes
  useEffect(() => {
    if (useAccountData && (accountData.name || accountData.email || accountData.phone)) {
      formik.setFieldValue("booker.name", accountData.name);
      formik.setFieldValue("booker.email", accountData.email);
      formik.setFieldValue("booker.phone", accountData.phone);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useAccountData, accountData]);

  // Effect to populate form when data is loaded
  useEffect(() => {
    if (touristsData && initialTourists.length > 0 && !hasPopulated.current) {
      const isActuallyPopulated = initialTourists.some((t: any) => t.name !== "");
      if (isActuallyPopulated) {
        formik.setValues({
          ...formik.values,
          tourists: initialTourists
        });
        hasPopulated.current = true;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTourists, touristsData]);

  // Ensure every tourist always has default gender 'Mr'
  useEffect(() => {
    formik.values.tourists.forEach((t, idx) => {
      if (!t.gender) {
        formik.setFieldValue(`tourists.${idx}.gender`, "Mr");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.tourists]);

  // Set initial add_ons if booking has them
  useEffect(() => {
    if (bookTourData?.booking_add_ons && formik.values.add_ons?.length === 0) {
      const existingAddOnIds = bookTourData.booking_add_ons.map((ba: any) => ba.add_on_id);
      if (existingAddOnIds.length > 0) {
        formik.setFieldValue("add_ons", existingAddOnIds);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookTourData]);

  const itemsSubtotal = useMemo(() => {
    if (itineraryData?.subtotal) return Number(itineraryData.subtotal);
    if (bookTourData?.subtotal) return Number(bookTourData.subtotal);
    return tourItems.reduce(
      (acc: number, item: any) => acc + Number(item.destination?.price || 0),
      0
    );
  }, [itineraryData, bookTourData, tourItems]);

  const totalPrice = useMemo(() => {
    const touristCount = formik.values.tourists?.length || 1;
    const baseSubtotal = itemsSubtotal * touristCount;
    const addOnsTotal = (formik.values.add_ons || []).reduce((acc: number, id: string) => {
      const addOn = availableAddOns.find((a) => a.id === id);
      return acc + (Number(addOn?.price) || 0);
    }, 0);
    return baseSubtotal + addOnsTotal;
  }, [itemsSubtotal, formik.values.tourists, formik.values.add_ons, availableAddOns]);

  const addTourist = () => {
    formik.setFieldValue("tourists", [
      ...formik.values.tourists,
      {
        gender: "Mr",
        name: "",
        phoneNumber: "",
        nationality: "",
        passportNumber: ""
      }
    ]);
  };

  const removeTourist = (index: number) => {
    const newTourists = [...formik.values.tourists];
    newTourists.splice(index, 1);
    formik.setFieldValue("tourists", newTourists);
  };

  const renderSummaryContent = (isInsideDrawer: boolean = false) => {
    if (isLoadingBookings) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      );
    }

    if (!tourItems || tourItems.length === 0) {
      return (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
            <Icon name="AlertCircle" className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Booking / Itinerary Tidak Ditemukan</p>
            <p className="mt-0.5 text-xs text-slate-500">Silakan kembali dan pilih itinerary yang valid</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Destination & Booking ID */}
        <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-left">
          <div className="flex items-center gap-2 text-left">
            <Icon name="MapPin" className="h-3.5 w-3.5 shrink-0 text-red-500" />
            <p className="truncate text-left text-sm font-bold text-slate-900">
              {itineraryName}
            </p>
          </div>
          <p className="mt-1 font-mono text-[11px] text-slate-400 text-left">ID: {activeId?.slice(0, 12)}...</p>
        </div>

        {/* Tour Items */}
        {tourItems && tourItems.length > 0 && (
          <div className="mb-4 text-left">
            <p className="mb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t("itineraryHeader", { count: tourItems.length })}
            </p>
            <div
              className={cn(
                "space-y-3 text-left",
                tourItems.length > 3 && "max-h-48 overflow-y-auto pr-1.5 scrollbar-thin"
              )}>
              {(() => {
                const sortedItems = [...tourItems].sort(
                  (a: any, b: any) =>
                    new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
                );
                return sortedItems.map((item: any, idx: number) => (
                  <SummaryTourItem
                    key={item.id || idx}
                    item={item}
                    locale={locale}
                    index={idx}
                    formatPrice={formatPrice}
                  />
                ));
              })()}
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{t("destinationsSubtotal")}</span>
            <span className="text-xs font-semibold text-slate-700">
              {formatPrice(itemsSubtotal)}
            </span>
          </div>
          {formik.values.tourists.length > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{t("travelerCount")}</span>
              <span className="text-xs font-semibold text-slate-700">
                {t("personsCount", { count: formik.values.tourists.length })}
              </span>
            </div>
          )}
          {formik.values.add_ons && formik.values.add_ons.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {t("addonsLabel", { count: formik.values.add_ons.length })}
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {formatPrice(
                  formik.values.add_ons.reduce((acc: number, id: string) => {
                    const addOn = availableAddOns.find((a) => a.id === id);
                    return acc + (Number(addOn?.price) || 0);
                  }, 0)
                )}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2.5">
            <span className="text-sm font-bold text-blue-900">{t("totalLabel")}</span>
            <span className="text-sm font-bold text-blue-700">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* CTA Button and Security inside Desktop Card */}
        {!isInsideDrawer && (
          <>
            <button
              type="button"
              onClick={handlePreSubmit}
              disabled={isCreatingTour || isUpdatingTour}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
              {isCreatingTour || isUpdatingTour ? (
                <>
                  <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                  {t("processing")}
                </>
              ) : (
                <>
                  <Icon name="CreditCard" className="h-4 w-4" />
                  {t("proceedPayment")}
                </>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-slate-400">
              <Icon name="ShieldCheck" className="h-3.5 w-3.5" />
              <span className="text-[11px]">{t("securePayment")}</span>
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 active:scale-95">
              <Icon name="ChevronLeft" className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">{t("pageTitle")}</h1>
              <p className="text-xs text-slate-500">{t("pageSubtitle")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 pb-28 lg:pb-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5 lg:col-span-8">

            {/* INFO BANNER */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 sm:px-4 py-3">
              <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs leading-relaxed text-amber-800">
                <span className="font-semibold">{t("importantNote")} </span>{t("importantBanner")}
              </p>
            </div>

            {/* ── DATA PEMESAN ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                    onClick={() => setBookerModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95">
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
                          toast.info("Data profil akun belum diisi");
                        }
                      }}
                      className={`flex items-center gap-1.5 rounded-[10px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
                        useAccountData
                          ? "bg-white text-emerald-700 shadow-sm"
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
                      className={`flex items-center gap-1.5 rounded-[10px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
                        !useAccountData
                          ? "bg-white text-blue-700 shadow-sm"
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
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                    <Icon name="UserCheck" className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <p className="text-xs text-emerald-700 font-medium">
                      {t("accountNotice")}
                    </p>
                  </div>
                ) : !accountData.name && !accountData.email ? (
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                    <Icon name="Info" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <p className="text-[11px] text-slate-500">
                      {t("generalNotice")}
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
                      className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-blue-400 focus:ring-blue-100"
                      value={formik.values.booker.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {(formik.errors.booker as any)?.name && formik.touched.booker?.name && (
                      <p className="mt-1 text-xs text-red-500">{(formik.errors.booker as any).name}</p>
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
                        className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm focus:border-blue-400 focus:ring-blue-100"
                        value={formik.values.booker.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {(formik.errors.booker as any)?.email && formik.touched.booker?.email && (
                      <p className="mt-1 text-xs text-red-500">{(formik.errors.booker as any).email}</p>
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
                        className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm focus:border-blue-400 focus:ring-blue-100"
                        value={formik.values.booker.phone}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          formik.setFieldValue("booker.phone", digitsOnly);
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {(formik.errors.booker as any)?.phone && formik.touched.booker?.phone && (
                      <p className="mt-1 text-xs text-red-500">{(formik.errors.booker as any).phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── DATA TRAVELER ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-4 sm:px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 shrink-0">
                    <Icon name="Users" className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{t("travelerHeader")}</h2>
                    <p className="text-xs text-slate-500">{t("travelersAdded", { count: formik.values.tourists.length })}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addTourist}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100 active:scale-95 w-full sm:w-auto shrink-0">
                  <Icon name="Plus" className="h-3 w-3" />
                  {t("addTraveler")}
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {formik.values.tourists.map((tourist, index) => (
                  <div key={index} className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm shadow-blue-200">
                          {index + 1}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{t("travelerTitle", { index: index + 1 })}</span>
                        {index === 0 && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                            {t("primaryTag")}
                          </span>
                        )}
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeTourist(index)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600">
                          <Icon name="Trash2" className="h-3.5 w-3.5" />
                          {t("removeBtn")}
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
                            {t("fullName")} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`tourists.${index}.name`}
                            name={`tourists.${index}.name`}
                            placeholder={t("fullNamePlaceholder")}
                            className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-blue-400 focus:ring-blue-100"
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
                            placeholder="Contoh: 08123456789"
                            className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-blue-400 focus:ring-blue-100"
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
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor={`tourists.${index}.nationality`} className="text-xs font-semibold text-slate-700">
                            {t("nationality")} <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={tourist.nationality}
                            onValueChange={(val) =>
                              formik.setFieldValue(`tourists.${index}.nationality`, val)
                            }>
                            <SelectTrigger className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-blue-400 focus:ring-blue-100">
                              <SelectValue placeholder={t("selectNationality")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Indonesia">Indonesia</SelectItem>
                              <SelectItem value="Malaysia">Malaysia</SelectItem>
                              <SelectItem value="Singapore">Singapore</SelectItem>
                            </SelectContent>
                          </Select>
                          {formik.errors.tourists?.[index] &&
                            (formik.errors.tourists[index] as any).nationality && (
                              <p className="mt-1 text-xs text-red-500">
                                {(formik.errors.tourists[index] as any).nationality}
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
                            className="mt-1.5 h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-blue-400 focus:ring-blue-100"
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ADD-ONS ── */}
            {availableAddOns.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                            ? "border-blue-400 bg-blue-50 shadow-sm shadow-blue-100"
                            : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/40"
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
                          <p className="text-sm font-semibold text-slate-800">{addOn.name}</p>
                        </div>
                        {addOn.description && (
                          <p className="ml-6 text-xs leading-relaxed text-slate-500 line-clamp-2">
                            {addOn.description}
                          </p>
                        )}
                        <div className="ml-6">
                          <span className={`text-sm font-bold ${isSelected ? "text-blue-600" : "text-slate-700"}`}>
                            {formatPrice(addOn.price)}
                          </span>
                          <span className="ml-1 text-[10px] text-slate-400">{t("perPerson")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — BOOKING SUMMARY (Desktop) ── */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-4 space-y-4">

              {/* SUMMARY CARD */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
                    <Icon name="Receipt" className="h-4 w-4 text-slate-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{t("summaryHeader")}</h3>
                </div>

                <div className="p-5">
                  {renderSummaryContent(false)}
                </div>
              </div>

              {/* SUPPORT CARD */}
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

      {/* ── MOBILE & TABLET FIXED BOTTOM BAR ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          {/* Price & Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsSummaryDrawerOpen(true)}
            className="flex flex-col text-left transition-opacity hover:opacity-80 active:scale-95">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="text-[11px] font-medium leading-none">{t("totalLabel")}</span>
              <span className="flex items-center gap-0.5 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                {t("viewDetails")}
                <Icon name="ChevronUp" className="h-3 w-3" />
              </span>
            </div>
            <span className="mt-1 text-base font-extrabold leading-tight text-blue-600">
              {formatPrice(totalPrice)}
            </span>
          </button>

          {/* Proceed to Payment Button */}
          <button
            type="button"
            onClick={handlePreSubmit}
            disabled={isCreatingTour || isUpdatingTour}
            className="flex h-11 flex-1 max-w-[220px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
            {isCreatingTour || isUpdatingTour ? (
              <>
                <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                <span className="truncate">{t("processing")}</span>
              </>
            ) : (
              <>
                <Icon name="CreditCard" className="h-4 w-4 shrink-0" />
                <span className="truncate">{t("proceedPayment")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── MOBILE & TABLET SUMMARY DRAWER ── */}
      <Drawer open={isSummaryDrawerOpen} onOpenChange={setIsSummaryDrawerOpen}>
        <DrawerContent className="max-h-[85vh] rounded-t-3xl bg-white p-0">
          <DrawerHeader className="border-b border-slate-100 px-5 py-4 text-left">
            <div className="flex w-full items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5 text-left">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <Icon name="Receipt" className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <DrawerTitle className="text-left text-base font-bold text-slate-900">
                    {t("summaryHeader")}
                  </DrawerTitle>
                  <DrawerDescription className="mt-0.5 text-left text-[11px] text-slate-400">
                    {t("pageSubtitle")}
                  </DrawerDescription>
                </div>
              </div>
              <DrawerClose asChild>
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 active:scale-95">
                  <Icon name="X" className="h-4 w-4" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="max-h-[calc(85vh-165px)] overflow-y-auto px-5 py-4 text-left">
            {renderSummaryContent(true)}
          </div>

          <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4">
            <button
              type="button"
              onClick={() => {
                setIsSummaryDrawerOpen(false);
                handlePreSubmit();
              }}
              disabled={isCreatingTour || isUpdatingTour}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
              {isCreatingTour || isUpdatingTour ? (
                <>
                  <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                  {t("processing")}
                </>
              ) : (
                <>
                  <Icon name="CreditCard" className="h-4 w-4" />
                  {t("proceedPayment")}
                </>
              )}
            </button>
            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-slate-400">
              <Icon name="ShieldCheck" className="h-3.5 w-3.5" />
              <span className="text-[11px]">{t("securePayment")}</span>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Booker List Modal */}
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

      {/* Confirmation Alert Modal */}
      <ConfirmBookingModal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => formik.handleSubmit()}
        isSubmitting={isCreatingTour || isUpdatingTour}
        values={formik.values}
        totalPrice={totalPrice}
        formatPrice={formatPrice}
        itineraryName={itineraryName}
      />
    </div>
  );
};

export const BookingTour = OrderTourPage;
export const BookingTourPage = OrderTourPage;
