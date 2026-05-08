"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRequestPasswordResetMutation } from "@/hooks/use-auth-mutations";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const reset = useRequestPasswordResetMutation();
  const reduce = useReducedMotion();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await reset.mutateAsync(email);
    if (!res.success) return toast.error(res.message);
    setSent(true);
    toast.success("If the email exists, a reset link is on its way");
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
      className="w-full max-w-md"
    >
      <Link
        href="/login"
        className="inline-flex items-center gap-2 font-brand text-xs uppercase tracking-[0.32em] text-mute transition-colors hover:text-foreground"
      >
        <ArrowLeft size={12} />
        Back to sign in
      </Link>

      <header className="mt-8 space-y-3">
        <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
          A small mercy
        </p>
        <h1 className="font-display text-balance text-4xl font-medium tracking-tight md:text-5xl">
          Reset your <span className="italic">password.</span>
        </h1>
        <p className="text-sm italic text-mute">
          We&rsquo;ll send a one-time link to set a new one.
        </p>
      </header>

      {sent ? (
        <div className="mt-10 rounded-3xl border border-hairline bg-surface/60 p-8 text-center backdrop-blur">
          <p className="font-display text-xl">Check your inbox.</p>
          <p className="mt-2 text-sm text-mute">
            We sent a reset link to{" "}
            <span className="text-foreground">{email}</span>. The link expires
            in an hour.
          </p>
          <p className="mt-6 font-brand text-xs uppercase tracking-[0.32em] text-mute">
            Didn&rsquo;t arrive?
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-2 text-sm text-foreground underline-offset-4 hover:underline"
          >
            Try a different email
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            name="email"
          />
          <Button
            type="submit"
            disabled={reset.isPending}
            variant="solid"
            size="xl"
            className="mt-2"
          >
            {reset.isPending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </motion.div>
  );
}
