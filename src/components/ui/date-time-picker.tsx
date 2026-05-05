"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  /** Date object value */
  value?: Date;
  /** Callback with Date object */
  onValueChange?: (date?: Date) => void;
  /** String value in ISO or "YYYY-MM-DDTHH:mm" format */
  stringValue?: string;
  /** Callback with "YYYY-MM-DDTHH:mm" string */
  onStringValueChange?: (value: string) => void;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// Shared input-like class string to keep both controls visually identical to <Input>
const inputBase =
  "bg-foreground/5 border border-border rounded-lg transition-all duration-200 outline-none " +
  "text-slate-900 dark:text-slate-100 " +
  "placeholder:text-slate-400 dark:placeholder:text-foreground/30 " +
  "hover:border-slate-300/50 " +
  "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:shadow-lg focus:shadow-primary-500/10 " +
  "disabled:bg-slate-50/50 disabled:cursor-not-allowed disabled:dark:bg-slate-50/10 disabled:text-foreground/70";

export function DateTimePicker({
  value,
  onValueChange,
  stringValue,
  onStringValueChange,
  label,
  name,
  placeholder,
  required,
  disabled,
  className,
}: DateTimePickerProps) {
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

  function emit(date?: Date) {
    if (onValueChange) onValueChange(date);
    if (onStringValueChange)
      onStringValueChange(date ? format(date, "yyyy-MM-dd'T'HH:mm") : "");
  }

  function handleDateSelect(selectedDate?: Date) {
    if (!selectedDate) {
      emit(undefined);

      return;
    }
    const current = resolvedDate || new Date();
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      current.getHours(),
      current.getMinutes(),
      0,
    );

    emit(newDate);
    setOpen(false);
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const timeValue = e.target.value;

    if (!timeValue) return;
    const [hours, minutes] = timeValue.split(":").map(Number);
    const current = resolvedDate || new Date();
    const newDate = new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate(),
      hours,
      minutes,
      0,
    );

    emit(newDate);
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
      <div className="flex items-center gap-2">
        {/* Date trigger — styled like Input */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex flex-1 items-center gap-2 px-4 py-1.75 text-sm",
                inputBase,
                !(resolvedDate && !isNaN(resolvedDate.getTime())) &&
                  "text-slate-400 dark:text-foreground/30",
              )}
              disabled={disabled}
              id={name}
              type="button"
            >
              <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400 dark:text-foreground/40" />
              <span className="flex-1 text-left">
                {resolvedDate && !isNaN(resolvedDate.getTime())
                  ? format(resolvedDate, "PPP")
                  : placeholder || "Pick a date"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              disabled={disabled}
              mode="single"
              selected={resolvedDate}
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>

        {/* Time input — styled like Input */}
        <input
          className={cn("w-28 px-3 py-1.75 text-sm", inputBase)}
          disabled={disabled}
          type="time"
          value={resolvedDate ? format(resolvedDate, "HH:mm") : ""}
          onChange={handleTimeChange}
        />
      </div>
    </div>
  );
}
