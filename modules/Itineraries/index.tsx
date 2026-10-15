"use client";

import Icon from "@/components/icon";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { cn } from "@/lib/utils";
import {
  useGetMyItinerariesQuery,
  useRemoveItemMutation,
  useUpdateItineraryItemsMutation
} from "@/store/services/itinerary.service";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AddDestinationModal } from "./AddDestinationModal";
import { ItineraryDetailModal } from "./ItineraryDetailModal";

// Picks a representative image based on location keyword
const LOCATION_IMAGES: { keyword: string; image: string }[] = [
  { keyword: "turk", image: "/images/turkey-destination.jpg" },
  { keyword: "cappad", image: "/images/turkey-destination.jpg" },
  { keyword: "bali", image: "/images/bali-destination.jpg" },
  { keyword: "yogya", image: "/images/bali-destination.jpg" },
  { keyword: "eropa", image: "/images/eropa-destination.jpg" },
  { keyword: "europe", image: "/images/eropa-destination.jpg" },
  { keyword: "japan", image: "/images/japan-destination.jpg" },
  { keyword: "swiss", image: "/images/swiss-destination.jpg" },
];

function resolveImage(name: string, fallback?: string): string {
  const lower = (name || "").toLowerCase();
  const match = LOCATION_IMAGES.find((f) => lower.includes(f.keyword));
  return match?.image || fallback || "/images/turkey-destination.jpg";
}

