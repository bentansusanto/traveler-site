import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import { generateMeta } from "@/lib/utils";
import { HotelsPage } from "@/modules/Services/Hotels";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }, { locale: "tr" }];
}

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
      ? "PacificTravelindo - Booking Hotel & Resort Terbaik Dunia"
      : isTr
      ? "PacificTravelindo - Otel & Tatil Köyü Rezervasyonu"
      : "PacificTravelindo - World-Class Hotel & Resort Bookings",
    description: isId
      ? "Pilihan hotel dan resort berbintang di lokasi strategis seluruh dunia dengan harga spesial dan voucher resmi instan bersama PacificTravelindo."
      : isTr
      ? "Popüler tatil ve iş merkezlerinde lüks oteller ve butik konaklama seçenekleri için hemen rezervasyon yapın."
      : "Reserve top-rated hotels, luxury resorts, and family suites worldwide with guaranteed vouchers and exclusive rates.",
    keywords: ["hotel", "hotels", "resort", "booking hotel", "voucher hotel", "pacifictravelindo"]
  });
}

export default async function HotelRoutePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <TravelerLayout hideLayoutOnMobile={true}>
      <HotelsPage />
    </TravelerLayout>
  );
}
