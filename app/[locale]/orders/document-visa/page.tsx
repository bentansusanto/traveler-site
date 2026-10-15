import { generateMeta } from "@/lib/utils";
import { OrderDocumentVisaPage } from "@/modules/Booking/BookingDocumentVisa";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

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
      ? "Checkout Pengajuan Visa & Dokumen - PacificTravelindo"
      : isTr
      ? "Vize ve Belge Başvurusu - PacificTravelindo"
      : "Visa & Document Application Checkout - PacificTravelindo",
    description: isId
      ? "Lengkapi data pemesan dan data pemohon (applicant) untuk pengajuan visa & dokumen Anda."
      : isTr
      ? "Vize ve belge başvurusu için sipariş ve başvuru sahibi bilgilerini tamamlayın."
      : "Complete your booker and applicant information for your visa & document application.",
    keywords: ["travel", "visa", "document visa", "passport", "checkout", "pacifictravelindo"]
  });
}

export default async function Page({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs text-slate-500">
          Loading checkout details...
        </div>
      }
    >
      <OrderDocumentVisaPage />
    </Suspense>
  );
}
