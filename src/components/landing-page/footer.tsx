"use client";

import Link from "next/link";

import { Container } from "./section";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Designs", href: "#designs" },
      { label: "What's new", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Journal", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help center", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Status", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface/40">
      <Container className="py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link className="inline-flex items-center gap-2" href="/">
              <span
                aria-hidden
                className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background"
              >
                <span className="font-display text-base font-medium leading-none">
                  e
                </span>
              </span>
              <span className="font-display text-xl font-medium tracking-tight text-foreground">
                e-nvite
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mute">
              Elegant digital invitations for the moments that matter. Designed
              with care, sent with intention.
            </p>
            <form
              className="mt-8 flex max-w-sm items-center gap-2 rounded-full border border-hairline bg-surface p-1.5 transition-colors focus-within:border-foreground/40"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                className="flex-1 bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-mute focus:outline-none"
                placeholder="your@email.com"
                type="email"
              />
              <button
                className="rounded-full bg-foreground px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
                type="submit"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {COLS.map((c) => (
              <div key={c.title}>
                <h4 className="text-xs font-medium uppercase tracking-[0.22em] text-mute">
                  {c.title}
                </h4>
                <ul className="mt-5 space-y-3">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                        href={l.href}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-8 md:flex-row md:items-center">
          <p className="text-xs text-mute">
            © {new Date().getFullYear()} e-nvite. Crafted with care.
          </p>
          <div className="flex items-center gap-6 text-xs text-mute">
            <Link className="transition-colors hover:text-foreground" href="#">
              Terms
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#">
              Privacy
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#">
              Cookies
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
