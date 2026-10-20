# Virtue & Co. Webworks

**Ultra-Sleek Web Engineering & Digital Experience Agency** — the public
marketing site *and* the studio's admin dashboard, in one Next.js application.

- Public site: photographic hero, services, filterable portfolio with
  case-study detail pages, an insights blog, fixed-price packages, FAQ, an
  about page, legal pages, contact/lead capture, and Flutterwave client
  payments.
- Admin dashboard: Supabase-authenticated portfolio CMS (upload / publish /
  edit / delete, tech tags, Supabase Storage screenshots) and an
  inquiries/leads hub with a status pipeline.
- Theme: light/dark with a system-following default, a persistent manual
  toggle, and a ⌘K command palette for keyboard-first navigation.

---

## Stack

| Concern        | Choice                                                        |
| -------------- | ------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack) + React 19 + TypeScript 6\* |
| Styling        | Tailwind CSS v4 (CSS-first `@theme`), Material-3 inspired      |
| Motion         | Framer Motion (page transitions, scroll reveals)               |
| Brand motion   | Remotion 4 (flat gold tile + self-drawing "V" lockup)          |
| Data & Auth    | Supabase (Postgres, Auth, RLS, Storage)                        |
| Email          | Resend (lead notification, client confirmation, receipts)      |
| Payments       | Flutterwave inline checkout + verified webhook ledger          |
| i18n           | next-intl with static locales: `en`, `fr`, `es`, `de`, `ar` (RTL) |
| Hosting        | Vercel                                                         |

\* TypeScript is pinned to **6.0.3**. `eslint-config-next` 16 bundles a
`typescript-eslint` whose peer range (`>=4.8.4 <6.1.0`) rejects TypeScript 7, so
the 7.x line would break `npm run lint`. Pinning to 6.0.3 keeps both the
compiler and the lint toolchain happy.

---

## Getting started

```bash
npm install
cp .env.example .env.local     # then fill in your keys
npm run dev                    # http://localhost:3000 -> /en
```

The marketing site renders **before** any keys are configured: missing Supabase
credentials fall back to `PLACEHOLDER_PROJECTS` and `PLACEHOLDER_POSTS`, and the
preloader falls back to the animated vector mark when `brand-intro-v2.mp4` is
absent. Hero imagery ships as committed files under `public/media/photos`, so
nothing is fetched from a third party at runtime — including the type: **Gropled**
(display) and **Inter** (body) are both self-hosted.

### Environment

