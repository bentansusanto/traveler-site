import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export interface MotorTranslation {
  id?: string;
  language_code: string;
  name_motor: string;
  description: string;
  slug?: string;
}

export interface MotorVariant {
  id?: string;
  color: string;
}

export interface MotorPrice {
  id?: string;
  price_type: "daily" | "weekly";
  price: number;
}

export interface Motor {
  id?: string;
  state_id: string;
  merek_id: string;
  engine_cc: number;
  thumbnail: string;
  is_available: boolean;
  translations: MotorTranslation[];
  variants: MotorVariant[];
  prices?: MotorPrice[];
  motor_prices?: MotorPrice[];
  merek?: {
    id: string;
    name_merek: string;
  };
  state?: {
    id: string;
    name: string;
  };
  location?: string;
}

export interface Merek {
  id: string;
  name_merek: string;
}

export interface FilterMotorQuery {
  page?: number;
  limit?: number;
  merek_id?: string;
  state_id?: string;
  country_id?: string;
  is_available?: boolean;
  search?: string;
}

export interface MotorsResponse {
  message: string;
  data: Motor[];
  datas?: Motor[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface SingleMotorResponse {
  message: string;
  data: Motor;
}

export interface MereksResponse {
  message: string;
  data: Merek[];
  datas?: Merek[];
}

export const motorService = createApi({
  reducerPath: "motorService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Motors", "Mereks"],
  endpoints: (builder) => ({
    findAllMotors: builder.query<MotorsResponse, FilterMotorQuery | void>({
      query: (params) => ({
        url: "/motors",
        method: "GET",
        params: {
          limit: 100,
          ...(params || {}),
        },
      }),
      providesTags: ["Motors"]
    }),
    findMotorById: builder.query<SingleMotorResponse, string>({
      query: (id) => ({
        url: `/motors/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [{ type: "Motors", id }]
    }),
    findMotorBySlug: builder.query<SingleMotorResponse, string>({
      query: (slug) => ({
        url: `/motors/slug/${slug}`,
        method: "GET"
      }),
      providesTags: (result, error, slug) => [{ type: "Motors", id: slug }]
    }),
    findAllMereks: builder.query<MereksResponse, void>({
      query: () => ({
        url: "/mereks",
        method: "GET"
      }),
      providesTags: ["Mereks"]
    }),
    findMerekById: builder.query<{ message: string; data: Merek }, string>({
      query: (id) => ({
        url: `/mereks/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [{ type: "Mereks", id }]
    })
  })
});

export const {
  useFindAllMotorsQuery,
  useFindMotorByIdQuery,
  useFindMotorBySlugQuery,
  useFindAllMereksQuery,
  useFindMerekByIdQuery
} = motorService;
