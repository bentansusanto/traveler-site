import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const locationService = createApi({
  reducerPath: "locationService",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include"
  }),
  endpoints: (builder) => ({
    findAllLocation: builder.query<any, void>({
      query: () => ({
        url: "/countries/find-all",
        method: "GET"
      })
    })
  })
});

export const { useFindAllLocationQuery } = locationService;
