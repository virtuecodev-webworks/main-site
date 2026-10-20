'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { PROJECTS_TAG } from '@/lib/supabase/queries'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getAdminSession } from '@/lib/supabase/auth'
import { issuesToFieldErrors, projectSchema, slugify } from '@/lib/validation'
import type { ProjectCategory } from '@/lib/constants'
import type { ActionState } from './state'

/** Prefer the admin's own RLS-scoped session; fall back to service role. */
async function writeClient() {
  const sessionClient = await createSupabaseServerClient()
  if (sessionClient && (await getAdminSession())) return sessionClient
  return createSupabaseAdminClient()
}

function bool(formData: FormData, key: string) {
  const value = formData.get(key)
  return value === 'on' || value === 'true' || value === '1'
}

function list(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .flatMap((entry) => String(entry).split(','))
    .map((entry) => entry.trim())
    .filter(Boolean)
}

/**
 * Create or update a portfolio item.
 *
 * Images are uploaded straight from the browser to Supabase Storage (see
 * `media-uploader.tsx`), so this action only receives the resulting object
 * paths — keeping large binaries out of the Server Action body.
 */
export async function saveProject(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getAdminSession()
  if (!session) return { status: 'error', message: 'unauthorised' }

  const parsed = projectSchema.safeParse({
    id: String(formData.get('id') ?? ''),
    title: String(formData.get('title') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    client: String(formData.get('client') ?? ''),
    summary: String(formData.get('summary') ?? ''),
    description: String(formData.get('description') ?? ''),
    category: (String(formData.get('category')) || 'custom') as ProjectCategory,
    techTags: list(formData, 'techTags'),
    liveUrl: String(formData.get('liveUrl') ?? ''),
    repoUrl: String(formData.get('repoUrl') ?? ''),
    coverImagePath: String(formData.get('coverImagePath') ?? ''),
    galleryPaths: formData.getAll('galleryPaths').map(String).filter(Boolean),
    featured: bool(formData, 'featured'),
    published: bool(formData, 'published'),
    sortOrder: String(formData.get('sortOrder') ?? '0'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'validation',
      fieldErrors: issuesToFieldErrors(parsed.error.issues),
    }
  }

  const input = parsed.data
  const slug = input.slug || slugify(input.title)
  if (!slug) {
    return { status: 'error', message: 'validation', fieldErrors: { slug: ['invalid'] } }
  }

  const supabase = await writeClient()
  if (!supabase) return { status: 'error', message: 'not-configured' }

  const payload = {
    slug,
    title: input.title,
    client: input.client || null,
    summary: input.summary || null,
    description: input.description || null,
    category: input.category,
    tech_tags: input.techTags,
    live_url: input.liveUrl || null,
    repo_url: input.repoUrl || null,
    cover_image_path: input.coverImagePath || null,
    gallery_paths: input.galleryPaths,
    featured: input.featured,
    published: input.published,
    sort_order: input.sortOrder,
  }

  const { data, error } = input.id
    ? await supabase.from('projects').update(payload).eq('id', input.id).select('id').single()
    : await supabase.from('projects').insert(payload).select('id').single()

  if (error) {
    console.error('[projects] save failed:', error.message)
    return {
      status: 'error',
      // A unique violation on `slug` is the only error worth pinpointing.
      message: error.code === '23505' ? 'duplicate-slug' : 'save-failed',
      fieldErrors: error.code === '23505' ? { slug: ['duplicate'] } : undefined,
    }
  }

  revalidateTag(PROJECTS_TAG, 'max')
  return { status: 'success', message: 'saved', projectId: (data as { id: string }).id }
}

export async function deleteProject(formData: FormData): Promise<void> {
  const session = await getAdminSession()
  if (!session) return

  const id = String(formData.get('id') ?? '')
  const locale = String(formData.get('locale') ?? 'en')
  if (!id) return

  const supabase = await writeClient()
  if (supabase) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) console.error('[projects] delete failed:', error.message)
  }

  revalidateTag(PROJECTS_TAG, 'max')
  redirect(`/${locale}/admin/portfolio`)
}

/** Quick publish / unpublish toggle from the portfolio table. */
export async function setProjectPublished(formData: FormData): Promise<void> {
  const session = await getAdminSession()
  if (!session) return

  const id = String(formData.get('id') ?? '')
  const next = formData.get('next') === 'true'
  if (!id) return

  const supabase = await writeClient()
  if (supabase) {
    const { error } = await supabase.from('projects').update({ published: next }).eq('id', id)
    if (error) console.error('[projects] toggle failed:', error.message)
  }

  revalidateTag(PROJECTS_TAG, 'max')
}
