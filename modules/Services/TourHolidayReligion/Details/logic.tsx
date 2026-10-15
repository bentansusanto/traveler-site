import { useFindDestinationBySlugQuery } from "@/store/services/destination.service";
import { useAddOrCreateItemMutation, useGetMyItinerariesQuery } from "@/store/services/itinerary.service";
import { setHasNewBooking } from "@/store/slices/uiSlice";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export const useDestinationDetailsLogic = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const slug = params.slug as string;
  const locale = useLocale();
  const t = useTranslations("TourHoliday");
  const currentCurrency = useSelector((state: any) => state.currency);
  const isLoggedIn = useSelector((state: any) => state.auth?.isLoggedIn || false);
  const router = useRouter();

  const { data: response, isLoading } = useFindDestinationBySlugQuery(slug, {
    skip: !slug
  });

  const { data: bookToursData } = useGetMyItinerariesQuery(undefined, {
    skip: !isLoggedIn
  });

  useEffect(() => {
    if (bookToursData?.data?.length > 0) {
      dispatch(setHasNewBooking(true));
    }
  }, [bookToursData, dispatch]);

  const [addOrCreateItinerary, { isLoading: isBooking }] = useAddOrCreateItemMutation();

  const destination = response?.data;
  const translation =
    destination?.translations?.find((tr: any) => tr.language_code === locale) ||
    destination?.translations?.[0];

  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Find matching draft itinerary in same country/state if exists
  const matchingItinerary = bookToursData?.data?.find((it: any) => {
    if (it.status && it.status !== "DRAFT") return false;
    const destStateId = destination?.state_id || (destination as any)?.state?.id;
    const destCountryId = destination?.country_id || (destination as any)?.country?.id;
    const itStateId = it.state_id || it.state?.id;
    const itCountryId = it.country_id || it.country?.id;

    if (destStateId && itStateId && destStateId === itStateId) return true;
    if (destCountryId && itCountryId && destCountryId === itCountryId) return true;
    if (destination?.location && it.location) {
      const destLoc = destination.location.toLowerCase();
      const itLoc = it.location.toLowerCase();
      if (destLoc.includes(itLoc) || itLoc.includes(destLoc)) return true;
    }
    return false;
  });

  const existingDates: string[] = (matchingItinerary?.itinerary_items || [])
    .map((item: any) => {
      if (!item.visit_date) return null;
      return typeof item.visit_date === "string"
        ? item.visit_date.split("T")[0]
        : new Date(item.visit_date).toISOString().split("T")[0];
    })
    .filter(Boolean)
    .sort();

  const maxExistingDateStr = existingDates.length > 0 ? existingDates[existingDates.length - 1] : null;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => new Date());

  // Automatically suggest the next available date if previous destinations exist in the itinerary
  useEffect(() => {
    if (maxExistingDateStr) {
      const [y, m, d] = maxExistingDateStr.split("-").map(Number);
      if (y && m && d) {
        const nextDay = new Date(y, m - 1, d + 1);
        setSelectedDate(nextDay);
      }
    }
  }, [maxExistingDateStr]);

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) return true;

    if (maxExistingDateStr) {
      const [y, m, d] = maxExistingDateStr.split("-").map(Number);
      if (y && m && d) {
        const maxExisting = new Date(y, m - 1, d);
        maxExisting.setHours(0, 0, 0, 0);
        if (checkDate <= maxExisting) return true;
      }
    }

    return false;
  };

  const toggleSave = () => {
    setIsSaved((prev) => {
      const next = !prev;
      toast.success(next ? t("savedToWishlist") : t("removedFromWishlist"));
      return next;
    });
  };

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t("linkCopied"));
      }
    } catch {
      toast.info(window.location.href);
    }
  };

  const handleBooking = async () => {
    if (!isLoggedIn) {
      toast.error(t("loginRequired"));
      router.push(`/${locale}/login`);
      return;
    }

    if (!selectedDate) {
      toast.error(t("selectDateRequired"));
      return;
    }

    try {
      if (!destination?.id) {
        toast.error(t("destinationIncomplete"));
        return;
      }

      // Format date consistently as YYYY-MM-DD to avoid client UTC timezone shift
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const d = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${y}-${m}-${d}`;

      await addOrCreateItinerary({
        destination_id: destination.id,
        visit_date: formattedDate
      }).unwrap();

      toast.success(t("bookingSuccess"));
      dispatch(setHasNewBooking(true));
      setIsDateDrawerOpen(false);
      router.push(`/${locale}/itineraries`);
    } catch (error: any) {
      // Use console.warn instead of console.error to avoid triggering Next.js Turbopack dev error overlay
      console.warn("Booking request rejected:", error?.data || error?.message);

      // Extract granular error message from NestJS / ErrorsService payload
      const rawErrorBody =
        error?.data?.error?.body ||
        (Array.isArray(error?.data?.error) ? error?.data?.error[0]?.body : null) ||
        (typeof error?.data?.error === "string" ? error?.data?.error : null) ||
        (error?.data?.message && error?.data?.message !== "Validation error" ? error?.data?.message : null) ||
        error?.message;

      let userFriendlyMessage = rawErrorBody;
      if (typeof rawErrorBody === "string") {
        const lower = rawErrorBody.toLowerCase();
        if (lower.includes("earlier than today")) {
          userFriendlyMessage = t("errorPastDate");
        } else if (
          lower.includes("already used") ||
          lower.includes("cannot be the same") ||
          lower.includes("same visit date")
        ) {
          userFriendlyMessage = t("errorDuplicateDate");
        } else if (
          lower.includes("earlier than existing") ||
          lower.includes("cannot be earlier than previous")
        ) {
          userFriendlyMessage = t("errorEarlierThanExisting");
        } else if (lower.includes("not found")) {
          userFriendlyMessage = t("destinationNotFound");
        }
      }

      toast.error(userFriendlyMessage || t("bookingFailed"));
    }
  };

  const formatPrice = (rawPrice: number) => {
    let displayPrice = rawPrice;
    if (currentCurrency.code !== "USD") {
      displayPrice = rawPrice * currentCurrency.idrToUsdRate;
    }

    return new Intl.NumberFormat(currentCurrency.code === "IDR" ? "id-ID" : "en-US", {
      style: "currency",
      currency: currentCurrency.code,
      maximumFractionDigits: currentCurrency.code === "IDR" ? 0 : 2
    })
      .format(displayPrice)
      .replace("$", "US$ ");
  };

  const getGalleryImages = () => {
    const images = [];
    if (destination?.images && Array.isArray(destination.images)) {
      images.push(...destination.images);
    } else if ((translation as any)?.image && Array.isArray((translation as any).image)) {
      images.push(...(translation as any).image);
    }
    
    const thumbnail = destination?.thumbnail || (translation as any)?.thumbnail;
    if (thumbnail && !images.includes(thumbnail)) {
      images.unshift(thumbnail);
    }

    if (images.length === 0) {
      images.push("/images/hero_things_todo_mobile.png");
    }
    return images;
  };

  return {
    destination,
    translation,
    isLoading,
    isBooking,
    formatPrice,
    handleBooking,
    isDateDrawerOpen,
    setIsDateDrawerOpen,
    selectedDate,
    setSelectedDate,
    isDateDisabled,
    isSaved,
    toggleSave,
    handleShare,
    galleryImages: getGalleryImages(),
    locale,
    hasNewBooking: useSelector((state: any) => state.ui.hasNewBooking)
  };
};
