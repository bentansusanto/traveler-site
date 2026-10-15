import { generateMeta } from "@/lib/utils";
import { OrderTourPage } from "@/modules/Booking/BookingTour";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }, { locale: "tr" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "PacificTravelindo - Book Tour",
    description: "Complete your tour booking details",
    keywords: ["travel", "booking", "tour", "pacifictravelindo"]
  });
}

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const resolvedSearchParams = await searchParams;
  const itineraryId = (resolvedSearchParams.itinerary_id || resolvedSearchParams.book_tour_id) as string;

  if (!itineraryId || typeof itineraryId !== "string") {
    redirect(`/${locale}/itineraries`);
  }

  return <OrderTourPage itineraryId={itineraryId} bookTourId={resolvedSearchParams.book_tour_id as string} />;
}
