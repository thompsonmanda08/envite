"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ResetPasswordPage() {
  const reduce = useReducedMotion();

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
          Briefly unavailable
        </p>
        <h1 className="font-display text-balance text-4xl font-medium tracking-tight md:text-5xl">
          Reset is on <span className="italic">its way.</span>
        </h1>
      </header>

      <div className="mt-10 rounded-3xl border border-hairline bg-surface/60 p-8 backdrop-blur">
        <span className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-background text-foreground">
          <Mail size={16} />
        </span>
        <p className="mt-5 text-sm leading-relaxed text-foreground/85">
          Token-based password reset isn&rsquo;t yet supported by our backend.
          In the meantime:
        </p>
        <ul className="mt-4 flex flex-col gap-3 text-sm text-foreground/80">
          <li className="flex items-start gap-3">
            <span className="mt-1 h-1 w-1 flex-none rounded-full bg-foreground/40" />
            <span>
              If you can still sign in, change your password from{" "}
              <Link
                href="/dashboard/settings"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Settings → Passphrase
              </Link>
              .
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-1 w-1 flex-none rounded-full bg-foreground/40" />
            <span>
              Locked out entirely? Email{" "}
              <a
                href="mailto:hello@e-nvite.com"
                className="text-foreground underline-offset-4 hover:underline"
              >
                hello@e-nvite.com
              </a>{" "}
              and we&rsquo;ll sort it manually.
            </span>
          </li>
        </ul>
      </div>

      <p className="mt-8 text-center font-display text-sm italic text-mute">
        &ldquo;Patience is a host&rsquo;s first virtue.&rdquo;
      </p>
    </motion.div>
  );
}
