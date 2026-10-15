"use client";

import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFindAllDestinationQuery } from "@/store/services/destination.service";
import { useAddOrCreateItemMutation } from "@/store/services/itinerary.service";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface AddDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: string;
  countryId?: string;
  stateId?: string;
  existingDestinationIds?: string[];
  existingDates?: string[];
}

export const AddDestinationModal = ({
  isOpen,
  onClose,
  location,
  countryId,
  stateId,
  existingDestinationIds = [],
  existingDates = []
}: AddDestinationModalProps) => {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const t = useTranslations("Itinerary");

  const { data: destinationsResponse, isLoading } = useFindAllDestinationQuery();
  const [addOrCreateItem, { isLoading: isAdding }] = useAddOrCreateItemMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDates, setSelectedDates] = useState<{ [key: string]: Date | undefined }>({});

  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", idrToUsdRate: 1 / 16000 }
  );

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

  const isAddingToExistingCard = Boolean(location || countryId || stateId);

  // Compute maximum existing date to calculate next day default and disabled range
  const sortedExistingDates = [...existingDates].filter(Boolean).sort();
  const maxExistingDateStr =
    sortedExistingDates.length > 0
      ? sortedExistingDates[sortedExistingDates.length - 1]
      : null;

  const defaultSuggestedDate = (() => {
    if (maxExistingDateStr) {
      const nextDay = new Date(maxExistingDateStr);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay;
    }
    return new Date();
  })();

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) return true;

    if (maxExistingDateStr) {
      const maxExisting = new Date(maxExistingDateStr);
      maxExisting.setHours(0, 0, 0, 0);
      if (checkDate <= maxExisting) return true;
    }

    return false;
  };

  const destinations = (destinationsResponse?.data || []).filter((dest: any) => {
    const translation =
      dest.translations?.find((tr: any) => tr.language_code === locale) ||
      dest.translations?.[0];
    const destName = (translation?.name || "").toLowerCase();
    const destLoc = (dest.location || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    // 1. Search Query
    if (query) {
      const matchesQuery = destName.includes(query) || destLoc.includes(query);
      if (!matchesQuery) return false;
    }

    // 2. Filter by same country & state if adding to an existing itinerary card
    if (isAddingToExistingCard) {
      let isMatched = false;

      if (stateId && dest.state_id && dest.state_id === stateId) {
        isMatched = true;
      }

      if (countryId && dest.country_id && dest.country_id === countryId) {
        isMatched = true;
      }

      if (location && location.trim()) {
        const locLower = location.toLowerCase().trim();
        const tokens = locLower.split(/[\s,]+/).filter((t) => t.length > 2);

        if (
          destLoc.includes(locLower) ||
          locLower.includes(destLoc) ||
          tokens.some((token) => destLoc.includes(token))
        ) {
          isMatched = true;
        }
      }

      return isMatched;
    }

    return true;
  });

  const handleAddDestination = async (destinationId: string) => {
    const date = selectedDates[destinationId] || defaultSuggestedDate || new Date();

    try {
      await addOrCreateItem({
        destination_id: destinationId,
        visit_date: date.toISOString()
      }).unwrap();

      toast.success(t("addSuccess"));
      onClose();
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
        } else if (
          errorBody.toLowerCase().includes("earlier than existing") ||
          errorBody.toLowerCase().includes("cannot be earlier than previous")
        ) {
          userFriendlyMessage = t("errorEarlierThanExisting");
        }
      }

      toast.error(userFriendlyMessage || t("addFailed"));
    }
  };

  const renderContent = () => (
    <>
      <div className="relative mb-3 shrink-0">
        <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-xs sm:text-sm bg-slate-50 border-slate-200 rounded-xl"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-0.5">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : destinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-12 text-center">
            <Icon name="Map" className="size-12 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              {isAddingToExistingCard
                ? t("emptyFilteredTitle", { location: location || "" })
                : t("emptyAllTitle")}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isAddingToExistingCard
                ? t("emptyFilteredHint")
                : t("emptyAllHint")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {destinations.map((dest: any) => {
              const translation =
                dest.translations?.find((tr: any) => tr.language_code === locale) ||
                dest.translations?.[0];
              const destName = translation?.name || "Destinasi Tour";
              const destImage =
                dest.thumbnail || translation?.thumbnail || "/images/turkey-destination.jpg";
              const rawPrice = parseFloat(dest.price) || 0;

              const targetDate = selectedDates[dest.id] || defaultSuggestedDate;

              return (
                <div
                  key={dest.id}
                  className="flex flex-col rounded-2xl border border-slate-100 bg-white p-3 shadow-sm hover:shadow-md transition-all">
                  <div className="flex gap-3">
                    <div className="relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <ImageWithFallback
                        src={destImage}
                        alt={destName}
                        fill
                        className="object-cover"
                        fallbackSrc="/images/turkey-destination.jpg"
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">
                        {destName}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {dest.location}
                      </p>
                      <p className="mt-auto text-xs sm:text-sm font-bold text-blue-600">
                        {formatPrice(rawPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                    <div className="flex-1">
                      <DatePicker
                        date={targetDate}
                        setDate={(date) =>
                          setSelectedDates((prev) => ({ ...prev, [dest.id]: date }))
                        }
                        disabled={isDateDisabled}
                        className="w-full h-8 sm:h-9 text-xs rounded-xl"
                      />
                    </div>
                    <Button
                      onClick={() => handleAddDestination(dest.id)}
                      disabled={isAdding}
                      className="font-bold bg-blue-600 hover:bg-blue-700 text-white h-8 sm:h-9 px-3.5 rounded-xl text-xs active:scale-95">
                      {t("addBtn")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  // ── Mobile / Tablet View: Bottom Sheet Drawer ─────────────────────────────
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85vh] flex flex-col rounded-t-[28px] bg-white">
          <DrawerHeader className="px-5 py-3.5 border-b border-slate-100 shrink-0 !text-left">
            <DrawerTitle className="text-base font-bold text-slate-900 !text-left">
              {isAddingToExistingCard
                ? t("modalAddTitle", { location: location || "" })
                : t("modalNewTitle")}
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-hidden flex flex-col p-4">
            {renderContent()}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // ── Desktop View: Centered Modal (Dialog) ──────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[95vw] sm:max-w-3xl flex flex-col p-0 overflow-hidden rounded-2xl md:rounded-3xl">
        <DialogHeader className="px-5 py-4 border-b border-slate-100 shrink-0">
          <DialogTitle className="text-lg md:text-xl font-bold text-slate-900">
            {isAddingToExistingCard
              ? t("modalAddTitle", { location: location || "" })
              : t("modalNewTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-4 md:p-6">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
