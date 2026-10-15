import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export type StatusBookDocumentVisa =
  | "draft"
  | "pending"
  | "paid"
  | "documents_submitted"
  | "under_review"
  | "revision_required"
  | "submitted_to_embassy"
  | "appointment_scheduled"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled";

export type ApplicantGender = "Mr" | "Mrs" | "Ms" | "male" | "female";

export type ApplicantStatus =
  | "pending_document"
  | "document_uploaded"
  | "under_review"
  | "revision_required"
  | "verified"
  | "rejected";

export type FileReviewStatus = "pending" | "approved" | "rejected";

export interface BookDocumentApplicantFile {
  id: string;
  requirement_id: string;
  requirement_name?: string;
  file_url: string;
  file_name: string;
  file_size_bytes?: number;
  review_status: FileReviewStatus;
  rejection_note?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface BookDocumentApplicant {
  id: string;
  tourist_id?: string;
  full_name: string;
  gender: ApplicantGender;
  birth_date?: string;
  birth_place?: string;
  nationality?: string;
  passport_number?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  occupation?: string;
  visa_document_url?: string;
  status: ApplicantStatus;
  files?: BookDocumentApplicantFile[];
  created_at: string;
}

export interface BookDocumentVisaData {
  id: string;
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
  booker_id?: string;
  booker_name?: string;
  booker_email?: string;
  booker_phone?: string;
  user_id?: string;
  user_name?: string;
  document_visa_id: string;
  document_visa_title?: string;
  country_name?: string;
  package_id: string;
  package_name?: string;
  processing_time_days?: number;
  applicant_count: number;
  unit_price: number;
  total_price: number;
  target_travel_date?: string;
  status: StatusBookDocumentVisa;
  appointment_date?: string;
  appointment_location?: string;
  embassy_application_id?: string;
  tracking_number?: string;
  shipping_address?: string;
  note?: string | null;
  rejection_reason?: string;
  admin_notes?: string;
  expired_at?: string;
  items?: BookDocumentVisaItem[];
  applicants: BookDocumentApplicant[];
  created_at: string;
  updated_at: string;
}

export interface BookDocumentVisaItem {
  id: string;
  document_visa_id?: string;
  package_id?: string;
  package_name?: string;
  unit_price: number;
  qty: number;
  subtotal: number;
  created_at: string;
}

export interface CreateApplicantDto {
  full_name: string;
  gender: ApplicantGender;
  birth_date?: string; // DD-MM-YYYY or YYYY-MM-DD
  birth_place?: string;
  nationality?: string;
  passport_number?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  occupation?: string;
  tourist_id?: string;
}

export interface BookerDto {
  id?: string;
  name?: string;
  email?: string;
  phone_number?: string;
}

export interface CreateBookDocumentVisaDto {
  document_visa_id: string;
  package_id: string;
  customer_id?: string;
  booker_id?: string;
  booker_name?: string;
  booker_email?: string;
  booker_phone_number?: string;
  booker_phone?: string;
  booker?: BookerDto;
  target_travel_date?: string;
  shipping_address?: string;
  note?: string;
  notes?: string;
  applicant_count?: number;
  qty?: number;
  items?: any[];
  applicants?: CreateApplicantDto[];
}

export interface UpdateBookDocumentVisaDetailsDto {
  booker_id?: string;
  booker?: BookerDto;
  target_travel_date?: string;
  shipping_address?: string;
  note?: string;
  notes?: string;
  applicants?: CreateApplicantDto[];
  applicant_count?: number;
}

export interface UploadApplicantFileDto {
  requirement_id: string;
  file_url: string;
  file_name: string;
  file_size_bytes?: number;
}

export interface FilterBookDocumentVisaQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: StatusBookDocumentVisa | string;
  customer_id?: string;
  user_id?: string;
  document_visa_id?: string;
  start_date?: string;
  end_date?: string;
  note?: string;
}

