import { generateMeta } from "@/lib/utils";
import { ForgotPasswordPage } from "@/modules/Authentication/ForgotPassword";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Forgot Password",
    description:
      "A login form with email and password. There's an option to login with Google and a link to sign up if you don't have an account."
  });
}
export default async function ForgotPasswordPageV1({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ForgotPasswordPage />;
}
