import { z } from "zod";

export const getOrderRentMotorSchema = (t?: (key: string, params?: any) => string) => {
  const msg = (key: string, fallback: string) => (t ? t(key) : fallback);

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

  const touristSchema = z.object({
    gender: z.string().min(1, msg("salutationRequired", "Titel wajib dipilih")),
    name: z.string().min(1, msg("fullNameRequired", "Nama lengkap wajib diisi")),
    phone_number: z
      .string()
      .trim()
      .min(1, msg("phoneRequired", "Nomor telepon wajib diisi"))
      .regex(/^[0-9]+$/, msg("phoneDigitsOnly", "Nomor telepon hanya boleh berisi angka"))
      .min(8, msg("phoneMin", "Nomor telepon minimal 8 digit"))
      .max(15, msg("phoneMax", "Nomor telepon maksimal 15 digit")),
    nationality: z.string().min(1, msg("nationalityRequired", "Kewarganegaraan wajib diisi")),
    passport_number: z
      .string()
      .trim()
      .min(1, msg("passportRequired", "Nomor KTP/Paspor wajib diisi"))
      .regex(
        /^[a-zA-Z0-9]{5,25}$/,
        msg("passportInvalid", "Nomor KTP/Paspor harus 5-25 karakter alfanumerik (tanpa spasi)")
      )
  });

  return z
    .object({
      booker: bookerSchema,
      tourists: z.array(touristSchema).min(1, msg("minOneRenter", "Minimal 1 data pengendara/penyewa wajib diisi")),
      start_date: z.date({
        required_error: msg("startDateRequired", "Tanggal mulai sewa wajib diisi"),
        invalid_type_error: msg("startDateInvalid", "Format tanggal mulai tidak valid")
      }),
      end_date: z.date({
        required_error: msg("endDateRequired", "Tanggal selesai sewa wajib diisi"),
        invalid_type_error: msg("endDateInvalid", "Format tanggal selesai tidak valid")
      }),
      add_ons: z.array(z.string()).optional()
    })
    .refine((data) => data.end_date > data.start_date, {
      message: msg("endDateAfterStart", "Tanggal selesai sewa harus setelah tanggal mulai"),
      path: ["end_date"]
    });
};

export const orderRentMotorSchema = getOrderRentMotorSchema();

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

export const touristSchema = z.object({
  gender: z.string().min(1, "Titel wajib dipilih"),
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  phone_number: z
    .string()
    .trim()
    .min(1, "Nomor telepon wajib diisi")
    .regex(/^[0-9]+$/, "Nomor telepon hanya boleh berisi angka")
    .min(8, "Nomor telepon minimal 8 digit")
    .max(15, "Nomor telepon maksimal 15 digit"),
  nationality: z.string().min(1, "Kewarganegaraan wajib diisi"),
  passport_number: z
    .string()
    .trim()
    .min(1, "Nomor KTP/Paspor wajib diisi")
    .regex(
      /^[a-zA-Z0-9]{5,25}$/,
      "Nomor KTP/Paspor harus 5-25 karakter alfanumerik (tanpa spasi)"
    )
});

export type OrderRentMotorValues = z.infer<typeof orderRentMotorSchema>;
export type TouristValues = z.infer<typeof touristSchema>;
export type BookerValues = z.infer<typeof bookerSchema>;

