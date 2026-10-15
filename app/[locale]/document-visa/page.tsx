import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import { generateMeta } from "@/lib/utils";
import { DocumentVisaPage } from "@/modules/DocumentVisa";
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

  const title = isId
    ? "PacificTravelindo - Layanan Dokumen & Visa Internasional"
    : isTr
    ? "PacificTravelindo - Uluslararası Belge & Vize Danışmanlığı"
    : "PacificTravelindo - International Document & Visa Services";

  const description = isId
    ? "Jasa pengurusan visa turis, bisnis, umrah resmi, dan paspor terpercaya bersama PacificTravelindo."
    : isTr
    ? "PacificTravelindo ile turistik, ticari, umre vizeleri ve pasaport işlemleri için güvenilir danışmanlık."
    : "Trusted visa and passport assistance for international tourism, business, and pilgrimages with PacificTravelindo.";

  return generateMeta({
    title,
    description,
    keywords: [
      "visa",
      "visa jepang",
      "visa schengen",
      "visa amerika",
      "visa saudi umrah",
      "e-paspor",
      "document visa",
      "documents visa",
      "jasa visa",
      "pacifictravelindo"
    ]
  });
}

export default async function DocumentVisaAliasPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <TravelerLayout hideLayoutOnMobile={true}>
      <DocumentVisaPage />
    </TravelerLayout>
  );
}
