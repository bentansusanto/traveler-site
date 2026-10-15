"use client";
import { DestinationSection } from "./Section/DestinationSection";
import { HeroSection } from "./Section/HeroSection";
import { PopularDestination } from "./Section/PopularDestination";
import { WhyChooseUs } from "./Section/WhyChooseUs";
import { CallToAction } from "./Section/CallToAction";

export const Homepage = () => {
  return (
    <>
      <HeroSection />
      <PopularDestination />
      <DestinationSection />
      <WhyChooseUs />
      <CallToAction />
    </>
  );
};
