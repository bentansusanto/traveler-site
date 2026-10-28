"use client";

import { Plane } from "lucide-react";
import { useTranslations } from "next-intl";
import { ServiceCatalogTemplate } from "../Shared/ServiceCatalogTemplate";

export const FlightPage = () => {
  const t = useTranslations("Flight");

  return (
    <ServiceCatalogTemplate
      serviceName={t("serviceName")}
      heroTitle={t("heroTitle")}
      heroSubtitle={t("heroSubtitle")}
      heroImage="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt={t("serviceName")}
      searchPlaceholder={t("searchPlaceholder")}
      catalogTitle={t("catalogTitle")}
      catalogSubtitle={t("catalogSubtitle")}
      icon={Plane}
      categories={[
        { id: "all", name: t("categories.all"), count: 0 },
        { id: "domestic", name: t("categories.domestic"), count: 0 },
        { id: "international", name: t("categories.international"), count: 0 },
        { id: "umrah_haji", name: t("categories.umrah_haji"), count: 0 },
        { id: "transit", name: t("categories.transit"), count: 0 }
      ]}
      emptyTitle={t("emptyTitle")}
      emptyDesc={t("emptyDesc")}
    />
  );
};
