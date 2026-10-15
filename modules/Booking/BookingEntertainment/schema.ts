import { z } from "zod";

export const getOrderEntertainmentSchema = (t?: (key: string, params?: any) => string) => {
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
      .min(1, msg("passportRequired", "Nomor KTP / Paspor wajib diisi"))
      .regex(
        /^[a-zA-Z0-9]{5,20}$/,
        msg("passportInvalid", "Nomor KTP/Paspor harus 5-20 karakter alfanumerik (tanpa spasi)")
      ),
    birthDate: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\d{2}-\d{2}-\d{4}$/.test(val),
        msg("birthDateInvalid", "Format tanggal lahir harus DD-MM-YYYY (contoh: 15-08-1995)")
      ),
    ticket_id: z.string().optional(),
    ticket_name: z.string().optional()
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
      tourists: z.array(touristSchema).min(1, msg("minOneTraveler", "Minimal 1 pengunjung/traveler wajib diisi")),
      add_ons: z.array(z.string()).optional()
    })
    .superRefine((data, ctx) => {
      const passportNumbers = data.tourists
        .map((t) => t.passportNumber?.trim())
        .filter(Boolean);

      data.tourists.forEach((tourist, index) => {
        const passport = tourist.passportNumber?.trim();
        if (passport && passportNumbers.filter((p) => p === passport).length > 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: msg("duplicatePassport", "Nomor Paspor / KTP tidak boleh sama antar traveler"),
            path: ["tourists", index, "passportNumber"]
          });
        }
      });
    });
};

export const orderEntertainmentSchema = getOrderEntertainmentSchema();

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
    .min(1, "Nomor KTP / Paspor wajib diisi")
    .regex(
      /^[a-zA-Z0-9]{5,20}$/,
      "Nomor KTP/Paspor harus 5-20 karakter alfanumerik (tanpa spasi)"
    ),
  birthDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{2}-\d{2}-\d{4}$/.test(val),
      "Format tanggal lahir harus DD-MM-YYYY (contoh: 15-08-1995)"
    ),
  ticket_id: z.string().optional(),
  ticket_name: z.string().optional()
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

export type OrderEntertainmentValues = z.infer<typeof orderEntertainmentSchema>;
export type TouristValues = z.infer<typeof touristSchema>;
export type BookerValues = z.infer<typeof bookerSchema>;
