import { routing } from "@/lib/languages/routing";
import { ReduxProvider } from "@/store/services/ReduxProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { Metadata } from "next";
import { generateMeta } from "@/lib/utils";
import "../globals.css";
import MaintenancePage from "./(guest)/maintenance/page";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = generateMeta({
  title: "PacificTravelindo - Best Travel Agency",
  description: "Let's travel together with PacificTravelindo, the best travel agency in Indonesia",
  keywords: ["travel", "pacifictravelindo", "tour", "sewa motor", "holiday"]
});

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Ensure that the incoming `locale` is valid
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale });
  const isMaintenance = process.env.NEXT_PUBLIC_IS_MAINTENANCE === "true";
  if (isMaintenance) {
    return (
      <html lang={locale} suppressHydrationWarning>
        <body className={`${inter.className} bg-slate-50 text-slate-900`}>
          <MaintenancePage />
        </body>
      </html>
    );
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReduxProvider>
            {children}
            <Toaster position="top-center" richColors />
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
