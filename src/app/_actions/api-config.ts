/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { verifySession, updateAuthSession } from "@/lib/auth";
import { AUTH_SESSION } from "@/lib/constants";
import type { AuthSession } from "@/types";

const BASE_URL =
  process.env.BASE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:8080";

// ─── Axios-compatible response shape ────────────────────────────────────────
type FetchResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: RequestConfig;
};

type RequestConfig = {
  url?: string;
  method?: string;
  data?: any;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  params?: Record<string, string>;
  responseType?: "json" | "blob" | "arraybuffer" | "text";
  next?: NextFetchRequestConfig;
  cache?: RequestCache;
};

export type RequestType = RequestConfig & {
  contentType?: string;
};

// ─── Core fetch wrapper ─────────────────────────────────────────────────────
async function request(config: RequestConfig): Promise<FetchResponse> {
  const {
    url = "",
    method = "GET",
    data,
    headers = {},
    params,
    responseType,
    next,
    cache,
  } = config;

  const search = params ? `?${new URLSearchParams(params).toString()}` : "";
  const fullUrl = `${BASE_URL}${url}${search}`;
  const isFormData = data instanceof FormData;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      ...(!isFormData && data !== undefined && {
        "Content-Type": "application/json",
      }),
      ...headers,
    },
    ...(data !== undefined && {
      body: isFormData ? data : JSON.stringify(data),
    }),
    ...(next !== undefined && { next }),
    ...(cache !== undefined && { cache }),
  };

  let res: Response;
  try {
    res = await fetch(fullUrl, fetchOptions);
  } catch (err: any) {
    const code =
      err?.cause?.code ||
      (err?.message?.includes("fetch failed") ? "ECONNREFUSED" : undefined);
    throw {
      code,
      message: err?.message || "Network request failed",
      response: undefined,
    };
  }

  let body: any;
  if (responseType === "arraybuffer") {
    body = await res.arrayBuffer();
  } else if (responseType === "blob") {
    body = await res.blob();
  } else {
    const text = await res.text();
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { message: text };
    }
  }

  const response: FetchResponse = {
    data: body,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
    config,
  };

  if (!res.ok) {
    throw {
      response,
      status: res.status,
      message: body?.message || body?.error || res.statusText,
      code: undefined,
    };
  }

  return response;
}

// ─── Public axios-shaped client ─────────────────────────────────────────────
function axiosCompat(config: RequestConfig): Promise<FetchResponse> {
  return request(config);
}
axiosCompat.get = (
  url: string,
  options?: Omit<RequestConfig, "method" | "url">,
): Promise<FetchResponse> => request({ ...options, url, method: "GET" });
axiosCompat.post = (
  url: string,
  body?: any,
  options?: Omit<RequestConfig, "method" | "url" | "data">,
): Promise<FetchResponse> =>
  request({ ...options, url, method: "POST", data: body });
axiosCompat.put = (
  url: string,
  body?: any,
  options?: Omit<RequestConfig, "method" | "url" | "data">,
): Promise<FetchResponse> =>
  request({ ...options, url, method: "PUT", data: body });
axiosCompat.patch = (
  url: string,
  body?: any,
  options?: Omit<RequestConfig, "method" | "url" | "data">,
): Promise<FetchResponse> =>
  request({ ...options, url, method: "PATCH", data: body });
axiosCompat.delete = (
  url: string,
  options?: Omit<RequestConfig, "method" | "url">,
): Promise<FetchResponse> => request({ ...options, url, method: "DELETE" });

export const axios = axiosCompat;

// ─── Silent token refresh ───────────────────────────────────────────────────
async function silentRefresh(
  session: AuthSession,
): Promise<AuthSession | null> {
  if (!session.refresh_token) return null;
  try {
    const res = await axios.post("/api/v1/auth/refresh", {
      refreshToken: session.refresh_token,
    });
    const data = res.data?.data || res.data;
    const newAccess = data?.accessToken || data?.access_token;
    if (!newAccess) return null;

    const expiresIn: number | undefined = data?.expiresIn;
    const newExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : undefined;

    const updated = await updateAuthSession({
      access_token: newAccess,
      refresh_token:
        data?.refreshToken || data?.refresh_token || session.refresh_token,
      expiresAt: newExpiresAt,
      expiresIn,
    });
    return updated ?? null;
  } catch {
    return null;
  }
}

// ─── Authenticated client ───────────────────────────────────────────────────
const authenticatedApiClient = async (
  reqConfig: RequestType,
  retryCount = 0,
): Promise<FetchResponse> => {
  const maxRetries = 1;
  const retryDelay = 200;

  try {
    let { isAuthenticated, session } = await verifySession();

    if (!isAuthenticated && session?.refresh_token) {
      const refreshed = await silentRefresh(session);
      if (refreshed) {
        session = refreshed;
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated || !session?.access_token) {
      if (retryCount < maxRetries) {
        await new Promise((r) => setTimeout(r, retryDelay));
        return authenticatedApiClient(reqConfig, retryCount + 1);
      }
      throw new Error("No valid session found");
    }

    const headers: Record<string, string> = {
      "Content-Type": reqConfig.contentType || "application/json",
      Authorization: `Bearer ${session.access_token}`,
      Cookie: `${AUTH_SESSION}=${session.access_token}`,
    };
    if (session.organization_id) {
      headers["X-Organization-ID"] = session.organization_id;
    }

    const config: RequestConfig = {
      method: "GET",
      ...reqConfig,
      headers: { ...headers, ...reqConfig.headers },
    };

    return await request(config);
  } catch (error: any) {
    if (error?.response?.status === 401 && retryCount === 0) {
      const { session } = await verifySession();
      if (session?.refresh_token) {
        const refreshed = await silentRefresh(session);
        if (refreshed) {
          return authenticatedApiClient(reqConfig, retryCount + 1);
        }
      }
      try {
        const { deleteSession } = await import("@/lib/auth");
        await deleteSession();
      } catch {
        // best-effort cleanup
      }
    }

    if (
      error?.message === "No valid session found" &&
      retryCount < maxRetries
    ) {
      await new Promise((r) => setTimeout(r, retryDelay * (retryCount + 1)));
      return authenticatedApiClient(reqConfig, retryCount + 1);
    }
    throw error;
  }
};

export default authenticatedApiClient;

// Re-export response helpers so callers can do
// `import authenticatedApiClient, { fromBackend, handleError } from "./api-config"`
export {
  fromBackend,
  handleError,
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  methodNotAllowedResponse,
  badRequestResponse,
} from "@/lib/response-helpers";

export const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
} as const;
