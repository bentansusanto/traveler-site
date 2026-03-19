import { z } from "zod";

export const touristSchema = z.object({
  gender: z.string().min(1, "Gender is required"),
  name: z.string().min(1, "Name is required"),
  phone_number: z.string().optional(),
  nationality: z.string().min(1, "Nationality is required"),
  passport_number: z.string().min(1, "Passport number is required")
});

export const orderRentMotorSchema = z.object({
  tourists: z.array(touristSchema).min(1, "At least one renter is required"),
  start_date: z.date({
    required_error: "Start date is required",
    invalid_type_error: "Invalid start date"
  }),
  end_date: z.date({
    required_error: "End date is required",
    invalid_type_error: "Invalid end date"
  })
}).refine((data) => data.end_date > data.start_date, {
  message: "End date must be after start date",
  path: ["end_date"]
});

export type OrderRentMotorValues = z.infer<typeof orderRentMotorSchema>;
export type TouristValues = z.infer<typeof touristSchema>;
