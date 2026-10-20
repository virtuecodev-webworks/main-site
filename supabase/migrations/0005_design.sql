-- =============================================================================
--  Virtue & Co. Webworks — design settings
--  One row of site-wide design choices, plus a bucket for uploaded fonts.
--  Run with:  supabase db push      (or paste into the Supabase SQL editor)
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
--  Site design
--
--  A single row, pinned by a boolean primary key that can only be true. Storing
--  only the handful of colours an admin actually chooses (rather than all thirty
--  tokens) keeps the row readable and means dark mode cannot drift out of sync -
--  it is derived from these values on every render.
--
--  The constraints are defence in depth, not the primary guard: the Server
--  Action validates first, and the CSS builder only ever interpolates values it
--  has re-validated. These exist so a hand-written `update` from the SQL editor
--  cannot put a `url(...)` where a hex colour belongs.
-- -----------------------------------------------------------------------------
create table if not exists public.site_design (
  id               boolean primary key default true,
  accent           text not null default '#dcaa28',
  light_background text not null default '#ffffff',
  light_surface    text not null default '#ffffff',
  dark_background  text not null default '#0c0c0d',
  dark_surface     text not null default '#141416',
  radius           integer not null default 12,
  font_body        text not null default 'Inter',
  font_display     text not null default 'Gropled',
  -- [{ family, kind, path, weights }]
  fonts            jsonb not null default '[]'::jsonb,
  updated_at       timestamptz not null default now(),
  updated_by       uuid references auth.users (id) on delete set null,

  constraint site_design_singleton check (id),
  constraint site_design_radius_range check (radius between 0 and 32),
  constraint site_design_hex_shape check (
    accent ~* '^#[0-9a-f]{6}$'
    and light_background ~* '^#[0-9a-f]{6}$'
    and light_surface ~* '^#[0-9a-f]{6}$'
    and dark_background ~* '^#[0-9a-f]{6}$'
    and dark_surface ~* '^#[0-9a-f]{6}$'
  ),
  -- Letters, digits, spaces and hyphens only: the name is interpolated into a
  -- single-quoted CSS string, and no published family name contains a quote.
  constraint site_design_font_body_shape check (font_body ~ '^[A-Za-z0-9][A-Za-z0-9 -]{0,48}$'),
  constraint site_design_font_display_shape check (font_display ~ '^[A-Za-z0-9][A-Za-z0-9 -]{0,48}$'),
  constraint site_design_fonts_array check (jsonb_typeof(fonts) = 'array'),
  constraint site_design_fonts_size check (jsonb_array_length(fonts) <= 40)
);

-- Seed the single row so the app never has to handle "no design yet".
insert into public.site_design (id) values (true)
on conflict (id) do nothing;

drop trigger if exists site_design_set_updated_at on public.site_design;
create trigger site_design_set_updated_at
  before update on public.site_design
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
--  Row Level Security
--  The design is public: the anon client reads it (through a cached read) to
--  build the stylesheet for every visitor. Only studio admins may change it.
-- -----------------------------------------------------------------------------
alter table public.site_design enable row level security;

drop policy if exists "Site design is public" on public.site_design;
create policy "Site design is public"
  on public.site_design for select
  using (true);

drop policy if exists "Admins manage the site design" on public.site_design;
create policy "Admins manage the site design"
  on public.site_design for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
--  Grants (Supabase usually sets these by default; made explicit on purpose)
-- -----------------------------------------------------------------------------
grant select on public.site_design to anon, authenticated;
grant insert, update, delete on public.site_design to authenticated;
grant all on public.site_design to service_role;

-- -----------------------------------------------------------------------------
--  Font storage
--
--  Custom uploads are served from a public bucket, because a visitor's browser
--  fetches the file directly. Uploading is admin-only.
--
--  `font/*` covers what browsers actually send for these extensions. A couple of
--  legacy spellings are allowed too, since some clients still label a .ttf as
--  `application/x-font-ttf`.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'design-fonts',
  'design-fonts',
  true,
  4194304, -- 4 MB: a full latin woff2 is typically 20-80 KB
  array[
    'font/woff2',
    'font/woff',
    'font/ttf',
    'font/otf',
    'application/font-woff',
    'application/font-woff2',
    'application/x-font-ttf',
    'application/x-font-otf',
    'application/vnd.ms-opentype',
    'application/octet-stream'
  ]
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "design_fonts_public_read" on storage.objects;
create policy "design_fonts_public_read"
  on storage.objects for select
  using (bucket_id = 'design-fonts');

drop policy if exists "design_fonts_admin_insert" on storage.objects;
create policy "design_fonts_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'design-fonts' and public.is_admin());

drop policy if exists "design_fonts_admin_update" on storage.objects;
create policy "design_fonts_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'design-fonts' and public.is_admin())
  with check (bucket_id = 'design-fonts' and public.is_admin());

drop policy if exists "design_fonts_admin_delete" on storage.objects;
create policy "design_fonts_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'design-fonts' and public.is_admin());

commit;
