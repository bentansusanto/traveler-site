import { generateMeta } from "@/lib/utils";
import { DestinationDetailsPage } from "@/modules/Services/TourHolidayReligion/Details";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "PacificTravelindo - Tour Holiday Religion",
    description:
      "Let's travel together with PacificTravelindo, the best travel agency in Indonesia",
    keywords: ["travel", "pacifictravelindo", "traveling", "traveling with PacificTravelindo"]
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DestinationDetailsPage />;
}
