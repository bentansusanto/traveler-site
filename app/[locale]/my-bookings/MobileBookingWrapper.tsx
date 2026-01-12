"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "@/lib/languages/routing";
import { MyBookingPageMobile } from "@/modules/BookingMobile";
import { useEffect, useState } from "react";

export const MobileBookingWrapper = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isMobile && window.innerWidth >= 768) {
      router.push("/profile");
    }
  }, [isMobile, router]);

  if (!mounted) return null;

  if (!isMobile && typeof window !== "undefined" && window.innerWidth >= 768) {
    return null;
  }

  return <MyBookingPageMobile />;
};
