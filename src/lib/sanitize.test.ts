import { describe, expect, it } from "vitest";

import { safeHtml } from "./sanitize";

describe("safeHtml", () => {
  it("returns __html shape", () => {
    const r = safeHtml("<p>hi</p>");
    expect(r).toHaveProperty("__html");
  });

  it("strips <script> tags", () => {
    const r = safeHtml("<p>safe</p><script>alert(1)</script>");
    expect(r.__html).toContain("<p>safe</p>");
    expect(r.__html).not.toContain("<script>");
    expect(r.__html).not.toContain("alert");
  });

  it("preserves safe inline markup", () => {
    const r = safeHtml("<strong>bold</strong> <em>italic</em>");
    expect(r.__html).toContain("<strong>");
    expect(r.__html).toContain("<em>");
  });

  it("handles undefined input", () => {
    expect(safeHtml(undefined).__html).toBe("");
  });

  it("handles null input", () => {
    expect(safeHtml(null).__html).toBe("");
  });

  it("strips inline event handlers", () => {
    const r = safeHtml('<a href="#" onclick="alert(1)">link</a>');
    expect(r.__html).not.toContain("onclick");
  });
});
