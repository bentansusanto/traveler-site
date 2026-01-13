import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface CreatePaymentDto {
  book_tour_id: string;
  payment_method: "paypal" | "cash" | "credit_card";
  currency: string;
}

interface PaymentData {
  id: string;
  user_id: string;
  book_tour_id?: string;
  total_tourists?: number;
  amount: number;
  currency: string;
  transaction_id?: string;
  payment_method: string;
  payer_email?: string;
  redirect_url?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

interface PaymentResponse {
  message: string;
  data?: PaymentData;
}

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include"
  }),
  tagTypes: ["Payment"],
  endpoints: (builder) => ({
    createPayment: builder.mutation<PaymentResponse, CreatePaymentDto>({
      query: (data) => ({
        url: "/payments/create",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Payment"]
    }),
    capturePayment: builder.mutation<PaymentResponse, string>({
      query: (orderId) => ({
        url: `/payments/capture/${orderId}`,
        method: "POST"
      }),
      invalidatesTags: ["Payment"]
    })
  })
});

export const { useCreatePaymentMutation, useCapturePaymentMutation } = paymentApi;
