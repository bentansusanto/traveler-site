"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { HookLogin } from "./hooks";

export const FormLogin = () => {
  const { formik, isLoading } = HookLogin();

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
            required
            className="w-full"
            placeholder="Email address"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>
          )}
        </div>
        <div>
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.password}</p>
          )}
        </div>
        <div className="text-end">
          <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
            Forgot your password?
          </Link>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={isLoading || !formik.isValid || !formik.dirty}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </div>
    </form>
  );
};
