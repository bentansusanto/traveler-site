import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const itineraryService = createApi({
  reducerPath: "itineraryService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Itineraries"],
  endpoints: (builder) => ({
    // POST /itineraries/items (Add or Create Itinerary Item)
    addOrCreateItem: builder.mutation<any, { destination_id: string; visit_date: string; name?: string }>({
      query: (data) => ({
        url: "/itineraries/items",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Itineraries"]
    }),
    // PUT /itineraries/:id/items (Update Itinerary Items / Dates / Name)
    updateItineraryItems: builder.mutation<any, { id: string; name?: string; items?: { item_id?: string; destination_id?: string; visit_date: string }[] }>({
      query: ({ id, name, items }) => ({
        url: `/itineraries/${id}/items`,
        method: "PUT",
        body: { name, items }
      }),
      invalidatesTags: ["Itineraries"]
    }),
    // DELETE /itineraries/:id/items/:itemId (Remove Item from Itinerary)
    removeItem: builder.mutation<any, { itineraryId: string; itemId: string }>({
      query: ({ itineraryId, itemId }) => ({
        url: `/itineraries/${itineraryId}/items/${itemId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Itineraries"]
    }),
    // DELETE /itineraries/:id (Delete Master Itinerary)
    deleteItinerary: builder.mutation<any, string>({
      query: (id) => ({
        url: `/itineraries/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Itineraries"]
    }),
    // GET /itineraries (Get My Itineraries)
    getMyItineraries: builder.query<any, void>({
      query: () => ({
        url: "/itineraries",
        method: "GET"
      }),
      providesTags: ["Itineraries"]
    }),
    // GET /itineraries/:id (Get Itinerary by ID)
    getItineraryById: builder.query<any, string>({
      query: (id) => ({
        url: `/itineraries/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [{ type: "Itineraries", id }]
    })
  })
});

export const {
  useAddOrCreateItemMutation,
  useUpdateItineraryItemsMutation,
  useRemoveItemMutation,
  useDeleteItineraryMutation,
  useGetMyItinerariesQuery,
  useGetItineraryByIdQuery
} = itineraryService;
