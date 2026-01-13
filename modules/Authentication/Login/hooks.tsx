"use client";
import { useLoginMutation } from "@/store/services/auth.service";
import { useFormik } from "formik";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setLoginState } from "@/store/slices/authSlice";
import { initialLoginValues, loginSchema } from "./schema";

export const HookLogin = () => {
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const dispatch = useDispatch();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const formik = useFormik({
    initialValues: initialLoginValues,
    validate: (values) => {
      const result = loginSchema.safeParse(values);
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
        const response = await login(values).unwrap();

        // Handle different response structures
        // Priority: session (actual API field) > access_token > token
        let accessToken = null;

        if (response?.data?.session) {
          accessToken = response.data.session;
        } else if (response?.session) {
          accessToken = response.session;
        } else if (response?.data?.access_token) {
          accessToken = response.data.access_token;
        } else if (response?.access_token) {
          accessToken = response.access_token;
        } else if (response?.data?.token) {
          accessToken = response.data.token;
        } else if (response?.token) {
          accessToken = response.token;
        }

        if (accessToken) {
          // Store token in cookie with proper options
          Cookies.set("travel_token", accessToken, {
            expires: 7,
            sameSite: "lax",
            path: "/"
          });

          dispatch(setLoginState({ userName: response.data?.name || "User", token: accessToken }));

          setStatusMessage({
            type: "success",
            text: "Login successful! Redirecting..."
          });

          // Redirect to home or dashboard
          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          console.error("Response structure:", response);
          throw new Error("No access token in response");
        }
      } catch (err: any) {
        console.error("Login failed", err);
        setStatusMessage({
          type: "error",
          text: err?.data?.message || err?.message || "Login failed. Please check your credentials."
        });
      }
    }
  });
  return { formik, isLoading, statusMessage };
};
