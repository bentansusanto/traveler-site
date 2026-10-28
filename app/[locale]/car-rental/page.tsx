import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import { generateMeta } from "@/lib/utils";
import { RentCarPage } from "@/modules/Services/RentCar";
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
      ? "PacificTravelindo - Sewa Mobil & Rental Mobil Terpercaya"
      : isTr
      ? "PacificTravelindo - Araç Kiralama & VIP Transfer"
      : "PacificTravelindo - Reliable Car Rental & Chauffeur Services",
    description: isId
      ? "Layanan rental mobil lepas kunci atau dengan supir profesional terpercaya, armada lengkap dan terawat bersama PacificTravelindo."
      : isTr
      ? "PacificTravelindo ile konforlu, bakımlı araç filosu ve profesyonel şoförlü transfer hizmetleri."
      : "Enjoy reliable car rentals and VIP airport transfers with well-maintained fleet and professional drivers.",
    keywords: ["rent car", "sewa mobil", "rental mobil", "car rental", "pacifictravelindo"]
  });
}

export default async function CarRentalRoutePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <TravelerLayout hideLayoutOnMobile={true}>
      <RentCarPage />
    </TravelerLayout>
  );
}
