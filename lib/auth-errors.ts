/**
 * Safely extracts and localizes backend error messages from NestJS / ErrorsService payloads.
 */
export function extractAuthErrorMessage(err: any, t?: (key: string) => string): string {
  // 1. Extract raw granular message from backend structure:
  //    - err.data.error.body
  //    - err.data.error[0].body
  //    - err.data.error
  //    - err.data.Error.body
  //    - err.data.message (skip if generic 'Validation error')
  //    - err.message
  let raw =
    err?.data?.error?.body ||
    (Array.isArray(err?.data?.error) ? err.data.error[0]?.body || err.data.error[0]?.message : null) ||
    err?.data?.Error?.body ||
    (Array.isArray(err?.data?.Error) ? err.data.Error[0]?.body : null) ||
    (typeof err?.data?.error === "string" ? err.data.error : null) ||
    (err?.data?.message && err?.data?.message !== "Validation error" ? err?.data?.message : null) ||
    (err?.message && err?.message !== "Validation error" ? err?.message : null) ||
    "";

  if (typeof raw !== "string") {
    raw = typeof raw === "object" ? JSON.stringify(raw) : String(raw || "");
  }

  const lower = raw.toLowerCase();

  // If translation function is available, map common backend error phrases
  if (t) {
    if (
      lower.includes("invalid email or password") ||
      lower.includes("invalid password") ||
      lower.includes("invalid credentials") ||
      lower.includes("password is incorrect") ||
      lower.includes("wrong password")
    ) {
      return t("invalidCredentials");
    }

    if (lower.includes("not verified") || lower.includes("account not verified")) {
      return t("accountNotVerified");
    }

    if (
      lower.includes("already registered") ||
      lower.includes("already in use") ||
      lower.includes("already exists") ||
      lower.includes("email is already")
    ) {
      return t("emailAlreadyRegistered");
    }

    if (lower.includes("not found") || lower.includes("does not exist")) {
      return t("userNotFound");
    }

    if (lower.includes("too many requests") || lower.includes("too many attempts")) {
      return t("tooManyRequests");
    }

    if (
      lower.includes("token has expired") ||
      lower.includes("invalid verification token") ||
      lower.includes("expired")
    ) {
      return t("verificationFailed");
    }

    if (!raw || raw === "Validation error" || raw === "Bad Request") {
      return t("loginFailed");
    }
  }

  // Fallback if no translation or translation doesn't match
  if (!raw || raw === "Validation error" || raw === "Bad Request") {
    return "Login failed. Please check your credentials.";
  }

  return raw;
}
