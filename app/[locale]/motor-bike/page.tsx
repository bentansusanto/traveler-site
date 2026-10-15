import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import { generateMeta } from "@/lib/utils";
import { MotorBikePage } from "@/modules/MotorBike/MotorBikePage";
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
      ? "PacificTravelindo - Sewa Motor"
      : "PacificTravelindo - Rent Motorcycle",
    description: isId
      ? "Sewa motor terpercaya dengan harga terjangkau bersama PacificTravelindo."
      : "Reliable and affordable motorbike rental service with PacificTravelindo.",
    keywords: [
      "motor",
      "rent motorcycle",
      "sewa motor",
      "rental motor",
      "pacifictravelindo"
    ]
  });
}

export default async function MotorBikeListPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <TravelerLayout hideLayoutOnMobile={true}>
      <MotorBikePage />
    </TravelerLayout>
  );
}