Every variable is documented inline in [`.env.example`](./.env.example).
The only ones required for a full build are the Supabase pair; the rest unlock
features incrementally:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — data + auth
- `SUPABASE_SERVICE_ROLE_KEY` — server-only; leads + payment ledger writes
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL` — transactional email
- `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` / `FLUTTERWAVE_SECRET_KEY` /
  `FLUTTERWAVE_WEBHOOK_HASH` — payments
- `ADMIN_EMAIL_ALLOWLIST` — extra gate on top of `profiles.role = 'admin'`

### Database

Apply the migrations in [`supabase/migrations`](./supabase/migrations) with the
Supabase CLI:

```bash
supabase link --project-ref <your-ref>
supabase db push
```

- `0001_init.sql` — `profiles`, `projects`, `inquiries`, `transactions`, enums,
  indexes, `is_admin()`, the signup trigger, and Row Level Security.
- `0002_storage.sql` — the public `project-media` bucket plus
  admin-only write policies.
- `0003_content.sql` — the blog (`posts`) and newsletter (`subscribers`)
  tables. Published posts are readable anonymously; the mailing list has RLS
  enabled with **no** policies, so it is only ever touched with the service
  role.
- `0004_accounts.sql` — client and agent accounts: `orders`,
  `order_messages`, `order_milestones`, `order_message_reads`, `order_events`,
  the phase/status enums, the status-history trigger, the read marker, and the
  policies that limit every row to its client, its assigned agent, or an admin.
- `0005_design.sql` — the `site_design` singleton row that drives the design
  settings screen, plus the public `design-fonts` bucket for uploaded fonts.
  Readable by anyone (the site needs it to render), writable only by an admin.

**`0004_accounts.sql` and `0005_design.sql` have not been run against a live
database yet.** Run them, then prove the account policies with the assertions
that ship alongside them:

```
supabase/tests/0004_accounts.sql   -- paste into the Supabase SQL editor
```

That file creates four throwaway users, exercises every policy as each of them,
prints one line per check, and rolls the whole transaction back. It ends with
`ALL CHECKS PASSED`. It has to be run by hand because it inserts into
`auth.users`, which only a privileged role may do.

There are three roles, and only the first is self-serve:

| Role     | Where it comes from                                        | What it can reach                                        |
| -------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| `client` | Signing up at `/{locale}/signup`, or submitting a request   | Only their own orders, milestones and messages            |
| `agent`  | Promoted in SQL by an admin                                 | Only the orders assigned to them, in `/admin/orders`      |
| `admin`  | Promoted in SQL, or the `ADMIN_EMAIL_ALLOWLIST`             | Everything, plus the CMS under `/admin`                   |

Then promote your account:

```sql
update public.profiles set role = 'admin' where email = 'virtueco.dev@gmail.com';
```

Sign in at `/{locale}/login`.

### Payments and orders are not joined up yet

`0001`'s `transactions` ledger records Flutterwave charges, and `0004`'s
`order_milestones` records what is owed. Nothing links the two: a milestone is
marked paid by hand in the orders console. Wiring an invoice to a milestone to a
charge is the next piece of work.

---

## Scripts

| Script                     | Purpose                                            |
| -------------------------- | -------------------------------------------------- |
| `npm run dev`              | Development server (Turbopack)                     |
| `npm run build`            | Production build                                   |
| `npm run start`            | Serve the production build                         |
| `npm run lint`             | ESLint (flat config — Next 16 has no `next lint`)  |
| `npm run typecheck`        | `tsc --noEmit`                                     |
| `npm run verify:design`    | Compiles the design engine and asserts its palette, contrast floors and font plumbing |
| `npm run format`           | Prettier                                           |
| `npm run remotion:studio`  | Preview all brand compositions                     |
| `npm run remotion:render`  | Render the 16:9 logo intro to `out/`               |
| `npm run remotion:gif`     | Animated GIF cutdown                               |
| `npm run remotion:still`   | 1080×1080 PNG of the logo mark                     |

> **Remotion licensing.** Remotion is free for individuals and small teams, but
> companies above its revenue threshold need a
> [Remotion license](https://remotion.dev/license). The in-browser `<Player>`
> passes `acknowledgeRemotionLicense`, which only silences its console notice —
> it does not grant a license. Confirm your eligibility before shipping.

---

## Loading & motion

The site has four distinct motion layers, each with its own job:

| Layer            | Component                          | Where it shows                                    |
| ---------------- | ---------------------------------- | ------------------------------------------------- |
| Brand preloader  | `components/site/brand-loader.tsx` | First load, once per session — **the logo motion _is_ the preloader** (`brand-intro-v2.mp4`, rendered from Remotion) |
| Route progress   | `components/site/route-progress.tsx` | Gold hairline sweeping across the top on every client-side navigation |
| Route fallback   | `app/[locale]/loading.tsx`         | Streamed by Next while a segment loads            |
| Inline spinner   | `components/brand/virtue-spinner.tsx` | Buttons, uploads, status changes — counter-rotating gold arcs + the "V" |

All four honour `prefers-reduced-motion` and fall back gracefully: the preloader
degrades to the animated vector monogram, and the spinner is pure CSS so it works
before hydration.

### Theme

`components/theme/theme-script.tsx` runs blocking in `<head>` and applies the
stored choice from `localStorage` (`vcw:theme`) before first paint, so a
dark-mode visitor never sees a white flash. With nothing stored the site follows
`prefers-color-scheme`; the header toggle (`theme-toggle.tsx`) writes an explicit
choice that then overrides the system setting. Every surface is tokenised, so
adding a theme costs no component changes.

### Design settings

`/{locale}/admin/design` lets an admin change the site's accent, its light and
dark surfaces, the corner radius and the two fonts. One design is shared by the
marketing site, the client portal and this console — nothing is per-surface.

How it flows:

| Step        | Where                              | What happens                                                                 |
| ----------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| Stored      | `public.site_design` (single row)   | Six values, plus the list of installed fonts, as `jsonb`                       |
| Derived     | `src/lib/design/palette.ts`         | The accent is expanded into a ten-step ramp, and every surface, border, muted tone and hover state is computed from it |
| Injected    | `src/components/design/design-styles.tsx` | One `<style>` as the first child of `<body>` — before any content paints, so there is no flash of the old design |
| Read        | `src/lib/design/read.ts`            | Cached and tagged; saving calls `revalidateTag('site-design', 'max')`          |

Only the tokens this feature owns are overridden. The emerald, destructive and
success colours, the ink ramp and the elevation shadows keep their brand values,
because those encode meaning rather than look.

**The accent cannot be set to something unreadable.** The button label colour is
picked by contrast, and the hover fill flips to whichever end of the range is
further from the accent, so every accent is usable rather than refused. The
editor reports four measured numbers - two contrast ratios for the button labels
and two perceptual distances for the hover change - instead of blocking a choice.
`npm run verify:design` sweeps 1260 accents to prove those floors hold, checks
that the default design reproduces the brand's own ten-step gold ramp, and
asserts that the derivation refuses malformed input.

**Fonts.** The bundled faces are Inter (body) and Gropled (display); Gropled only
ships its bold cut. Beyond those, the editor offers 44 curated Google families,
requested as one stylesheet at runtime (`next/font` is build time, so an
admin-chosen font cannot go through it), and it accepts your own `.woff2`,
`.woff`, `.ttf` or `.otf` files, uploaded to the public `design-fonts` bucket and
served through an injected `@font-face`. Nothing is requested from Google unless a
Google family is actually in use, which is why the shipped site makes no
third-party font request at all.

**Reset** puts the six values back to the brand defaults; it does not remove
uploaded fonts, so an accidental reset never breaks a live page.

`0005_design.sql` has not been run against a live database yet either — until it
is, the editor reads the brand defaults and saving reports a failure.

### Command palette

`components/site/command-palette.tsx` opens on ⌘K / Ctrl-K and builds its items
from the same `PRIMARY_NAV` and `SERVICES` data the header uses, so a new route
appears in search automatically. It covers pages, services and actions (quote,
book a call, email, WhatsApp, switch theme, dashboard).

---

## Project structure

```
src/
├─ app/
│  ├─ [locale]/                 # root layout (owns <html>/<body>)
│  │  ├─ (marketing)/           # home, services, portfolio(+[slug]), blog(+[slug]),
│  │  │                         # about, contact, privacy, terms, payment
│  │  ├─ login/                 # studio sign-in
│  │  ├─ admin/                 # dashboard: overview, portfolio CMS, inquiries
│  │  └─ opengraph-image.tsx
│  ├─ api/
│  │  ├─ contact/               # public lead endpoint (shares the action pipeline)
│  │  ├─ newsletter/            # subscribe (service-role write, honeypot + rate limit)
│  │  ├─ payments/{initialize,verify}/
│  │  └─ webhooks/flutterwave/
│  ├─ sitemap.ts / robots.ts
│  └─ globals.css               # Tailwind v4 tokens: flat gold/emerald/ink ramps + dark set
├─ components/
│  ├─ admin/  brand/  motion/  site/  theme/  ui/
├─ i18n/                        # routing, request config, navigation
├─ lib/
│  ├─ actions/                  # server actions (auth, projects, inquiries)
│  ├─ brand/                    # wordmark + mark geometry (shared with Remotion)
│  ├─ email/  payments/  supabase/
│  ├─ content.ts  photos.ts  portfolio.ts
│  └─ seo.ts  studio.ts  validation.ts
├─ messages/                    # en, fr, es, de, ar catalogues
├─ remotion/                    # LogoIntro + registered compositions
└─ proxy.ts                     # Next 16 middleware (next-intl + headers)
```

### Notes on the Next 16 specifics

- `middleware.ts` is **`src/proxy.ts`** (named `proxy`, Node runtime).
- There is **no `src/app/layout.tsx`** — `src/app/[locale]/layout.tsx` is the
  root layout, because every route is localised.
- `params`, `searchParams`, `cookies()` and `headers()` are all async.
- `revalidateTag` takes a second `cacheLife` argument.
- Public (cookie-free) Supabase reads are separated from session reads so
  `unstable_cache` never touches a dynamic request API.

---

## Security model

- **Auth**: Supabase email + password. Sign-in is one page for everyone; the
  Server Action reads the account's role afterwards and routes it to `/portal`
  (clients) or `/admin` (staff). Self-signup always produces a `client`;
  `ADMIN_EMAIL_ALLOWLIST` is a bootstrap for the first admin and the fallback
  when `profiles.role` is still unset. A role-less account that is not on the
  allow-list is signed straight back out.
- **RLS**: anon can read only `published` projects and `published` posts and
  create brand-new inquiries; the `subscribers` table has RLS on with no
  policies at all, so the mailing list is unreachable with the anon key. Order
  data is visible only to its client, its assigned agent, or an admin — there is
  no "staff can read the whole table" policy anywhere, so an agent's token
  reaches only the work they were given. A trigger blocks role escalation from
  the client, and `author_role`/`internal` on a message are derived from the
  session rather than trusted from the form.
- **Guarded routes**: `/portal` and `/admin` are checked twice. The proxy answers
  a session-cookie-less request with a real 307 before anything renders — a
  redirect thrown from a layout could only ever be a one-second meta-refresh,
  because `[locale]/loading.tsx` has already flushed the document shell. The
  layout then verifies the session properly. Neither check is the access
  control; RLS is.
- **Payments**: card data never touches our servers. Every charge is re-queried
  from the Flutterwave API before it is recorded, amounts/currencies are
  cross-checked, webhooks are authenticated with a constant-time `verif-hash`
  comparison, and receipts are sent exactly once.
- **Uploads**: the browser uploads directly to Supabase Storage using the
  admin's session; only object paths reach the Server Action.
- **Admin routing**: the `/admin` and `/portal` segments are `force-dynamic`, so
  the session check runs on every request instead of being frozen into a
  prerendered redirect when the build environment has no Supabase keys.

---

## Deployment

1. Push to GitHub and import the repo at Vercel (config in `vercel.json`).
2. Add every variable from `.env.example` to the Vercel project.
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin (drives canonicals,
   hreflang, sitemap and email links).
4. Point the Flutterwave webhook at
   `https://<your-domain>/api/webhooks/flutterwave` and paste the same secret
   into `FLUTTERWAVE_WEBHOOK_HASH`.
5. Verify your sending domain in Resend so `RESEND_FROM_EMAIL` is deliverable.

---

© Virtue & Co. Webworks · `virtueco.dev@gmail.com` · Lagos, Nigeria
