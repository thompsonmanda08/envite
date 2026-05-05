import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
      xl: "size-8",
    },
    color: {
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent",
      white: "text-white",
    },
  },
  defaultVariants: {
    size: "sm",
    color: "primary",
  },
});

export type SpinnerProps = React.SVGProps<SVGSVGElement> &
  VariantProps<typeof spinnerVariants> & {
    variant?: "default" | "dots" | "pulse" | "wave" | "ring";
  };

export function Spinner({
  className,
  size,
  color,
  variant: _variant,
  ...props
}: SpinnerProps) {
  return (
    <svg
      className={cn(spinnerVariants({ size, color }), className)}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Spinner;
