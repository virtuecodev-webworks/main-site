# Virtue & Co. Webworks — Complete Component & Route Inventory (`COMPONENT_INVENTORY.md`)

> **Purpose:** A complete audit of every route, layout, active component, and **dormant (built-but-unmounted) component** in the repository so you know every building block available for the UI redesign.

---

## 1. Route & Page Inventory (`src/app/`)

### 1.1 Public Marketing Routes (`src/app/[locale]/(marketing)/`)

| Route Path | File | Rendering | Key Components Mounted |
| :--- | :--- | :--- | :--- |
| `/{locale}` | `(marketing)/page.tsx` | Static (`setRequestLocale`) | `Hero`, `QuoteMarquee`, `CapabilitiesBand`, `ServiceShowcase`, `PortfolioGrid`, `Faq`, `CtaBand` |
| `/{locale}/services` | `(marketing)/services/page.tsx` | Static | `PageHero`, `PhotoBand`, 4 alternating Service Sections, `ProjectEstimator`, `StartingPrice`, `CtaBand` |
| `/{locale}/portfolio` | `(marketing)/portfolio/page.tsx` | Static + Cached DB | `PageHero`, `PhotoBand`, `PortfolioGrid`, `ProjectFolders`, `CtaBand` |
| `/{locale}/portfolio/[slug]` | `(marketing)/portfolio/[slug]/page.tsx` | Static / Dynamic | Case study detail, `ZoomMedia`, tech badges, live preview |
| `/{locale}/about` | `(marketing)/about/page.tsx` | Static | `PageHero`, Editorial Story + Image, Collaboration `figure`, 4 Principle Cards, Capabilities Checklist, Closing CTA |
| `/{locale}/blog` | `(marketing)/blog/page.tsx` | Static + Cached DB | `PageHero`, `BlogCard` grid, `NewsletterForm` |
| `/{locale}/blog/[slug]` | `(marketing)/blog/[slug]/page.tsx` | Static / Dynamic | Article header, cover photo, formatted body, related posts |
| `/{locale}/contact` | `(marketing)/contact/page.tsx` | Static | `PageHero`, Contact Aside (Photo, Email, SLA, Global Availability), `ContactForm`, `#book` Google Meet section, `Faq` |
| `/{locale}/payment` | `(marketing)/payment/page.tsx` | Static | `PageHero`, `PaymentForm` (Flutterwave inline checkout) |
| `/{locale}/payment/success` | `(marketing)/payment/success/page.tsx` | Dynamic | Verified transaction summary receipt card |
| `/{locale}/privacy` | `(marketing)/privacy/page.tsx` | Static | `PageHero`, legal prose sections |
| `/{locale}/terms` | `(marketing)/terms/page.tsx` | Static | `PageHero`, legal prose sections |

### 1.2 Authentication Routes (`src/app/[locale]/`)

| Route Path | File | Key Components Mounted |
| :--- | :--- | :--- |
| `/{locale}/login` | `login/page.tsx` | `AuthShell`, `LoginForm`, `PasswordInput` |
| `/{locale}/signup` | `signup/page.tsx` | `AuthShell`, `SignupForm`, `PasswordInput`, `CodeInput` (OTP verification) |
| `/{locale}/forgot-password` | `forgot-password/page.tsx` | `AuthShell`, `ForgotPasswordForm` |
| `/{locale}/reset-password` | `reset-password/page.tsx` | `AuthShell`, `ResetPasswordForm`, `CodeInput`, `PasswordInput` |

### 1.3 Client Portal Routes (`src/app/[locale]/portal/`)

| Route Path | File | Access Gate | Key Components Mounted |
| :--- | :--- | :--- | :--- |
| `/{locale}/portal` | `portal/page.tsx` | `requireClient` | `PortalNav`, `PortalEmpty`, `OrderCard` (active & past), `NewRequestForm` |
| `/{locale}/portal/orders/[reference]` | `portal/orders/[reference]/page.tsx` | `requireClient` + RLS | `OrderView`, `EditBrief`, `MessageList`, `MessageComposer`, `MarkOrderRead` |

### 1.4 Staff & Admin Console Routes (`src/app/[locale]/admin/`)

