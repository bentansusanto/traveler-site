"use client";

import { Hotel } from "lucide-react";
import { useTranslations } from "next-intl";
import { ServiceCatalogTemplate } from "../Shared/ServiceCatalogTemplate";

export const HotelsPage = () => {
  const t = useTranslations("Hotels");

  return (
    <ServiceCatalogTemplate
      serviceName={t("serviceName")}
      heroTitle={t("heroTitle")}
      heroSubtitle={t("heroSubtitle")}
      heroImage="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt={t("serviceName")}
      searchPlaceholder={t("searchPlaceholder")}
      catalogTitle={t("catalogTitle")}
      catalogSubtitle={t("catalogSubtitle")}
      icon={Hotel}
      categories={[
        { id: "all", name: t("categories.all"), count: 0 },
        { id: "star_5", name: t("categories.star_5"), count: 0 },
        { id: "star_4", name: t("categories.star_4"), count: 0 },
        { id: "resort", name: t("categories.resort"), count: 0 },
        { id: "boutique", name: t("categories.boutique"), count: 0 },
        { id: "budget", name: t("categories.budget"), count: 0 }
      ]}
      emptyTitle={t("emptyTitle")}
      emptyDesc={t("emptyDesc")}
    />
  );
};
