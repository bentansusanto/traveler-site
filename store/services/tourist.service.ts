import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const touristService = createApi({
  reducerPath: "touristService",
  baseQuery: baseQueryWithReauth,
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
