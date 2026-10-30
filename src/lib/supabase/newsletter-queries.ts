import 'server-only'

import { createSupabaseAdminClient, createSupabasePublicClient } from './admin'
import { createSupabaseServerClient } from './server'
import type { NewsletterDispatch, NewsletterSubscriber } from './types'

export async function getNewsletterDashboardData() {
  let supabase: any = createSupabaseAdminClient()
  if (!supabase) {
    try {
      supabase = await createSupabaseServerClient()
    } catch {
      supabase = null
    }
  }
  if (!supabase) {
    supabase = createSupabasePublicClient()
  }

  if (!supabase) {
    return {
      subscribersCount: 0,
      dispatchesCount: 0,
      recentDispatches: [] as NewsletterDispatch[],
      subscribers: [] as NewsletterSubscriber[],
    }
  }

  const [subscribersCountRes, subscribersListRes, dispatchesRes, countRes] = await Promise.all([
    supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('newsletter_dispatches')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(20),
    supabase.from('newsletter_dispatches').select('id', { count: 'exact', head: true }),
  ])

  let subscribers = (subscribersListRes.data as NewsletterSubscriber[] | null) ?? []

  // Fallback: If newsletter_subscribers returned empty, check legacy subscribers table
  if (subscribers.length === 0) {
    const { data: legacyData } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (legacyData && legacyData.length > 0) {
      subscribers = legacyData.map((row: any) => ({
        id: row.id || `legacy-${row.email}`,
        email: row.email,
        status: (row.status || 'active') as 'active' | 'unsubscribed',
        confirmed_at: row.created_at || null,
        unsubscribed_at: null,
        source: row.source || 'website',
        created_at: row.created_at || new Date().toISOString(),
      }))
    }
  }

  const activeSubscribers = subscribers.filter((s: NewsletterSubscriber) => s.status === 'active' || !s.status)
  const resolvedSubscribersCount =
    typeof subscribersCountRes.count === 'number' && subscribersCountRes.count > 0
      ? Math.max(subscribersCountRes.count, activeSubscribers.length)
      : activeSubscribers.length

  return {
    subscribersCount: resolvedSubscribersCount,
    dispatchesCount: countRes.count ?? (dispatchesRes.data?.length ?? 0),
    recentDispatches: dispatchesRes.data ?? [],
    subscribers,
  }
}
