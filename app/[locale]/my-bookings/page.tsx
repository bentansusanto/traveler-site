import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MobileBookingWrapper } from "./MobileBookingWrapper";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "PacificTravelindo - Order Tour",
    description:
      "Let's travel together with PacificTravelindo, the best travel agency in Indonesia",
    keywords: ["travel", "pacifictravelindo", "traveling", "traveling with PacificTravelindo"]
  });
}

export default async function BookingTourPageMobile(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MobileBookingWrapper />;
}
