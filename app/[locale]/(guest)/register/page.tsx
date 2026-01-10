import { generateMeta } from "@/lib/utils";
import { RegisterPage } from "@/modules/Authentication/Register";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Register Page",
    description:
      "A login form with email and password. There's an option to login with Google and a link to sign up if you don't have an account."
  });
}

export default async function RegisterPageV1({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RegisterPage />;
}
