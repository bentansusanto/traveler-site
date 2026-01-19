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
  tagTypes: ["Payments"],
  endpoints: (builder) => ({
    // create payment
    createPayment: builder.mutation<any, any>({
      query: (data) => ({
        url: "/payments/create",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Payments"],
      // Manually invalidate bookTourService cache
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Import bookTourService dynamically to avoid circular dependency
          const { bookTourService } = await import("./book-tour.service");
          dispatch(bookTourService.util.invalidateTags(["BookTours"]));
        } catch {}
      }
    }),
    // capture payment
    capturePayment: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/payments/capture/${orderId}`,
        method: "POST"
      }),
      invalidatesTags: ["Payments"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const { bookTourService } = await import("./book-tour.service");
          dispatch(bookTourService.util.invalidateTags(["BookTours"]));
        } catch {}
      }
    }),
    // cancel payment
    cancelPayment: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/payments/cancel/${orderId}`,
        method: "PUT"
      }),
      invalidatesTags: ["Payments"],
      // Manually invalidate bookTourService cache to update booking status in real-time
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Import bookTourService dynamically to avoid circular dependency
          const { bookTourService } = await import("./book-tour.service");
          // Invalidate BookTours cache to trigger refetch
          dispatch(bookTourService.util.invalidateTags(["BookTours"]));
        } catch {}
      }
    }),
    // webhook payment
    webhookPayment: builder.mutation<any, any>({
      query: (data) => ({
        url: "/payments/webhook",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Payments"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const { bookTourService } = await import("./book-tour.service");
          dispatch(bookTourService.util.invalidateTags(["BookTours"]));
        } catch {}
      }
    }),
    // find all payment
    findAllPayment: builder.query<any, void>({
      query: () => ({
        url: "/payments/find-all",
        method: "GET"
      }),
      providesTags: ["Payments"]
    }),
    // find payment by id
    findPaymentById: builder.query<any, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [{ type: "Payments", id }]
    })
  })
});

export const {
  useCreatePaymentMutation,
  useCapturePaymentMutation,
  useCancelPaymentMutation,
  useWebhookPaymentMutation,
  useFindAllPaymentQuery,
  useFindPaymentByIdQuery
} = paymentService;
