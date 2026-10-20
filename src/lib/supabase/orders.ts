import 'server-only'

import { createSupabaseServerClient } from './server'
import type {
  Order,
  OrderEvent,
  OrderMessage,
  OrderMessageRead,
  OrderMilestone,
  OrderWithClient,
  Profile,
} from './types'

/**
 * Order reads.
 *
 * Deliberately thin: **the Row Level Security policies are the access control**,
 * not these functions. A client's query physically cannot return another
 * client's order, and an agent's cannot return work assigned to somebody else.
 * Re-checking participation here would be duplicated logic that could drift from
 * the database — the one place it can actually be enforced.
 *
 * The trade-off is that a query which "should" return nothing returns an empty
 * list rather than an error, so callers must treat `[]` and `null` as "not yours
 * or not there" and never as "something broke".
 */

const DEMO_ORDERS: Order[] = [
  {
    id: 'demo-order-1',
    reference: 'VCW-2026-DEV001',
    client_id: 'demo-client-id',
    agent_id: 'demo-admin-id',
    title: 'Modern Full-Stack Next.js 16 Web Application',
    brief: 'High-performance bespoke SaaS interface with Supabase authentication, multi-currency Stripe checkout, and automated onboarding workflow.',
    service: 'custom',
    scope: 'multi-page',
    status: 'active',
    currency: 'USD',
    locale: 'en',
    country: 'US',
    inquiry_id: null,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'demo-order-2',
    reference: 'VCW-2026-WIX002',
    client_id: 'demo-client-id',
    agent_id: 'demo-admin-id',
    title: 'Brand Refresh & Wix Studio Migration',
    brief: 'Migrating Figma UI components to Wix Studio with responsive breakpoints, SEO meta schema, and custom client inquiry forms.',
    service: 'wix',
    scope: 'single-page',
    status: 'delivered',
    currency: 'USD',
    locale: 'en',
    country: 'US',
    inquiry_id: null,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
]

/** Every order the caller is allowed to see, newest activity first. */
export async function listOrders(limit = 100): Promise<Order[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return DEMO_ORDERS.slice(0, limit)

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit)
    .returns<Order[]>()

  if (error) {
    console.warn('[orders] listOrders failed:', error.message)
    return DEMO_ORDERS.slice(0, limit)
  }
  return data ?? []
}

/** One order by its human reference, e.g. `VCW-2026-4F9A2C`. */
export async function getOrderByReference(reference: string): Promise<Order | null> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return DEMO_ORDERS.find((o) => o.reference === reference) ?? DEMO_ORDERS[0]
  }

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('reference', reference)
    .maybeSingle<Order>()

  return data ?? null
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const { data } = await supabase.from('orders').select('*').eq('id', id).maybeSingle<Order>()
  return data ?? null
}

export interface OrderThread {
  messages: OrderMessage[]
  events: OrderEvent[]
  milestones: OrderMilestone[]
}

