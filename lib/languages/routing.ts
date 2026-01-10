import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "id"],

  // Used when no locale matches
  defaultLocale: "id",
  localePrefix: "always",

  // Enable locale detection to ensure proper redirects
  localeDetection: true
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
