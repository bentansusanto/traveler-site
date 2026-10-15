import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const rolesService = createApi({
  reducerPath: "rolesService",
  baseQuery: baseQueryWithReauth,
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
