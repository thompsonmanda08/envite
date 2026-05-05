import { APIResponse } from "@/types";

/**
 * Normalises a backend response into our standard APIResponse, preserving the
 * server's success flag and pagination shape (both camel and snake aliases).
 */
export function fromBackend<T = any>(
  axiosResponse: any,
  message?: string,
): APIResponse<T> {
  const body = axiosResponse?.data;
  const raw = body?.pagination;

  const pagination = raw
    ? {
        ...raw,
        page_size: raw.pageSize ?? raw.page_size,
        total_pages: raw.totalPages ?? raw.total_pages,
        has_next: raw.hasNext ?? raw.has_next,
        has_prev: raw.hasPrev ?? raw.hasPrevious ?? raw.has_prev,
        totalCount: raw.total ?? raw.totalCount,
        limit: raw.pageSize ?? raw.limit ?? raw.page_size,
        pageSize: raw.pageSize ?? raw.page_size,
        totalPages: raw.totalPages ?? raw.total_pages,
        hasNext: raw.hasNext ?? raw.has_next,
        hasPrev: raw.hasPrev ?? raw.hasPrevious ?? raw.has_prev,
      }
    : undefined;

  return {
    success: body?.success ?? false,
    message: message || body?.message || "",
    data: (body?.data ?? null) as T | null,
    pagination,
  };
}

export function successResponse<T = any>(
  data: T | null,
  message: string = "Action completed successfully",
  pagination?: any,
): APIResponse<T> {
  return { success: true, message, data, pagination };
}

export function unauthorizedResponse(
  message: string = "Unauthorized",
): APIResponse {
  return { success: false, message, data: null };
}

export function notFoundResponse(message: string): APIResponse {
  return { success: false, message, data: null };
}

export function methodNotAllowedResponse(): APIResponse {
  return { success: false, message: "Method not allowed", data: null };
}

export function badRequestResponse(message: string): APIResponse {
  return { success: false, message, data: null };
}

export function handleError(
  error: any,
  method = "GET",
  url = "",
): APIResponse {
  // Let Next.js navigation errors propagate.
  if (
    typeof error?.digest === "string" &&
    (error.digest.startsWith("NEXT_REDIRECT") ||
      error.digest.startsWith("NEXT_NOT_FOUND"))
  ) {
    throw error;
  }

  const errorLog: any = { endpoint: `${method} | ${url}` };
  if (error?.response) {
    errorLog.status = error.response.status;
    errorLog.statusText = error.response.statusText;
    errorLog.data = error.response.data;
  } else {
    errorLog.message = error?.message || String(error);
    errorLog.code = error?.code;
  }
  console.error(errorLog);

  const status = error?.response?.status || 500;

  if (status === 401) {
    return unauthorizedResponse(
      error?.response?.data?.message ||
        "Authentication required. Please log in again.",
    );
  }

  if (status === 403) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "You don't have permission to perform this action.",
      data: null,
    };
  }

  return {
    success: false,
    message:
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Oops! Something went wrong. Please try again.",
    data: null,
  };
}
