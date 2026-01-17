"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordMutation } from "@/store/services/auth.service";
import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "sonner";
import { ForgotPasswordFormValues, forgotPasswordSchema } from "./schema";

export const FormForgotPassword = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);

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
        toast.success("Password reset link sent to your email!");
        setIsSuccess(true);
        formik.resetForm();
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to send reset email");
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
            className="w-full"
            placeholder="Email address"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={isLoading || !formik.isValid || !formik.dirty}>
          {isLoading ? "Sending..." : "Send Mail"}
        </Button>
        {isSuccess && (
          <div className="mt-2 rounded-md bg-green-100 p-4 text-sm text-green-700">
            Check your email for password reset instructions
          </div>
        )}
      </div>
    </form>
  );
};
