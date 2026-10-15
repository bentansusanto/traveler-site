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
    title: "PacificTravelindo - Order Tour",
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
  const bookTourId = resolvedSearchParams.book_tour_id;

  if (!bookTourId || typeof bookTourId !== "string") {
    redirect(`/${locale}/itineraries`);
  }

  return <OrderTourPage bookTourId={bookTourId} />;
}
