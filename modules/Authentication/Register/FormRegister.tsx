"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HookRegister } from "./hooks";

export const FormRegister = () => {
  const { formik, isLoading, statusMessage } = HookRegister();

  return (
    <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="sr-only">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            className="w-full text-sm py-3"
            placeholder="Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.name}</p>
          )}
        </div>
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
      </div>

      <div>
        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={isLoading || !formik.isValid || !formik.dirty}>
          {isLoading ? "Signing up..." : "Sign up"}
        </Button>
        {statusMessage && (
          <div
            className={`rounded-md p-4 text-sm mt-2 ${
              statusMessage.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
            {statusMessage.text}
          </div>
        )}
      </div>
    </form>
  );
};
