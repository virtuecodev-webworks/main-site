import 'server-only'

import { createSupabaseAdminClient } from './admin'
import type { NewsletterDispatch } from './types'

export async function getNewsletterDashboardData() {
  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return {
      subscribersCount: 0,
      dispatchesCount: 0,
      recentDispatches: [] as NewsletterDispatch[],
    }
  }

  const [subscribersRes, dispatchesRes, countRes] = await Promise.all([
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase
      .from('newsletter_dispatches')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(20)
      .returns<NewsletterDispatch[]>(),
    supabase.from('newsletter_dispatches').select('id', { count: 'exact', head: true }),
  ])

  return {
    subscribersCount: subscribersRes.count ?? 0,
    dispatchesCount: countRes.count ?? 0,
    recentDispatches: dispatchesRes.data ?? [],
  }
}
