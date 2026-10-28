import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import { generateMeta } from "@/lib/utils";
import { HealthTourismPage } from "@/modules/Services/HealthTourism";
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
      ? "PacificTravelindo - Wisata Medis & Kesehatan Dunia"
      : isTr
      ? "PacificTravelindo - Sağlık Turizmi & Medikal Danışmanlık"
      : "PacificTravelindo - World Health Tourism & Medical Travel",
    description: isId
      ? "Paket terpadu wisata medis, transplantasi rambut di Turki, estetika gigi, medical check-up, dan wellness dengan pendamping profesional bersama PacificTravelindo."
      : isTr
      ? "Saç ekimi, diş estetiği ve check-up için uluslararası akredite hastanelerle eksiksiz medikal turizm paketleri."
      : "Comprehensive medical tourism packages for hair transplant in Turkey, cosmetic dentistry, checkups, and wellness retreat.",
    keywords: ["health tourism", "wisata medis", "hair transplant turki", "medical travel", "wellness", "pacifictravelindo"]
  });
}

export default async function HealthTourismRoutePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <TravelerLayout hideLayoutOnMobile={true}>
      <HealthTourismPage />
    </TravelerLayout>
  );
}