function getStatusBadgeClass(status: string) {
  switch ((status || "").toLowerCase()) {
    case "draft":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "confirmed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ongoing":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "cancelled":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export const ItinerariesPage = () => {
  const locale = useLocale();
  const t = useTranslations("Itinerary");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailItinerary, setSelectedDetailItinerary] = useState<any | null>(null);

  const [modalFilter, setModalFilter] = useState<{
    location: string;
    countryId?: string;
    stateId?: string;
    existingIds: string[];
    existingDates: string[];
  }>({
    location: "",
    countryId: undefined,
    stateId: undefined,
    existingIds: [],
    existingDates: []
  });

  const { data: itinerariesResponse, isLoading } = useGetMyItinerariesQuery(undefined);
  const [removeItem, { isLoading: isRemoving }] = useRemoveItemMutation();
  const [updateItineraryItems, { isLoading: isUpdatingDate }] = useUpdateItineraryItemsMutation();

  const itineraries = itinerariesResponse?.data || itinerariesResponse?.datas || [];

  const handleRemoveDestination = async (itineraryId: string, itemId: string) => {
    try {
      const res = await removeItem({ itineraryId, itemId }).unwrap();
      toast.success(t("deleteSuccess"));
      // If modal detail is open, update its state with server response or recalculate subtotal
      if (res?.data) {
        setSelectedDetailItinerary(res.data);
      } else if (selectedDetailItinerary && selectedDetailItinerary.id === itineraryId) {
        setSelectedDetailItinerary((prev: any) => {
          if (!prev) return null;
          const currentItems = prev.items || prev.itinerary_items || [];
          const updatedItems = currentItems.filter(
            (i: any) => i.id !== itemId && i.destination_id !== itemId && i.destination?.id !== itemId
          );
          const newSubtotal = updatedItems.reduce(
            (sum: number, cur: any) => sum + Number(cur.destination?.price || 0),
            0
          );
          return {
            ...prev,
            subtotal: newSubtotal,
            items: updatedItems,
            itinerary_items: updatedItems
          };
        });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || t("deleteFailed"));
    }
  };

  const handleUpdateDestinationDate = async (itineraryId: string, itemId: string, newDate: Date) => {
    try {
      const res = await updateItineraryItems({
        id: itineraryId,
        items: [{ item_id: itemId, visit_date: newDate.toISOString() }]
      }).unwrap();

      toast.success(t("updateDateSuccess"));

      // Update modal state if open with new sorted items from server
      if (res?.data) {
        setSelectedDetailItinerary(res.data);
      }
    } catch (error: any) {
      const errorBody =
        error?.data?.error?.body ||
        (Array.isArray(error?.data?.error) ? error?.data?.error[0]?.body : null) ||
        error?.data?.message ||
        error?.message;

      let userFriendlyMessage = errorBody;
      if (typeof errorBody === "string") {
        if (errorBody.toLowerCase().includes("earlier than today")) {
          userFriendlyMessage = t("errorPastDate");
        } else if (
          errorBody.toLowerCase().includes("already used") ||
          errorBody.toLowerCase().includes("cannot be the same") ||
          errorBody.toLowerCase().includes("same visit date")
        ) {
          userFriendlyMessage = t("errorDuplicateDate");
        }
      }

      toast.error(userFriendlyMessage || t("updateDateFailed"));
    }
  };

  const handleUpdateItineraryName = async (itineraryId: string, newName: string) => {
    try {
      const res = await updateItineraryItems({
        id: itineraryId,
        name: newName
      }).unwrap();

      toast.success("Nama itinerary berhasil diperbarui.");

      if (res?.data) {
        setSelectedDetailItinerary(res.data);
      } else {
        setSelectedDetailItinerary((prev: any) => (prev ? { ...prev, name: newName } : null));
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Gagal memperbarui nama itinerary.");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* ── Hero Section ── */}
      <div className="relative flex min-h-[280px] w-full flex-col items-center justify-center overflow-hidden md:min-h-[500px] pt-16 md:pt-32 pb-10 md:pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <ImageWithFallback
            src="/images/turkey-destination.jpg"
            alt="My Itinerary Hero"
            fill
            className="object-cover object-center"
            priority
            fallbackSrc="/images/hero_things_todo_mobile.png"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/10" />
        </div>

        {/* Back Button (Mobile) */}
        <div className="absolute left-4 top-5 z-20 md:hidden">
          <Link
            href={`/${locale}`}
            className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg transition-transform active:scale-95">
            <Icon name="ChevronLeft" className="size-6 text-white" />
          </Link>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 lg:px-10">
          <div className="mb-6 flex w-full flex-col items-center text-center mt-8 md:mt-0">
            <span className="mb-2 md:mb-4 block text-xs md:text-sm font-bold tracking-widest text-orange-400 uppercase drop-shadow-md">
              {t("heroTagline")}
            </span>
            <h1
              className="font-bold tracking-tight text-white drop-shadow-2xl"
              style={{ fontSize: "clamp(2rem, 4vw + 1rem, 4.5rem)" }}>
              {t("heroTitle")}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Content Section ── */}
      <div className="relative mx-auto w-full max-w-7xl px-5 pt-8 md:px-8">
        {/* Loading */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : itineraries.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-slate-50 text-slate-300 shadow-inner">
              <Icon name="Map" className="size-10" />
            </div>
            <h3 className="mt-6 text-lg font-bold text-slate-900">{t("emptyTitle")}</h3>
            <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">
              {t("emptySubtitle")}
            </p>
            <Link
              href={`/${locale}/tour-holiday-religion`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95">
              <Icon name="Compass" className="size-4" />
              {t("exploreBtn")}
            </Link>
          </div>
        ) : (
          <>
            {/* ── Itinerary Cards Grid (2 col mobile, 3 col md, 4 col lg) ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 xl:gap-8">
              {itineraries.map((itinerary: any) => {
                const items = itinerary.items || itinerary.itinerary_items || [];
                const firstItem = items[0];
                const destinationLocation = firstItem?.destination?.location;
                const location =
                  itinerary.location ||
                  destinationLocation ||
                  (itinerary.state?.name
                    ? `${itinerary.state.name}, ${itinerary.country?.name || ""}`
                    : itinerary.country?.name) ||
                  "Turkey";
                const heroImage =
                  firstItem?.destination?.thumbnail ||
                  firstItem?.destination?.translations?.[0]?.thumbnail ||
                  resolveImage(location);

                return (
                  <div
                    key={itinerary.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl md:rounded-[1.5rem] bg-white shadow-md shadow-slate-200/50 border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/60">
                    {/* Card Image */}
                    <div
                      onClick={() => {
                        setSelectedDetailItinerary(itinerary);
                        setIsDetailModalOpen(true);
                      }}
                      className="relative aspect-[4/3] w-full overflow-hidden cursor-pointer">
                      <ImageWithFallback
                        src={heroImage}
                        alt={location}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        fallbackSrc="/images/turkey-destination.jpg"
                      />

                      {/* Eye Button Overlay */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDetailItinerary(itinerary);
                          setIsDetailModalOpen(true);
                        }}
                        className="absolute top-2.5 right-2.5 z-10 flex size-7 sm:size-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-md transition-all hover:bg-white hover:text-blue-600 active:scale-95"
                        title={t("viewDetailTooltip")}>
                        <Icon name="Eye" className="size-3.5 sm:size-4" />
                      </button>
                    </div>

                    {/* Card Info */}
                    <div className="flex flex-1 flex-col p-3 sm:p-5">
                      {/* Name & Status Badge */}
                      <div
                        onClick={() => {
                          setSelectedDetailItinerary(itinerary);
                          setIsDetailModalOpen(true);
                        }}
                        className="flex items-start justify-between gap-1.5 cursor-pointer">
                        <h3 className="line-clamp-1 text-xs sm:text-base font-bold leading-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                          {itinerary.name || t("tripTo", { location })}
                        </h3>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider",
                            getStatusBadgeClass(itinerary.status)
                          )}>
                          {itinerary.status || "draft"}
                        </span>
                      </div>

                      <p className="mt-1 flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-500 truncate">
                        <Icon name="MapPin" className="size-3 sm:size-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{location}</span>
                      </p>

                      <div className="mt-2 flex items-center gap-1 sm:gap-1.5">
                        <Icon name="Layers" className="size-3 sm:size-3.5 text-blue-500" />
                        <span className="text-[11px] sm:text-xs font-semibold text-blue-600">
                          {t("destinationsCount", { count: items.length })}
                        </span>
                      </div>

                      {/* Actions: Clean 2-Button Row */}
                      <div className="mt-auto flex items-center gap-1.5 sm:gap-2 pt-3 sm:pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            const existingIds = items
                              .map((it: any) => it.destination?.id || it.destination_id)
                              .filter(Boolean);
                            const existingDates = items
                              .map((it: any) =>
                                typeof it.visit_date === "string"
                                  ? it.visit_date
                                  : it.visit_date
                                  ? new Date(it.visit_date).toISOString().split("T")[0]
                                  : null
                              )
                              .filter(Boolean);
                            const countryId =
                              itinerary.country_id ||
                              itinerary.country?.id ||
                              firstItem?.destination?.country_id;
                            const stateId =
                              itinerary.state_id ||
                              itinerary.state?.id ||
                              firstItem?.destination?.state_id;

                            setModalFilter({
                              location,
                              countryId,
                              stateId,
                              existingIds,
                              existingDates
                            });
                            setIsModalOpen(true);
                          }}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 sm:py-2.5 text-[11px] sm:text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97]">
                          <Icon name="Plus" className="size-3 sm:size-3.5 text-slate-500" />
                          <span>{t("addBtn")}</span>
                        </button>

                        <Link
                          href={`/${locale}/book-tour?itinerary_id=${itinerary.id}`}
                          className="flex flex-1 items-center justify-center rounded-xl bg-blue-600 py-2 sm:py-2.5 text-[11px] sm:text-sm font-bold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.97]">
                          {t("checkoutBtn")}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* New Itinerary CTA */}
            <div className="mt-8">
              <button
                onClick={() => {
                  setModalFilter({
                    location: "",
                    countryId: undefined,
                    stateId: undefined,
                    existingIds: [],
                    existingDates: []
                  });
                  setIsModalOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-5 text-sm font-semibold text-slate-400 transition-colors hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-600 active:scale-[0.99]">
                <Icon name="Plus" className="size-4" />
                {t("createNewBtn")}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Add Destination Modal */}
      <AddDestinationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        location={modalFilter.location}
        countryId={modalFilter.countryId}
        stateId={modalFilter.stateId}
        existingDestinationIds={modalFilter.existingIds}
        existingDates={modalFilter.existingDates}
      />

      {/* Itinerary Detail Modal */}
      <ItineraryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        itinerary={selectedDetailItinerary}
        onRemoveItem={handleRemoveDestination}
        isRemoving={isRemoving}
        onUpdateItemDate={handleUpdateDestinationDate}
        isUpdatingDate={isUpdatingDate}
        onUpdateItineraryName={handleUpdateItineraryName}
        isUpdatingName={isUpdatingDate}
      />
    </div>
  );
};
