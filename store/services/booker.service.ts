import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const bookerService = createApi({
  reducerPath: "bookerService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Booker"],
  endpoints: (builder) => ({
    // GET /bookers — list all bookers for the logged-in customer
    findAllBookers: builder.query<any, void>({
      query: () => ({
        url: "/bookers",
        method: "GET"
      }),
      providesTags: ["Booker"]
    }),
    // GET /bookers/:id
    findBookerById: builder.query<any, string>({
      query: (id) => ({
        url: `/bookers/${id}`,
        method: "GET"
      }),
      providesTags: (_result, _err, id) => [{ type: "Booker", id }]
    }),
    // POST /bookers — create a new booker
    createBooker: builder.mutation<any, { name: string; email: string; phone_number: string }>({
      query: (data) => ({
        url: "/bookers",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Booker"]
    }),
    // PUT /bookers/:id
    updateBooker: builder.mutation<any, { id: string; name?: string; email?: string; phone_number?: string }>({
      query: ({ id, ...body }) => ({
        url: `/bookers/${id}`,
        method: "PUT",
        body
      }),
      invalidatesTags: ["Booker"]
    }),
    // DELETE /bookers/:id
    deleteBooker: builder.mutation<any, string>({
      query: (id) => ({
        url: `/bookers/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Booker"]
    })
  })
});

export const {
  useFindAllBookersQuery,
  useFindBookerByIdQuery,
  useCreateBookerMutation,
  useUpdateBookerMutation,
  useDeleteBookerMutation
} = bookerService;
