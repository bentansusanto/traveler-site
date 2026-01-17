import { z } from "zod";

export const profileSchema = z.object({
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9+\-\s()]+$/, "Phone number must be valid"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters")
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
