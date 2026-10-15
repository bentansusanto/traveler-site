import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const customerService = createApi({
  reducerPath: "customerService",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // register customer
    register: builder.mutation<any, any>({
      query: (data) => ({
        url: "/customers/register",
        method: "POST",
        body: data
      })
    }),
    // verify customer account
    verifyUser: builder.mutation<any, any>({
      query: (data) => ({
        url: "/customers/verify-account?verify_code=" + data.token,
        method: "POST",
        body: data
      })
    }),
    // resend verify code
    resendVerifyUser: builder.mutation({
      query: (data) => ({
        url: "/customers/resend-verify-account",
        method: "POST",
        body: data
      })
    }),
    // login customer
    login: builder.mutation<any, any>({
      query: (data) => ({
        url: "/customers/login",
        method: "POST",
        body: data
      })
    }),
    // logout customer
    logout: builder.mutation<any, void>({
      query: () => ({
        url: "/customers/logout",
        method: "POST"
      })
    }),
    // get customer profile
    getUser: builder.query<any, void>({
      query: () => ({
        url: "/customers/me",
        method: "GET"
      })
    }),
    // refresh token
    refreshToken: builder.mutation<any, void>({
      query: () => ({
        url: "/customers/refresh-token",
        method: "POST"
      })
    }),
    // forgot password
    forgotPassword: builder.mutation<any, any>({
      query: (data) => ({
        url: "/customers/forgot-password",
        method: "POST",
        body: data
      })
    }),
    // reset password
    resetPassword: builder.mutation<any, any>({
      query: (data) => ({
        url: "/customers/reset-password",
        method: "POST",
        body: {
          code: data.code || data.verify_code || data.verify_token,
          new_password: data.new_password || data.password,
          confirm_new_password:
            data.confirm_new_password || data.retryPassword || data.retry_password,
          ...data
        }
      })
    })
  })
});

export const {
  useRegisterMutation,
  useVerifyUserMutation,
  useResendVerifyUserMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetUserQuery,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation
} = customerService;
