import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const profileService = createApi({
  reducerPath: "profileService",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get("travel_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include"
  }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    // get profile by authenticated user (secure)
    getProfile: builder.query<any, void>({
      query: () => ({
        url: `/profiles/me`,
        method: "GET"
      }),
      providesTags: ["Profile"]
    }),
    // update profile
    updateProfile: builder.mutation<
      any,
      {
        id: string;
        user_id: string;
        phone_number: string;
        address: string;
        state: string;
        country: string;
      }
    >({
      query: (data) => ({
        url: `/profiles/update/${data.id}`,
        method: "PUT",
        body: {
          user_id: data.user_id,
          phone_number: data.phone_number,
          address: data.address,
          state: data.state,
          country: data.country
        }
      }),
      invalidatesTags: ["Profile"]
    }),
    // delete profile
    deleteProfile: builder.mutation<any, string>({
      query: (id: string) => ({
        url: `/profiles/delete/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Profile"]
    }),
    // create profile
    createProfile: builder.mutation<
      any,
      { user_id: string; phone_number: string; address: string; state: string; country: string }
    >({
      query: (data) => ({
        url: `/profiles/create`,
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Profile"]
    })
  })
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteProfileMutation,
  useCreateProfileMutation
} = profileService;
