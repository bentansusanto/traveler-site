"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordMutation } from "@/store/services/customer.service";
import { useFormik } from "formik";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { extractAuthErrorMessage } from "@/lib/auth-errors";
import { ForgotPasswordFormValues, forgotPasswordSchema } from "./schema";

export const FormForgotPassword = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);
  const t = useTranslations("Auth");

  const formik = useFormik<ForgotPasswordFormValues>({
    initialValues: {
      email: ""
    },
    validate: (values) => {
      const result = forgotPasswordSchema.safeParse(values);
      if (!result.success) {
        const errors: any = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (path) {
            errors[path] = issue.message;
          }
        });
        return errors;
      }
      return {};
    },
    onSubmit: async (values) => {
      try {
        await forgotPassword(values).unwrap();
        toast.success(t("resetEmailSent"));
        setIsSuccess(true);
        formik.resetForm();
      } catch (error: any) {
        toast.error(extractAuthErrorMessage(error, t));
      }
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="sr-only">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full text-sm h-12 rounded-md bg-gray-50 border-gray-200 focus-visible:ring-primary/20 transition-all px-4"
            placeholder="Email address"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-xs text-red-500 px-4">{formik.errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <Button
          type="submit"
          className="w-full h-10 rounded-md text-sm font-medium transition-all shadow-sm hover:shadow-md"
          disabled={isLoading || !formik.isValid || !formik.dirty}>
          {isLoading ? "Sending..." : "Send Mail"}
        </Button>
        {isSuccess && (
          <div className="mt-2 rounded-md bg-green-100 p-4 text-sm text-green-700">
            Check your email for password reset instructions
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
};
