"use client";

import Icon from "@/components/icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslations } from "next-intl";
import Image from "next/image";

export const WhyChooseUs = () => {
  const isMobile = useIsMobile();
  const t = useTranslations("WhyChooseUs");

  const features = [
    t("features.allInOne"),
    t("features.professional"),
    t("features.multiTrip"),
    t("features.flexible")
  ];

  return (
    <div className="mt-3 bg-white px-5 py-5 md:mt-20 md:bg-transparent md:px-8 lg:mx-auto lg:max-w-5xl lg:px-0 xl:max-w-[1400px]">
      <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12 lg:gap-16">
        {/* Left Side - Illustration (Desktop Only) */}
        {!isMobile && (
          <div className="relative w-full md:w-1/2">
            <Image
              src="/images/image-why-choose-us.png"
              alt="Why Choose Us Illustration"
              width={500}
              height={400}
              className="h-auto w-full"
              priority
            />
          </div>
        )}

        {/* Right Side - Content */}
        <div className="w-full md:w-1/2">
          {/* Title Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-orange-500 md:text-base">
              {t("sectionTag")}
            </h3>
            <h2 className="text-xl leading-tight font-bold text-gray-900 md:text-3xl lg:text-4xl">
              {t("title")}
            </h2>

            {/* Image for Mobile - Between Title and Description */}
            {isMobile && (
              <div className="relative w-full py-4">
                <Image
                  src="/images/image-why-choose-us.png"
                  alt="Why Choose Us Illustration"
                  width={500}
                  height={400}
                  className="h-auto w-full"
                  priority
                />
              </div>
            )}

            <p className="text-sm text-gray-500 md:text-base">{t("description")}</p>
          </div>

          {/* Features List */}
          <div className="mt-6 space-y-3 md:mt-8">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500 md:size-6">
                  <Icon name="Check" className="size-3 text-white md:size-4" />
                </div>
                <span className="text-sm font-medium text-gray-800 md:text-base">{feature}</span>
              </div>
            ))}
          </div>

          {/* Book Now Button */}
          <div className="mt-6 hidden md:mt-8 md:block">
            <button className="rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600 md:px-8 md:text-base">
              {t("bookNow")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
