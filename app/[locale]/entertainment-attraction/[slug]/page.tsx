import { generateMeta } from "@/lib/utils";
import { EntertainmentDetailPage } from "@/modules/Entertainment/Details";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isId = locale === "id";
  const isTr = locale === "tr";

  return generateMeta({
    title: isId
      ? "PacificTravelindo - Detail Tiket Atraksi & Hiburan"
      : isTr
      ? "PacificTravelindo - Eğlence & Turistik Yerler Bilet Detayları"
      : "PacificTravelindo - Entertainment & Attraction Ticket Details",
    description: isId
      ? "Pesan tiket resmi untuk berbagai atraksi populer bersama PacificTravelindo."
      : isTr
      ? "PacificTravelindo ile popüler turistik yerler ve etkinlikler için resmi biletinizi ayırtın."
      : "Book verified admission tickets for top attractions and entertainment with PacificTravelindo.",
    keywords: [
      "attraction",
      "entertainment",
      "tickets",
      "booking",
      "pacifictravelindo"
    ]
  });
}

export default async function Page({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <EntertainmentDetailPage />;
}
