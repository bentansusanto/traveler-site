import { generateMeta } from "@/lib/utils";
import { LoginPage } from "@/modules/Authentication/Login";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Login Page",
    description:
      "A login form with email and password. There's an option to login with Google and a link to sign up if you don't have an account."
  });
}

export default async function LoginPageV1({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LoginPage />;
}
