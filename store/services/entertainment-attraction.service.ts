import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export interface EntertainmentAttractionTranslation {
  id?: string;
  language_code: string;
  name: string;
  slug: string;
  description: string;
}

export interface EntertainmentAttractionTicket {
  id: string;
  name: string;
  ticket_type: "flat" | "tiered" | "package";
  price: number;
  pax_count: number;
  min_age?: number | null;
  max_age?: number | null;
  description?: string;
}

export interface EntertainmentCategory {
  id: string;
  name: string;
}

export interface EntertainmentAttraction {
  id: string;
  category_entertainment_id?: string;
  category_entertainment?: EntertainmentCategory;
  category_entertainment_name?: string;
  state_id?: string;
  state_name?: string;
  state?: { id: string; name: string };
  country_id?: string;
  country_name?: string;
  country?: { id: string; name: string };
  price: number;
  thumbnail: string;
  images: string[];
  daily_quota?: number | null;
  translations: EntertainmentAttractionTranslation[];
  tickets: EntertainmentAttractionTicket[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterEntertainmentAttractionQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category_id?: string;
  category_destination_id?: string;
  country_id?: string;
  state_id?: string;
}

export interface EntertainmentAttractionsResponse {
  message: string;
  data?: EntertainmentAttraction[];
  datas?: EntertainmentAttraction[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface SingleEntertainmentAttractionResponse {
  message: string;
  data: EntertainmentAttraction;
}

export interface EntertainmentCategoriesResponse {
  message: string;
  data?: EntertainmentCategory[];
  datas?: EntertainmentCategory[];
}

export const entertainmentAttractionService = createApi({
  reducerPath: "entertainmentAttractionService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["EntertainmentAttraction", "EntertainmentCategories"],
  endpoints: (builder) => ({
    findAllAttractions: builder.query<
      EntertainmentAttractionsResponse,
      FilterEntertainmentAttractionQuery | void
    >({
      query: (params) => ({
        url: "/entertainment-attractions",
        method: "GET",
        params: params || undefined
      }),
      providesTags: ["EntertainmentAttraction"]
    }),
    findAttractionCategories: builder.query<EntertainmentCategoriesResponse, void>({
      query: () => ({
        url: "/entertainment-attractions/categories",
        method: "GET"
      }),
      providesTags: ["EntertainmentCategories"]
    }),
    findAttractionBySlug: builder.query<SingleEntertainmentAttractionResponse, string>({
      query: (slug) => ({
        url: `/entertainment-attractions/slug/${slug}`,
        method: "GET"
      }),
      providesTags: (result, error, slug) => [
        { type: "EntertainmentAttraction", id: slug }
      ]
    }),
    findAttractionById: builder.query<SingleEntertainmentAttractionResponse, string>({
      query: (id) => ({
        url: `/entertainment-attractions/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [
        { type: "EntertainmentAttraction", id }
      ]
    }),
    createAttraction: builder.mutation<SingleEntertainmentAttractionResponse, any>({
      query: (body) => ({
        url: "/entertainment-attractions",
        method: "POST",
        body
      }),
      invalidatesTags: ["EntertainmentAttraction"]
    }),
    updateAttraction: builder.mutation<
      SingleEntertainmentAttractionResponse,
      { id: string; body: any }
    >({
      query: ({ id, body }) => ({
        url: `/entertainment-attractions/${id}`,
        method: "PUT",
        body
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EntertainmentAttraction", id },
        "EntertainmentAttraction"
      ]
    }),
    deleteAttraction: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/entertainment-attractions/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["EntertainmentAttraction"]
    })
  })
});

export const {
  useFindAllAttractionsQuery,
  useFindAttractionCategoriesQuery,
  useFindAttractionBySlugQuery,
  useFindAttractionByIdQuery,
  useCreateAttractionMutation,
  useUpdateAttractionMutation,
  useDeleteAttractionMutation
} = entertainmentAttractionService;
