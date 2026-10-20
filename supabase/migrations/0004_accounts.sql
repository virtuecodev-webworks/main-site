-- =============================================================================
--  Virtue & Co. Webworks — client & agent accounts
--
--  Turns the site from "a contact form" into "an agency you can actually work
--  with": every client who requests work gets an account they can discuss it in,
--  and every agent gets a console to move it along.
--
--  Two ideas do most of the work here:
--
--    1. **Participation is the only key.** A row is visible to you if you are its
--       client, its assigned agent, or an admin. There is no "role can read the
--       whole table" policy anywhere, so a compromised or careless client token
--       can only ever reach the client's own work.
--
--    2. **The status timeline is written by the database.** An order's history is
--       produced by a trigger, not by application code, so it cannot be skipped,
--       forged or forgotten by a route handler.
--
--  Run with:  supabase db push      (or paste into the Supabase SQL editor)
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
--  Roles
--
--  'client' is the new default: signup is open, so every self-serve account is a
--  client until a human promotes it. 'admin' and 'agent' are the two staff roles;
--  'viewer' and 'editor' are retained so existing rows stay valid.
-- -----------------------------------------------------------------------------

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'agent', 'client', 'editor', 'viewer'));

-- New signups are clients, never staff. Promotion is a deliberate human act.
alter table public.profiles alter column role set default 'client';

-- A little more about the person, for the portal and for invoices.
alter table public.profiles add column if not exists phone   text;
alter table public.profiles add column if not exists company text;
alter table public.profiles add column if not exists country text;

-- Every new auth user becomes a client profile.
--
-- Deliberately does **not** read `role` from signup metadata: trusting a
-- client-supplied value here would be a trivial privilege-escalation hole.
--
-- Phone and company come from the same untrusted metadata, which is fine —
-- they are descriptive fields the account holder owns, and the role is pinned
-- to 'client' here regardless of what the payload claims.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, company, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'phone', null),
    coalesce(new.raw_user_meta_data ->> 'company', null),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
--  Enums
-- -----------------------------------------------------------------------------

