import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import { generateMeta } from "@/lib/utils";
import { EntertainmentModule } from "@/modules/Entertainment";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isId = locale === "id";
  const isTr = locale === "tr";

  const title = isId
    ? "PacificTravelindo - Tiket Atraksi & Hiburan"
    : isTr
    ? "PacificTravelindo - Eğlence & Turistik Yerler Biletleri"
    : "PacificTravelindo - Entertainment & Attraction Tickets";

  const description = isId
    ? "Pesan tiket resmi atraksi wisata populer, balon udara kelas dunia, taman hiburan, dan pengalaman tak terlupakan bersama PacificTravelindo."
    : isTr
    ? "PacificTravelindo ile popüler turistik yerler, dünyaca ünlü sıcak hava balonları, tema parkları ve unutulmaz deneyimler için bilet ayırtın."
    : "Book official admission tickets for top attractions, world-famous hot air balloons, theme parks, and unforgettable experiences with PacificTravelindo.";

  return generateMeta({
    title,
    description,
    keywords: [
      "attractions",
      "entertainment",
      "tickets",
      "hot air balloon",
      "cappadocia",
      "theme parks",
      "shows",
      "tiket atraksi",
      "hiburan",
      "pacifictravelindo"
    ]
  });
}

export default async function EntertainmentAttractionPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <TravelerLayout hideLayoutOnMobile={true}>
      <EntertainmentModule />
    </TravelerLayout>
  );
}
