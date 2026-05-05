"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  useLoginMutation,
  useRegisterMutation,
} from "@/hooks/use-auth-mutations";

const ease = [0.22, 1, 0.36, 1] as const;

const inputCls =
  "w-full rounded-xl border border-hairline bg-background px-4 py-3 text-sm transition-colors focus:border-foreground/40 focus:outline-none";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const reduce = useReducedMotion();

  const initialMode: Mode =
    params.get("signup") === "true" ? "signup" : "signin";
  const justRegistered = params.get("registered") === "1";

  const [mode, setMode] = useState<Mode>(initialMode);
  const login = useLoginMutation();
  const register = useRegisterMutation();

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
  });

  useEffect(() => {
    if (justRegistered) {
      toast.success("Account created. Sign in to continue.");
    }
  }, [justRegistered]);

  function bind<K extends keyof typeof form>(k: K) {
    return {
      value: form[k],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value })),
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "signin") {
      const res = await login.mutateAsync({
        email: form.email,
        password: form.password,
      });
      if (!res.success) return toast.error(res.message);
      toast.success("Welcome back");
      router.replace("/dashboard");
      return;
    }

    if (!form.first_name || !form.last_name) {
      return toast.error("First and last name are required");
    }
    const res = await register.mutateAsync(form);
    if (!res.success) return toast.error(res.message);
    router.replace("/login?registered=1");
    setMode("signin");
  }

  const pending = login.isPending || register.isPending;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
      className="w-full max-w-md"
    >
      <header className="space-y-3">
        <p className="font-brand text-[11px] uppercase tracking-[0.42em] text-mute">
          {mode === "signin" ? "The salon awaits" : "Compose an invitation"}
        </p>
        <h1 className="font-display text-balance text-4xl font-medium tracking-tight md:text-5xl">
          {mode === "signin" ? (
            <>
              Welcome <span className="italic">back.</span>
            </>
          ) : (
            <>
              Create your <span className="italic">account.</span>
            </>
          )}
        </h1>
        <p className="text-sm italic text-mute">
          {mode === "signin"
            ? "Sign in to manage events, guests, and replies."
            : "A minute now — a lifetime of well-set tables."}
        </p>
      </header>

      <div className="mt-8 inline-flex rounded-full border border-hairline bg-surface/50 p-1 text-xs font-medium uppercase tracking-[0.28em] text-mute backdrop-blur">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`rounded-full px-4 py-1.5 transition-colors ${
            mode === "signin"
              ? "bg-foreground text-background"
              : "hover:text-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-full px-4 py-1.5 transition-colors ${
            mode === "signup"
              ? "bg-foreground text-background"
              : "hover:text-foreground"
          }`}
        >
          Create
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" required>
              <input
                {...bind("first_name")}
                required
                autoComplete="given-name"
                className={inputCls}
              />
            </Field>
            <Field label="Last name" required>
              <input
                {...bind("last_name")}
                required
                autoComplete="family-name"
                className={inputCls}
              />
            </Field>
          </div>
        )}

        <Field label="Email" required>
          <input
            {...bind("email")}
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputCls}
          />
        </Field>

        {mode === "signup" && (
          <Field label="Phone" required>
            <input
              {...bind("phone")}
              type="tel"
              required
              autoComplete="tel"
              placeholder="+1 (555) 555-0100"
              className={inputCls}
            />
          </Field>
        )}

        <Field
          label="Password"
          required
          hint={
            mode === "signin" ? (
              <Link
                href="/forgot-password"
                className="font-brand text-[10px] uppercase tracking-[0.28em] text-mute transition-colors hover:text-foreground"
              >
                Forgot?
              </Link>
            ) : undefined
          }
        >
          <input
            {...bind("password")}
            type="password"
            required
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            placeholder={mode === "signup" ? "Min 8 characters" : ""}
            className={inputCls}
          />
        </Field>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--foreground)_50%,transparent)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_color-mix(in_oklch,var(--foreground)_60%,transparent)] disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
        >
          {pending
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <Ornament className="mt-12" />

      <p className="mt-6 text-center text-xs text-mute">
        By continuing, you accept our{" "}
        <Link
          href="#"
          className="text-foreground/80 underline-offset-4 hover:underline"
        >
          terms
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          className="text-foreground/80 underline-offset-4 hover:underline"
        >
          privacy notice
        </Link>
        .
      </p>
    </motion.div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between">
        <span className="font-brand text-[10px] uppercase tracking-[0.32em] text-mute">
          {label}
          {required ? " ·" : null}
        </span>
        {hint}
      </span>
      {children}
    </label>
  );
}

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center gap-3 text-foreground/30 ${className}`}
    >
      <span className="h-px w-10 bg-current" />
      <span className="font-display text-base italic">e</span>
      <span className="text-[10px]">✦</span>
      <span className="font-display text-base italic">n</span>
      <span className="h-px w-10 bg-current" />
    </div>
  );
}
