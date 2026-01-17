import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    code: z.string().min(1, "Verification code is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
      .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
      .regex(/(?=.*\d)/, "Password must contain at least one number")
      .regex(
        /(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/,
        "Password must contain at least one special character"
      ),
    retryPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.retryPassword, {
    message: "Passwords do not match",
    path: ["retryPassword"]
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
