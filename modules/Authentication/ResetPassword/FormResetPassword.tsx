"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordMutation } from "@/store/services/customer.service";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { extractAuthErrorMessage } from "@/lib/auth-errors";
import { ResetPasswordFormValues, resetPasswordSchema } from "./schema";
import Link from "next/link";
import Icon from "@/components/icon";
import { Eye, EyeOff } from "lucide-react";

export const FormResetPassword = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Auth");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get verify code directly from URL query params (customer email uses verify_code, fallback to verify_token or code)
  const verifyCode =
    searchParams.get("verify_code") ||
    searchParams.get("verify_token") ||
    searchParams.get("code") ||
    "";

  const formik = useFormik<ResetPasswordFormValues>({
    initialValues: {
      code: verifyCode,
      password: "",
      retryPassword: ""
    },
    enableReinitialize: true, // Re-initialize when verifyCode changes
    validate: (values) => {
      const result = resetPasswordSchema.safeParse(values);
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
      if (!verifyCode) {
        toast.error(t("invalidResetLink"));
        return;
      }

      try {
        await resetPassword({
          code: verifyCode,
          new_password: values.password,
          confirm_new_password: values.retryPassword,
          password: values.password,
          retryPassword: values.retryPassword
        }).unwrap();
        toast.success(t("resetPasswordSuccess"));
        setIsSuccess(true);
        formik.resetForm();

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 2000);
      } catch (error: any) {
        toast.error(extractAuthErrorMessage(error, t) || t("resetPasswordFailed"));
      }
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
      {/* Hidden input to bind verify_code into form submission */}
      <input type="hidden" name="code" value={formik.values.code} />

      {!verifyCode && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <Icon name="AlertCircle" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">{t("invalidResetLink")}</p>
            <Link
              href={`/${locale}/forgot-password`}
              className="mt-2 inline-block font-semibold text-blue-600 underline">
              {t("requestNewLink")}
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Password */}
        <div>
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full text-sm h-12 rounded-md bg-gray-50 border-gray-200 focus-visible:ring-primary/20 transition-all px-4 pr-12"
              placeholder="New Password"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-xs text-red-500 px-4">{formik.errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="retryPassword" className="sr-only">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="retryPassword"
              name="retryPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formik.values.retryPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full text-sm h-12 rounded-md bg-gray-50 border-gray-200 focus-visible:ring-primary/20 transition-all px-4 pr-12"
              placeholder="Confirm Password"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {formik.touched.retryPassword && formik.errors.retryPassword && (
            <p className="mt-1 text-xs text-red-500 px-4">{formik.errors.retryPassword}</p>
          )}
        </div>
      </div>

      <div>
        <Button
          type="submit"
          className="w-full h-10 rounded-md text-sm font-medium transition-all shadow-sm hover:shadow-md"
          disabled={isLoading || !verifyCode || !formik.isValid || !formik.dirty}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
        {isSuccess && (
          <div className="mt-2 rounded-md bg-green-100 p-4 text-sm text-green-700">
            {t("resetPasswordSuccess")}
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
