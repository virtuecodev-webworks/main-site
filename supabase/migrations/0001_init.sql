-- =============================================================================
--  Virtue & Co. Webworks — initial schema
--  Run with:  supabase db push      (or paste into the Supabase SQL editor)
-- =============================================================================

begin;

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
--  Enums (guarded so the migration is safe to re-run)
-- -----------------------------------------------------------------------------
do $$
begin
  create type public.project_category as enum ('custom', 'wordpress', 'wix', 'ecommerce');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.inquiry_status as enum ('new', 'contacted', 'won', 'archived');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.transaction_status as enum ('pending', 'successful', 'failed', 'cancelled');
exception when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
--  Tables
-- -----------------------------------------------------------------------------

-- Mirrors auth.users 1:1. `role` is the second half of the admin gate
-- (the other half is ADMIN_EMAIL_ALLOWLIST in the app).
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  created_at  timestamptz not null default now()
);

create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  client            text,
  summary           text,
  description       text,
  category          public.project_category not null default 'custom',
  tech_tags         text[] not null default '{}',
  live_url          text,
  repo_url          text,
  cover_image_path  text,
  gallery_paths     text[] not null default '{}',
  featured          boolean not null default false,
  published         boolean not null default false,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  company     text,
  service     text,
  budget      text,
  timeline    text,
  message     text not null,
  locale      text not null default 'en',
  status      public.inquiry_status not null default 'new',
  source      text not null default 'website',
  notified_at timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.transactions (
  id             uuid primary key default gen_random_uuid(),
  reference      text not null unique,
  provider       text not null default 'flutterwave',
  provider_tx_id text,
  amount         numeric(14, 2) not null default 0,
  currency       text not null default 'NGN',
  status         public.transaction_status not null default 'pending',
  customer_email text,
  customer_name  text,
  purpose        text,
  raw            jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
--  Indexes
-- -----------------------------------------------------------------------------
create index if not exists projects_published_idx
  on public.projects (published, sort_order, created_at desc);

create index if not exists projects_category_idx
  on public.projects (category);

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);

create index if not exists inquiries_status_idx
  on public.inquiries (status);

-- -----------------------------------------------------------------------------
--  Helper functions
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Create a profile row for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- A user may edit their own profile, but cannot promote themselves.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role = old.role;
  end if;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
--  Triggers
-- -----------------------------------------------------------------------------
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- -----------------------------------------------------------------------------
--  Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.projects     enable row level security;
alter table public.inquiries    enable row level security;
alter table public.transactions enable row level security;

-- profiles --------------------------------------------------------------------
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- projects --------------------------------------------------------------------
-- Anonymous visitors only ever see published work.
drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
  on public.projects for select
  using (published = true or public.is_admin());

drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write"
  on public.projects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- inquiries -------------------------------------------------------------------
-- The public contact form may create a brand-new lead and nothing else.
drop policy if exists "inquiries_public_insert" on public.inquiries;
create policy "inquiries_public_insert"
  on public.inquiries for insert
  to anon, authenticated
  with check (status = 'new' and source = 'website');

drop policy if exists "inquiries_admin_read" on public.inquiries;
create policy "inquiries_admin_read"
  on public.inquiries for select
  to authenticated
  using (public.is_admin());

drop policy if exists "inquiries_admin_update" on public.inquiries;
create policy "inquiries_admin_update"
  on public.inquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "inquiries_admin_delete" on public.inquiries;
create policy "inquiries_admin_delete"
  on public.inquiries for delete
  to authenticated
  using (public.is_admin());

-- transactions -----------------------------------------------------------------
-- Written exclusively by the service role (initialize route + webhook).
drop policy if exists "transactions_admin_read" on public.transactions;
create policy "transactions_admin_read"
  on public.transactions for select
  to authenticated
  using (public.is_admin());

drop policy if exists "transactions_admin_write" on public.transactions;
create policy "transactions_admin_write"
  on public.transactions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
--  Grants (Supabase usually sets these by default; made explicit on purpose)
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant select on public.projects to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.inquiries to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;

grant all on all tables in schema public to service_role;

commit;
