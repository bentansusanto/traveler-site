"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "@/lib/languages/routing";
import { OrderPageMobile } from "@/modules/OrdersMobile";
import { useEffect, useState } from "react";

export const MobileOrderWrapper = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isMobile && window.innerWidth >= 768) {
      router.push("/orders");
    }
  }, [isMobile, router]);

  if (!mounted) return null;

  if (!isMobile && typeof window !== "undefined" && window.innerWidth >= 768) {
    return null;
  }

  return <OrderPageMobile />;
};
