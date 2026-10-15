import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { OrderRentMotorPage } from "@/modules/Booking/BookingMotor";

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
      ? "Checkout Rental Motor - PacificTravelindo"
      : isTr
      ? "Motosiklet Kiralama Ödemesi - PacificTravelindo"
      : "Motorcycle Rental Checkout - PacificTravelindo",
    description: isId
      ? "Sewa motor dengan mudah di PacificTravelindo. Pilih durasi dan lengkapi data diri Anda."
      : isTr
      ? "PacificTravelindo ile kolayca motosiklet kiralayın. Kiralama sürenizi seçin ve bilgilerinizi tamamlayın."
      : "Rent a motorcycle easily with PacificTravelindo. Choose duration and complete your details.",
  });
}

import { Suspense } from "react";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderRentMotorPage />
    </Suspense>
  );
}
