import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface DestinationTranslation {
  id: number;
  destination_id: string;
  language_code: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  image: string[];
  detail_tour: string[];
  facilities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Destination {
  id: string;
  state_id: string;
  location: string;
  category_destination_id: string;
  category_destination_name: string;
  price: string;
  translations: DestinationTranslation[];
}

export interface DestinationsResponse {
  message: string;
  data: Destination[];
}

export interface DestinationDetailResponse {
  message: string;
  data: Destination;
}

export const destinationService = createApi({
  reducerPath: "destinationService",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include"
  }),
  // find all destinations
  endpoints: (builder) => ({
    findAllDestination: builder.query<DestinationsResponse, void>({
      query: () => ({
        url: "/destination/find-all-destination-with-translation",
        method: "GET"
      })
    }),
    findDestinationBySlug: builder.query<DestinationDetailResponse, string>({
      query: (slug) => ({
        url: `/destination/${slug}`,
        method: "GET"
      })
    }),
    // find all categories
    findCategoryDestinations: builder.query<any, void>({
      query: () => ({
        url: "/destination/find-all-categories-destination",
        method: "GET"
      })
    }),
    // find destination id
    findDestinationId: builder.query<DestinationDetailResponse, string>({
      query: (id) => ({
        url: `/destination/find/${id}`,
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
