"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PillButton } from "./primitives";
import ThemeToggle from "./theme-toggle";

const NAV = [
  { name: "How it works", href: "#how-it-works" },
  { name: "Designs", href: "#designs" },
  { name: "Pricing", href: "#pricing" },
  { name: "Stories", href: "#stories" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/70 backdrop-blur-xl border-b border-hairline"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span
            aria-hidden
            className="relative grid h-8 w-8 place-items-center rounded-full bg-foreground text-background"
          >
            <span className="font-display text-base font-medium leading-none">
              e
            </span>
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-secondary" />
          </span>
          <span className="font-display text-xl font-medium tracking-tight text-foreground">
            e-nvite
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group relative rounded-full px-4 py-2 text-sm text-foreground/75 transition-colors hover:text-foreground"
            >
              {item.name}
              <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm text-foreground/80 transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <PillButton href="/login?signup=true" variant="solid">
            Get started
          </PillButton>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-hairline bg-surface/60 text-foreground transition-colors hover:border-foreground/30"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="border-t border-hairline bg-background/95 backdrop-blur md:hidden"
          >
            <nav className="mx-auto flex max-w-6xl flex-col px-5 py-4 sm:px-8">
              {NAV.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-hairline py-4 text-base text-foreground/85"
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center gap-3 pt-4">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-hairline px-5 py-3 text-center text-sm font-medium"
                >
                  Sign in
                </Link>
                <PillButton
                  href="/login?signup=true"
                  className="flex-1"
                  variant="solid"
                >
                  Get started
                </PillButton>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
