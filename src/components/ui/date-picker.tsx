"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  /** Date object value */
  value?: Date;
  /** Callback with Date object */
  onValueChange?: (value?: Date) => void;
  /** String value in "YYYY-MM-DD" format — alternative to value/onValueChange */
  stringValue?: string;
  /** Callback with "YYYY-MM-DD" string — alternative to onValueChange */
  onStringValueChange?: (value: string) => void;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DatePicker({
  value,
  onValueChange,
  stringValue,
  onStringValueChange,
  label,
  name,
  placeholder,
  required,
  disabled,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const resolvedDate = React.useMemo(() => {
    if (value) return value;
    if (stringValue) {
      try {
        return parseISO(stringValue);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }, [value, stringValue]);

  const disabledDates = React.useMemo(() => {
    if (!minDate && !maxDate) return undefined;
    return (date: Date) => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    };
  }, [minDate, maxDate]);

  function handleSelect(date?: Date) {
    if (onValueChange) onValueChange(date);
    if (onStringValueChange)
      onStringValueChange(date ? format(date, "yyyy-MM-dd") : "");
    setOpen(false);
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      {label && (
        <label
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
          htmlFor={name}
        >
          {label}
          {required && (
            <span className="text-red-500 font-bold ml-0.5"> *</span>
          )}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={name}
            type="button"
            disabled={disabled}
            className={cn(
              // Match Input base styles
              "w-full flex items-center gap-2 px-4 py-1.75 text-base",
              "bg-foreground/5 border border-border rounded-lg",
              "transition-all duration-200 outline-none",
              "hover:border-slate-300/50",
              "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:shadow-lg focus:shadow-primary-500/10",
              "disabled:bg-slate-50/50 disabled:cursor-not-allowed disabled:dark:bg-slate-50/10 disabled:text-foreground/70",
              resolvedDate && !isNaN(resolvedDate.getTime())
                ? "text-slate-900 dark:text-slate-100"
                : "text-slate-400 dark:text-foreground/30",
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400 dark:text-foreground/40" />
            <span className="flex-1 text-left text-sm">
              {resolvedDate && !isNaN(resolvedDate.getTime())
                ? format(resolvedDate, "PPP")
                : placeholder || "Pick a date"}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={resolvedDate}
            disabled={disabledDates || disabled}
            captionLayout="dropdown"
            startMonth={new Date(1900, 0)}
            endMonth={new Date(2099, 11)}
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
