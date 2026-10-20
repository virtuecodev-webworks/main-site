-- =============================================================================
--  Virtue & Co. Webworks — content platform
--  Adds the blog (`posts`) and the newsletter list (`subscribers`).
--  Run with:  supabase db push      (or paste into the Supabase SQL editor)
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
--  Blog posts
-- -----------------------------------------------------------------------------
create table if not exists public.posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  excerpt          text,
  -- Long-form body. Stored as light Markdown and rendered by the app.
  body             text,
  cover_image_path text,
  tags             text[] not null default '{}',
  author           text,
  reading_minutes  integer not null default 5,
  published        boolean not null default false,
  published_at     timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
--  Newsletter subscribers
-- -----------------------------------------------------------------------------
create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  locale     text not null default 'en',
  source     text not null default 'footer',
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
--  Indexes
-- -----------------------------------------------------------------------------
create index if not exists posts_published_idx
  on public.posts (published, published_at desc);

create index if not exists posts_tags_idx
  on public.posts using gin (tags);

-- -----------------------------------------------------------------------------
--  Triggers
-- -----------------------------------------------------------------------------
drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
--  Row Level Security
--  Anonymous visitors may read published posts. Nothing else is public:
--  subscribers are written by the server (service role) only, so a leaked anon
--  key can never harvest the mailing list.
-- -----------------------------------------------------------------------------
alter table public.posts enable row level security;
alter table public.subscribers enable row level security;

drop policy if exists "Published posts are public" on public.posts;
create policy "Published posts are public"
  on public.posts for select
  using (published = true);

drop policy if exists "Admins manage posts" on public.posts;
create policy "Admins manage posts"
  on public.posts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Intentionally no policies on `subscribers`: RLS +
-- zero policies = no anon/authenticated access. The service role bypasses RLS.

commit;
