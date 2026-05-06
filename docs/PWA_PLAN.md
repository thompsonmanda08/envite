# PWA Optimization Plan — e-nvite

Goal: best-in-class installable invite app. Guests open invitations on flaky cell reception at venues; hosts manage events on the move. PWA delivers offline RSVP, instant launch, push notifications, app-shell loads.

Current state: manifest exists ([src/app/manifest.json](../src/app/manifest.json)) but stale (`theme_color: #005284` from old navy palette, no shortcuts, no screenshots). No service worker. No offline fallback. Icons present (192/512 + `apple-icon.png` + `icon0.svg` + `icon1.png`).

---

## Phase 1 — Foundation (ship-blocking)

### 1.1 Manifest hardening

**Convert** `manifest.json` → `manifest.ts` so theme tokens read from a single source.

```ts
// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "e-nvite — Elegant Digital Invitations",
    short_name: "e-nvite",
    description:
      "Compose distinguished invitations and orchestrate guest RSVPs.",
    id: "/?source=pwa",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "portrait",
    theme_color: "#fafafa",     // light ivory; align with --background
    background_color: "#fafafa",
    categories: ["productivity", "lifestyle", "social"],
    lang: "en",
    icons: [
      { src: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Compose event", url: "/dashboard/events/new", icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192" }] },
      { name: "Open atelier", url: "/dashboard", icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192" }] },
    ],
    screenshots: [
      { src: "/screenshots/dashboard.png", sizes: "1280x720", type: "image/png", form_factor: "wide", label: "Dashboard atelier" },
      { src: "/screenshots/invite.png", sizes: "750x1334", type: "image/png", form_factor: "narrow", label: "Public invitation" },
    ],
  };
}
```

Per-scheme `theme-color` via `<meta>` in `app/layout.tsx`:

```tsx
<meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0e0e0e" media="(prefers-color-scheme: dark)" />
```

Also add `<meta name="apple-mobile-web-app-capable" content="yes">` + `apple-mobile-web-app-status-bar-style="black-translucent"`.

Generate the two screenshots from `/dashboard` and `/i/{demoId}`.

### 1.2 Service worker — Serwist (Next 16 compatible)

`pnpm add @serwist/next serwist`. Wrap `next.config.ts`:

```ts
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

export default withSerwist(nextConfig);
```

Service worker (`src/app/sw.ts`) — runtime caching strategies:

| Pattern | Strategy | Rationale |
|---|---|---|
| Next build assets (`/_next/static/**`) | `CacheFirst` | Hash-suffixed; immutable |
| `next/font` Google fonts | `CacheFirst` 1y | Fonts rarely change |
| ImageKit `ik.imagekit.io/**` + remote images | `CacheFirst` 7d, max 60 entries | Bandwidth on mobile |
| Public invite pages `/i/**` | `StaleWhileRevalidate` | Guests may revisit; freshness on background |
| API GET `/api/v1/events/list`, `/event-type/list`, `/event-sessions/*/list` | `NetworkFirst` 5s timeout, cache 10min | Hosts skim while signal flickers |
| API mutations (POST/PUT/PATCH/DELETE) | `NetworkOnly` + Background Sync queue | Replay public RSVPs + guest writes when online |
| Auth-gated dashboard pages | `NetworkOnly` | Stale UI = stale data; show offline page if no net |
| Navigation fallback | precached `/offline` | Survives total outage |

### 1.3 Offline fallback

`src/app/offline/page.tsx` — editorial-luxury "no signal" page (matches not-found treatment). Precached at install.

Public RSVP `submitPublicRsvp` action: detect failure type, on network error queue via Background Sync API; toast: *"You're offline — we'll send your reply the moment you're back."*

### 1.4 Install prompt UX

- Capture `beforeinstallprompt` event in a top-level client component (`InstallPromptProvider`).
- Editorial-luxury install banner on landing footer + dashboard sidebar footer slot. Dismiss persisted to `localStorage["pwa-install-dismissed"]`.
- iOS Safari (no `beforeinstallprompt`): UA-detect + show "Add to Home Screen" instructions card with Share-icon walkthrough.
- Track installs via `appinstalled` event → analytics.

---

## Phase 2 — Performance (Lighthouse polish)

### 2.1 Targets