| Route Path | File | Access Gate | Key Components Mounted |
| :--- | :--- | :--- | :--- |
| `/{locale}/admin` | `admin/page.tsx` | `requireAdmin` | `AdminNav`, 4 KPI Metric Cards, Recent Inquiries List |
| `/{locale}/admin/orders` | `admin/orders/page.tsx` | `requireStaff` | Orders filter & status pipeline table (`agent` sees assigned; `admin` sees all) |
| `/{locale}/admin/orders/[reference]` | `admin/orders/[reference]/page.tsx` | `requireStaff` + RLS | `OrderControls` (status, phase, agent assignment, milestones), `MessageList`, `MessageComposer` |
| `/{locale}/admin/portfolio` | `admin/portfolio/page.tsx` | `requireAdmin` | `ProjectsTable` (publish/unpublish, feature toggle, delete) |
| `/{locale}/admin/portfolio/new` | `admin/portfolio/new/page.tsx` | `requireAdmin` | `ProjectForm`, `MediaUploader` |
| `/{locale}/admin/portfolio/[id]/edit` | `admin/portfolio/[id]/edit/page.tsx` | `requireAdmin` | `ProjectForm`, `MediaUploader` |
| `/{locale}/admin/inquiries` | `admin/inquiries/page.tsx` | `requireAdmin` | `InquiriesTable` (status selector, notes, delete) |
| `/{locale}/admin/newsletter` | `admin/newsletter/page.tsx` | `requireAdmin` | `NewsletterConsole` (AI synthesis, preview, broadcast dispatch) |
| `/{locale}/admin/design` | `admin/design/page.tsx` | `requireAdmin` | `DesignEditor`, `DesignPreview`, `FontLibrary` |

---

## 2. Dormant / Unmounted Components ("Hidden Treasure Chest")

> [!TIP]
> **14 Fully Built Components Are Currently Unmounted!**  
> During previous iterations, several rich interactive sections and UI primitives were built in `src/components/site/` and `src/components/ui/` but are **not currently imported on any live page**. You can immediately leverage, restyle, or retire these during your UI redesign:

