/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { verifySession } from "@/lib/auth";

const BASE_URL =
  process.env.BASE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:4000";

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
      ...(!isFormData &&
        data !== undefined && {
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

// ─── Authenticated client ───────────────────────────────────────────────────
const authenticatedApiClient = async (
  reqConfig: RequestType,
): Promise<FetchResponse> => {
  const { isAuthenticated, session } = await verifySession();

  if (!isAuthenticated || !session?.access_token) {
    throw {
      response: { status: 401, data: { message: "No valid session" } },
      status: 401,
      message: "No valid session",
    };
  }

  // Let `request()` set Content-Type for FormData (it owns the multipart
  // boundary). Only inject a Content-Type header when the caller didn't pass
  // one explicitly AND the body isn't FormData.
  const isFormData = reqConfig.data instanceof FormData;
  const authHeaders: Record<string, string> = {
    Authorization: `Bearer ${session.access_token}`,
  };
  if (reqConfig.contentType) {
    authHeaders["Content-Type"] = reqConfig.contentType;
  } else if (!isFormData) {
    authHeaders["Content-Type"] = "application/json";
  }

  return await request({
    ...reqConfig,
    // caller-supplied headers win over our defaults EXCEPT Authorization,
    // which the auth client owns.
    headers: {
      ...authHeaders,
      ...reqConfig.headers,
      Authorization: authHeaders.Authorization,
    },
  });
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
