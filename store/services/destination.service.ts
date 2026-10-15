import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export interface DestinationTranslation {
  id: number;
  destination_id: string;
  language_code: string;
  name: string;
  slug: string;
  description: string;
  detail_tour: string[];
  facilities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Destination {
  id: string;
  state_id: string;
  city_id?: string;
  city_name?: string;
  country_id?: string;
  location: string;
  category_destination_id: string;
  category_destination_name: string;
  price: string;
  thumbnail: string;
  images: string[];
  translations: DestinationTranslation[];
}

export interface DestinationsResponse {
  message: string;
  data: Destination[];
  meta?: {
    page: number;
    limit: number;
    totalData: number;
    totalPage: number;
  };
}

export interface DestinationDetailResponse {
  message: string;
  data: Destination;
}

export const destinationService = createApi({
  reducerPath: "destinationService",
  baseQuery: baseQueryWithReauth,
  // find all destinations
  endpoints: (builder) => ({
    findAllDestination: builder.query<DestinationsResponse, void>({
      query: () => ({
        url: "/destinations",
        method: "GET"
      })
    }),
    findDestinationBySlug: builder.query<DestinationDetailResponse, string>({
      query: (slug) => ({
        url: `/destinations/slug/${slug}`,
        method: "GET"
      })
    }),
    // find all categories
    findCategoryDestinations: builder.query<any, void>({
      query: () => ({
        url: "/destinations/categories",
        method: "GET"
      })
    }),
    // find destination id
    findDestinationId: builder.query<DestinationDetailResponse, string>({
      query: (id) => ({
        url: `/destinations/${id}`,
        method: "GET"
      })
    })
  })
});

export const {
  useFindAllDestinationQuery,
  useFindCategoryDestinationsQuery,
  useFindDestinationBySlugQuery,
  useFindDestinationIdQuery
} = destinationService;
