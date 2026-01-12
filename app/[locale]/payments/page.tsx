import { generateMeta } from "@/lib/utils";
import { PaymentPage } from "@/modules/Payments";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "PacificTravelindo - Payments",
    description:
      "Let's travel together with PacificTravelindo, the best travel agency in Indonesia",
    keywords: ["travel", "pacifictravelindo", "traveling", "traveling with PacificTravelindo"]
  });
}

export default async function PaymentPageV1({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { locale } = await params;
  const { order_id } = await searchParams;

  if (!order_id) {
    redirect(`/${locale}`);
  }

  return <PaymentPage orderId={order_id} />;
}
