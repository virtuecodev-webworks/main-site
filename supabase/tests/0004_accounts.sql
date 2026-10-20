-- =============================================================================
--  Virtue & Co. Webworks — assertions for 0004_accounts.sql
--
--  Run this by hand, in the Supabase SQL editor, against a database that already
--  has 0001–0004 applied:
--
--     1. open the SQL editor
--     2. paste this whole file
--     3. run it
--
--  It prints one line per check and ends with "ALL CHECKS PASSED". A failed
--  `assert` aborts the transaction and names the check that failed.
--
--  Everything runs inside a transaction that is rolled back at the end, so no
--  test user, order or message survives. Nothing here touches real data.
--
--  Why it has to be run by hand: the fixtures insert into `auth.users`, which
--  only a privileged role (the SQL editor, or the service role) can do. `supabase
--  test db` runs files in `supabase/tests` as pgTAP tests; this file asserts with
--  plain PL/pgSQL instead, so that it needs no extension beyond pgcrypto, which
--  Supabase ships with.
--
--  The point of the whole file is that **Row Level Security is the access
--  control**, so every check impersonates a real JWT: `set local role
--  authenticated` moves off the table owner (which would bypass RLS entirely) and
--  `request.jwt.claims` supplies the `sub` that `auth.uid()` reads.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
--  Fixtures
-- -----------------------------------------------------------------------------

do $$
declare
  client_a uuid := gen_random_uuid();
  client_b uuid := gen_random_uuid();
  agent    uuid := gen_random_uuid();
  boss     uuid := gen_random_uuid();
  order_a  uuid := gen_random_uuid();
  order_b  uuid := gen_random_uuid();
begin
  -- Four real accounts. `handle_new_user` gives each one a profile.
  --
  -- `encrypted_password` is a placeholder: nothing signs in with these, and
  -- keeping it a plain string means the file needs no pgcrypto.
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  )
  select
    u.uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    u.mail,
    'test-not-a-real-hash',
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', u.mail)
  from (values
    (client_a, 'rls-client-a@test.invalid'),
    (client_b, 'rls-client-b@test.invalid'),
    (agent,    'rls-agent@test.invalid'),
    (boss,     'rls-admin@test.invalid')
  ) as u(uid, mail);

  -- Staff roles are a deliberate promotion. `prevent_role_escalation` allows this
  -- here precisely because there is no JWT in this context — a null `auth.uid()`.
  -- If that fix were reverted, these two updates would silently do nothing and
  -- the agent/admin checks below would fail, which is the point.
  update public.profiles set role = 'agent' where id = agent;
  update public.profiles set role = 'admin' where id = boss;

  -- Order A: client A's, assigned to the agent.
  insert into public.orders (id, client_id, agent_id, title, brief, service, currency, status)
  values (order_a, client_a, agent, 'Order A', 'A brief from client A.', 'custom', 'USD', 'inquiry');

  -- Order B: client B's, owned by nobody.
  insert into public.orders (id, client_id, agent_id, title, brief, service, currency, status)
  values (order_b, client_b, null, 'Order B', 'A brief from client B.', 'wix', 'GBP', 'inquiry');

  -- Two client-visible messages and one internal note, all on order A.
  insert into public.order_messages (order_id, author_id, author_role, body, internal)
  values
    (order_a, client_a, 'client', 'Hello, here is what I need.', false),
    (order_a, agent,    'agent',  'Noted, we will take a look.', false),
    (order_a, agent,    'agent',  'Internal: this one needs a second opinion.', true);

  -- A milestone on each order, so the milestone policy has something to filter.
  insert into public.order_milestones (order_id, title, amount, currency, position)
  values
    (order_a, 'Deposit', 2500, 'USD', 0),
    (order_b, 'Deposit', 1800, 'GBP', 0);

  perform set_config('test.client_a', client_a::text, true);
  perform set_config('test.client_b', client_b::text, true);
  perform set_config('test.agent',    agent::text,    true);
  perform set_config('test.boss',     boss::text,     true);
  perform set_config('test.order_a',  order_a::text,  true);
  perform set_config('test.order_b',  order_b::text,  true);

  raise notice 'fixtures created';
end $$;

