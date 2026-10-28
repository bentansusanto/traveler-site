"use client";

import { Activity } from "lucide-react";
import { useTranslations } from "next-intl";
import { ServiceCatalogTemplate } from "../Shared/ServiceCatalogTemplate";

export const HealthTourismPage = () => {
  const t = useTranslations("HealthTourism");

  return (
    <ServiceCatalogTemplate
      serviceName={t("serviceName")}
      heroTitle={t("heroTitle")}
      heroSubtitle={t("heroSubtitle")}
      heroImage="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt={t("serviceName")}
      searchPlaceholder={t("searchPlaceholder")}
      catalogTitle={t("catalogTitle")}
      catalogSubtitle={t("catalogSubtitle")}
      icon={Activity}
      categories={[
        { id: "all", name: t("categories.all"), count: 0 },
        { id: "hair_transplant", name: t("categories.hair_transplant"), count: 0 },
        { id: "dental", name: t("categories.dental"), count: 0 },
        { id: "checkup", name: t("categories.checkup"), count: 0 },
        { id: "wellness", name: t("categories.wellness"), count: 0 },
        { id: "eye_care", name: t("categories.eye_care"), count: 0 }
      ]}
      emptyTitle={t("emptyTitle")}
      emptyDesc={t("emptyDesc")}
    />
  );
};
