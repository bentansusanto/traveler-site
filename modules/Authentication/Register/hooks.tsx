"use client";
import { useRegisterMutation } from "@/store/services/customer.service";
import { useFormik } from "formik";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { extractAuthErrorMessage } from "@/lib/auth-errors";
import { initialRegisterValues, registerSchema } from "./schema";

export const HookRegister = () => {
  const [register, { isLoading }] = useRegisterMutation();
  const t = useTranslations("Auth");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const formik = useFormik({
    initialValues: initialRegisterValues,
    validate: (values) => {
      const result = registerSchema.safeParse(values);
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        return errors;
      }
      return {};
    },
    onSubmit: async (values) => {
      setStatusMessage(null); // Clear previous message
      try {
        await register({ ...values, site: "traveller" }).unwrap();
        localStorage.setItem("travel_verify_email", values.email);
        setStatusMessage({
          type: "success",
          text: t("registrationSuccess")
        });
        formik.resetForm();
      } catch (err: any) {
        console.warn("Registration rejected:", err?.data || err?.message);
        setStatusMessage({
          type: "error",
          text: extractAuthErrorMessage(err, t) || t("registrationFailed")
        });
      }
    }
  });
  return { formik, isLoading, statusMessage };
};
