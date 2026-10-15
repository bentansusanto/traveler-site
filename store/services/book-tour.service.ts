import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const bookTourService = createApi({
  reducerPath: "bookTourService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["BookTours"],
  endpoints: (builder) => ({
    // POST /book-tours (create book tour)
    createTour: builder.mutation<any, any>({
      query: (data) => ({
        url: "/book-tours",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["BookTours"]
    }),
    // GET /book-tours (get all customer book tours)
    getAllTour: builder.query<any, void>({
      query: () => ({
        url: "/book-tours",
        method: "GET"
      }),
      providesTags: ["BookTours"]
    }),
    // GET /book-tours/:id (find book tour by id)
    findTourById: builder.query<any, string>({
      query: (id) => ({
        url: `/book-tours/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [{ type: "BookTours", id }]
    }),
    // PATCH /book-tours/:id/status (update status book tour)
    updateStatusTour: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/book-tours/${id}/status`,
        method: "PATCH",
        body: { status }
      }),
      invalidatesTags: ["BookTours"]
    }),
    // PUT /book-tours/:id (update book tour / add-ons)
    updateTour: builder.mutation<any, { id: string; add_ons: string[] }>({
      query: ({ id, add_ons }) => ({
        url: `/book-tours/${id}`,
        method: "PUT",
        body: { add_ons }
      }),
      invalidatesTags: ["BookTours"]
    })
  })
});

export const {
  useCreateTourMutation,
  useGetAllTourQuery,
  useFindTourByIdQuery,
  useUpdateStatusTourMutation,
  useUpdateTourMutation
} = bookTourService;
