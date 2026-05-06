"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof console !== "undefined") console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "2rem",
            fontFamily:
              "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
            background: "#fafafa",
            color: "#111",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 480 }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                opacity: 0.55,
              }}
            >
              A misstep
            </p>
            <h1
              style={{
                fontSize: "clamp(3rem, 12vw, 6rem)",
                fontWeight: 500,
                lineHeight: 1,
                margin: "1rem 0 0.5rem",
                opacity: 0.15,
              }}
            >
              500
            </h1>
            <h2
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                fontWeight: 500,
                margin: "1rem 0",
              }}
            >
              The application could not start.
            </h2>
            <p style={{ fontStyle: "italic", opacity: 0.65 }}>
              Try refreshing the page.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 24,
                padding: "12px 24px",
                background: "#111",
                color: "#fafafa",
                border: 0,
                borderRadius: 999,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
