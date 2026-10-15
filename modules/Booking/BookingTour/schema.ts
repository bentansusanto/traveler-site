import { z } from "zod";

export const getOrderTourSchema = (t?: (key: string, params?: any) => string) => {
  const msg = (key: string, fallback: string) => (t ? t(key) : fallback);

  const touristSchema = z.object({
    gender: z.string().min(1, msg("salutationRequired", "Titel wajib dipilih")),
    name: z.string().min(1, msg("fullNameRequired", "Nama lengkap wajib diisi")),
    phoneNumber: z
      .string()
      .trim()
      .min(1, msg("phoneRequired", "Nomor telepon wajib diisi"))
      .regex(/^[0-9]+$/, msg("phoneDigitsOnly", "Nomor telepon hanya boleh berisi angka"))
      .min(8, msg("phoneMin", "Nomor telepon minimal 8 digit"))
      .max(15, msg("phoneMax", "Nomor telepon maksimal 15 digit")),
    nationality: z.string().min(1, msg("nationalityRequired", "Kewarganegaraan wajib dipilih")),
    passportNumber: z
      .string()
      .trim()
      .min(1, msg("passportRequired", "Nomor Passport wajib diisi"))
      .regex(
        /^[a-zA-Z0-9]{5,15}$/,
        msg("passportInvalid", "Nomor Passport harus 5-15 karakter alfanumerik (tanpa spasi atau simbol)")
      )
  });

  const bookerSchema = z.object({
    name: z.string().min(1, msg("bookerNameRequired", "Nama pemesan wajib diisi")),
    email: z
      .string()
      .min(1, msg("emailRequired", "Email pemesan wajib diisi"))
      .email(msg("emailInvalid", "Format email tidak valid")),
    phone: z
      .string()
      .trim()
      .min(1, msg("phoneRequired", "Nomor telepon wajib diisi"))
      .regex(/^[0-9]+$/, msg("phoneDigitsOnly", "Nomor telepon hanya boleh berisi angka"))
      .min(8, msg("phoneMin", "Nomor telepon minimal 8 digit"))
      .max(15, msg("phoneMax", "Nomor telepon maksimal 15 digit"))
  });

  return z
    .object({
      booker: bookerSchema,
      tourists: z.array(touristSchema).min(1, msg("minOneTraveler", "Minimal 1 traveler wajib diisi")),
      add_ons: z.array(z.string()).optional()
    })
    .superRefine((data, ctx) => {
      const passportNumbers = data.tourists.map((t) => t.passportNumber.trim());
      data.tourists.forEach((tourist, index) => {
        const passport = tourist.passportNumber.trim();
        if (passport && passportNumbers.filter((p) => p === passport).length > 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: msg("duplicatePassport", "Nomor Passport tidak boleh sama"),
            path: ["tourists", index, "passportNumber"]
          });
        }
      });
    });
};

export const orderTourSchema = getOrderTourSchema();

export const touristSchema = z.object({
  gender: z.string().min(1, "Titel wajib dipilih"),
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Nomor telepon wajib diisi")
    .regex(/^[0-9]+$/, "Nomor telepon hanya boleh berisi angka")
    .min(8, "Nomor telepon minimal 8 digit")
    .max(15, "Nomor telepon maksimal 15 digit"),
  nationality: z.string().min(1, "Kewarganegaraan wajib dipilih"),
  passportNumber: z
    .string()
    .trim()
    .min(1, "Nomor Passport wajib diisi")
    .regex(
      /^[a-zA-Z0-9]{5,15}$/,
      "Nomor Passport harus 5-15 karakter alfanumerik (tanpa spasi atau simbol)"
    )
});

export const bookerSchema = z.object({
  name: z.string().min(1, "Nama pemesan wajib diisi"),
  email: z.string().email("Format email tidak valid").min(1, "Email pemesan wajib diisi"),
  phone: z
    .string()
    .trim()
    .min(1, "Nomor telepon wajib diisi")
    .regex(/^[0-9]+$/, "Nomor telepon hanya boleh berisi angka")
    .min(8, "Nomor telepon minimal 8 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
});

export type OrderTourValues = z.infer<typeof orderTourSchema>;
export type TouristValues = z.infer<typeof touristSchema>;
export type BookerValues = z.infer<typeof bookerSchema>;
