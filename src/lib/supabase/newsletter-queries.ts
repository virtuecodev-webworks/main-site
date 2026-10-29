import 'server-only'

import { createSupabaseAdminClient } from './admin'
import type { NewsletterDispatch, NewsletterSubscriber } from './types'

export async function getNewsletterDashboardData() {
  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return {
      subscribersCount: 0,
      dispatchesCount: 0,
      recentDispatches: [] as NewsletterDispatch[],
      subscribers: [] as NewsletterSubscriber[],
    }
  }

  const [subscribersCountRes, subscribersListRes, dispatchesRes, countRes] = await Promise.all([
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false })
      .returns<NewsletterSubscriber[]>(),
    supabase
      .from('newsletter_dispatches')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(20)
      .returns<NewsletterDispatch[]>(),
    supabase.from('newsletter_dispatches').select('id', { count: 'exact', head: true }),
  ])

  return {
    subscribersCount: subscribersCountRes.count ?? 0,
    dispatchesCount: countRes.count ?? 0,
    recentDispatches: dispatchesRes.data ?? [],
    subscribers: subscribersListRes.data ?? [],
  }
}
