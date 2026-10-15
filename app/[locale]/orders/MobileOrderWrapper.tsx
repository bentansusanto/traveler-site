"use client";

import { useRouter } from "@/lib/languages/routing";
import { OrderPageMobile } from "@/modules/OrdersMobile";
import { useEffect, useState } from "react";

const DESKTOP_BREAKPOINT = 1024;

export const MobileOrderWrapper = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkDevice = () => {
      const desktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      setIsDesktop(desktop);
      if (desktop) {
        router.replace("/profile?tab=orders");
      }
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, [router]);

  if (!mounted) return null;

  if (isDesktop || (typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT)) {
    return null;
  }

  return <OrderPageMobile />;
};
