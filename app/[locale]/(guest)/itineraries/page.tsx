import { generateMeta } from "@/lib/utils";
import { ItinerariesPage } from "@/modules/Itineraries";
import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }, { locale: "tr" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "PacificTravelindo - My Itineraries",
    description: "Manage your trip plans and itineraries with PacificTravelindo",
    keywords: ["travel", "itinerary", "trip planner", "pacifictravelindo"]
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <TravelerLayout hideLayoutOnMobile={true}>
      <ItinerariesPage />
    </TravelerLayout>
  );
}
