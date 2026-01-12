"use client";

import Icon from "@/components/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFindDestinationIdQuery } from "@/store/services/destination.service";
import { useLocale } from "next-intl";
import { useState } from "react";

// Helper component for itinerary items
const TourItemDetail = ({
  item,
  index,
  locale,
  dayNumber,
  dayRange
}: {
  item: any;
  index: number;
  locale: string;
  dayNumber: number;
  dayRange?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: destinationData, isLoading } = useFindDestinationIdQuery(item.destination_id, {
    skip: !item.destination_id
  });

  if (isLoading) {
    return (
      <div className="border-l-2 border-blue-200 pl-4">
        <div className="animate-pulse">
          <div className="mb-2 h-5 w-3/4 rounded bg-gray-200"></div>
          <div className="h-4 w-1/2 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  const destination = destinationData?.data;
  const translation =
    destination?.translations?.find((tr: any) => tr.language_code === locale) ||
    destination?.translations?.[0];

  return (
    <div className="relative border-l-2 border-blue-300 pl-6">
      {/* Timeline dot */}
      <div className="absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2 border-blue-500 bg-white"></div>

      {/* Itinerary item */}
      <div className="pb-6">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="-ml-3 w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Day number */}
              <div className="mb-1 text-xs font-semibold text-blue-600">
                Day {dayRange || dayNumber}
              </div>

              {/* Destination name */}
              <h4 className="mb-1 font-semibold text-gray-900">
                {translation?.name || "Destination"}
              </h4>

              {/* Location */}
              {destination?.location && (
                <p className="mb-1 text-sm text-gray-500">
                  <Icon name="MapPin" className="mr-1 inline h-3 w-3" />
                  {destination.location}
                </p>
              )}

              {/* Visit Date */}
              <p className="text-sm text-gray-600">
                <Icon name="Calendar" className="mr-1 inline h-4 w-4" />
                {new Date(item.visit_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </p>
            </div>

            {/* Chevron icon */}
            <Icon
              name="ChevronDown"
              className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Expandable Detail Tour */}
        {isExpanded && translation?.detail_tour && translation.detail_tour.length > 0 && (
          <div className="mt-3 rounded-lg bg-blue-50 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">Itinerary Detail:</p>
            <ul className="space-y-2">
              {translation.detail_tour.map((detail: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span className="capitalize">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export const BookTourDetail = ({
  open,
  setOpen,
  data
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any;
}) => {
  const locale = useLocale();

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Info Card */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-medium">{data.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium capitalize">{data.status}</span>
              </div>
              {data.country && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Country:</span>
                  <span className="font-medium">{data.country.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-bold">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0
                  }).format(parseFloat(data.subtotal))}
                </span>
              </div>
            </div>
          </div>

          {/* Tour Itinerary */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-4 font-semibold text-gray-900">
              Tour Itinerary ({data.book_tour_items?.length || 0} destinations)
            </h3>
            <div className="space-y-0">
              {(() => {
                // Sort items by visit_date chronologically
                const items = data.book_tour_items || [];
                const sortedItems = [...items].sort(
                  (a: any, b: any) =>
                    new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
                );

                return sortedItems.map((item: any, index: number) => (
                  <TourItemDetail
                    key={item.id}
                    item={item}
                    index={index}
                    locale={locale}
                    dayNumber={index + 1}
                    dayRange={undefined}
                  />
                ));
              })()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
