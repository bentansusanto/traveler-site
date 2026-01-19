import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const bookTourService = createApi({
  reducerPath: "bookTourService",
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
  tagTypes: ["BookTours"], // Define cache tags
  endpoints: (builder) => ({
    // create book tour
    createTour: builder.mutation<any, any>({
      query: (data) => ({
        url: "/book-tours/create",
        method: "POST",
        body: data
      }),
      // Invalidate cache after creating a booking
      invalidatesTags: ["BookTours"]
    }),
    // get all book tour
    getAllTour: builder.query<any, void>({
      query: () => ({
        url: "/book-tours/find-all",
        method: "GET"
      }),
      // Provide cache tag
      providesTags: ["BookTours"]
    }),
    // find book tour by id
    findTourById: builder.query<any, string>({
      query: (id) => ({
        url: `/book-tours/find/${id}`,
        method: "GET"
      }),
      // Provide cache tag with ID
      providesTags: (result, error, id) => [{ type: "BookTours", id }]
    }),
    // update status book tour
    updateStatusTour: builder.mutation<any, any>({
      query: ({ id, data }) => ({
        url: `/book-tours/update-status/${id}`,
        method: "PUT",
        body: data
      }),
      // Invalidate cache after updating status
      invalidatesTags: ["BookTours"]
    })
  })
});

export const {
  useCreateTourMutation,
  useGetAllTourQuery,
  useFindTourByIdQuery,
  useUpdateStatusTourMutation
} = bookTourService;
