import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export interface AddOn {
  id: string;
  name: string;
  price: number;
  max_price?: number;
  category: "tour" | "motor" | "general";
  description?: string;
}

export interface AddOnsResponse {
  message: string;
  data?: AddOn;
  datas?: AddOn[];
}

export const addOnsService = createApi({
  reducerPath: "addOnsService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AddOn"],
  endpoints: (builder) => ({
    findAllAddOns: builder.query<AddOnsResponse, void>({
      query: () => "/add-ons/find-all",
      providesTags: ["AddOn"],
    }),
    findAddOnsByCategory: builder.query<AddOnsResponse, string>({
      query: (category) => `/add-ons/find-category/${category}`,
      providesTags: ["AddOn"],
    }),
  }),
});

export const { useFindAllAddOnsQuery, useFindAddOnsByCategoryQuery } = addOnsService;
