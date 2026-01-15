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
  endpoints: (builder) => ({
    // create book tour
    createTour: builder.mutation<any, any>({
      query: (data) => ({
        url: "/book-tours/create",
        method: "POST",
        body: data
      })
    }),
    // get all book tour
    getAllTour: builder.query<any, void>({
      query: () => ({
        url: "/book-tours/find-all",
        method: "GET"
      })
    }),
    // find book tour by id
    findTourById: builder.query<any, string>({
      query: (id) => ({
        url: `/book-tours/find/${id}`,
        method: "GET"
      })
    }),
    // update status book tour
    updateStatusTour: builder.mutation<any, any>({
      query: ({ id, data }) => ({
        url: `/book-tours/update-status/${id}`,
        method: "PUT",
        body: data
      })
    })
  })
});

export const { useCreateTourMutation, useGetAllTourQuery, useFindTourByIdQuery, useUpdateStatusTourMutation } = bookTourService;
