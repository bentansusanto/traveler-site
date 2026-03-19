import { generateMeta } from "@/lib/utils";
import { MotorBikeDetailPage } from "@/modules/MotorBike/Details";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "PacificTravelindo - Rent Motorcycle",
    description:
      "Sewa motor terpercaya dengan harga terjangkau bersama PacificTravelindo.",
    keywords: ["motor", "rent motorcycle", "sewa motor", "pacifictravelindo"]
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MotorBikeDetailPage />;
}
