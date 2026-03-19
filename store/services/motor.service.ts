import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

export interface MotorsResponse {
  message: string;
  data: Motor[];
}

export interface SingleMotorResponse {
  message: string;
  data: Motor;
}

export interface MereksResponse {
  message: string;
  data: Merek[];
}

export const motorService = createApi({
  reducerPath: "motorService",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include"
  }),
  endpoints: (builder) => ({
    findAllMotors: builder.query<MotorsResponse, void>({
      query: () => ({
        url: "/motors/find-all",
        method: "GET"
      })
    }),
    findMotorById: builder.query<SingleMotorResponse, string>({
      query: (id) => ({
        url: `/motors/${id}`,
        method: "GET"
      })
    }),
    findAllMereks: builder.query<MereksResponse, void>({
      query: () => ({
        url: "/mereks/find-all",
        method: "GET"
      })
    })
  })
});

export const {
  useFindAllMotorsQuery,
  useFindMotorByIdQuery,
  useFindAllMereksQuery
} = motorService;