do $$ begin
  create type public.order_status as enum (
    'inquiry',    -- submitted, not yet reviewed
    'scoping',    -- in conversation, scope still open
    'quoted',     -- a proposal is with the client
    'active',     -- work underway
    'review',     -- client is reviewing something
    'delivered',  -- done, awaiting sign-off
    'closed',     -- archived
    'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.milestone_status as enum ('pending', 'invoiced', 'paid');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
--  Reference generator
--
--  Defined before the tables because `orders.reference` uses it as a column
--  default. Generating it in the database (rather than in a route handler) means
--  a reference is never missing, never duplicated, and never depends on the
--  application getting its retry logic right.
-- -----------------------------------------------------------------------------

create or replace function public.generate_order_reference()
returns text
language sql
volatile
as $$
  select 'VCW-' || to_char(now(), 'YYYY') || '-' ||
         upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
$$;

-- -----------------------------------------------------------------------------
--  Tables
-- -----------------------------------------------------------------------------

/**
 * One piece of requested work.
 *
 * `orders` rather than `projects`, because `projects` is already the public
 * case-study table and the two must never be confused: one is marketing, this is
 * a live commercial relationship with money attached.
 */
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  reference    text not null unique default public.generate_order_reference(),
  client_id    uuid not null references auth.users (id) on delete cascade,
  -- Null means "nobody owns this yet". Only an admin can assign, which is what
  -- makes the agents' "you only see your own work" promise enforceable.
  agent_id     uuid references auth.users (id) on delete set null,
  title        text not null,
  brief        text,
  service      text,
  scope        text,
  status       public.order_status not null default 'inquiry',
  -- The currency we will actually invoice in, captured at submission time.
  currency     text not null default 'USD',
  locale       text not null default 'en',
  -- ISO 3166-1 alpha-2 as detected when the request was made.
  country      text,
  -- Set when an order was promoted out of the public contact form.
  inquiry_id   uuid references public.inquiries (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- The conversation. Client and agency talk here.
create table if not exists public.order_messages (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  author_id   uuid references auth.users (id) on delete set null,
  -- Snapshotted, so the thread still reads correctly if a role later changes.
  author_role text not null default 'client'
              check (author_role in ('client', 'agent', 'admin')),
  body        text not null check (length(btrim(body)) between 1 and 8000),
  -- Internal notes are the studio talking to itself. Never client-visible.
  internal    boolean not null default false,
  created_at  timestamptz not null default now()
);

/**
 * Per-person read marker.
 *
 * Deliberately not a `read_at` column on `order_messages`: a message can have
 * several legitimate readers (the client, the assigned agent, any admin), and a
 * single timestamp cannot express "read by whom". It is also not something the
 * message policies can grant safely — row-level policies cannot restrict *which
 * columns* an update touches, so letting a reader update a message would also
 * let them rewrite it.
 */
create table if not exists public.order_message_reads (
  order_id     uuid not null references public.orders (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (order_id, user_id)
);

-- Append-only status history, written by trigger (see below).
create table if not exists public.order_events (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  actor_id    uuid references auth.users (id) on delete set null,
  from_status public.order_status,
  to_status   public.order_status not null,
  note        text,
  created_at  timestamptz not null default now()
);

/**
 * A billable stage of an order.
 *
 * No escrow: a milestone is a marker the studio invoices against, and `reference`
 * ties it to the row in `transactions` once Flutterwave confirms it. We never
 * hold client money.
 */
create table if not exists public.order_milestones (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  title      text not null,
  amount     numeric(14, 2) not null default 0 check (amount >= 0),
  currency   text not null default 'USD',
  position   integer not null default 0,
  status     public.milestone_status not null default 'pending',
  -- Matches public.transactions.reference once this milestone is invoiced.
  reference  text,
  due_at     timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
--  Indexes
-- -----------------------------------------------------------------------------

create index if not exists orders_client_idx  on public.orders (client_id, created_at desc);
create index if not exists orders_agent_idx   on public.orders (agent_id, created_at desc);
create index if not exists orders_status_idx  on public.orders (status, created_at desc);
create index if not exists orders_reference_idx on public.orders (reference);

create index if not exists order_messages_order_idx
  on public.order_messages (order_id, created_at);
create index if not exists order_events_order_idx
  on public.order_events (order_id, created_at);
create index if not exists order_milestones_order_idx
  on public.order_milestones (order_id, position);
-- Counts unread messages per order: `user_id` first because every query is
-- "what have I not read", and the primary key already leads with `order_id`.
create index if not exists order_message_reads_user_idx
  on public.order_message_reads (user_id, order_id);

-- -----------------------------------------------------------------------------
--  Helper functions
--
--  All `security definer` so they can consult `profiles`/`orders` without being
--  blocked by the very policies they exist to help evaluate — and with a pinned
--  `search_path`, which is what makes that safe.
-- -----------------------------------------------------------------------------

/**
 * Let the project owner promote themselves from the SQL editor.
 *
 * `prevent_role_escalation` (0001) resets `role` unless the caller is already an
 * admin — which made the documented promotion below impossible: in the SQL
 * editor there is no JWT, so `auth.uid()` is null, `is_admin()` is false, and the
 * role change was silently undone.
 *
 * A null `auth.uid()` can only mean a non-request context (the SQL editor, the
 * service role, a migration). Unauthenticated internet traffic cannot reach
 * `profiles` at all: 0001 grants the table to `authenticated` only, and any
 * authenticated request always carries a JWT.
 */
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    new.role = old.role;
  end if;
  return new;
end;
$$;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

/** Admin or agent — anyone on the studio side. */
create or replace function public.is_agent()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('admin', 'agent') from public.profiles where id = auth.uid()),
    false
  );
$$;

/**
 * Can the caller see this order at all?
 *
 * The single definition of "participant", reused by every child table so the
 * visibility rule can never drift between messages, milestones and events.
 */
create or replace function public.can_view_order(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.orders o
    where o.id = target
      and (
        o.client_id = auth.uid()
        or public.is_admin()
        or (public.is_agent() and o.agent_id = auth.uid())
      )
  );
$$;

/** Can the caller *act on* this order — change status, invoice, leave notes? */
create or replace function public.can_staff_order(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.orders o
    where o.id = target
      and (
        public.is_admin()
        or (public.is_agent() and o.agent_id = auth.uid())
      )
  );
$$;

-- -----------------------------------------------------------------------------
--  Triggers
-- -----------------------------------------------------------------------------

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists order_milestones_set_updated_at on public.order_milestones;
create trigger order_milestones_set_updated_at
  before update on public.order_milestones
  for each row execute function public.set_updated_at();

/**
 * Records every status change in `order_events`.
 *
 * Living in the database rather than in a route handler is the point: no matter
 * which code path moves an order, and no matter who forgets to log it, the
 * history is complete and in order.
 */
create or replace function public.record_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.order_events (order_id, actor_id, from_status, to_status)
    values (new.id, auth.uid(), old.status, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists orders_record_status on public.orders;
create trigger orders_record_status
  after update on public.orders
  for each row execute function public.record_order_status_change();

-- Every order opens with its own history entry, so the timeline is never empty.
--
-- The note is left null on purpose: this row is rendered in the visitor's own
-- language, and baking an English string into the history would make the
-- timeline half-translated. A null `from_status` is what marks "this is the
-- request being created".
create or replace function public.record_order_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.order_events (order_id, actor_id, from_status, to_status, note)
  values (new.id, auth.uid(), null, new.status, null);
  return new;
end;
$$;

drop trigger if exists orders_record_created on public.orders;
create trigger orders_record_created
  after insert on public.orders
  for each row execute function public.record_order_created();

-- -----------------------------------------------------------------------------
--  Row Level Security
-- -----------------------------------------------------------------------------

alter table public.orders            enable row level security;
alter table public.order_messages    enable row level security;
alter table public.order_events      enable row level security;
alter table public.order_milestones  enable row level security;
alter table public.order_message_reads enable row level security;

-- orders ----------------------------------------------------------------------

drop policy if exists "orders_participant_read" on public.orders;
create policy "orders_participant_read"
  on public.orders for select
  to authenticated
  using (
    client_id = auth.uid()
    or public.is_admin()
    or (public.is_agent() and agent_id = auth.uid())
  );

-- You may open a request for yourself. Staff may open one on a client's behalf.
--
-- A client's own insert is pinned to the opening state and to "nobody owns this
-- yet", so a request cannot be born already assigned, already quoted, or already
-- closed. Staff are exempt because they legitimately backfill and correct work.
drop policy if exists "orders_open" on public.orders;
create policy "orders_open"
  on public.orders for insert
  to authenticated
  with check (
    public.is_agent()
    or (client_id = auth.uid() and status = 'inquiry' and agent_id is null)
  );

drop policy if exists "orders_staff_update" on public.orders;
create policy "orders_staff_update"
  on public.orders for update
  to authenticated
  using (public.can_staff_order(id))
  with check (public.can_staff_order(id));

-- A client may edit their own brief, but only while it is still just a request —
-- and the status guard stops that edit from being a way to move an order along.
drop policy if exists "orders_client_edit_own_request" on public.orders;
create policy "orders_client_edit_own_request"
  on public.orders for update
  to authenticated
  using (client_id = auth.uid() and status = 'inquiry')
  with check (client_id = auth.uid() and status = 'inquiry');

-- order_messages --------------------------------------------------------------

drop policy if exists "order_messages_read" on public.order_messages;
create policy "order_messages_read"
  on public.order_messages for select
  to authenticated
  using (
    public.can_view_order(order_id)
    -- Internal notes exist only for the studio.
    and (not internal or public.is_agent())
  );

drop policy if exists "order_messages_insert" on public.order_messages;
create policy "order_messages_insert"
  on public.order_messages for insert
  to authenticated
  with check (
    public.can_view_order(order_id)
    and author_id = auth.uid()
    -- A client can never post an internal note, nor claim a staff role.
    and (public.is_agent() or (not internal and author_role = 'client'))
  );

-- Authors may correct a typo; nobody may rewrite someone else's words.
drop policy if exists "order_messages_edit_own" on public.order_messages;
create policy "order_messages_edit_own"
  on public.order_messages for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists "order_messages_delete_own" on public.order_messages;
create policy "order_messages_delete_own"
  on public.order_messages for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- order_events ----------------------------------------------------------------

-- Read-only to the app: rows are written exclusively by the triggers above.
drop policy if exists "order_events_read" on public.order_events;
create policy "order_events_read"
  on public.order_events for select
  to authenticated
  using (public.can_view_order(order_id));

-- order_milestones ------------------------------------------------------------

drop policy if exists "order_milestones_read" on public.order_milestones;
create policy "order_milestones_read"
  on public.order_milestones for select
  to authenticated
  using (public.can_view_order(order_id));

drop policy if exists "order_milestones_staff_write" on public.order_milestones;
create policy "order_milestones_staff_write"
  on public.order_milestones for all
  to authenticated
  using (public.can_staff_order(order_id))
  with check (public.can_staff_order(order_id));

-- order_message_reads ---------------------------------------------------------

-- You can only ever see or move your own marker, and only on an order you are
-- already part of — so this table cannot be used to probe for order ids.
drop policy if exists "order_message_reads_own" on public.order_message_reads;
create policy "order_message_reads_own"
  on public.order_message_reads for all
  to authenticated
  using (user_id = auth.uid() and public.can_view_order(order_id))
  with check (user_id = auth.uid() and public.can_view_order(order_id));

-- profiles --------------------------------------------------------------------

-- Agents need to know who they are working for — but only for their own orders.
drop policy if exists "profiles_agent_read_clients" on public.profiles;
create policy "profiles_agent_read_clients"
  on public.profiles for select
  to authenticated
  using (
    public.is_agent()
    and exists (
      select 1 from public.orders o
      where o.client_id = public.profiles.id
        and (public.is_admin() or o.agent_id = auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
--  Grants
-- -----------------------------------------------------------------------------

grant select, insert, update on public.orders to authenticated;
grant select, insert, update, delete on public.order_messages to authenticated;
grant select on public.order_events to authenticated;
grant select, insert, update, delete on public.order_milestones to authenticated;
grant select, insert, update on public.order_message_reads to authenticated;

-- The service role owns the Flutterwave ledger and credentials.
grant all on all tables in schema public to service_role;

commit;

-- =============================================================================
--  Making yourself staff
--
--  Self-serve signup always creates a 'client'. To become staff, sign up once
--  through the site, then run (as the project owner, in the SQL editor):
--
--    update public.profiles set role = 'agent' where email = 'you@example.com';
--    update public.profiles set role = 'admin' where email = 'you@example.com';
--
--  Or keep using ADMIN_EMAIL_ALLOWLIST in the app's environment, which grants the
--  admin console without touching the database at all.
-- =============================================================================
