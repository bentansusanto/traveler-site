import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const locationService = createApi({
  reducerPath: "locationService",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    findAllLocation: builder.query<any, void>({
      query: () => ({
        url: "/locations",
        method: "GET"
      })
    })
  })
});

export const { useFindAllLocationQuery } = locationService;
