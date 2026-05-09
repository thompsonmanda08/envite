import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full bg-transparent text-foreground placeholder:text-mute/60 outline-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "rounded-xl border border-hairline bg-background focus-visible:border-foreground/40",
        bare: "rounded-none border-0 border-b border-hairline px-0 focus-visible:border-foreground",
        pill: "rounded-full border border-hairline bg-background focus-visible:border-foreground/40",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-4 text-sm",
        lg: "h-12 px-5 text-base",
      },
    },
    compoundVariants: [
      { variant: "bare", size: "sm", class: "px-0" },
      { variant: "bare", size: "default", class: "px-0" },
      { variant: "bare", size: "lg", class: "px-0" },
      { variant: "pill", size: "default", class: "px-5" },
      { variant: "pill", size: "lg", class: "px-6" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> &
  VariantProps<typeof inputVariants> & {
    label?: string;
    name?: string;
    error?: string;
    hint?: string;
    isInvalid?: boolean;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    classNames?: {
      wrapper?: string;
      input?: string;
      label?: string;
      error?: string;
      hint?: string;
    };
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant,
      size,
      className,
      classNames,
      label,
      name,
      id,
      error,
      hint,
      isInvalid,
      startContent,
      endContent,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const fieldId = id ?? name;
    const invalid = isInvalid || !!error;

    return (
      <div className={cn("flex w-full flex-col gap-2", classNames?.wrapper)}>
        {label && (
          <label
            htmlFor={fieldId}
            className={cn(
              "font-brand text-xs uppercase tracking-[0.32em] text-mute",
              invalid && "text-destructive",
              classNames?.label,
            )}
          >
            {label}
            {props?.required && <span className="ml-1 text-foreground">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {startContent && (
            <span className="pointer-events-none absolute left-3 grid place-items-center text-mute">
              {startContent}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            name={name}
            type={type}
            aria-invalid={invalid || undefined}
            className={cn(
              inputVariants({ variant, size }),
              startContent && "pl-10",
              endContent && "pr-10",
              className,
              classNames?.input,
            )}
            {...props}
          />
          {endContent && (
            <span className="absolute right-3 grid place-items-center text-mute">
              {endContent}
            </span>
          )}
        </div>

        {error ? (
          <p
            className={cn("text-xs italic text-destructive", classNames?.error)}
          >
            {error}
          </p>
        ) : hint ? (
          <p className={cn("text-xs italic text-mute", classNames?.hint)}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input, inputVariants };
