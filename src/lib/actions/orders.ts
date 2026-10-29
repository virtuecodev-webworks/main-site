'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/auth'
import { canTransition } from '@/lib/orders'
import {
  MILESTONE_STATUSES,
  ORDER_STATUSES,
  isStaffRole,
  type MilestoneStatus,
  type OrderStatus,
} from '@/lib/constants'
import { DEMO_THREAD } from '@/lib/supabase/orders'
import { notifyOrderMessage, notifyNewOrderRequest } from '@/lib/orders/notifications'
import type { ActionState } from './state'

/**
 * Order mutations.
 *
 * Two rules hold everywhere in this file:
 *
 *   1. **The session decides who you are, never the form.** `author_role` and
 *      `internal` are derived from the signed-in user, not from hidden inputs, so
 *      a client cannot post an internal note or claim to be staff.
 *   2. **Authorization is still the database's job.** Every write goes through
 *      the caller's own cookie-bound client, so RLS applies a second time. A
 *      zero-row update is reported as a plain failure rather than an error the
 *      caller could use to probe which ids exist.
 */

const MAX_TITLE = 140
const MAX_BRIEF = 4000
const MAX_MESSAGE = 2000000
const MAX_MILESTONE_TITLE = 140

function field(formData: FormData, key: string, max = 0): string {
  const value = String(formData.get(key) ?? '').trim()
  return max > 0 ? value.slice(0, max) : value
}

function currency(formData: FormData, key = 'currency'): string {
  const value = field(formData, key).toUpperCase()
  return /^[A-Z]{3}$/.test(value) ? value : 'USD'
}

/** Re-render both sides of a conversation after a write. */
function revalidateOrder(locale: string, reference: string) {
  revalidatePath(`/${locale}/portal`)
  revalidatePath(`/${locale}/portal/orders/${reference}`)
  revalidatePath(`/${locale}/admin/orders`)
  revalidatePath(`/${locale}/admin/orders/${reference}`)
}

/* -------------------------------------------------------------------------- */
/*  Client side                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Open a new request.
 *
 * The status is pinned here as well as in the insert policy — a client's request
 * always starts life as an `inquiry` with nobody assigned.
 */
export async function createOrderRequest(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { status: 'error', message: 'not-signed-in' }

  const supabase = await createSupabaseServerClient()
  if (!supabase) return { status: 'error', message: 'not-configured' }

  const locale = field(formData, 'locale') || 'en'
  const title = field(formData, 'title', MAX_TITLE)
  const brief = field(formData, 'brief', MAX_BRIEF)
  const service = field(formData, 'service', 60)
  const scope = field(formData, 'scope', 60)

  const fieldErrors: Record<string, string[]> = {}
  if (!title) fieldErrors.title = ['required']
  if (!brief) fieldErrors.brief = ['required']
  if (Object.keys(fieldErrors).length) {
    return { status: 'error', message: 'missing-fields', fieldErrors }
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      client_id: session.userId,
      title,
      brief,
      service: service || null,
      scope: scope || null,
      currency: currency(formData),
      locale,
      status: 'inquiry',
    })
    .select('reference')
    .single<{ reference: string }>()

  if (error || !data) {
    console.warn('[orders] createOrderRequest failed:', error?.message)
    return { status: 'error', message: 'save-failed' }
  }

  revalidateOrder(locale, data.reference)

  // Dispatch email & push notifications to Admin and confirmation to Client
  notifyNewOrderRequest({
    orderReference: data.reference,
    orderTitle: title,
    brief,
    service,
    scope,
    clientUserId: session.userId,
    locale,
  }).catch((err) => {
    console.warn('[orders] notifyNewOrderRequest background failed:', err)
  })

  return { status: 'success', message: 'created', reference: data.reference }
}

/**
 * Edit the brief while it is still a request.
 *
 * The `orders_client_edit_own_request` policy allows this only while the status
 * is `inquiry`, so a request that has moved on is silently refused — which is
 * why the caller checks the returned row rather than trusting its own form.
 */
export async function updateOrderRequest(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { status: 'error', message: 'not-signed-in' }

  const supabase = await createSupabaseServerClient()
  if (!supabase) return { status: 'error', message: 'not-configured' }

  const locale = field(formData, 'locale') || 'en'
  const orderId = field(formData, 'orderId')
  const reference = field(formData, 'reference')
  const title = field(formData, 'title', MAX_TITLE)
  const brief = field(formData, 'brief', MAX_BRIEF)

  if (!orderId || !title || !brief) return { status: 'error', message: 'missing-fields' }

  const { data, error } = await supabase
    .from('orders')
    .update({ title, brief })
    .eq('id', orderId)
    .select('id')
    .maybeSingle<{ id: string }>()

  if (error || !data) return { status: 'error', message: 'not-editable' }

  revalidateOrder(locale, reference)
  return { status: 'success', message: 'saved' }
}

