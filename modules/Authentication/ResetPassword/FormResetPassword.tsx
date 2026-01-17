"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordMutation } from "@/store/services/auth.service";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ResetPasswordFormValues, resetPasswordSchema } from "./schema";

export const FormResetPassword = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);

  // Get verify_code from URL query params
  const verifyCode = searchParams.get("verify_token") || "";

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
      try {
        await resetPassword(values).unwrap();
        toast.success("Password reset successfully!");
        setIsSuccess(true);
        formik.resetForm();

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (error: any) {
        toast.error(error?.message || "Failed to reset password");
      }
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        {/* Password */}
        <div>
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full"
            placeholder="New Password"
          />
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="retryPassword" className="sr-only">
            Confirm Password
          </Label>
          <Input
            id="retryPassword"
            name="retryPassword"
            type="password"
            autoComplete="new-password"
            value={formik.values.retryPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full"
            placeholder="Confirm Password"
          />
          {formik.touched.retryPassword && formik.errors.retryPassword && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.retryPassword}</p>
          )}
        </div>
        {/* Verify Token */}
        <div>
          <Label htmlFor="code" className="sr-only">
            Verify Token
          </Label>
          <Input
            id="code"
            name="code"
            type="text"
            autoComplete="on"
            value={formik.values.code}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full"
            placeholder="Verify Code"
          />
          {formik.touched.code && formik.errors.code && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.code}</p>
          )}
        </div>
      </div>

      <div>
        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={isLoading || !formik.isValid || !formik.dirty}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
        {isSuccess && (
          <div className="mt-2 rounded-md bg-green-100 p-4 text-sm text-green-700">
            Password reset successfully! Redirecting to login...
          </div>
        )}
      </div>
    </form>
  );
};
