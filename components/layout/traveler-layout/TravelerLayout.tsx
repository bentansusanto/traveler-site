"use client";
import { UseRefreshToken } from "@/hooks/useRefreshToken";
import React from "react";
import { Footer } from "./Footer";
import { MobileBottomNavbar } from "./MobileBottomNavbar";
import { Navbar } from "./Navbar";

export const TravelerLayout = ({
  children,
  hideLayoutOnMobile = false
}: {
  children: React.ReactNode;
  hideLayoutOnMobile?: boolean;
}) => {
  // Auto refresh token on mount and periodically
  UseRefreshToken();

  return (
    <>
      <div className={hideLayoutOnMobile ? "hidden md:block" : ""}>
        <Navbar />
      </div>
      <main className="md:pb-0">{children}</main>
      <div className={hideLayoutOnMobile ? "hidden md:block" : ""}>
        <Footer />
      </div>
      {!hideLayoutOnMobile && <MobileBottomNavbar />}
    </>
  );
};
