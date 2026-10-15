import { generateMeta } from "@/lib/utils";
import { DocumentVisaDetailPage } from "@/modules/DocumentVisa";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }, { locale: "tr" }];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isId = locale === "id";
  const isTr = locale === "tr";

  return generateMeta({
    title: isId
      ? "PacificTravelindo - Layanan Dokumen & Visa Internasional"
      : isTr
      ? "PacificTravelindo - Uluslararası Belge & Vize Danışmanlığı"
      : "PacificTravelindo - International Document & Visa Services",
    description: isId
      ? "Layanan pengurusan visa resmi, audit verifikasi berkas, dan booking slot janji temu kedutaan bersama PacificTravelindo."
      : isTr
      ? "PacificTravelindo ile resmi vize işlemleri, evrak kontrolü ve elçilik randevu alma hizmeti."
      : "Official visa assistance, meticulous document auditing, and embassy slot reservation with PacificTravelindo.",
    keywords: [
      "visa",
      "document visa",
      "visa service",
      "visa jepang",
      "visa schengen",
      "visa eropa",
      "visa amerika",
      "visa saudi umrah",
      "e-paspor",
      "pacifictravelindo"
    ]
  });
}

export default async function Page({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DocumentVisaDetailPage />;
}
