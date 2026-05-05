"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Spinner from "./spinner";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  spinnerVariant?: "default" | "dots" | "pulse" | "wave" | "ring";
  spinnerColor?: "primary" | "secondary" | "accent" | "white";
  loadingText?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      className,
      isLoading = false,
      spinnerVariant = "ring",
      spinnerColor = "white",
      loadingText,
      disabled,
      variant = "default",
      size = "default",
      ...props
    },
    ref,
  ) => {
    // Map button size to spinner size
    const spinnerSize = size === "lg" ? "sm" : size === "icon" ? "sm" : "sm";

    return (
      <Button
        className={cn(className)}
        disabled={disabled || isLoading}
        ref={ref}
        variant={variant as any}
        size={size}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Spinner
              variant={spinnerVariant}
              size={spinnerSize}
              color={spinnerColor}
            />
            {loadingText && <span className="ml-2">{loadingText}</span>}
          </div>
        ) : (
          children
        )}
      </Button>
    );
  },
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
