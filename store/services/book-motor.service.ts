import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export interface BookMotorItem {
  motor_id: string;
  qty: number;
}

export interface Tourist {
  name: string;
  passport_number: string;
  phone_number?: string;
}

export interface CreateBookMotorDto {
  items: BookMotorItem[];
  tourists: Tourist[];
  start_date: string;
  end_date: string;
}

export interface BookMotorResponse {
  message: string;
  data: any;
  datas?: any[];
}

export const bookMotorService = createApi({
  reducerPath: "bookMotorService",
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
  tagTypes: ["BookMotor"],
  endpoints: (builder) => ({
    createBookMotor: builder.mutation<BookMotorResponse, CreateBookMotorDto>({
      query: (data) => ({
        url: "/book-motors/create",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["BookMotor"]
    }),
    findAllBookMotors: builder.query<BookMotorResponse, void>({
      query: () => "/book-motors/find-all",
      providesTags: ["BookMotor"]
    }),
    findBookMotorById: builder.query<BookMotorResponse, string>({
      query: (id) => `/book-motors/${id}`,
      providesTags: (result, error, id) => [{ type: "BookMotor", id }]
    }),
    updateStatusMotor: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/book-motors/update-status/${id}`,
        method: "PUT",
        body: { status }
      }),
      invalidatesTags: ["BookMotor"]
    })
  })
});

export const {
  useCreateBookMotorMutation,
  useFindAllBookMotorsQuery,
  useFindBookMotorByIdQuery,
  useUpdateStatusMotorMutation
} = bookMotorService;
