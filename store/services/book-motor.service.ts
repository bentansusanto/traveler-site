import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export interface BookMotorItem {
  motor_id: string;
  qty: number;
}

export interface Tourist {
  name: string;
  passport_number: string;
  phone_number?: string;
  gender: string;
  nationality: string;
}

export interface CreateBookMotorDto {
  items: BookMotorItem[];
  tourists?: Tourist[];
  start_date: string;
  end_date: string;
  add_ons?: string[];
  customer_id?: string;
  booker_id?: string;
  idempotency_key?: string;
}

export interface FilterBookMotorQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface BookMotorResponse {
  message: string;
  data: any;
  datas?: any[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export const bookMotorService = createApi({
  reducerPath: "bookMotorService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["BookMotor"],
  endpoints: (builder) => ({
    createBookMotor: builder.mutation<BookMotorResponse, CreateBookMotorDto>({
      query: (data) => ({
        url: "/book-motors",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["BookMotor"]
    }),
    findAllBookMotors: builder.query<BookMotorResponse, FilterBookMotorQuery | void>({
      query: (params) => ({
        url: "/book-motors",
        method: "GET",
        params: params || undefined
      }),
      providesTags: ["BookMotor"]
    }),
    findBookMotorById: builder.query<BookMotorResponse, string>({
      query: (id) => `/book-motors/${id}`,
      providesTags: (result, error, id) => [{ type: "BookMotor", id }]
    }),
    updateBookMotor: builder.mutation<BookMotorResponse, { id: string; data: Partial<CreateBookMotorDto> }>({
      query: ({ id, data }) => ({
        url: `/book-motors/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["BookMotor"]
    }),
    updateStatusMotor: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/book-motors/${id}/status`,
        method: "PATCH",
        body: { status }
      }),
      invalidatesTags: ["BookMotor"]
    }),
    deleteBookMotor: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/book-motors/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["BookMotor"]
    })
  })
});

export const {
  useCreateBookMotorMutation,
  useFindAllBookMotorsQuery,
  useFindBookMotorByIdQuery,
  useUpdateBookMotorMutation,
  useUpdateStatusMotorMutation,
  useDeleteBookMotorMutation
} = bookMotorService;
