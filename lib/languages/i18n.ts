import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as any)) {
    console.warn(`[i18n] Invalid locale received: "${locale}". Falling back to default.`);
    // notFound(); // Temporarily disabled for debugging
  }

  const finalLocale = routing.locales.includes(locale as any) ? locale : routing.defaultLocale;

  console.log(`[i18n] Loading messages for: "${finalLocale}"`);

  return {
    locale: finalLocale as string,
    messages: (await import(`@/messages/${finalLocale}.json`)).default
  };
});
