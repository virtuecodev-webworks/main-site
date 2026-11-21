import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/outreach/auth'
import { buildDedupKey, normalizeDomain } from '@/lib/outreach/deduplication'
import {
  createOutreachRepository,
  OutreachDatabaseUnavailableError,
  OutreachRepositoryError,
} from '@/lib/outreach/repository'
import type { ProspectUpdatePatch } from '@/lib/outreach/types'
import {
  issuesToFieldErrors,
  prospectCreateSchema,
  prospectQuerySchema,
  prospectUpdateSchema,
} from '@/lib/outreach/validation'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi()
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
  }

  const sp = request.nextUrl.searchParams
  const parsed = prospectQuerySchema.safeParse({
    status: sp.get('status') ?? undefined,
    q: sp.get('q') ?? undefined,
    limit: sp.get('limit') ?? undefined,
    offset: sp.get('offset') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid prospect query parameters',
        fieldErrors: issuesToFieldErrors(parsed.error.issues),
      },
      { status: 400 },
    )
  }

  try {
    const repo = createOutreachRepository()
    const prospects = await repo.listProspects(parsed.data)
    return NextResponse.json({
      ok: true,
      prospects,
    })
  } catch (err) {
    if (err instanceof OutreachDatabaseUnavailableError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 503 })
    }
    const message = err instanceof Error ? err.message : 'Failed to list outreach prospects'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi()
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON request body' },
      { status: 400 },
    )
  }

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { ok: false, error: 'Request body must be a JSON object' },
      { status: 400 },
    )
  }

  const parsed = prospectCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid prospect payload',
        fieldErrors: issuesToFieldErrors(parsed.error.issues),
      },
      { status: 400 },
    )
  }

  try {
    const data = parsed.data
    const normalizedDomain = normalizeDomain(data.website_url)
    const dedupKey = buildDedupKey({
      businessName: data.business_name,
      location: data.location,
      websiteUrl: data.website_url,
      normalizedDomain,
    })

    const repo = createOutreachRepository()
    const prospect = await repo.upsertProspect({
      business_name: data.business_name,
      normalized_domain: normalizedDomain,
      website_url: data.website_url ?? null,
      industry: data.industry ?? null,
      location: data.location ?? null,
      contact_email: data.contact_email ?? null,
      phone: data.phone ?? null,
      source_provider: data.source_provider,
      source_external_id: data.source_external_id ?? null,
      dedup_key: dedupKey,
      evaluation_notes: data.evaluation_notes ?? null,
      status: data.status,
      issue_score: data.issue_score,
      has_website: data.has_website ?? Boolean(data.website_url),
      issues: data.issues,
    })

    return NextResponse.json(
      {
        ok: true,
        prospect,
      },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof OutreachDatabaseUnavailableError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 503 })
    }
    const message = err instanceof Error ? err.message : 'Failed to create outreach prospect'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApi()
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON request body' },
      { status: 400 },
    )
  }

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { ok: false, error: 'Request body must be a JSON object' },
      { status: 400 },
    )
  }

  const parsed = prospectUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid prospect update payload',
        fieldErrors: issuesToFieldErrors(parsed.error.issues),
      },
      { status: 400 },
    )
  }

  try {
    const { id, ...rest } = parsed.data
    const patch: ProspectUpdatePatch = {}

    if (rest.status !== undefined) patch.status = rest.status
    if (rest.contact_email !== undefined) patch.contact_email = rest.contact_email
    if (rest.evaluation_notes !== undefined) patch.evaluation_notes = rest.evaluation_notes
    if (rest.website_url !== undefined) {
      patch.website_url = rest.website_url
      patch.normalized_domain = normalizeDomain(rest.website_url)
      patch.has_website = Boolean(rest.website_url)
    }

    const repo = createOutreachRepository()
    const prospect = await repo.updateProspect(id, patch)

    return NextResponse.json({
      ok: true,
      prospect,
    })
  } catch (err) {
    if (err instanceof OutreachDatabaseUnavailableError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 503 })
    }
    if (err instanceof OutreachRepositoryError && err.code === 'PGRST116') {
      return NextResponse.json({ ok: false, error: 'Prospect not found' }, { status: 404 })
    }
    const message = err instanceof Error ? err.message : 'Failed to update outreach prospect'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
