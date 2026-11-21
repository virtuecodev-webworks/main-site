-- =============================================================================
--  Virtue & Co. Webworks — AI client scouting & daily outreach (0010)
--  Tables: outreach_settings, outreach_prospects, outreach_runs,
--          outreach_dispatches, outreach_opt_outs
--  RLS: admin-only via public.is_admin(); zero anon access; service_role full.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
--  1. Singleton outreach settings
-- -----------------------------------------------------------------------------
create table if not exists public.outreach_settings (
  id                   boolean primary key default true,
  is_paused            boolean not null default false,
  daily_send_cap       integer not null default 15,
  industries           text[] not null default '{}',
  locations            text[] not null default '{}',
  keywords             text[] not null default '{}',
  discovery_provider   text not null default 'auto',
  min_issue_score      integer not null default 30,
  dry_run_default      boolean not null default false,
  test_recipient_email text,
  updated_at           timestamptz not null default now(),

  constraint outreach_settings_singleton check (id = true),
  constraint outreach_settings_daily_send_cap_range check (daily_send_cap between 1 and 200),
  constraint outreach_settings_discovery_provider_check check (
    discovery_provider in ('osm', 'google_places', 'serper', 'auto')
  ),
  constraint outreach_settings_min_issue_score_range check (min_issue_score between 0 and 100),
  constraint outreach_settings_test_recipient_email_check check (
    test_recipient_email is null
    or (
      test_recipient_email = lower(btrim(test_recipient_email))
      and position('@' in test_recipient_email) > 1
    )
  )
);

drop trigger if exists outreach_settings_set_updated_at on public.outreach_settings;
create trigger outreach_settings_set_updated_at
  before update on public.outreach_settings
  for each row execute function public.set_updated_at();

insert into public.outreach_settings (id) values (true)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
--  2. Discovered & evaluated prospects
-- -----------------------------------------------------------------------------
create table if not exists public.outreach_prospects (
  id                 uuid primary key default gen_random_uuid(),
  business_name      text not null,
  normalized_domain  text,
  website_url        text,
  industry           text,
  location           text,
  contact_email      text,
  phone              text,
  source_provider    text not null default 'osm',
  source_external_id text,
  dedup_key          text not null unique,
  evaluation_status  text not null default 'pending',
  has_website        boolean not null default false,
  issue_score        integer not null default 0,
  issues             jsonb not null default '[]'::jsonb,
  http_status        integer,
  ttfb_ms            integer,
  site_title         text,
  evaluation_notes   text,
  pitch_subject      text,
  pitch_preview      text,
  status             text not null default 'discovered',
  last_evaluated_at  timestamptz,
  last_pitched_at    timestamptz,
  last_error         text,
  raw_metadata       jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint outreach_prospects_normalized_domain_check check (
    normalized_domain is null
    or (
      normalized_domain = lower(btrim(normalized_domain))
      and length(normalized_domain) > 0
    )
  ),
  constraint outreach_prospects_dedup_key_check check (
    dedup_key = lower(btrim(dedup_key))
    and length(dedup_key) > 0
  ),
  constraint outreach_prospects_issue_score_range check (issue_score between 0 and 100),
  constraint outreach_prospects_issues_array check (jsonb_typeof(issues) = 'array'),
  constraint outreach_prospects_status_check check (
    status in (
      'discovered',
      'qualified',
      'qualified_no_email',
      'pitched',
      'replied',
      'converted',
      'opted_out',
      'skipped',
      'failed'
    )
  )
);

create unique index if not exists outreach_prospects_domain_uidx
  on public.outreach_prospects (lower(normalized_domain))
  where normalized_domain is not null and normalized_domain <> '';

create index if not exists outreach_prospects_status_idx
  on public.outreach_prospects (status, created_at desc);

create index if not exists outreach_prospects_contact_email_idx
  on public.outreach_prospects (lower(contact_email))
  where contact_email is not null;

drop trigger if exists outreach_prospects_set_updated_at on public.outreach_prospects;
create trigger outreach_prospects_set_updated_at
  before update on public.outreach_prospects
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
--  3. Daily & manual outreach runs
-- -----------------------------------------------------------------------------
create table if not exists public.outreach_runs (
  id                    uuid primary key default gen_random_uuid(),
  run_date              date not null default (now() at time zone 'utc')::date,
  mode                  text not null,
  status                text not null default 'running',
  triggered_by          uuid references auth.users (id) on delete set null,
  scouted_count         integer not null default 0,
  qualified_count       integer not null default 0,
  sent_count            integer not null default 0,
  skipped_count         integer not null default 0,
  failed_count          integer not null default 0,
  daily_cap_snapshot    integer not null default 0,
  sent_today_before_run integer not null default 0,
  error_summary         text,
  details               jsonb not null default '{}'::jsonb,
  started_at            timestamptz not null default now(),
  completed_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint outreach_runs_mode_check check (mode in ('cron', 'manual', 'dry_run')),
  constraint outreach_runs_status_check check (
    status in ('running', 'completed', 'paused', 'cap_reached', 'failed')
  ),
  constraint outreach_runs_counts_nonneg check (
    scouted_count >= 0
    and qualified_count >= 0
    and sent_count >= 0
    and skipped_count >= 0
    and failed_count >= 0
    and daily_cap_snapshot >= 0
    and sent_today_before_run >= 0
  ),
  constraint outreach_runs_details_object check (jsonb_typeof(details) = 'object')
);

