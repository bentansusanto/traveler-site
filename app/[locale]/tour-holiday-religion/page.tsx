import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import { generateMeta } from "@/lib/utils";
import { DestinationPage } from "@/modules/Services/TourHolidayReligion/DestinationPage";
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

  return generateMeta({
    title: isId
      ? "PacificTravelindo - Tour Wisata & Religi"
      : "PacificTravelindo - Tour Holiday Religion",
    description: isId
      ? "Jelajahi paket tour liburan dan wisata religi terbaik bersama PacificTravelindo."
      : "Let's travel together with PacificTravelindo, the best travel agency in Indonesia.",
    keywords: ["tour", "travel", "holiday", "wisata religi", "pacifictravelindo"]
  });
}

export default async function TourHolidayReligionPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <TravelerLayout hideLayoutOnMobile={true}>
      <DestinationPage />
    </TravelerLayout>
  );
}
