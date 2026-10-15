"use client";

import { useTranslations } from "next-intl";
import { extractAuthErrorMessage } from "@/lib/auth-errors";
import { useResendVerifyUserMutation, useVerifyUserMutation } from "@/store/services/customer.service";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const HooksVerifyAccount = () => {
  const searchParams = useSearchParams();
  const t = useTranslations("Auth");
  const verifyToken = searchParams.get("verify_token");
  const [verifyUser] = useVerifyUserMutation();
  const [resendVerifyUser, { isLoading: isResending }] = useResendVerifyUserMutation();
  const [status, setStatus] = useState<{
    type: "success" | "error" | "loading" | "idle";
    message: string;
  }>({ type: "idle", message: "" });
  const [resendStatus, setResendStatus] = useState<{
    type: "success" | "error" | "idle";
    message: string;
  }>({ type: "idle", message: "" });

  const [storedEmail, setStoredEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStoredEmail(localStorage.getItem("travel_verify_email"));
    }
  }, []);

  const handleVerify = useCallback(async () => {
    if (!verifyToken) {
      setStatus({
        type: "error",
        message: "Verification code is missing."
      });
      return;
    }

    setStatus({ type: "loading", message: "Verifying your account..." });

    try {
      await verifyUser({ token: verifyToken }).unwrap();
      setStatus({
        type: "success",
        message: t("verificationSuccess")
      });
    } catch (err: any) {
      setStatus({
        type: "error",
        message: extractAuthErrorMessage(err, t) || t("verificationFailed")
      });
    }
  }, [verifyToken, verifyUser, t]);

  const handleResend = async () => {
    if (!storedEmail) return;

    setResendStatus({ type: "idle", message: "" });
    try {
      await resendVerifyUser({ email: storedEmail }).unwrap();
      setResendStatus({
        type: "success",
        message: "Verification link has been resent to your email."
      });
      localStorage.removeItem("travel_verify_email");
    } catch (err: any) {
      setResendStatus({
        type: "error",
        message: err?.data?.message || "Failed to resend verification link. Please try again later."
      });
    }
  };

  return {
    status,
    resendStatus,
    handleVerify,
    handleResend,
    isResending,
    verifyToken
  };
};