- LCP < 2.5s on 3G Fast
- INP < 200ms
- CLS < 0.05
- Lighthouse PWA score 100

### 2.2 Bundle

Already in [next.config.ts](../next.config.ts):
```ts
experimental.optimizePackageImports: ["lucide-react", "date-fns", "recharts", "framer-motion", "@radix-ui/react-icons"]
```

Add: `cmdk`, `@hookform/resolvers`, `zod`, `react-hook-form`. Run `@next/bundle-analyzer`:

```bash
pnpm add -D @next/bundle-analyzer
ANALYZE=true pnpm build
```

Code-split heavy editor: `@editorjs/*` (~150kB) only used by `rich-text-modal`. Wrap `rich-text-modal.tsx` with `next/dynamic({ ssr: false })`.

### 2.3 Fonts

Already using `next/font/google` Manrope + Fraunces. Add `display: "swap"` (already set) + `preload: true` on Manrope (body) only; Fraunces preload only on landing/auth.

### 2.4 Images

- Landing hero card is CSS gradient — fine, no image
- Add `next/image` `loading="lazy"` + `placeholder="blur"` everywhere user-uploaded imagery lands (invitation banners, host avatars)
- ImageKit transforms: `?tr=w-800,q-80,f-auto` for responsive

### 2.5 Critical hints in `<head>`

```tsx
<link rel="dns-prefetch" href={apiHost} />
<link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="" />
```

### 2.6 React 19 / Next 16 wins

- Audit Server Components vs Client Components: dashboard pages already `force-dynamic` server; client only where interactivity. Push more fetches into server components.
- Use `<Link prefetch={false}>` on dashboard cross-links to reduce idle prefetch on entry pages
- Suspense boundaries on data-table loads with `<Skeleton>` from migrated UI

---

## Phase 3 — Push notifications (post backend)

Blocked on backend endpoints. Plan:

1. Generate VAPID keypair; backend stores public key + endpoint.
2. Frontend: `Notification.requestPermission()` after first successful sign-in (not page load — UX courtesy).
3. `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC })`.
4. POST subscription to backend `/user/push-subscriptions`.
5. Triggers: RSVP received, invitation viewed, event-day reminder (24h before), guest-list capacity warning.
6. SW `push` listener → `self.registration.showNotification(title, { body, icon, badge, tag, data: { url } })`.
7. `notificationclick` → `clients.openWindow(data.url)`.

Documented in [docs/BACKEND_PENDING.md](./BACKEND_PENDING.md) once backend roadmap confirmed.

---

## Phase 4 — Polish

### 4.1 Share target (Android)

Manifest:
```json
"share_target": {
  "action": "/dashboard/events/new",
  "method": "GET",
  "params": { "title": "title", "text": "description" }
}
```

Lets users share-sheet a webpage / text into "New event" form pre-filled.

### 4.2 Periodic Background Sync

Hosts opt-in: poll `/events/list` every 12h while installed. Notify on new RSVPs.

### 4.3 File handlers

Register `.ics` so guests can "Open with e-nvite" calendar invite files → import as event.

### 4.4 Window Controls Overlay

Already in `display_override`. Style title bar via CSS `env(titlebar-area-*)` for desktop PWA.

---

## Phase 5 — Verification

Run before each release:

```bash
# Lighthouse CI
npx @lhci/cli autorun --collect.url=http://localhost:3000 \
                     --collect.url=http://localhost:3000/dashboard \
                     --collect.url=http://localhost:3000/i/demo

# PWA audit
npx pwa-asset-generator ...
# Or pwabuilder.com — paste URL, validate
```

Manual matrix:
- iOS Safari 17+ — install, offline, push (push limited)
- Android Chrome 120+ — install, offline, share target, push
- Desktop Chrome — install, window controls overlay

---

## Execution order

1. **Manifest + meta hardening** (1h) — no deps
2. **Serwist install + sw.ts + offline page** (3h) — adds runtime caching
3. **Background Sync for public RSVP** (2h) — biggest UX win for guests
4. **Install prompt component** (2h)
5. **Bundle analyzer + dynamic imports** (1h)
6. **Lighthouse pass + tuning** (1h)
7. **Push notifications** — deferred (needs backend endpoints)
8. **Share target + file handlers** — Phase 2

**Phase 1 estimate**: ~10h to ship installable + offline RSVP. Push + share-target deferred behind backend work.
