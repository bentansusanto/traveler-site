"use client";

import Icon from "@/components/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
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
    skip: !!item?.destination || !item.destination_id
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

  const destination = item?.destination || destinationData?.data;
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
              <div className="mb-1 text-[10px] font-bold tracking-wider text-blue-500 uppercase">
                Day {dayRange || dayNumber}
              </div>

              {/* Destination name */}
              <h4 className="mb-1 text-sm font-bold text-gray-900">
                {translation?.name || "Destination"}
              </h4>

              {/* Icon Row for Details */}
              {/* {translation?.detail_tour && translation.detail_tour.length > 0 && (
                <div className="mb-2">
                  {translation.detail_tour.slice(0, 4).map((detail: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 rounded-full border border-blue-100/50 bg-blue-50/50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                      <Icon name={detail} className="h-2.5 w-2.5" />
                      <span className="capitalize">{detail}</span>
                    </div>
                  ))}
                </div>
              )} */}

              <div className="flex flex-col gap-1">
                {destination?.location && (
                  <p className="flex items-center text-[11px] text-gray-500">
                    <Icon name="MapPin" className="mr-1 h-3.5 w-3.5 text-gray-400" />
                    {destination.location}
                  </p>
                )}
                <p className="flex items-center text-[11px] text-gray-400">
                  <Icon name="Calendar" className="mr-1 h-3.5 w-3.5" />
                  {new Date(item.visit_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
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
          <div className="mt-3 rounded-lg border border-blue-100/50 bg-blue-50/50 p-4">
            <p className="mb-3 text-xs font-bold text-blue-800">Detail Rencana Perjalanan:</p>
            <ul className="space-y-3">
              {translation.detail_tour.map((detail: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-gray-700">
                  <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Icon name={detail} className="h-2.5 w-2.5" />
                  </div>
                  <span className="leading-relaxed capitalize">{detail}</span>
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
      <DialogContent className="flex max-h-[90vh] flex-col p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b p-6">
          <DialogTitle>Detail Booking</DialogTitle>
        </DialogHeader>

        <div className="shrink-0 border-b bg-gray-50/30 p-6">
          {/* Booking Info Card */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-gray-900">Informasi Booking</h3>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Booking ID:</span>
                <span className="font-mono font-medium text-blue-600">{data.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                    data.status?.toLowerCase() === "completed" ||
                      data.status?.toLowerCase() === "ongoing"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  )}>
                  {data.status}
                </span>
              </div>
              {data.country && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Negara:</span>
                  <span className="font-medium">{data.country.name}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2">
                <span className="font-semibold text-gray-900">Total Subtotal:</span>
                <span className="font-bold text-blue-600">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(parseFloat(data.subtotal))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Tour Itinerary Detail */}
          <div className="rounded-xl border border-gray-100 p-4">
            <h3 className="mb-4 text-sm font-bold text-gray-900">
              Detail Itinerary ({data.book_tour_items?.length || 0} Destinasi)
            </h3>
            <div className="space-y-0">
              {(() => {
                // Sort items by visit_date chronologically
                const items = data.book_tour_items || [];
                const sortedItems = [...items].sort((a: any, b: any) => {
                  const dateA = new Date(a.visit_date).getTime();
                  const dateB = new Date(b.visit_date).getTime();
                  if (dateA !== dateB) return dateA - dateB;
                  // Stable secondary sort using created_at
                  const seqA = new Date(a.created_at || 0).getTime();
                  const seqB = new Date(b.created_at || 0).getTime();
                  return seqA - seqB;
                });

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
