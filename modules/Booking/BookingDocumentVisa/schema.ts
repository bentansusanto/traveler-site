import { z } from "zod";

export interface ApplicantFormValues {
  full_name: string;
  gender: "male" | "female" | "Mr" | "Mrs" | "Miss" | "Ms";
  nationality: string;
  passport_number: string;
  birth_date?: string;
  birth_place?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  occupation?: string;
}

export interface OrderDocumentVisaValues {
  booker: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
  target_travel_date?: string;
  note?: string;
  shipping_address?: string;
  applicants: ApplicantFormValues[];
}

export interface DocumentVisaContext {
  visaType?: string;
  categorySlug?: string;
  title?: string;
}

export const getOrderDocumentVisaSchema = (
  localeOrT?: string | ((key: string) => string),
  context?: DocumentVisaContext
) => {
  const isFunction = typeof localeOrT === "function";
  const locale = typeof localeOrT === "string" ? localeOrT : "id";
  const isTr = locale === "tr";
  const isEn = locale === "en";

  const msg = (key: string, fallbackId: string, fallbackEn: string, fallbackTr: string) => {
    if (isFunction) {
      try {
        const res = localeOrT(key);
        if (res) return res;
      } catch {
        // next-intl throws if key is not found in active namespace
      }
    }
    return isTr ? fallbackTr : isEn ? fallbackEn : fallbackId;
  };

  const visaType = context?.visaType || "";
  const categorySlug = (context?.categorySlug || "").toLowerCase();
  const title = (context?.title || "").toLowerCase();

  const isPassportNew =
    visaType === "passport_new" ||
    ((categorySlug === "passport" || title.includes("paspor") || title.includes("passport")) &&
      (title.includes("baru") || title.includes("new") || title.includes("pertama")));

  const isGeneralDocument =
    categorySlug === "legalisation" ||
    categorySlug === "sworn-translator" ||
    categorySlug === "travel-insurance" ||
    visaType === "other" ||
    title.includes("legalisir") ||
    title.includes("legalisasi") ||
    title.includes("terjemah") ||
    title.includes("asuransi") ||
    title.includes("penerjemah");

  // Determine passport number validation schema based on service type
  let passportNumberSchema: z.ZodType<any> = z
    .string()
    .min(1, msg("passportRequired", "Nomor paspor wajib diisi", "Passport number is required", "Pasaport numarası zorunludur"));

  if (isPassportNew) {
    passportNumberSchema = z
      .string()
      .min(1, msg("nikRequired", "Nomor NIK / KTP wajib diisi", "National ID (NIK) is required", "Kimlik numarası zorunludur"));
  } else if (isGeneralDocument) {
    passportNumberSchema = z.string().optional();
  }

  // Birth date and place are mandatory for new passport registration
  const birthDateSchema = isPassportNew
    ? z.string().min(1, msg("birthDateRequired", "Tanggal lahir wajib diisi", "Date of birth is required", "Doğum tarihi zorunludur"))
    : z.string().optional();

  const birthPlaceSchema = isPassportNew
    ? z.string().min(1, msg("birthPlaceRequired", "Tempat lahir wajib diisi", "Place of birth is required", "Doğum yeri zorunludur"))
    : z.string().optional();

  return z.object({
    booker: z.object({
      name: z.string().min(1, msg("bookerNameRequired", "Nama pemesan wajib diisi", "Booker name is required", "Sipariş verenin adı zorunludur")),
      email: z
        .string()
        .min(1, msg("emailRequired", "Email pemesan wajib diisi", "Booker email is required", "Sipariş verenin e-postası zorunludur"))
        .email(msg("emailInvalid", "Format email tidak valid", "Invalid email format", "Geçersiz e-posta formatı")),
      phone: z
        .string()
        .trim()
        .min(8, msg("phoneMin", "Nomor telepon minimal 8 digit", "Phone number must be at least 8 digits", "Telefon numarası en az 8 haneli olmalıdır"))
        .max(15, msg("phoneMax", "Nomor telepon maksimal 15 digit", "Phone number must be at most 15 digits", "Telefon numarası en fazla 15 haneli olmalıdır"))
    }),
    applicants: z
      .array(
        z.object({
          full_name: z.string().min(1, msg("fullNameRequired", "Nama lengkap pemohon wajib diisi", "Applicant full name is required", "Başvuru sahibinin tam adı zorunludur")),
          gender: z.string().min(1, msg("genderRequired", "Pilih jenis kelamin / titel", "Please select title / gender", "Cinsiyet / unvan seçiniz")),
          nationality: z.string().min(1, msg("nationalityRequired", "Kewarganegaraan wajib diisi", "Nationality is required", "Uyruk zorunludur")),
          passport_number: passportNumberSchema,
          birth_date: birthDateSchema,
          birth_place: birthPlaceSchema,
          passport_issue_date: z.string().optional(),
          passport_expiry_date: z.string().optional(),
          occupation: z.string().optional()
        })
      )
      .min(1, msg("minOneApplicant", "Minimal 1 pemohon wajib diisi", "At least 1 applicant is required", "En az 1 başvuru sahibi zorunludur"))
  });
};
