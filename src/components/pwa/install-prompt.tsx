"use client";

import { useEffect, useState } from "react";
import { Download, Share, Smartphone, X } from "lucide-react";

import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (navigator as any).standalone === true
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [iosShown, setIosShown] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const ts = Number(dismissed);
      if (Number.isFinite(ts) && Date.now() - ts < DISMISS_DURATION_MS) return;
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setOpen(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (isIos()) {
      const t = setTimeout(() => {
        setIosShown(true);
        setOpen(true);
      }, 4000);
      return () => {
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        clearTimeout(t);
      };
    }

    function onInstalled() {
      setOpen(false);
      setDeferred(null);
    }
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "dismissed") dismiss();
    setDeferred(null);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Install e-nvite"
      className={cn(
        "fixed bottom-4 left-1/2 z-50 w-[min(420px,calc(100%-2rem))] -translate-x-1/2",
        "rounded-3xl border border-hairline bg-background/95 backdrop-blur-xl shadow-[0_30px_70px_-30px_color-mix(in_oklch,var(--foreground)_45%,transparent)]",
      )}
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-mute hover:bg-surface hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>

      <div className="flex items-start gap-4 p-5 pr-12">
        <span className="mt-0.5 inline-grid h-10 w-10 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-foreground">
          <Smartphone className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
            Quietly tucked into your home screen
          </p>
          <p className="font-display mt-1 text-lg font-medium leading-snug tracking-tight">
            Install e-nvite
          </p>
          <p className="mt-1 text-xs italic text-mute">
            One-tap launch, offline-friendly invitations.
          </p>

          {iosShown && !deferred ? (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-hairline bg-surface/60 p-4">
              <p className="flex items-center gap-2 text-xs text-foreground/85">
                <span className="font-brand rounded-full bg-foreground px-2 py-0.5 text-[10px] uppercase tracking-[0.24em] text-background">
                  1
                </span>
                Tap <Share className="inline size-3.5" /> in Safari
              </p>
              <p className="flex items-center gap-2 text-xs text-foreground/85">
                <span className="font-brand rounded-full bg-foreground px-2 py-0.5 text-[10px] uppercase tracking-[0.24em] text-background">
                  2
                </span>
                Choose{" "}
                <em className="not-italic font-medium">Add to Home Screen</em>
              </p>
            </div>
          ) : (
            <button
              onClick={install}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-medium text-background transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_color-mix(in_oklch,var(--foreground)_60%,transparent)]"
            >
              <Download className="size-3.5" />
              Install app
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
