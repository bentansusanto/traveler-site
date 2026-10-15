import { generateMeta } from "@/lib/utils";
import { OrderEntertainmentPage } from "@/modules/Booking/BookingEntertainment";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isId = locale === "id";
  const isTr = locale === "tr";

  return generateMeta({
    title: isId
      ? "Checkout Tiket Atraksi - PacificTravelindo"
      : isTr
      ? "Etkinlik Bileti Ödemesi - PacificTravelindo"
      : "Attraction Ticket Checkout - PacificTravelindo",
    description: isId
      ? "Lengkapi data pemesan dan pengunjung untuk konfirmasi tiket atraksi Anda."
      : isTr
      ? "Etkinlik rezervasyonunuzu tamamlayın."
      : "Complete your attraction ticket booking.",
    keywords: ["travel", "entertainment", "tickets", "booking", "pacifictravelindo"]
  });
}

export default async function Page({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs text-slate-500">
          Loading checkout details...
        </div>
      }
    >
      <OrderEntertainmentPage />
    </Suspense>
  );
}