export const DEMO_THREAD: OrderThread = {
  messages: [
    {
      id: 'msg-1',
      order_id: 'demo-order-1',
      author_id: 'demo-client-id',
      author_role: 'client',
      body: `Hello team! We need to make sure the Stripe checkout supports Apple Pay and USD invoicing. We've attached our brand typography guidelines and assets.\n\n<!--VCW_CHAT_PAYLOAD_START-->\n{"report":null,"links":[{"title":"Figma Brand Library","url":"https://www.figma.com/design/virtue-brand","category":"figma"}],"attachments":[{"id":"att-1","name":"brand-assets-v2.zip","size":2450000,"type":"application/zip"},{"id":"att-2","name":"invoicing-requirements.pdf","size":480000,"type":"application/pdf"}]}\n<!--VCW_CHAT_PAYLOAD_END-->`,
      internal: false,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'msg-internal-1',
      order_id: 'demo-order-1',
      author_id: 'demo-admin-id',
      author_role: 'admin',
      body: 'Verified Stripe webhook endpoints in sandbox mode. Database indexes for order transactions deployed.',
      internal: true,
      created_at: new Date(Date.now() - 2.5 * 86400000).toISOString(),
    },
    {
      id: 'msg-2',
      order_id: 'demo-order-1',
      author_id: 'demo-admin-id',
      author_role: 'admin',
      body: `Hi Alex! Apple Pay and Google Pay are both active through our Stripe integration. Here is our official Sprint 2 progress report and staging link for your review:\n\n<!--VCW_CHAT_PAYLOAD_START-->\n{"report":{"sprint":"Sprint 2: Core Frontend & Database Setup","percent":75,"deliverables":["Responsive Questrial layouts complete across mobile, tablet, and desktop","Supabase Auth & Client Portal permissions secured","Stripe Checkout integrated with Apple Pay & Google Pay (USD)","Lighthouse audit achieving 100/100 performance score"],"nextSteps":"Client review of staging build and final DNS domain handover","stagingUrl":"https://staging.virtueco.dev"},"links":[{"title":"Live Staging Preview","url":"https://staging.virtueco.dev","category":"staging"},{"title":"Figma Interactive Prototype","url":"https://www.figma.com/design/virtue-proto","category":"figma"},{"title":"GitHub Pull Request","url":"https://github.com/virtueweb/core/pull/42","category":"github"}],"attachments":[{"id":"att-3","name":"architecture-spec.pdf","size":1250000,"type":"application/pdf"},{"id":"att-4","name":"lighthouse-audit-100.png","size":620000,"type":"image/png"}]}\n<!--VCW_CHAT_PAYLOAD_END-->`,
      internal: false,
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ],
  events: [
    {
      id: 'evt-1',
      order_id: 'demo-order-1',
      actor_id: 'demo-admin-id',
      from_status: 'inquiry',
      to_status: 'scoping',
      note: 'Scope agreed with client',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'evt-2',
      order_id: 'demo-order-1',
      actor_id: 'demo-admin-id',
      from_status: 'scoping',
      to_status: 'active',
      note: 'Deposit confirmed & engineering sprint initiated',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
  ],
  milestones: [
    {
      id: 'ms-1',
      order_id: 'demo-order-1',
      title: 'Sprint 1: Architecture, Design Tokens & Auth Setup',
      amount: 450,
      currency: 'USD',
      status: 'paid',
      position: 1,
      reference: 'INV-2026-001',
      due_at: null,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'ms-2',
      order_id: 'demo-order-1',
      title: 'Sprint 2: Core Components & Staging Review',
      amount: 450,
      currency: 'USD',
      status: 'pending',
      position: 2,
      reference: 'INV-2026-002',
      due_at: null,
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'ms-3',
      order_id: 'demo-order-1',
      title: 'Sprint 3: Handover, Domain DNS & IP Transfer',
      amount: 150,
      currency: 'USD',
      status: 'pending',
      position: 3,
      reference: 'INV-2026-003',
      due_at: null,
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
  ],
}

/**
 * The three children of an order in one round trip.
 */
export async function getOrderThread(orderId: string, includeInternal: boolean): Promise<OrderThread> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return DEMO_THREAD

  let messageQuery = supabase
    .from('order_messages')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  if (!includeInternal) messageQuery = messageQuery.eq('internal', false)

  const [messages, events, milestones] = await Promise.all([
    messageQuery.returns<OrderMessage[]>(),
    supabase
      .from('order_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .returns<OrderEvent[]>(),
    supabase
      .from('order_milestones')
      .select('*')
      .eq('order_id', orderId)
      .order('position', { ascending: true })
      .returns<OrderMilestone[]>(),
  ])

  return {
    messages: messages.data ?? [],
    events: events.data ?? [],
    milestones: milestones.data ?? [],
  }
}

/**
 * The caller's read markers for a set of orders.
 *
 * RLS restricts this to rows where `user_id = auth.uid()`, so passing ids is a
 * filter, never a way in.
 */
export async function listMyReadMarkers(orderIds: string[]): Promise<OrderMessageRead[]> {
  if (!orderIds.length) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('order_message_reads')
    .select('*')
    .in('order_id', orderIds)
    .returns<OrderMessageRead[]>()

  return data ?? []
}

export interface UnreadSummary {
  /** order id → number of messages the caller has not seen yet. */
  byOrder: Record<string, number>
  total: number
}

/**
 * Unread counts across a set of orders.
 *
 * Done in two flat queries and reduced in memory rather than one query per
 * order: the portal shows a fixed number of orders at a time, so this trades a
 * little bandwidth for a predictable two round trips.
 */
export async function getUnreadSummary(orderIds: string[]): Promise<UnreadSummary> {
  const empty: UnreadSummary = { byOrder: {}, total: 0 }
  if (!orderIds.length) return empty

  const supabase = await createSupabaseServerClient()
  if (!supabase) return empty

  const [sent, markers] = await Promise.all([
    supabase
      .from('order_messages')
      .select('order_id, author_id, internal, created_at')
      .in('order_id', orderIds)
      .returns<Array<Pick<OrderMessage, 'order_id' | 'author_id' | 'internal' | 'created_at'>>>(),
    listMyReadMarkers(orderIds),
  ])

  if (sent.error) {
    console.warn('[orders] unread scan failed:', sent.error.message)
    return empty
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const me = user?.id ?? null

  const readAt = new Map(markers.map((marker) => [marker.order_id, Date.parse(marker.last_read_at)]))
  const byOrder: Record<string, number> = {}

  for (const message of sent.data ?? []) {
    // A message you wrote is never unread, and neither is a note you cannot see.
    if (message.author_id && message.author_id === me) continue
    const seen = readAt.get(message.order_id)
    if (seen !== undefined && Date.parse(message.created_at) <= seen) continue
    byOrder[message.order_id] = (byOrder[message.order_id] ?? 0) + 1
  }

  return {
    byOrder,
    total: Object.values(byOrder).reduce((sum, count) => sum + count, 0),
  }
}

const DEMO_CLIENT_PROFILE: Pick<Profile, 'id' | 'email' | 'full_name' | 'company'> = {
  id: 'demo-client-id',
  email: 'client@virtueco.dev',
  full_name: 'Alex Vance',
  company: 'Apex Technologies LLC',
}

const DEMO_ADMIN_PROFILE: Pick<Profile, 'id' | 'email' | 'full_name' | 'company'> = {
  id: 'demo-admin-id',
  email: 'admin@virtueco.dev',
  full_name: 'Virtue Principal Engineer',
  company: 'Virtueweb & Co Webworks',
}

/**
 * Orders plus the people on each one, for the staff console.
 *
 * `client_id` and `agent_id` point at `auth.users` rather than at
 * `public.profiles`, so PostgREST cannot embed either — both are fetched with a
 * second query and joined in memory. That query is itself policy-bound: an agent
 * may only read the profiles of clients on their own orders, so a missing row is
 * a permission answer rather than a bug.
 */
export async function listOrdersWithClients(limit = 100): Promise<OrderWithClient[]> {
  const orders = await listOrders(limit)
  if (!orders.length) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return orders.map((order) => ({
      ...order,
      client: DEMO_CLIENT_PROFILE,
      agent: DEMO_ADMIN_PROFILE,
    }))
  }

  const peopleIds = [
    ...new Set([
      ...orders.map((order) => order.client_id),
      ...orders.map((order) => order.agent_id).filter((id): id is string => Boolean(id)),
    ]),
  ]

  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, company')
    .in('id', peopleIds)
    .returns<Array<Pick<Profile, 'id' | 'email' | 'full_name' | 'company'>>>()

  const byId = new Map((data ?? []).map((profile) => [profile.id, profile]))

  return orders.map((order) => ({
    ...order,
    client: byId.get(order.client_id) ?? null,
    agent: order.agent_id ? (byId.get(order.agent_id) ?? null) : null,
  }))
}

/** One order with its client and agent, for a staff detail page. */
export async function getOrderWithClient(reference: string): Promise<OrderWithClient | null> {
  const order = await getOrderByReference(reference)
  if (!order) return null

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return {
      ...order,
      client: DEMO_CLIENT_PROFILE,
      agent: DEMO_ADMIN_PROFILE,
    }
  }

  const peopleIds = [order.client_id, order.agent_id].filter(
    (id): id is string => Boolean(id),
  )

  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, company')
    .in('id', peopleIds)
    .returns<Array<Pick<Profile, 'id' | 'email' | 'full_name' | 'company'>>>()

  const byId = new Map((data ?? []).map((profile) => [profile.id, profile]))

  return {
    ...order,
    client: byId.get(order.client_id) ?? null,
    agent: order.agent_id ? (byId.get(order.agent_id) ?? null) : null,
  }
}

