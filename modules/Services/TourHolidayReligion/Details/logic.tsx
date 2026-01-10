import { useCreateTourMutation, useGetAllTourQuery } from "@/store/services/book-tour.service";
import { useFindDestinationBySlugQuery } from "@/store/services/destination.service";
import { setHasNewBooking } from "@/store/slices/uiSlice";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export const useDestinationDetailsLogic = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const slug = params.slug as string;
  const locale = useLocale();
  const t = useTranslations("Common");
  const currentCurrency = useSelector((state: any) => state.currency);
  const isLoggedIn = useSelector((state: any) => state.auth?.isLoggedIn || false);

  const { data: response, isLoading } = useFindDestinationBySlugQuery(slug, {
    skip: !slug
  });

  const { data: bookToursData } = useGetAllTourQuery(undefined, {
    skip: !isLoggedIn
  });

  useEffect(() => {
    if (bookToursData?.data?.length > 0) {
      dispatch(setHasNewBooking(true));
    }
  }, [bookToursData, dispatch]);

  const [createTour, { isLoading: isBooking }] = useCreateTourMutation();

  const destination = response?.data;
  const translation =
    destination?.translations?.find((tr: any) => tr.language_code === locale) ||
    destination?.translations?.[0];

  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookingData, setBookingData] = useState({
    date: "2 Mei - 7 Mei 2024"
  });

  const handleBooking = async () => {
    if (!selectedDate) {
      toast.error("Silakan pilih tanggal terlebih dahulu");
      return;
    }

    try {
      if (!destination?.id) {
        toast.error("Data destinasi tidak lengkap");
        return;
      }

      await createTour({
        destination_id: destination.id,
        visit_date: selectedDate.toISOString()
      }).unwrap();

      toast.success("Booking berhasil!");
      dispatch(setHasNewBooking(true));
      setIsDateDrawerOpen(false);
    } catch (error: any) {
      console.error("Booking error details:", error);
      let errorMsg = "Gagal melakukan booking";

      if (error?.data?.message) {
        errorMsg = Array.isArray(error.data.message)
          ? error.data.message.join(", ")
          : error.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg);
    }
  };

  const formatPrice = (rawPrice: number) => {
    let displayPrice = rawPrice;
    if (currentCurrency.code === "USD") {
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
    if (!translation) return [];
    const images = [...(translation.image || [])];
    if (translation.thumbnail && !images.includes(translation.thumbnail)) {
      images.unshift(translation.thumbnail);
    }
    return images;
  };

  return {
    destination,
    translation,
    isLoading,
    isBooking,
    formatPrice,
    bookingData,
    setBookingData,
    handleBooking,
    isDateDrawerOpen,
    setIsDateDrawerOpen,
    selectedDate,
    setSelectedDate,
    galleryImages: getGalleryImages(),
    locale,
    hasNewBooking: useSelector((state: any) => state.ui.hasNewBooking)
  };
};
