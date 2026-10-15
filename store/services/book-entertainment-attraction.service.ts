import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export interface AttractionTourist {
  name: string;
  passport_number: string;
  phone_number?: string;
  gender: string;
  nationality: string;
  birth_date?: string; // DD-MM-YYYY
  age_group?: "adult" | "child" | "infant";
  ticket_id?: string;
}

export interface BookEntertainmentItem {
  entertainment_attraction_id?: string;
  ticket_id?: string;
  qty: number;
  unit_price?: number;
}

export interface CreateBookEntertainmentAttractionDto {
  customer_id?: string;
  booker_id?: string;
  pemesan_id?: string;
  subtotal?: number;
  booking_date?: string; // DD-MM-YYYY
  items?: BookEntertainmentItem[];
  tourists?: AttractionTourist[];
}

export interface SubmitTouristsDto {
  tourists: AttractionTourist[];
}

export interface UpdateBookEntertainmentAttractionDto {
  booker_id?: string;
  pemesan_id?: string;
  tourists?: AttractionTourist[];
}

export interface FilterBookEntertainmentAttractionQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface BookEntertainmentAttractionItemData {
  id: string;
  entertainment_attraction_id?: string;
  entertainment_attraction_name?: string;
  ticket_id?: string;
  ticket_name?: string;
  unit_price: number;
  qty: number;
  subtotal: number;
}

export interface BookEntertainmentAttractionData {
  id: string;
  customer_id?: string;
  booker_id?: string;
  pemesan_id?: string;
  booker?: {
    id: string;
    name: string;
    email: string;
    phone_number: string;
  } | null;
  user_id?: string;
  status: string;
  subtotal: number;
  booking_date?: string;
  expired_at?: string;
  book_entertainment_attraction_items?: BookEntertainmentAttractionItemData[];
  tourists?: AttractionTourist[];
  created_at: string;
  updated_at: string;
}

export interface BookEntertainmentAttractionResponse {
  message: string;
  data?: BookEntertainmentAttractionData;
  datas?: BookEntertainmentAttractionData[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export const bookEntertainmentAttractionService = createApi({
  reducerPath: "bookEntertainmentAttractionService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["BookEntertainmentAttraction"],
  endpoints: (builder) => ({
    // POST /book-entertainment-attractions
    createBookEntertainmentAttraction: builder.mutation<
      BookEntertainmentAttractionResponse,
      CreateBookEntertainmentAttractionDto
    >({
      query: (data) => ({
        url: "/book-entertainment-attractions",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["BookEntertainmentAttraction"]
    }),

    // POST /book-entertainment-attractions/:id/tourists
    submitAttractionTourists: builder.mutation<
      BookEntertainmentAttractionResponse,
      { id: string; dto: SubmitTouristsDto }
    >({
      query: ({ id, dto }) => ({
        url: `/book-entertainment-attractions/${id}/tourists`,
        method: "POST",
        body: dto
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "BookEntertainmentAttraction", id },
        "BookEntertainmentAttraction"
      ]
    }),

    // PATCH /book-entertainment-attractions/:id
    updateBookingDetails: builder.mutation<
      BookEntertainmentAttractionResponse,
      { id: string; dto: UpdateBookEntertainmentAttractionDto }
    >({
      query: ({ id, dto }) => ({
        url: `/book-entertainment-attractions/${id}`,
        method: "PATCH",
        body: dto
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "BookEntertainmentAttraction", id },
        "BookEntertainmentAttraction"
      ]
    }),

    // PATCH /book-entertainment-attractions/:id/cancel
    cancelBooking: builder.mutation<BookEntertainmentAttractionResponse, string>({
      query: (id) => ({
        url: `/book-entertainment-attractions/${id}/cancel`,
        method: "PATCH"
      }),
      invalidatesTags: (result, error, id) => [
        { type: "BookEntertainmentAttraction", id },
        "BookEntertainmentAttraction"
      ]
    }),

    // GET /book-entertainment-attractions
    findAllBookEntertainmentAttractions: builder.query<
      BookEntertainmentAttractionResponse,
      FilterBookEntertainmentAttractionQuery | void
    >({
      query: (params) => ({
        url: "/book-entertainment-attractions",
        method: "GET",
        params: params || undefined
      }),
      providesTags: ["BookEntertainmentAttraction"]
    }),

    // GET /book-entertainment-attractions/:id
    findBookEntertainmentAttractionById: builder.query<
      BookEntertainmentAttractionResponse,
      string
    >({
      query: (id) => `/book-entertainment-attractions/${id}`,
      providesTags: (result, error, id) => [
        { type: "BookEntertainmentAttraction", id }
      ]
    }),

    // PATCH /book-entertainment-attractions/:id/status
    updateBookingStatus: builder.mutation<
      BookEntertainmentAttractionResponse,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/book-entertainment-attractions/${id}/status`,
        method: "PATCH",
        body: { status }
      }),
      invalidatesTags: ["BookEntertainmentAttraction"]
    }),

    // DELETE /book-entertainment-attractions/:id
    deleteBooking: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/book-entertainment-attractions/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["BookEntertainmentAttraction"]
    })
  })
});

export const {
  useCreateBookEntertainmentAttractionMutation,
  useSubmitAttractionTouristsMutation,
  useUpdateBookingDetailsMutation,
  useCancelBookingMutation,
  useFindAllBookEntertainmentAttractionsQuery,
  useFindBookEntertainmentAttractionByIdQuery,
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation
} = bookEntertainmentAttractionService;
