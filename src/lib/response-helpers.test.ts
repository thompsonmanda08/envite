import { describe, expect, it } from "vitest";
import { fromBackend, handleError } from "./response-helpers";

describe("fromBackend", () => {
  it("preserves backend success flag", () => {
    const result = fromBackend({
      data: { success: true, message: "ok", data: { id: "1" } },
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: "1" });
    expect(result.message).toBe("ok");
  });

  it("normalises pagination camel + snake aliases", () => {
    const result = fromBackend({
      data: {
        success: true,
        data: [],
        pagination: {
          page: 1,
          pageSize: 20,
          totalPages: 5,
          total: 100,
          hasNext: true,
          hasPrev: false,
        },
      },
    });
    expect(result.pagination?.page_size).toBe(20);
    expect(result.pagination?.total_pages).toBe(5);
    expect(result.pagination?.totalCount).toBe(100);
    expect(result.pagination?.has_next).toBe(true);
    expect(result.pagination?.hasPrev).toBe(false);
  });

  it("falls back to success=false when backend omits flag", () => {
    const result = fromBackend({ data: { data: null } });
    expect(result.success).toBe(false);
  });
});

describe("handleError", () => {
  it("returns 401 message verbatim", () => {
    const r = handleError(
      { response: { status: 401, data: { message: "Token expired" } } },
      "GET",
      "/x",
    );
    expect(r.success).toBe(false);
    expect(r.message).toBe("Token expired");
  });

  it("rethrows NEXT_REDIRECT digests", () => {
    expect(() =>
      handleError({ digest: "NEXT_REDIRECT;..." }, "GET", "/x"),
    ).toThrow();
  });
});