export interface BookDocumentVisaResponse {
  message: string;
  data?: BookDocumentVisaData;
  datas?: BookDocumentVisaData[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const bookDocumentVisaService = createApi({
  reducerPath: "bookDocumentVisaService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["BookDocumentVisa"],
  endpoints: (builder) => ({
    // POST /book-document-visas (Create Booking)
    createBookDocumentVisa: builder.mutation<
      BookDocumentVisaResponse,
      CreateBookDocumentVisaDto
    >({
      query: (data) => ({
        url: "/book-document-visas",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["BookDocumentVisa"]
    }),

    // GET /book-document-visas (List All Bookings)
    findAllBookDocumentVisas: builder.query<
      BookDocumentVisaResponse,
      FilterBookDocumentVisaQuery | void
    >({
      query: (params) => ({
        url: "/book-document-visas",
        method: "GET",
        params: params || undefined
      }),
      transformResponse: (response: any) => {
        const rawList = response?.datas || response?.data || [];
        return {
          message: response?.message || "Success",
          datas: Array.isArray(rawList) ? rawList : [rawList],
          data: response?.data,
          meta: response?.meta
        };
      },
      providesTags: ["BookDocumentVisa"]
    }),

    // GET /book-document-visas/:id (Booking Detail)
    findBookDocumentVisaById: builder.query<BookDocumentVisaResponse, string>({
      query: (id) => `/book-document-visas/${id}`,
      providesTags: (result, error, id) => [{ type: "BookDocumentVisa", id }]
    }),

    // POST /book-document-visas/:bookingId/applicants/:applicantId/files (Upload Requirement File)
    uploadApplicantFile: builder.mutation<
      BookDocumentVisaResponse,
      {
        bookingId: string;
        applicantId: string;
        dto: UploadApplicantFileDto;
      }
    >({
      query: ({ bookingId, applicantId, dto }) => ({
        url: `/book-document-visas/${bookingId}/applicants/${applicantId}/files`,
        method: "POST",
        body: dto
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        { type: "BookDocumentVisa", id: bookingId },
        "BookDocumentVisa"
      ]
    }),

    // PATCH /book-document-visas/:id/cancel (Cancel Booking)
    cancelBookDocumentVisa: builder.mutation<BookDocumentVisaResponse, string>({
      query: (id) => ({
        url: `/book-document-visas/${id}/cancel`,
        method: "PATCH"
      }),
      invalidatesTags: (result, error, id) => [
        { type: "BookDocumentVisa", id },
        "BookDocumentVisa"
      ]
    }),

    // PATCH /book-document-visas/:id/status (Update Booking Status - Admin/Staff)
    updateBookDocumentVisaStatus: builder.mutation<
      BookDocumentVisaResponse,
      { id: string; status: StatusBookDocumentVisa | string }
    >({
      query: ({ id, status }) => ({
        url: `/book-document-visas/${id}/status`,
        method: "PATCH",
        body: { status }
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "BookDocumentVisa", id },
        "BookDocumentVisa"
      ]
    }),

    // PATCH /book-document-visas/:id (Update Order Details: Booker, Note, Applicants)
    updateBookDocumentVisaDetails: builder.mutation<
      BookDocumentVisaResponse,
      { id: string; body: UpdateBookDocumentVisaDetailsDto }
    >({
      query: ({ id, body }) => ({
        url: `/book-document-visas/${id}`,
        method: "PATCH",
        body
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "BookDocumentVisa", id },
        "BookDocumentVisa"
      ]
    })
  })
});

export const {
  useCreateBookDocumentVisaMutation,
  useFindAllBookDocumentVisasQuery,
  useFindBookDocumentVisaByIdQuery,
  useUploadApplicantFileMutation,
  useCancelBookDocumentVisaMutation,
  useUpdateBookDocumentVisaStatusMutation,
  useUpdateBookDocumentVisaDetailsMutation
} = bookDocumentVisaService;
