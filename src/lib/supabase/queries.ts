import 'server-only'

import { unstable_cache } from 'next/cache'
import { createSupabaseServerClient } from './server'
import { createSupabaseAdminClient, createSupabasePublicClient } from './admin'
import type { Inquiry, Project, Transaction } from './types'
import type { ProjectCategory } from '@/lib/constants'

/** Cache tag invalidated by the admin Server Actions after every write. */
export const PROJECTS_TAG = 'projects'

async function fetchPublishedProjects(category?: ProjectCategory) {
  // Cookie-free client: safe inside `unstable_cache`, and RLS already limits
  // the anon role to published rows.
  const supabase = createSupabasePublicClient()
  if (!supabase) return []

  let query = supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)

  const { data, error } = await query.returns<Project[]>()
  if (error) {
    console.warn('[queries] published projects failed:', error.message)
    return []
  }
  return data ?? []
}

/**
 * Published portfolio items. Cached for 5 minutes and revalidated on demand by
 * the admin Server Actions, so the public grid stays fast without going stale.
 */
export const getPublishedProjects = (category?: ProjectCategory) =>
  unstable_cache(
    () => fetchPublishedProjects(category),
    ['published-projects', category ?? 'all'],
    { revalidate: 300, tags: [PROJECTS_TAG] },
  )()

export async function getFeaturedProjects(limit = 3) {
  const projects = await getPublishedProjects()
  return projects.filter((project) => project.featured).slice(0, limit)
}

export async function getProjectBySlug(slug: string) {
  const supabase = createSupabasePublicClient()
  if (!supabase) return null

  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle<Project>()

  return data ?? null
}

/** Single row for the CMS edit screen. Admin-only. */
export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = (await createSupabaseServerClient()) ?? createSupabaseAdminClient()
  if (!supabase) return null

  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle<Project>()

  return data ?? null
}

/* -------------------------------------------------------------------------- */
/*  Admin-only reads                                                           */
/* -------------------------------------------------------------------------- */

export async function listAllProjects(): Promise<Project[]> {
  const supabase = (await createSupabaseServerClient()) ?? createSupabaseAdminClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false })
    .returns<Project[]>()

  if (error) {
    console.warn('[queries] listAllProjects failed:', error.message)
    return []
  }
  return data ?? []
}

export async function listInquiries(limit = 100): Promise<Inquiry[]> {
  const supabase = (await createSupabaseServerClient()) ?? createSupabaseAdminClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<Inquiry[]>()

  if (error) {
    console.warn('[queries] listInquiries failed:', error.message)
    return []
  }
  return data ?? []
}

export interface StudioMetrics {
  published: number
  drafts: number
  newInquiries: number
  collected: number
  collectedCurrency: string
}

export async function getStudioMetrics(): Promise<StudioMetrics> {
  const empty: StudioMetrics = {
    published: 0,
    drafts: 0,
    newInquiries: 0,
    collected: 0,
    collectedCurrency: 'USD',
  }

  const supabase = (await createSupabaseServerClient()) ?? createSupabaseAdminClient()
  if (!supabase) return empty

  const [projects, inquiries, payments] = await Promise.all([
    supabase.from('projects').select('published'),
    supabase.from('inquiries').select('status').eq('status', 'new'),
    supabase.from('transactions').select('amount,currency,status').eq('status', 'successful'),
  ])

  const rows = (projects.data ?? []) as Array<{ published: boolean }>
  const successful = (payments.data ?? []) as Array<{ amount: number; currency: string }>

  // Totals are only meaningful per currency, so we report the dominant one.
  const byCurrency = successful.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.currency] = (acc[tx.currency] ?? 0) + Number(tx.amount ?? 0)
    return acc
  }, {})
  const dominant = Object.entries(byCurrency).sort((a, b) => b[1] - a[1])[0]

  return {
    published: rows.filter((row) => row.published).length,
    drafts: rows.filter((row) => !row.published).length,
    newInquiries: (inquiries.data ?? []).length,
    collected: dominant?.[1] ?? 0,
    collectedCurrency: dominant?.[0] ?? 'USD',
  }
}

export async function listRecentTransactions(limit = 10): Promise<Transaction[]> {
  const supabase = (await createSupabaseServerClient()) ?? createSupabaseAdminClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<Transaction[]>()

  return data ?? []
}
