"use client";

import { useRefreshTokenMutation } from "@/store/services/auth.service";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const UseRefreshToken = () => {
  const [refreshToken, { isLoading }] = useRefreshTokenMutation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const handleRefreshToken = useCallback(async () => {
    try {
      const token = Cookies.get("travel_token");

      if (!token) {
        return false;
      }

      // Call refresh token API
      const response = await refreshToken().unwrap();

      // Update token in cookie - prioritize 'session' field
      let newToken = null;

      if (response?.data?.session) {
        newToken = response.data.session;
      } else if (response?.session) {
        newToken = response.session;
      } else if (response?.data?.access_token) {
        newToken = response.data.access_token;
      } else if (response?.access_token) {
        newToken = response.access_token;
      }

      if (newToken) {
        Cookies.set("travel_token", newToken, {
          expires: 7,
          sameSite: "lax",
          path: "/"
        });
        console.log("Token refreshed successfully");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Refresh token failed:", error);
      // Clear invalid token
      Cookies.remove("travel_token");
      return false;
    }
  }, [refreshToken]);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto refresh on mount and periodically
  useEffect(() => {
    if (!mounted) return;

    const token = Cookies.get("travel_token");

    if (token) {
      // Delay initial refresh to avoid state update before mount
      const initialTimeout = setTimeout(() => {
        handleRefreshToken();
      }, 100);

      // Set up periodic refresh (every 30 minutes)
      const interval = setInterval(
        () => {
          handleRefreshToken();
        },
        30 * 60 * 1000
      ); // 30 minutes

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
      };
    }
  }, [mounted, handleRefreshToken]);

  return {
    refreshToken: handleRefreshToken,
    isLoading
  };
};
