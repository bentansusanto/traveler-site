import { redirect } from "next/navigation";

export default async function TourAliasPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/tour-holiday-religion`);
}
