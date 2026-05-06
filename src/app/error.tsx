"use client";

import { useEffect } from "react";

import ErrorDisplay from "@/components/base/error-display";

export default function AppError({
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
    <ErrorDisplay
      status={500}
      title="Something went amiss"
      message={
        error?.message?.length && error.message.length < 200
          ? error.message
          : "An unexpected error interrupted this view. Try again or return home."
      }
      onRetry={reset}
    />
  );
}
