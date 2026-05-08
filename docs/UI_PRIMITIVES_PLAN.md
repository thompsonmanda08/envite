# UI primitives consistency plan

## Why

Auth pages (login, signup, forgot-password, reset-password) declare local
`inputCls` strings and use raw `<input>` / `<button>`. Dashboard pages use
`<Input>` from `components/ui` but with inconsistent class overrides
(`h-12 rounded-none border-b` vs `h-11 rounded-full px-5` vs default).
Fields wrap labels three different ways across `event-form`, `sessions-
manager`, `guests-manager`, `invitations-manager`.

Result: editorial-luxury aesthetic drifts. Maintenance grows. Style
changes touch dozens of files.

## Goal

One primitive set, three variants, one `Field` wrapper. Every form on
every page composes from it. Aesthetic changes ship via primitives.

## Inventory

Existing `components/ui/`:
- `button.tsx` — shadcn cva. Solid. Variants align with brand. **Keep.**
- `input.tsx` — over-engineered (motion error text, slate hardcoded,
  primary-500 colors not in palette). **Rebuild.**
- `textarea.tsx` — minimal shadcn. **Keep, add classNames variant.**
- `label.tsx` — Radix. **Keep.**
- `select.tsx` — Radix shadcn. **Keep.**
- `loading-button.tsx` — wraps Button + Spinner. **Keep.**

Missing primitive: `Field` (label eyebrow + slot + hint/error). Currently
re-implemented inline in 6 files.

## Variants

Three `Input` variants, all editorial-luxury:

| Variant | Visual | Use |
| --- | --- | --- |
| `default` | `h-11 rounded-xl border border-hairline bg-background px-4` | Standard form fields (auth, dashboard) |
| `bare` | `h-12 rounded-none border-0 border-b border-hairline bg-transparent px-0 text-base focus:border-foreground` | Big editorial inputs (event title, RSVP form) |
| `pill` | `h-11 rounded-full border border-hairline bg-background px-5` | Dialog quick-add fields, search bars |

Each variant carries focus ring as `focus-visible:border-foreground/40
focus-visible:ring-0` (no shadcn blue ring — clashes with palette).

Sizes: `sm` (h-9), `default` (h-11), `lg` (h-12).

## Field wrapper

```tsx
<Field label="Email" required hint="We never share this">
  <Input type="email" placeholder="you@example.com" />
</Field>
```

- `font-brand text-xs uppercase tracking-[0.32em] text-mute` label by default
- Required marker `<span className="ml-1 text-foreground">*</span>`
- Optional `hint` slot below input (italic mute)
- Optional `error` slot (text-destructive)
- Optional `htmlFor` — auto-derives from `Input.id` if both present

## Button

Audit current variants:
- `default` → `bg-primary text-primary-foreground` (navy-blue brand)
- `outline` → `border border-input bg-background`
- `ghost`, `link`, `secondary`, `destructive`

For auth pages we currently render `bg-foreground text-background` rounded-
full — diverges from default. Add a `solid` variant matching that style
(black-on-light, light-on-black per scheme).

| Variant | Use |
| --- | --- |
| `default` | Form submit, primary CTA |
| `solid` | Hero/auth CTA (full-bleed black pill) |
| `outline` | Secondary CTA, dropdown trigger |
| `ghost` | Tertiary, dropdown items |
| `link` | Inline links |
| `destructive` | Delete confirmations |

Sizes: `sm` (h-8), `default` (h-9), `lg` (h-11), `xl` (h-12), `icon` (size-9).

## Migration order

1. **Phase A — Primitives** (this work):
   - Rebuild `Input` with variants + sane focus ring
   - Add `Field` to `components/ui/field.tsx`
   - Add `solid` Button variant + `xl` size
2. **Phase B — Auth migration**:
   - Login / signup / forgot-password / reset-password use Input + Field +
     Button. Drop local `inputCls` constants.
3. **Phase C — Dashboard cleanup**:
   - `event-form.tsx`: replace inline FieldShell with Field, swap raw
     class strings for variant="bare"
   - `sessions-manager`, `guests-manager`, `invitations-manager`: swap
     local Field components for shared one, switch dialog inputs to
     variant="pill"
   - Search inputs (events list, guests, check-in) → variant="pill"
4. **Phase D — Lint** (defer): drop ad-hoc `text-xs uppercase tracking-…`
   strings in favour of `<Eyebrow>` primitive (out of scope).

## Acceptance

- `grep -r "inputCls\|inputCls =" src/` returns zero hits
- `grep -rE "<input |<button " src/` returns only `radix`/`<input
  type="checkbox|radio|file">` results
- All forms render identically in light + dark schemes
- type-check + build green

## This commit

Phase A + Phase B (login + signup + forgot-password + reset-password).
Phase C/D queued.