create index if not exists outreach_runs_run_date_idx
  on public.outreach_runs (run_date desc, created_at desc);

create index if not exists outreach_runs_status_idx
  on public.outreach_runs (status, created_at desc);

drop trigger if exists outreach_runs_set_updated_at on public.outreach_runs;
create trigger outreach_runs_set_updated_at
  before update on public.outreach_runs
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
--  4. Email dispatches (live & dry-run audit log)
-- -----------------------------------------------------------------------------
create table if not exists public.outreach_dispatches (
  id              uuid primary key default gen_random_uuid(),
  run_id          uuid references public.outreach_runs (id) on delete set null,
  prospect_id     uuid references public.outreach_prospects (id) on delete set null,
  business_name   text not null,
  recipient_email text not null,
  is_dry_run      boolean not null default false,
  subject         text not null,
  body_preview    text,
  status          text not null,
  message_id      text,
  error           text,
  sent_at         timestamptz not null default now(),
  created_at      timestamptz not null default now(),

  constraint outreach_dispatches_status_check check (
    status in ('sent', 'dry_run', 'failed', 'skipped')
  )
);

create index if not exists outreach_dispatches_live_sent_idx
  on public.outreach_dispatches (sent_at desc)
  where is_dry_run = false and status = 'sent';

create index if not exists outreach_dispatches_run_idx
  on public.outreach_dispatches (run_id, created_at desc);

create index if not exists outreach_dispatches_prospect_idx
  on public.outreach_dispatches (prospect_id, created_at desc);

-- -----------------------------------------------------------------------------
--  5. Opt-outs / unsubscribes
-- -----------------------------------------------------------------------------
create table if not exists public.outreach_opt_outs (
  email       text primary key,
  reason      text,
  source      text not null default 'unsubscribe',
  prospect_id uuid references public.outreach_prospects (id) on delete set null,
  created_at  timestamptz not null default now(),

  constraint outreach_opt_outs_email_check check (
    email = lower(btrim(email))
    and length(email) > 3
    and position('@' in email) > 1
  )
);

create or replace function public.normalize_outreach_opt_out_email()
returns trigger
language plpgsql
as $$
begin
  new.email = lower(btrim(new.email));
  return new;
end;
$$;

drop trigger if exists outreach_opt_outs_normalize_email on public.outreach_opt_outs;
create trigger outreach_opt_outs_normalize_email
  before insert or update on public.outreach_opt_outs
  for each row execute function public.normalize_outreach_opt_out_email();

-- -----------------------------------------------------------------------------
--  6. Row Level Security & explicit grants
-- -----------------------------------------------------------------------------
alter table public.outreach_settings enable row level security;
alter table public.outreach_prospects enable row level security;
alter table public.outreach_runs enable row level security;
alter table public.outreach_dispatches enable row level security;
alter table public.outreach_opt_outs enable row level security;

drop policy if exists "Admins manage outreach_settings" on public.outreach_settings;
create policy "Admins manage outreach_settings"
  on public.outreach_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage outreach_prospects" on public.outreach_prospects;
create policy "Admins manage outreach_prospects"
  on public.outreach_prospects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage outreach_runs" on public.outreach_runs;
create policy "Admins manage outreach_runs"
  on public.outreach_runs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage outreach_dispatches" on public.outreach_dispatches;
create policy "Admins manage outreach_dispatches"
  on public.outreach_dispatches for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage outreach_opt_outs" on public.outreach_opt_outs;
create policy "Admins manage outreach_opt_outs"
  on public.outreach_opt_outs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.outreach_settings from anon;
revoke all on public.outreach_prospects from anon;
revoke all on public.outreach_runs from anon;
revoke all on public.outreach_dispatches from anon;
revoke all on public.outreach_opt_outs from anon;

grant select, insert, update, delete on public.outreach_settings to authenticated;
grant select, insert, update, delete on public.outreach_prospects to authenticated;
grant select, insert, update, delete on public.outreach_runs to authenticated;
grant select, insert, update, delete on public.outreach_dispatches to authenticated;
grant select, insert, update, delete on public.outreach_opt_outs to authenticated;

grant all on public.outreach_settings to service_role;
grant all on public.outreach_prospects to service_role;
grant all on public.outreach_runs to service_role;
grant all on public.outreach_dispatches to service_role;
grant all on public.outreach_opt_outs to service_role;

commit;
