"use client";

import { useLogoutMutation } from "@/store/services/auth.service";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useLogout = () => {
  const router = useRouter();
  const [logout, { isLoading }] = useLogoutMutation();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleLogout = async () => {
    try {
      setStatusMessage(null);

      // Call logout API
      const response = await logout().unwrap();

      // Clear token from cookies
      Cookies.remove("travel_token");

      // Show success message
      setStatusMessage({
        type: "success",
        message: response.message || "Logout successful"
      });

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 500);
    } catch (error: any) {
      // Even if API fails, still clear token and redirect
      Cookies.remove("travel_token");

      setStatusMessage({
        type: "error",
        message: error?.data?.message || "Logout failed, but you've been logged out locally"
      });

      // Redirect anyway
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    }
  };

  return {
    handleLogout,
    isLoading,
    statusMessage
  };
};
