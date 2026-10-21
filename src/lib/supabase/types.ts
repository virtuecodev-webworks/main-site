/**
 * Domain types for the Supabase schema in `supabase/migrations`.
 *
 * Hand-authored on purpose: they stay readable and keep `supabase-js`'s
 * generics out of the way. Regenerate with
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 * if you ever want the fully inferred variant.
 */

import type {
  InquiryStatus,
  MilestoneStatus,
  OrderStatus,
  ProfileRole,
  ProjectCategory,
} from '@/lib/constants'

export interface Project {
  id: string
  slug: string
  title: string
  client: string | null
  summary: string | null
  description: string | null
  category: ProjectCategory
  tech_tags: string[]
  live_url: string | null
  repo_url: string | null
  cover_image_path: string | null
  gallery_paths: string[]
  featured: boolean
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
}

export type ProjectUpdate = Partial<ProjectInsert>

export interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  service: string | null
  budget: string | null
  timeline: string | null
  message: string
  locale: string
  status: InquiryStatus
  source: string
  notified_at: string | null
  created_at: string
}

export type InquiryInsert = Omit<
  Inquiry,
  'id' | 'created_at' | 'status' | 'source' | 'notified_at'
> &
  Partial<Pick<Inquiry, 'status' | 'source' | 'notified_at'>>

export interface Transaction {
  id: string
  reference: string
  provider: string
  provider_tx_id: string | null
  amount: number
  currency: string
  status: 'pending' | 'successful' | 'failed' | 'cancelled'
  customer_email: string | null
  customer_name: string | null
  purpose: string | null
  raw: unknown
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: ProfileRole
  phone: string | null
  company: string | null
  country: string | null
  created_at: string
}

/* -------------------------------------------------------------------------- */
/*  Orders                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A piece of requested work and the commercial relationship around it.
 *
 * Distinct from `Project`, which is the published marketing case study. An order
 * is private, has a client, and may never appear on the site at all.
 */
export interface Order {
  id: string
  reference: string
  client_id: string
  agent_id: string | null
  title: string
  brief: string | null
  service: string | null
  scope: string | null
  status: OrderStatus
  currency: string
  locale: string
  country: string | null
  inquiry_id: string | null
  created_at: string
  updated_at: string
}

export interface OrderMessage {
  id: string
  order_id: string
  author_id: string | null
  author_role: 'client' | 'agent' | 'admin'
  body: string
  internal: boolean
  created_at: string
}

export interface OrderEvent {
  id: string
  order_id: string
  actor_id: string | null
  from_status: OrderStatus | null
  to_status: OrderStatus
  note: string | null
  created_at: string
}

export interface OrderMilestone {
  id: string
  order_id: string
  title: string
  amount: number
  currency: string
  position: number
  status: MilestoneStatus
  reference: string | null
  due_at: string | null
  created_at: string
  updated_at: string
}

/** Who has read up to when, per order. See the migration for why this is a table. */
export interface OrderMessageRead {
  order_id: string
  user_id: string
  last_read_at: string
}

/**
 * An order plus the people on it, for the staff console.
 *
 * `orders.client_id` and `orders.agent_id` both point at `auth.users`, not at
 * `public.profiles`, so PostgREST cannot embed either one — they are fetched with
 * a second query and joined in memory.
 */
export interface OrderWithClient extends Order {
  client: Pick<Profile, 'id' | 'email' | 'full_name' | 'company'> | null
  agent: Pick<Profile, 'id' | 'email' | 'full_name'> | null
}

export interface NewsletterDispatch {
  id: string
  title: string
  subject: string
  content_html: string
  content_text: string | null
  recipients_total: number
  recipients_sent: number
  recipients_failed: number
  triggered_by: 'cron' | 'admin'
  triggered_by_user?: string | null
  sent_at: string
  created_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  status: 'active' | 'unsubscribed'
  confirmed_at: string | null
  unsubscribed_at: string | null
  source: string | null
  created_at: string
}

export interface PushSubscriptionRecord {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth_key: string
  user_agent: string | null
  created_at: string
  updated_at: string
}