/* -------------------------------------------------------------------------- */
/*  The conversation                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Post a message.
 *
 * `author_role` is taken from the session. A client sending `internal=true` is
 * ignored rather than rejected: internal notes simply do not exist for them.
 */
export async function postMessage(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { status: 'error', message: 'not-signed-in' }

  const locale = field(formData, 'locale') || 'en'
  const orderId = field(formData, 'orderId')
  const reference = field(formData, 'reference')
  const body = field(formData, 'body', MAX_MESSAGE)

  if (!orderId || !body) return { status: 'error', message: 'missing-fields' }

  const authorRole = session.isAdmin ? 'admin' : session.isStaff ? 'agent' : 'client'
  const internal = session.isStaff && field(formData, 'internal') === 'true'

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    DEMO_THREAD.messages.push({
      id: `msg-${Date.now()}`,
      order_id: orderId,
      author_id: session.userId,
      author_role: authorRole,
      body,
      internal,
      created_at: new Date().toISOString(),
    })
    revalidateOrder(locale, reference)
    return { status: 'success', message: 'sent' }
  }

  const { data, error } = await supabase
    .from('order_messages')
    .insert({ order_id: orderId, author_id: session.userId, author_role: authorRole, body, internal })
    .select('id')
    .maybeSingle<{ id: string }>()

  if (error || !data) {
    console.warn('[orders] postMessage failed:', error?.message)
    return { status: 'error', message: 'save-failed' }
  }

  revalidateOrder(locale, reference)

  if (!internal) {
    // Dispatch transactional email notification to recipient asynchronously
    notifyOrderMessage({
      orderId,
      reference,
      body,
      authorRole,
      authorId: session.userId,
      locale,
    }).catch((err) => {
      console.warn('[orders] notifyOrderMessage background failed:', err)
    })
  }

  return { status: 'success', message: 'sent' }
}

/**
 * Move the caller's read marker to now.
 *
 * Called by the thread when it opens. Upsert rather than update so the first
 * visit creates the row; the primary key makes it idempotent, which matters
 * because this runs on every render of the thread.
 */
export async function markOrderRead(orderId: string): Promise<void> {
  const session = await getSession()
  if (!session) return

  const supabase = await createSupabaseServerClient()
  if (!supabase) return

  const { error } = await supabase
    .from('order_message_reads')
    .upsert(
      { order_id: orderId, user_id: session.userId, last_read_at: new Date().toISOString() },
      { onConflict: 'order_id,user_id' },
    )

  if (error) console.warn('[orders] markOrderRead failed:', error.message)
}

/* -------------------------------------------------------------------------- */
/*  Studio side                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Change an order's status, optionally leaving a note.
 *
 * The status history itself is written by the database trigger. A note is posted
 * as a message instead of being attached to the event, because `order_events` is
 * append-only and deliberately has no write policy for the application.
 */
export async function setOrderStatus(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!session?.isStaff) return { status: 'error', message: 'not-allowed' }

  const supabase = await createSupabaseServerClient()
  if (!supabase) return { status: 'error', message: 'not-configured' }

  const locale = field(formData, 'locale') || 'en'
  const orderId = field(formData, 'orderId')
  const reference = field(formData, 'reference')
  const to = field(formData, 'status') as OrderStatus
  const note = field(formData, 'note', MAX_MESSAGE)
  const noteInternal = field(formData, 'noteInternal') === 'true'

  if (!orderId) return { status: 'error', message: 'missing-fields' }
  if (!ORDER_STATUSES.includes(to)) return { status: 'error', message: 'invalid-status' }

  const { data: current } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .maybeSingle<{ status: OrderStatus }>()

  if (!current) return { status: 'error', message: 'not-found' }
  if (!canTransition(current.status, to)) {
    return { status: 'error', message: 'invalid-transition' }
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update({ status: to })
    .eq('id', orderId)
    .select('id')
    .maybeSingle<{ id: string }>()

  if (error || !updated) {
    console.warn('[orders] setOrderStatus failed:', error?.message)
    return { status: 'error', message: 'save-failed' }
  }

  if (note) {
    const authorRole = session.isAdmin ? 'admin' : 'agent'
    await supabase.from('order_messages').insert({
      order_id: orderId,
      author_id: session.userId,
      author_role: authorRole,
      body: note,
      internal: noteInternal,
    })
  }

  revalidateOrder(locale, reference)
  return { status: 'success', message: 'status-updated' }
}

