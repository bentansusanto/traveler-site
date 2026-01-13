import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const paymentService = createApi({
  reducerPath: "paymentService",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get("travel_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include"
  }),
  endpoints: (builder) => ({
    // create payment
    createPayment: builder.mutation<any, any>({
      query: (data) => ({
        url: "/payments/create",
        method: "POST",
        body: data
      })
    }),
    // capture payment
    capturePayment: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/payments/capture/${orderId}`,
        method: "POST"
      })
    }),
    // webhook payment
    webhookPayment: builder.mutation<any, any>({
      query: (data) => ({
        url: "/payments/webhook",
        method: "POST",
        body: data
      })
    }),
    // find all payment
    findAllPayment: builder.query<any, void>({
      query: () => ({
        url: "/payments/find-all",
        method: "GET"
      })
    }),
    // find payment by id
    findPaymentById: builder.query<any, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "GET"
      })
    })
  })
});

export const { useCreatePaymentMutation, useCapturePaymentMutation, useWebhookPaymentMutation, useFindAllPaymentQuery, useFindPaymentByIdQuery } =
  paymentService;
