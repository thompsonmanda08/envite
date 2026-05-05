import DOMPurify from "isomorphic-dompurify";

/** Sanitize untrusted HTML before passing to dangerouslySetInnerHTML. */
export function safeHtml(input: string | undefined | null): { __html: string } {
  return { __html: DOMPurify.sanitize(input ?? "") };
}
