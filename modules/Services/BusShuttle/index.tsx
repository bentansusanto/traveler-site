"use client";

import { Bus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ServiceCatalogTemplate } from "../Shared/ServiceCatalogTemplate";

export const BusShuttlePage = () => {
  const t = useTranslations("BusShuttle");

  return (
    <ServiceCatalogTemplate
      serviceName={t("serviceName")}
      heroTitle={t("heroTitle")}
      heroSubtitle={t("heroSubtitle")}
      heroImage="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt={t("serviceName")}
      searchPlaceholder={t("searchPlaceholder")}
      catalogTitle={t("catalogTitle")}
      catalogSubtitle={t("catalogSubtitle")}
      icon={Bus}
      categories={[
        { id: "all", name: t("categories.all"), count: 0 },
        { id: "microbus", name: t("categories.microbus"), count: 0 },
        { id: "medium_bus", name: t("categories.medium_bus"), count: 0 },
        { id: "big_bus", name: t("categories.big_bus"), count: 0 },
        { id: "airport_shuttle", name: t("categories.airport_shuttle"), count: 0 }
      ]}
      emptyTitle={t("emptyTitle")}
      emptyDesc={t("emptyDesc")}
    />
  );
};
