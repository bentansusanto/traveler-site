import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery
} from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { setLogoutState } from "../slices/authSlice";

/**
 * Base fetch query — attaches Bearer token from cookie to every request.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers) => {
    const token = Cookies.get("customer_token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include"
});

/**
 * Wraps rawBaseQuery with automatic token refresh on 401.
 * If the refresh attempt also fails (session truly expired), clears the
 * token cookie, dispatches logout, and redirects the browser to the
 * localised login page.
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the session
    const refreshResult = await rawBaseQuery(
      { url: "/customers/refresh-token", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const responseData = refreshResult.data as any;
      const newToken =
        responseData?.data?.session ||
        responseData?.session ||
        responseData?.data?.access_token ||
        responseData?.access_token ||
        null;

      if (newToken) {
        // Save new token and retry the original request
        Cookies.set("customer_token", newToken, {
          expires: 7,
          sameSite: "lax",
          path: "/"
        });
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh succeeded but token was not in response — log out
        handleSessionExpired(api);
      }
    } else {
      // Refresh itself returned 401 / error — session is truly expired
      handleSessionExpired(api);
    }
  }

  return result;
};

/**
 * Clears credentials and redirects to the login page.
 * Works both on client and during SSR (no-op on server).
 */
function handleSessionExpired(api: any) {
  Cookies.remove("customer_token");
  api.dispatch(setLogoutState());

  if (typeof window !== "undefined") {
    // Derive locale from the current path, e.g. /en/orders/... → "en"
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    const supportedLocales = ["en", "id", "tr"];
    const locale =
      pathSegments.length > 0 && supportedLocales.includes(pathSegments[0])
        ? pathSegments[0]
        : "en";

    window.location.href = `/${locale}/login`;
  }
}
