# Admin-Only AI Client Scouting & Daily Outreach

The AI Client Scouting & Daily Outreach subsystem (`/[locale]/admin/outreach`) automatically discovers businesses that lack a modern website or exhibit technical/design issues warranting a redesign, generates AI-personalized audit pitches, and sends them daily via Brevo SMTP.

## 1. Access Control & Security

- **Admin UI (`/[locale]/admin/outreach`)**: Guarded on the server by `await requireAdmin(locale)`. Unauthenticated visitors redirect to `/{locale}/login`, `client` accounts redirect to `/{locale}/portal`, and non-admin `agent` staff redirect to `/{locale}/admin/orders`.
- **Admin APIs (`/api/admin/outreach/*`)**: Every endpoint enforces `await requireAdminApi()` from `src/lib/outreach/auth.ts`, returning HTTP `401` for unauthenticated requests and HTTP `403` for authenticated non-admin (`client` or `agent`) requests.
- **Scheduled Cron (`/api/cron/daily-outreach`)**: Enforces `await requireCronOrAdminApi(request)`, accepting either a timing-safe `Authorization: Bearer ${CRON_SECRET}` header (when `CRON_SECRET` is configured) or an authenticated admin session.
- **Database Row-Level Security (`supabase/migrations/0010_outreach.sql`)**: RLS is enabled on `outreach_settings`, `outreach_prospects`, `outreach_runs`, `outreach_dispatches`, and `outreach_opt_outs` with policies restricted to `public.is_admin()`.

## 2. Scouting, Site Evaluation & AI Pitch Pipeline

1. **Business Discovery (`src/lib/outreach/discovery.ts`)**:
   - **`osm` (Zero-Key Default)**: Geocodes target locations with OpenStreetMap Nominatim and queries Overpass API for matching businesses.
   - **`google_places` (Optional)**: Uses Google Places Text Search v1 when `GOOGLE_PLACES_API_KEY` is configured.
   - **`serper` (Optional)**: Uses Serper Places API when `SERPER_API_KEY` is configured.
   - **`auto`**: Automatically selects `google_places` -> `serper` -> `osm` based on configured environment keys, falling back gracefully on provider error.
2. **Website Evaluator (`src/lib/outreach/site-evaluator.ts`)**:
   - Evaluates whether a discovered business lacks a website (`no_website`) or exhibits redesign issues (`unreachable`, `http_error`, `no_https`, `slow_ttfb`, `missing_title`, `missing_meta_description`, `missing_viewport`, `legacy_builder`, `thin_content`).
   - Extracts public contact emails from `mailto:` links, HTML text, and `/contact` fallback pages while filtering out third-party asset/tracker addresses.
3. **Deduplication & Unsubscribe (`src/lib/outreach/deduplication.ts`, `/api/outreach/unsubscribe`)**:
   - Normalizes domains (`normalizeDomain`), business keys (`normalizeBusinessKey`), and email addresses (`normalizeEmail`) so the same business, domain, or email is never pitched twice across or within runs.
   - Every email includes an RFC 8058 one-click `List-Unsubscribe` header and footer link pointing to `/api/outreach/unsubscribe`.
4. **AI Pitch Generation (`src/lib/outreach/pitch-generator.ts`, `src/emails/outreach-pitch.tsx`)**:
   - Calls Gemini (`GEMINI_API_KEY`) to craft a personalized audit pitch referencing the specific issues detected on the prospect's site and recommending the best-fit Virtue & Co. Webworks package.
   - Automatically falls back to a deterministic audit pitch if `GEMINI_API_KEY` is absent or rate-limited.
5. **Safeguards & Dry-Run Mode (`src/lib/outreach/runner.ts`)**:
   - **Pause / Resume**: When `is_paused` is `true`, live scheduled (`cron`) and `manual` runs abort immediately with `status: 'paused'` and send `0` emails.
   - **Daily Send Cap**: Counts live (`is_dry_run = false`, `status = 'sent'`) dispatches sent in the current UTC day and never exceeds `daily_send_cap`.
   - **Dry-Run Mode**: Executes the full discovery, site evaluation, and AI pitch pipeline but routes emails exclusively to `test_recipient_email` with a `[DRY RUN]` subject prefix, without marking prospects as `pitched` or consuming the live daily send cap.

## 3. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only Supabase service role key for outreach persistence |
| `BREVO_SMTP_HOST` / `BREVO_SMTP_PORT` | Yes | Brevo SMTP relay host (`smtp-relay.brevo.com`) and port (`587`) |
| `BREVO_SMTP_LOGIN` / `BREVO_SMTP_KEY` | Yes | Brevo SMTP credentials |
| `BREVO_FROM_EMAIL` | Yes | Verified sender identity |
| `CRON_SECRET` | Yes (Prod) | Bearer secret for `GET /api/cron/daily-outreach` (`0 9 * * *` in `vercel.json`) |
| `GEMINI_API_KEY` | Recommended | Google Gemini API key for AI pitch personalization |
| `GOOGLE_PLACES_API_KEY` | Optional | Enables Google Places Text Search v1 discovery provider |
| `SERPER_API_KEY` | Optional | Enables Serper Places discovery provider |
| `OUTREACH_UNSUBSCRIBE_SECRET` | Optional | HMAC secret for signing unsubscribe links (falls back to `CRON_SECRET`) |
