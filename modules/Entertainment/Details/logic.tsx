"use client";

import { useCreateBookEntertainmentAttractionMutation } from "@/store/services/book-entertainment-attraction.service";
import {
  EntertainmentAttraction,
  useFindAllAttractionsQuery,
  useFindAttractionByIdQuery,
  useFindAttractionBySlugQuery
} from "@/store/services/entertainment-attraction.service";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { validateTicketSelection } from "../schema";

export const useEntertainmentDetailLogic = () => {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const locale = useLocale();
  const t = useTranslations("Entertainment");
  const router = useRouter();

  const currentCurrency = useSelector(
    (state: any) =>
      state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16761 }
  );
  const isLoggedIn = useSelector(
    (state: any) => state.auth?.isLoggedIn || false
  );

  // Fetch attraction by slug with fallback to ID
  const {
    data: slugResponse,
    isLoading: isLoadingSlug,
    error: slugError
  } = useFindAttractionBySlugQuery(slug, { skip: !slug });

  const isNotFoundBySlug = !isLoadingSlug && (!slugResponse?.data || Boolean(slugError));

  const {
    data: idResponse,
    isLoading: isLoadingId
  } = useFindAttractionByIdQuery(slug, { skip: !isNotFoundBySlug });

  const attraction: EntertainmentAttraction | undefined =
    slugResponse?.data || idResponse?.data;
  const isLoading = isLoadingSlug || (isNotFoundBySlug && isLoadingId);

  // Translation
  const translation =
    attraction?.translations?.find((tr: any) => tr.language_code === locale) ||
    attraction?.translations?.find((tr: any) => tr.language_code === "en") ||
    attraction?.translations?.[0];

  // Gallery
  const galleryImages = useMemo(() => {
    const imgs: string[] = [];
    if (attraction?.thumbnail) imgs.push(attraction.thumbnail);
    if (Array.isArray(attraction?.images)) {
      attraction.images.forEach((img: string) => {
        if (img && !imgs.includes(img)) imgs.push(img);
      });
    }
    return imgs.length > 0 ? imgs : ["/images/hero_things_todo_mobile.png"];
  }, [attraction]);

  // Visit Date (default to tomorrow)
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

  const isDateDisabled = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }, []);

  // Ticket quantities
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Booking mutation
  const [createBooking, { isLoading: isBooking }] =
    useCreateBookEntertainmentAttractionMutation();

  // Initialize ticket quantities
  useEffect(() => {
    if (attraction?.tickets) {
      const initial: Record<string, number> = {};
      attraction.tickets.forEach((tk) => {
        initial[tk.id] = 0;
      });
      setTicketQuantities(initial);
    }
  }, [attraction]);

  // Wishlist state on mount
  useEffect(() => {
    if (attraction?.id) {
      try {
        const saved = JSON.parse(
          localStorage.getItem("entertainment_saved") || "[]"
        );
        setIsSaved(saved.includes(attraction.id));
      } catch (e) {
        console.error(e);
      }
    }
  }, [attraction?.id]);

  const toggleSave = useCallback(() => {
    if (!attraction?.id) return;
    try {
      const saved: string[] = JSON.parse(
        localStorage.getItem("entertainment_saved") || "[]"
      );
      let updated: string[];
      if (saved.includes(attraction.id)) {
        updated = saved.filter((id) => id !== attraction.id);
        setIsSaved(false);
        toast.info(t("saved") ? "Removed from saved" : "Dihapus dari simpanan");
      } else {
        updated = [...saved, attraction.id];
        setIsSaved(true);
        toast.success(t("saved") || "Saved to wishlist");
      }
      localStorage.setItem("entertainment_saved", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }, [attraction?.id, t]);

  const handleShare = useCallback(() => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success(locale === "id" ? "Tautan berhasil disalin!" : "Link copied to clipboard!");
    }
  }, [locale]);

  // Stepper handlers
  const handleIncrease = useCallback((ticketId: string) => {
    setTicketQuantities((prev) => ({
      ...prev,
      [ticketId]: (prev[ticketId] || 0) + 1
    }));
  }, []);

  const handleDecrease = useCallback((ticketId: string) => {
    setTicketQuantities((prev) => ({
      ...prev,
      [ticketId]: Math.max(0, (prev[ticketId] || 0) - 1)
    }));
  }, []);

  // Price calculations
  const totalSelectedTickets = useMemo(() => {
    return Object.values(ticketQuantities).reduce((acc, q) => acc + (q || 0), 0);
  }, [ticketQuantities]);

  const subtotal = useMemo(() => {
    if (!attraction?.tickets) return 0;
    return attraction.tickets.reduce((acc, tk) => {
      const qty = ticketQuantities[tk.id] || 0;
      const price = Number(tk.price) || 0;
      return acc + qty * price;
    }, 0);
  }, [attraction?.tickets, ticketQuantities]);

  const isOverQuota = Boolean(
    attraction?.daily_quota &&
      attraction.daily_quota > 0 &&
      totalSelectedTickets > attraction.daily_quota
  );

  // Format Price
  const formatPrice = useCallback(
    (rawPrice: number) => {
      let displayPrice = Number(rawPrice || 0);
      if (currentCurrency.code !== "USD") {
        displayPrice = displayPrice * (currentCurrency.idrToUsdRate || 1);
      }

      const localeCode =
        currentCurrency.code === "IDR"
          ? "id-ID"
          : currentCurrency.code === "TRY"
          ? "tr-TR"
          : "en-US";

      return new Intl.NumberFormat(localeCode, {
        style: "currency",
        currency: currentCurrency.code,
        maximumFractionDigits: currentCurrency.code === "IDR" ? 0 : 2
      })
        .format(displayPrice)
        .replace("$", "US$ ");
    },
    [currentCurrency]
  );

  // Similar Attractions Query
  const { data: similarData } = useFindAllAttractionsQuery({
    limit: 6,
    category_id: attraction?.category_entertainment_id
  });

  const similarAttractions = useMemo(() => {
    const list = similarData?.data || similarData?.datas || [];
    return list.filter((item: any) => item.id !== attraction?.id).slice(0, 3);
  }, [similarData, attraction?.id]);

  // Auth Guard & Booking Proceed
  const handleBooking = async () => {
    if (!attraction) return;

    if (!isLoggedIn) {
      toast.error(
        locale === "id"
          ? "Silakan login terlebih dahulu untuk memesan tiket."
          : locale === "tr"
          ? "Bilet rezervasyonu yapmak için lütfen önce giriş yapın."
          : "Please log in first to book tickets."
      );
      router.push(
        `/${locale}/login?redirect=/${locale}/entertainment-attraction/${slug || attraction.id}`
      );
      return;
    }

    if (totalSelectedTickets === 0) {
      toast.error(t("selectTicketsPrompt"));
      return;
    }

    if (isOverQuota) {
      toast.error(t("quotaExceeded", { quota: attraction.daily_quota ?? 0 }));
      return;
    }

    const bookingPayload = {
      attraction_id: attraction.id,
      attraction_name: translation?.name || "Attraction",
      booking_date: visitDate,
      items: (attraction.tickets || []).map((tk) => ({
        ticket_id: tk.id,
        ticket_name: tk.name,
        unit_price: Number(tk.price) || 0,
        pax_count: tk.pax_count || 1,
        qty: ticketQuantities[tk.id] || 0
      }))
    };

    const validation = validateTicketSelection(bookingPayload, attraction.daily_quota);
    if (!validation.success) {
      const err = Object.values(validation.errors || {})[0];
      toast.error(err || t("selectTicketsPrompt"));
      return;
    }

    const formatDateDDMMYYYY = (d: Date) => {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const formattedBookingDate = selectedDate
      ? formatDateDDMMYYYY(selectedDate)
      : undefined;

    const selectedItems = (attraction.tickets || [])
      .filter((tk) => (ticketQuantities[tk.id] || 0) > 0)
      .map((tk) => ({
        entertainment_attraction_id: attraction.id,
        ticket_id: tk.id,
        qty: ticketQuantities[tk.id] || 0,
        unit_price: Number(tk.price) || 0
      }));

    try {
      const res = await createBooking({
        booking_date: formattedBookingDate,
        items: selectedItems
      }).unwrap();

      const bookingId = res?.data?.id;

      // Save session booking draft as instant cache
      const draft = {
        booking_id: bookingId,
        attraction: {
          id: attraction.id,
          name: translation?.name || "Attraction",
          category:
            attraction.category_entertainment?.name ||
            attraction.category_entertainment_name ||
            "Attraction",
          thumbnail: galleryImages[0],
          location: [
            attraction.state?.name || attraction.state_name,
            attraction.country?.name || attraction.country_name
          ]
            .filter(Boolean)
            .join(", ")
        },
        visit_date: formattedBookingDate,
        items: validation.data?.items.filter((item) => item.qty > 0),
        total_tickets: totalSelectedTickets,
        subtotal
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem("entertainment_booking_draft", JSON.stringify(draft));
      }

      toast.success(t("bookingCreated"));
      router.push(
        `/${locale}/orders/entertainment?book_entertainment_id=${bookingId}&attraction_id=${attraction.id}`
      );
    } catch (err: any) {
      console.error("Create book entertainment attraction failed:", err);
      const errMsg =
        err?.data?.message ||
        err?.message ||
        (locale === "id"
          ? "Gagal membuat pemesanan tiket atraksi. Silakan coba lagi."
          : "Failed to create attraction booking. Please try again.");
      toast.error(errMsg);
    }
  };

  return {
    attraction,
    translation,
    galleryImages,
    isLoading,
    isBooking,
    selectedDate,
    setSelectedDate,
    isDateDisabled,
    visitDate,
    ticketQuantities,
    handleIncrease,
    handleDecrease,
    totalSelectedTickets,
    subtotal,
    isOverQuota,
    formatPrice,
    isSaved,
    toggleSave,
    handleShare,
    similarAttractions,
    handleBooking,
    locale,
    t
  };
};