/** Hand an unassigned order to an agent. Admin only. */
export async function assignOrder(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!session?.isAdmin) return { status: 'error', message: 'not-allowed' }

  const supabase = await createSupabaseServerClient()
  if (!supabase) return { status: 'error', message: 'not-configured' }

  const locale = field(formData, 'locale') || 'en'
  const orderId = field(formData, 'orderId')
  const reference = field(formData, 'reference')
  const agentEmail = field(formData, 'agentEmail').toLowerCase()

  if (!orderId) return { status: 'error', message: 'missing-fields' }

  let agentId: string | null = null
  if (agentEmail) {
    const { data: agent } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', agentEmail)
      .maybeSingle<{ id: string; role: string }>()

    if (!agent || !isStaffRole(agent.role)) {
      return { status: 'error', message: 'agent-not-found' }
    }
    agentId = agent.id
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update({ agent_id: agentId })
    .eq('id', orderId)
    .select('id')
    .maybeSingle<{ id: string }>()

  if (error || !updated) return { status: 'error', message: 'save-failed' }

  revalidateOrder(locale, reference)
  return { status: 'success', message: agentId ? 'assigned' : 'unassigned' }
}

/* -------------------------------------------------------------------------- */
/*  Milestones                                                                 */
/* -------------------------------------------------------------------------- */

export async function addMilestone(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!session?.isStaff) return { status: 'error', message: 'not-allowed' }

  const supabase = await createSupabaseServerClient()
  if (!supabase) return { status: 'error', message: 'not-configured' }

  const locale = field(formData, 'locale') || 'en'
  const orderId = field(formData, 'orderId')
  const reference = field(formData, 'reference')
  const title = field(formData, 'title', MAX_MILESTONE_TITLE)
  const rawAmount = Number(field(formData, 'amount'))
  const dueAt = field(formData, 'dueAt')

  if (!orderId || !title) return { status: 'error', message: 'missing-fields' }
  if (!Number.isFinite(rawAmount) || rawAmount < 0) {
    return { status: 'error', message: 'invalid-amount' }
  }

  // Append to the end of the schedule without trusting a client-supplied index.
  const { data: last } = await supabase
    .from('order_milestones')
    .select('position')
    .eq('order_id', orderId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle<{ position: number }>()

  const { error } = await supabase.from('order_milestones').insert({
    order_id: orderId,
    title,
    amount: rawAmount,
    currency: currency(formData),
    position: (last?.position ?? -1) + 1,
    due_at: dueAt ? new Date(dueAt).toISOString() : null,
  })

  if (error) {
    console.warn('[orders] addMilestone failed:', error.message)
    return { status: 'error', message: 'save-failed' }
  }

  revalidateOrder(locale, reference)
  return { status: 'success', message: 'milestone-added' }
}

export async function setMilestoneStatus(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!session?.isStaff) return { status: 'error', message: 'not-allowed' }

  const supabase = await createSupabaseServerClient()
  if (!supabase) return { status: 'error', message: 'not-configured' }

  const locale = field(formData, 'locale') || 'en'
  const id = field(formData, 'milestoneId')
  const reference = field(formData, 'reference')
  const status = field(formData, 'milestoneStatus') as MilestoneStatus

  if (!id) return { status: 'error', message: 'missing-fields' }
  if (!MILESTONE_STATUSES.includes(status)) {
    return { status: 'error', message: 'invalid-status' }
  }

  const { data: updated, error } = await supabase
    .from('order_milestones')
    .update({ status })
    .eq('id', id)
    .select('id')
    .maybeSingle<{ id: string }>()

  if (error || !updated) return { status: 'error', message: 'save-failed' }

  revalidateOrder(locale, reference)
  return { status: 'success', message: 'saved' }
}

export async function removeMilestone(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!session?.isStaff) return { status: 'error', message: 'not-allowed' }

  const supabase = await createSupabaseServerClient()
  if (!supabase) return { status: 'error', message: 'not-configured' }

  const locale = field(formData, 'locale') || 'en'
  const id = field(formData, 'milestoneId')
  const reference = field(formData, 'reference')

  if (!id) return { status: 'error', message: 'missing-fields' }

  const { error } = await supabase.from('order_milestones').delete().eq('id', id)
  if (error) return { status: 'error', message: 'save-failed' }

  revalidateOrder(locale, reference)
  return { status: 'success', message: 'removed' }
}
