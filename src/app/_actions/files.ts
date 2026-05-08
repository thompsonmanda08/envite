"use server";

import type { APIResponse } from "@/types";

import authenticatedApiClient, {
  axios,
  badRequestResponse,
  fromBackend,
  fromBackendList,
  handleError,
} from "./api-config";

export type FileCollection =
  | "qr_codes"
  | "event_banners"
  | "avatars"
  | "guest_lists"
  | "attachments";

export type FileRecord = {
  collection: FileCollection;
  record_id: string;
  filename: string;
  url?: string;
  size?: number;
  mime?: string;
  created_at?: string;
  [k: string]: unknown;
};

const PROTECTED: FileCollection[] = ["guest_lists", "attachments"];

export async function uploadFile(
  collection: FileCollection,
  file: File,
): Promise<APIResponse<FileRecord>> {
  if (!collection) return badRequestResponse("Collection required");
  if (!file) return badRequestResponse("File required");

  const url = `/api/v1/files/${collection}`;
  const data = new FormData();
  data.append("file", file);

  const client = PROTECTED.includes(collection)
    ? authenticatedApiClient
    : axios.post;

  try {
    const res = PROTECTED.includes(collection)
      ? await authenticatedApiClient({ url, method: "POST", data })
      : await axios.post(url, data);
    return fromBackend<FileRecord>(res);
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

export async function listFiles(
  collection: FileCollection,
  recordId: string,
): Promise<APIResponse<FileRecord[]>> {
  if (!collection) return badRequestResponse("Collection required");
  if (!recordId) return badRequestResponse("Record ID required");
  const url = `/api/v1/files/${collection}/${recordId}`;
  try {
    const res = PROTECTED.includes(collection)
      ? await authenticatedApiClient({ url, method: "GET" })
      : await axios.get(url);
    return fromBackendList<FileRecord>(res);
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

export async function deleteFile(
  collection: FileCollection,
  recordId: string,
  filename: string,
): Promise<APIResponse> {
  if (!collection) return badRequestResponse("Collection required");
  if (!recordId) return badRequestResponse("Record ID required");
  if (!filename) return badRequestResponse("Filename required");
  const url = `/api/v1/files/${collection}/${recordId}/${filename}`;
  try {
    const res = PROTECTED.includes(collection)
      ? await authenticatedApiClient({ url, method: "DELETE" })
      : await axios.delete(url);
    return fromBackend(res);
  } catch (error: any) {
    return handleError(error, "DELETE", url);
  }
}

// Build a public file URL (for <img>, <a download>, etc.).
// Caller must build absolute URL using NEXT_PUBLIC_API_BASE_URL when needed.
export async function fileUrl(
  collection: FileCollection,
  recordId: string,
  filename: string,
): Promise<string> {
  return `/api/v1/files/${collection}/${recordId}/${filename}`;
}
