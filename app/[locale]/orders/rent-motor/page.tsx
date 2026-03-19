import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { OrderRentMotorPage } from "@/modules/Tourist/OrderRentMotor";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Checkout Rental Motor - PacificTravelindo",
    description: "Sewa motor dengan mudah di PacificTravelindo. Pilih durasi dan lengkapi data diri Anda.",
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
