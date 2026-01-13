import { z } from "zod";

export const touristSchema = z.object({
  gender: z.string().min(1, "Gender is required"),
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  passportNumber: z.string().min(1, "Passport number is required")
});

export const orderTourSchema = z
  .object({
    tourists: z.array(touristSchema).min(1, "At least one traveler is required")
  })
  .superRefine((data, ctx) => {
    const passportNumbers = data.tourists.map((t) => t.passportNumber.trim());
    data.tourists.forEach((tourist, index) => {
      const passport = tourist.passportNumber.trim();
      if (passport && passportNumbers.filter((p) => p === passport).length > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nomor Passport tidak boleh sama",
          path: ["tourists", index, "passportNumber"]
        });
      }
    });
  });

export type OrderTourValues = z.infer<typeof orderTourSchema>;
export type TouristValues = z.infer<typeof touristSchema>;
