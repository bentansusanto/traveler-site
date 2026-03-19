import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import { MotorBikePage } from "@/modules/MotorBike/MotorBikePage";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
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
      <MotorBikePage />
    </TravelerLayout>
  );
}
