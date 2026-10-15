import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/languages/i18n.ts");

const nextConfig: NextConfig = {
  trailingSlash: true,
  devIndicators: false,
  output: process.env.VERCEL ? undefined : "standalone",
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
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
