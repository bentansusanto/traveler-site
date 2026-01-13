import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const touristService = createApi({
  reducerPath: "touristService",
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
    createTourist: builder.mutation<any, any>({
      query: (data) => ({
        url: "/tourists/create-many",
        method: "POST",
        body: data
      })
    }),
    // find all tourist
    findAllTourist: builder.query<any, void>({
      query: () => ({
        url: "tourists/find-all",
        method: "GET"
      })
    }),
    // delete tourist id
    deleteTourist: builder.mutation<any, string | number>({
      query: (id) => ({
        url: `tourists/delete/${id}`,
        method: "DELETE"
      })
    }),
    // update tourist id
    updateTourist: builder.mutation<any, { id: string | number; data: any }>({
      query: ({ id, data }) => ({
        url: `tourists/update/${id}`,
        method: "PUT",
        body: data
      })
    }),
    // update many tourists
    updateManyTourist: builder.mutation<any, any>({
      query: (data) => ({
        url: "/tourists/update-many",
        method: "PUT",
        body: data
      })
    })
  })
});

export const { 
  useCreateTouristMutation, 
  useFindAllTouristQuery, 
  useUpdateTouristMutation, 
  useDeleteTouristMutation,
  useUpdateManyTouristMutation
} = touristService;
