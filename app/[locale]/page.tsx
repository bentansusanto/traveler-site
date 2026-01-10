import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import { generateMeta } from "@/lib/utils";
import { Homepage } from "@/modules/Homepage/Homepage";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "PacificTravelindo - Homepage",
    description:
      "Let's travel together with PacificTravelindo, the best travel agency in Indonesia",
    keywords: ["travel", "pacifictravelindo", "traveling", "traveling with PacificTravelindo"]
  });
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <TravelerLayout>
      <Homepage />
    </TravelerLayout>
  );
}
