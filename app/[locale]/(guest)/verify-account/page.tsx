import { VerifyAccount } from "@/modules/Authentication/VerifyAccount";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
}

export default async function VerifyAccountV1({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <VerifyAccount />;
}
