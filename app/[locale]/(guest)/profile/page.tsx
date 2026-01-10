import { generateMeta } from "@/lib/utils";
import { ProfilePage } from "@/modules/Profile";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "PacificTravelindo - Profile",
    description:
      "Let's travel together with PacificTravelindo, the best travel agency in Indonesia",
    keywords: ["travel", "pacifictravelindo", "traveling", "traveling with PacificTravelindo"]
  });
}

export default async function ProfilePageV1({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProfilePage />;
}
