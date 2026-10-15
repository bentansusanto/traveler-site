import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const paymentService = createApi({
  reducerPath: "paymentService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Payments"],
  endpoints: (builder) => ({
    // create payment
    createPayment: builder.mutation<any, any>({
      query: (data) => {
        const { idempotency_key, ...body } = data || {};
        return {
          url: "/payments",
          method: "POST",
          body,
          headers: idempotency_key
            ? { "Idempotency-Key": idempotency_key }
            : undefined
        };
      },
      invalidatesTags: ["Payments"],
      // Manually invalidate bookTourService cache
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Import bookTourService dynamically to avoid circular dependency
          const { bookTourService } = await import("./book-tour.service");
          const { bookMotorService } = await import("./book-motor.service");
          const { bookEntertainmentAttractionService } = await import("./book-entertainment-attraction.service");
          const { bookDocumentVisaService } = await import("./book-document-visa.service");
          dispatch(bookTourService.util.invalidateTags(["BookTours"]));
          dispatch(bookMotorService.util.invalidateTags(["BookMotor"]));
          dispatch(bookEntertainmentAttractionService.util.invalidateTags(["BookEntertainmentAttraction"]));
          dispatch(bookDocumentVisaService.util.invalidateTags(["BookDocumentVisa"]));
        } catch {}
      }
    }),
    // capture payment
    capturePayment: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/payments/${orderId}/capture`,
        method: "POST"
      }),
      invalidatesTags: ["Payments"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const { bookTourService } = await import("./book-tour.service");
          const { bookMotorService } = await import("./book-motor.service");
          const { bookEntertainmentAttractionService } = await import("./book-entertainment-attraction.service");
          const { bookDocumentVisaService } = await import("./book-document-visa.service");
          dispatch(bookTourService.util.invalidateTags(["BookTours"]));
          dispatch(bookMotorService.util.invalidateTags(["BookMotor"]));
          dispatch(bookEntertainmentAttractionService.util.invalidateTags(["BookEntertainmentAttraction"]));
          dispatch(bookDocumentVisaService.util.invalidateTags(["BookDocumentVisa"]));
        } catch {}
      }
    }),
    // cancel payment
    cancelPayment: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/payments/${orderId}/cancel`,
        method: "PATCH"
      }),
      invalidatesTags: ["Payments"],
      // Manually invalidate bookTourService cache to update booking status in real-time
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Import bookTourService dynamically to avoid circular dependency
          const { bookTourService } = await import("./book-tour.service");
          const { bookMotorService } = await import("./book-motor.service");
          const { bookEntertainmentAttractionService } = await import("./book-entertainment-attraction.service");
          const { bookDocumentVisaService } = await import("./book-document-visa.service");
          dispatch(bookTourService.util.invalidateTags(["BookTours"]));
          dispatch(bookMotorService.util.invalidateTags(["BookMotor"]));
          dispatch(bookEntertainmentAttractionService.util.invalidateTags(["BookEntertainmentAttraction"]));
          dispatch(bookDocumentVisaService.util.invalidateTags(["BookDocumentVisa"]));
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
          const { bookMotorService } = await import("./book-motor.service");
          dispatch(bookTourService.util.invalidateTags(["BookTours"]));
          dispatch(bookMotorService.util.invalidateTags(["BookMotor"]));
        } catch {}
      }
    }),
    // find all payment
    findAllPayment: builder.query<any, void>({
      query: () => ({
        url: "/payments",
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
