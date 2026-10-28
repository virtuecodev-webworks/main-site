-- =============================================================================
--  Virtue & Co. Webworks — Vantra Redesign & Full-Stack Sync Fixes (0009)
--
--  1. Relaxes `order_messages` body check constraint to 2,500,000 characters so
--     file attachments encoded in message threads never fail Postgres check constraints.
--  2. Fixes `newsletter_dispatches` and `newsletter_subscribers` RLS policies to
--     check `profiles.role in ('admin', 'agent')` or `public.is_admin()`.
--  3. Adds optional `order_id` and `milestone_id` columns on `public.transactions`
--     so milestone payments automatically reconcile with `public.order_milestones`.
--  4. Updates `public.site_design` defaults to match the Vantra × Virtue & Co.
--     palette (#f5f4f0 Warm Bone, #0a0a0a Deep Ink, #dcaa28 Gold, Inter + Instrument Sans).
-- =============================================================================

begin;

-- 1. Relax order_messages body length check for attachments
alter table public.order_messages
  drop constraint if exists order_messages_body_check;

alter table public.order_messages
  add constraint order_messages_body_check
  check (length(btrim(body)) between 1 and 2500000);

-- 2. Fix newsletter RLS policies (replace invalid 'staff' role with 'admin', 'agent' and is_admin())
drop policy if exists "admin read newsletter dispatches" on public.newsletter_dispatches;
create policy "admin read newsletter dispatches"
  on public.newsletter_dispatches
  for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'agent')
    )
  );

drop policy if exists "admin read newsletter subscribers" on public.newsletter_subscribers;
create policy "admin read newsletter subscribers"
  on public.newsletter_subscribers
  for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'agent')
    )
  );

-- 3. Link transactions to orders & milestones
alter table public.transactions
  add column if not exists order_id uuid references public.orders(id) on delete set null;

alter table public.transactions
  add column if not exists milestone_id uuid references public.order_milestones(id) on delete set null;

create index if not exists transactions_order_idx on public.transactions (order_id);
create index if not exists transactions_milestone_idx on public.transactions (milestone_id);

-- 4. Update site_design defaults & singleton row to Vantra × Virtue & Co. defaults
alter table public.site_design
  alter column accent set default '#dcaa28',
  alter column light_background set default '#f5f4f0',
  alter column light_surface set default '#ffffff',
  alter column dark_background set default '#0a0a0a',
  alter column dark_surface set default '#141416',
  alter column radius set default 16,
  alter column font_body set default 'Instrument Sans',
  alter column font_display set default 'Inter';

update public.site_design
set accent = '#dcaa28',
    light_background = '#f5f4f0',
    light_surface = '#ffffff',
    dark_background = '#0a0a0a',
    dark_surface = '#141416',
    radius = 16,
    font_body = 'Instrument Sans',
    font_display = 'Inter',
    updated_at = now()
where id = true;

commit;
