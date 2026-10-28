"use client";

import { Car } from "lucide-react";
import { useTranslations } from "next-intl";
import { ServiceCatalogTemplate } from "../Shared/ServiceCatalogTemplate";

export const RentCarPage = () => {
  const t = useTranslations("RentCar");

  return (
    <ServiceCatalogTemplate
      serviceName={t("serviceName")}
      heroTitle={t("heroTitle")}
      heroSubtitle={t("heroSubtitle")}
      heroImage="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt={t("serviceName")}
      searchPlaceholder={t("searchPlaceholder")}
      catalogTitle={t("catalogTitle")}
      catalogSubtitle={t("catalogSubtitle")}
      icon={Car}
      categories={[
        { id: "all", name: t("categories.all"), count: 0 },
        { id: "family_mpv", name: t("categories.family_mpv"), count: 0 },
        { id: "luxury_mpv", name: t("categories.luxury_mpv"), count: 0 },
        { id: "suv", name: t("categories.suv"), count: 0 },
        { id: "city_car", name: t("categories.city_car"), count: 0 },
        { id: "sedan", name: t("categories.sedan"), count: 0 }
      ]}
      emptyTitle={t("emptyTitle")}
      emptyDesc={t("emptyDesc")}
    />
  );
};
