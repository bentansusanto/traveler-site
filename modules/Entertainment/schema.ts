import { z } from "zod";

/**
 * Filter & Search Query Schema
 */
export const entertainmentFilterSchema = z.object({
  search: z.string().trim().optional(),
  category_id: z.string().trim().optional(),
  sort: z.enum(["recommended", "price_asc", "price_desc", "newest"]).default("recommended"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12)
});

export type EntertainmentFilterValues = z.infer<typeof entertainmentFilterSchema>;

/**
 * Ticket Selection Item Schema
 */
export const ticketItemSelectionSchema = z.object({
  ticket_id: z.string().min(1, "Ticket ID is required"),
  ticket_name: z.string().optional(),
  unit_price: z.number().min(0),
  pax_count: z.number().int().min(1).default(1),
  qty: z.number().int().min(0, "Quantity cannot be negative")
});

export type TicketItemSelection = z.infer<typeof ticketItemSelectionSchema>;

/**
 * Ticket Booking Form Schema
 */
export const ticketBookingFormSchema = z.object({
  attraction_id: z.string().min(1, "Attraction ID is required"),
  attraction_name: z.string().min(1, "Attraction name is required"),
  booking_date: z.string().min(1, "Please select a visit date"),
  items: z.array(ticketItemSelectionSchema)
});

export type TicketBookingFormValues = z.infer<typeof ticketBookingFormSchema>;

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Manual validation function for filter parameters
 */
export function validateFilterParams(input: unknown): ValidationResult<EntertainmentFilterValues> {
  const result = entertainmentFilterSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  });

  return { success: false, errors };
}

/**
 * Manual validation function for ticket selection
 */
export function validateTicketSelection(
  input: unknown,
  dailyQuota?: number | null
): ValidationResult<TicketBookingFormValues> {
  const result = ticketBookingFormSchema.safeParse(input);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      errors[path] = issue.message;
    });
    return { success: false, errors };
  }

  const data = result.data;
  const totalQty = data.items.reduce((acc, item) => acc + (item.qty || 0), 0);

  if (totalQty <= 0) {
    return {
      success: false,
      errors: {
        items: "Please select at least 1 ticket to proceed"
      }
    };
  }

  if (dailyQuota != null && dailyQuota > 0 && totalQty > dailyQuota) {
    return {
      success: false,
      errors: {
        items: `Total tickets (${totalQty}) cannot exceed the daily quota of ${dailyQuota}`
      }
    };
  }

  return { success: true, data };
}