-- -----------------------------------------------------------------------------
--  Client A
-- -----------------------------------------------------------------------------

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', current_setting('test.client_a'), 'role', 'authenticated')::text,
  true
);

do $$
declare
  order_a uuid := current_setting('test.order_a')::uuid;
  order_b uuid := current_setting('test.order_b')::uuid;
  me      uuid := current_setting('test.client_a')::uuid;
  other   uuid := current_setting('test.client_b')::uuid;
  n       int;
  role_after text;
  status_after text;
  brief_after text;
  raised  boolean;
begin
  -- Sees only their own order.
  select count(*) into n from public.orders;
  assert n = 1, format('client A should see exactly 1 order, saw %s', n);

  select count(*) into n from public.orders where id = order_b;
  assert n = 0, 'client A must not see client B''s order';

  -- Sees the two client-visible messages, not the internal note.
  select count(*) into n from public.order_messages where order_id = order_a;
  assert n = 2, format('client A should see 2 messages, saw %s', n);

  select count(*) into n from public.order_messages where internal;
  assert n = 0, 'client A must not see internal notes';

  -- The child tables inherit the same visibility.
  select count(*) into n from public.order_events where order_id = order_b;
  assert n = 0, 'client A must not see client B''s history';

  select count(*) into n from public.order_milestones where order_id = order_b;
  assert n = 0, 'client A must not see client B''s milestones';

  -- Each order opens with one history row from the trigger.
  select count(*) into n from public.order_events where order_id = order_a;
  assert n = 1, format('order A should open with 1 history row, saw %s', n);

  -- A client can read their own profile but not another client's.
  select count(*) into n from public.profiles where id = me;
  assert n = 1, 'client A should read their own profile';

  select count(*) into n from public.profiles where id = other;
  assert n = 0, 'client A must not read client B''s profile';

  -- Cannot promote themselves: `prevent_role_escalation` resets it.
  update public.profiles set role = 'admin' where id = me;
  select role into role_after from public.profiles where id = me;
  assert role_after = 'client',
    format('client A promoted themselves to %s', role_after);

  -- Cannot move the order along: the client edit policy pins status to 'inquiry'.
  raised := false;
  begin
    update public.orders set status = 'active' where id = order_a;
  exception when others then
    raised := true;
  end;
  select status into status_after from public.orders where id = order_a;
  assert status_after = 'inquiry',
    format('client A advanced the order to %s', status_after);

  -- ...but they *can* still correct their own brief.
  update public.orders set brief = 'A corrected brief from client A.' where id = order_a;
  select brief into brief_after from public.orders where id = order_a;
  assert brief_after = 'A corrected brief from client A.',
    'client A could not edit their own brief';

  -- Cannot post an internal note.
  raised := false;
  begin
    insert into public.order_messages (order_id, author_id, author_role, body, internal)
    values (order_a, me, 'client', 'A note to the studio alone.', true);
  exception when others then
    raised := true;
  end;
  assert raised, 'client A posted an internal note';

  -- Cannot claim to be staff.
  raised := false;
  begin
    insert into public.order_messages (order_id, author_id, author_role, body, internal)
    values (order_a, me, 'admin', 'A message pretending to be an admin.', false);
  exception when others then
    raised := true;
  end;
  assert raised, 'client A posted a message as an admin';

  -- Cannot open a request that is already quoted, closed, or assigned.
  raised := false;
  begin
    insert into public.orders (client_id, title, status)
    values (me, 'Already quoted', 'quoted');
  exception when others then
    raised := true;
  end;
  assert raised, 'client A opened an order straight into ''quoted''';

  raised := false;
  begin
    insert into public.orders (client_id, title, agent_id)
    values (me, 'Pre-assigned', current_setting('test.agent')::uuid);
  exception when others then
    raised := true;
  end;
  assert raised, 'client A opened an order already assigned to an agent';

  -- Cannot write a read marker on somebody else's behalf.
  raised := false;
  begin
    insert into public.order_message_reads (order_id, user_id)
    values (order_a, other);
  exception when others then
    raised := true;
  end;
  assert raised, 'client A wrote a read marker for client B';

  raise notice 'client A: 18 checks passed';
end $$;

select set_config('request.jwt.claims', '', true);
reset role;

