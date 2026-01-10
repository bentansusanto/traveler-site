import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/languages/i18n.ts");

const nextConfig: NextConfig = {
  trailingSlash: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      },
      {
        protocol: "http",
        hostname: "**"
      }
    ],
    unoptimized: true
  }
};

export default withNextIntl(nextConfig);
