import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import { generateMeta } from "@/lib/utils";
import { BusShuttlePage } from "@/modules/Services/BusShuttle";
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
      ? "PacificTravelindo - Sewa Bus & Shuttle Antar Kota"
      : isTr
      ? "PacificTravelindo - Otobüs Kiralama & Şehirlerarası Servis"
      : "PacificTravelindo - Charter Bus & Intercity Shuttle Services",
    description: isId
      ? "Sewa bus pariwisata eksekutif dan shuttle antar kota nyaman untuk rombongan keluarga, gathering kantor, dan ziarah bersama PacificTravelindo."
      : isTr
      ? "PacificTravelindo ile grup seyahatleri, şirket etkinlikleri ve konforlu servis turları için otobüs kiralama."
      : "Charter luxury tourist buses and point-to-point shuttle transportation for corporate groups and family outings.",
    keywords: ["bus", "shuttle", "sewa bus", "bus pariwisata", "charter bus", "pacifictravelindo"]
  });
}

export default async function BusShuttleRoutePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <TravelerLayout hideLayoutOnMobile={true}>
      <BusShuttlePage />
    </TravelerLayout>
  );
}