-- -----------------------------------------------------------------------------
--  The assigned agent
-- -----------------------------------------------------------------------------

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', current_setting('test.agent'), 'role', 'authenticated')::text,
  true
);

do $$
declare
  order_a uuid := current_setting('test.order_a')::uuid;
  order_b uuid := current_setting('test.order_b')::uuid;
  client_a uuid := current_setting('test.client_a')::uuid;
  client_b uuid := current_setting('test.client_b')::uuid;
  n       int;
  status_after text;
  raised  boolean;
begin
  -- Sees their own assignment, and nothing else.
  select count(*) into n from public.orders;
  assert n = 1, format('agent should see exactly 1 order, saw %s', n);

  select count(*) into n from public.orders where id = order_b;
  assert n = 0, 'agent must not see an order they are not assigned to';

  -- Sees the internal note, because it is studio-internal.
  select count(*) into n from public.order_messages where order_id = order_a;
  assert n = 3, format('agent should see 3 messages, saw %s', n);

  -- The client on their order, but not the other client.
  select count(*) into n from public.profiles where id = client_a;
  assert n = 1, 'agent should read the profile of their own client';

  select count(*) into n from public.profiles where id = client_b;
  assert n = 0, 'agent must not read a client they do not work for';

  -- Cannot touch an order that is not theirs: the update matches no rows.
  update public.orders set status = 'active' where id = order_b;
  select status into status_after from public.orders where id = order_b;
  assert status_after = 'inquiry', 'agent advanced an order they do not own';

  -- Can move their own order along, and the trigger records it.
  update public.orders set status = 'active' where id = order_a;
  select count(*) into n from public.order_events
    where order_id = order_a and from_status = 'inquiry' and to_status = 'active';
  assert n = 1, 'the status change was not recorded in order_events';

  -- Can add a milestone to their own order, not to somebody else's.
  insert into public.order_milestones (order_id, title, amount, currency)
  values (order_a, 'Build', 2500, 'USD');

  raised := false;
  begin
    insert into public.order_milestones (order_id, title, amount, currency)
    values (order_b, 'Build', 1800, 'GBP');
  exception when others then
    raised := true;
  end;
  assert raised, 'agent added a milestone to an order they do not own';

  raise notice 'agent: 9 checks passed';
end $$;

select set_config('request.jwt.claims', '', true);
reset role;

-- -----------------------------------------------------------------------------
--  An admin sees everything
-- -----------------------------------------------------------------------------

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', current_setting('test.boss'), 'role', 'authenticated')::text,
  true
);

do $$
declare
  n int;
  order_b uuid := current_setting('test.order_b')::uuid;
  client_b uuid := current_setting('test.client_b')::uuid;
begin
  select count(*) into n from public.orders;
  assert n = 2, format('admin should see both orders, saw %s', n);

  select count(*) into n from public.profiles where id = client_b;
  assert n = 1, 'admin should read any client profile';

  -- An admin can pick up an unassigned order without being its agent.
  update public.orders set status = 'scoping' where id = order_b;
  select count(*) into n from public.order_events
    where order_id = order_b and to_status = 'scoping';
  assert n = 1, 'admin status change was not recorded';

  raise notice 'admin: 3 checks passed';
end $$;

select set_config('request.jwt.claims', '', true);
reset role;

-- -----------------------------------------------------------------------------
--  Read markers stay private
-- -----------------------------------------------------------------------------

do $$
declare
  order_a uuid := current_setting('test.order_a')::uuid;
  agent   uuid := current_setting('test.agent')::uuid;
begin
  -- Written as the owner, so it bypasses RLS on purpose.
  insert into public.order_message_reads (order_id, user_id, last_read_at)
  values (order_a, agent, now());
end $$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', current_setting('test.client_b'), 'role', 'authenticated')::text,
  true
);

do $$
declare
  n int;
begin
  select count(*) into n from public.order_message_reads;
  assert n = 0, format('a stranger read %s read markers', n);
  raise notice 'read markers: 1 check passed';
end $$;

select set_config('request.jwt.claims', '', true);
reset role;

-- -----------------------------------------------------------------------------

do $$
begin
  raise notice 'ALL CHECKS PASSED — rolling back so nothing is left behind';
end $$;

rollback;