| Component | File Path | What It Does | Redesign Recommendation |
| :--- | :--- | :--- | :--- |
| **`MarketplaceCatalog`** | [`src/components/site/marketplace-catalog.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/site/marketplace-catalog.tsx) | Interactive productized service catalog with AI-curated search popover, category pills, `Starter / Business / Enterprise` tier tabs, and direct order modal trigger. | **Mount on `/services` (or Homepage)** as the primary package comparison & checkout engine. |
| **`PackageIntakeModal`** | [`src/components/site/package-intake-modal.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/site/package-intake-modal.tsx) | Multi-step modal triggered by `MarketplaceCatalog` that submits directly to `/api/orders/intake`. | **Keep & restyle** alongside `MarketplaceCatalog`. |
| **`BentoGrid`** | [`src/components/site/bento-grid.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/site/bento-grid.tsx) | 4-card bento showcase (100% Lighthouse scores + `TechMarquee`, Questrial typography card, Fixed USD pricing grid, and live Client Portal milestone mockup). | **Mount on Homepage** (replaces or upgrades `CapabilitiesBand`) after aligning its colors/fonts with the new design. |
| **`WebsiteAnatomy`** | [`src/components/site/website-anatomy.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/site/website-anatomy.tsx) | Interactive 5-layer exploded architecture inspector (`01 Visual Design` → `05 Google SEO & Edge Delivery`) with plain-English business value callouts. | **Mount on Homepage or `/services`** — explains technical value to non-technical founders brilliantly. |
| **`ProjectJourney`** | [`src/components/site/project-journey.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/site/project-journey.tsx) + [`timeline.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/timeline.tsx) | Server-translated 5-step process timeline ("How a project runs") paired with `PHOTOS.process`. | **Mount on Homepage or `/about`** to visualize the 5-step engagement lifecycle. |
| **`DeviceMockup`** | [`src/components/site/device-mockup.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/site/device-mockup.tsx) | Hardware frame mockup for showcasing project screenshots. | **Integrate into `PortfolioGrid` or `/portfolio/[slug]`** case studies. |
| **`BrandLoader`** | [`src/components/site/brand-loader.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/site/brand-loader.tsx) | Session-once (`sessionStorage`) preloader playing `public/media/brand-intro-v2.mp4` with SVG monogram fallback. | **Optional:** Keep unmounted for fastest LCP on marketing pages, or use selectively on portal login. |
| **`RouteLoader`** | [`src/components/site/route-loader.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/site/route-loader.tsx) | Full-overlay route loader (superseded by top hairline `RouteProgress`). | **Retire / Delete** to keep bundle clean (`RouteProgress` is faster and less intrusive). |
| **`RegionClock`** | [`src/components/site/region-clock.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/site/region-clock.tsx) | Live timezone clock display. | **Mount in `SiteFooter` or `/contact`** alongside Global Availability. |
| **`WhatsappWidget`** | [`src/components/site/whatsapp-widget.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/site/whatsapp-widget.tsx) | Floating WhatsApp button (deprecated in `constants.ts` in favor of `AiAssistant` and Google Meet). | **Retire / Delete** (`WHATSAPP_DIGITS` is intentionally empty). |
| **`Hero1` / `TiltedGridHero` / `SaaSTemplate` / `BackgroundPaths`** | `src/components/ui/hero-1.tsx`, `tilted-grid-hero.tsx`, `saa-s-template.tsx`, `background-paths.tsx` | Experimental 21st.dev hero templates explored during earlier iterations. | **Extract best visual primitives** (e.g., tilted 3D grid or SVG background paths) for the new Hero redesign, then remove unused template files. |

---

## 3. Active Component Library Reference

### 3.1 UI Primitives (`src/components/ui/`)
- [`button.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/button.tsx): Variants: `default`, `gold`, `secondary`, `outline`, `ghost`, `subtle`, `destructive`, `link`. Sizes: `sm` (`h-9`), `default` (`h-11`), `lg` (`h-12`), `xl` (`h-14`), `icon` (`size-10`), `icon-sm` (`size-8`).
- [`badge.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/badge.tsx): Variants: `default`, `gold`, `emerald`, `outline`, `muted`.
- [`card.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/card.tsx): `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` built on `.surface`.
- [`dialog.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/dialog.tsx), [`dropdown-menu.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/dropdown-menu.tsx), [`select.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/select.tsx), [`tabs.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/tabs.tsx), [`switch.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/switch.tsx), [`separator.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/separator.tsx), [`label.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/label.tsx): Radix UI primitives styled with theme tokens.
- [`input.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/input.tsx), [`table.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/table.tsx), [`sonner.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/sonner.tsx): Form inputs, data tables, and toast notifications.
- [`features-panel.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/features-panel.tsx): Interactive master-detail service showcase.
- [`glass-folder.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/glass-folder.tsx): 3D hover-fanning deliverable folder widget.
- [`spotlight-card.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/spotlight-card.tsx) & [`border-beam.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/ui/border-beam.tsx): Cursor-tracking radial spotlight card and animated CSS offset-path gold beam.

### 3.2 Brand & Motion Components (`src/components/brand/` & `src/components/motion/`)
- [`virtue-mark.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/brand/virtue-mark.tsx), [`virtue-wordmark.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/brand/virtue-wordmark.tsx), [`virtue-spinner.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/brand/virtue-spinner.tsx), [`ambient-background.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/brand/ambient-background.tsx).
- [`gsap-section-reveal.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/motion/gsap-section-reveal.tsx), [`reveal.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/motion/reveal.tsx), [`page-transition.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/motion/page-transition.tsx), [`scroll-zoom-image.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/motion/scroll-zoom-image.tsx), [`zoom-media.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/components/motion/zoom-media.tsx).

### 3.3 Transactional Email Templates (`src/emails/`)
All emails share [`src/emails/base/shell.tsx`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/emails/base/shell.tsx) and [`src/emails/base/tokens.ts`](file:///c:/Users/Dr%20Bankole/OneDrive/Documents/Virtueweb%20&%20Co%20Webworks/src/emails/base/tokens.ts) (previewable in development via `/api/preview/email`):
- `enquiry-admin.tsx` & `enquiry-client.tsx`
- `signup-otp.tsx`, `reset-otp.tsx`, `welcome.tsx`
- `newsletter-confirm.tsx` & `newsletter.tsx`
- `payment-receipt.tsx`
