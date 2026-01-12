import { generateMeta } from "@/lib/utils";
import { OrderTourPage } from "@/modules/Orders/OrderTour";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "PacificTravelindo - Order Tour",
    description:
      "Let's travel together with PacificTravelindo, the best travel agency in Indonesia",
    keywords: ["travel", "pacifictravelindo", "traveling", "traveling with PacificTravelindo"]
  });
}

export default async function OrderTourPageV1({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ bookTourId?: string }>;
}) {
  const { locale } = await params;
  const { bookTourId } = await searchParams;

  setRequestLocale(locale);

  // Redirect if bookTourId is not provided
  if (!bookTourId) {
    redirect(`/${locale}`);
  }

  return <OrderTourPage bookTourId={bookTourId} />;
}
