import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const rolesService = createApi({
  reducerPath: "rolesService",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL
  }),
  endpoints: (builder) => ({
    getRoles: builder.query<any, void>({
      query: () => ({
        url: `/roles`,
        method: "GET"
      })
    }),
    getRoleById: builder.query<any, string>({
      query: (id: string) => ({
        url: `/roles/${id}`,
        method: "GET"
      })
    })
  })
});

export const { useGetRolesQuery, useGetRoleByIdQuery } = rolesService;
