import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import { generateMeta } from "@/lib/utils";
import { FlightPage } from "@/modules/Services/Flight";
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
      ? "PacificTravelindo - Tiket Pesawat Domestik & Internasional"
      : isTr
      ? "PacificTravelindo - Yurt İçi & Yurt Dışı Uçak Bileti"
      : "PacificTravelindo - Domestic & International Flight Tickets",
    description: isId
      ? "Pesan tiket pesawat resmi maskapai terbaik dunia dengan harga kompetitif, rute fleksibel, dan bantuan IATA berlisensi di PacificTravelindo."
      : isTr
      ? "Dünyanın en iyi havayollarından en uygun fiyatlı yurt içi ve yurt dışı uçak biletlerini güvenle ayırtın."
      : "Book airline tickets for major domestic and international airlines with official IATA certified assistance and competitive fares.",
    keywords: ["flight", "tiket pesawat", "pesawat", "airline tickets", "iata", "pacifictravelindo"]
  });
}

export default async function FlightRoutePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <TravelerLayout hideLayoutOnMobile={true}>
      <FlightPage />
    </TravelerLayout>
  );
}
