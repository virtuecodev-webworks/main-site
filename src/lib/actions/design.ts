'use server'

import { revalidateTag } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { resolveAdminSession } from '@/lib/supabase/auth'
import { googleFont, requestableWeights } from '@/lib/design/fonts'
import {
  BRAND_FONT_BODY,
  BRAND_FONT_DISPLAY,
  DEFAULT_DESIGN,
  DESIGN_TAG,
  FONTS_BUCKET,
  clampRadius,
  isFamilyName,
  isHex,
  isStoragePath,
  normalizeDesign,
  type InstalledFont,
} from '@/lib/design/tokens'
import type { ActionState } from './state'

/**
 * Prefer the admin's own RLS-scoped session; fall back to the service role.
 *
 * The RLS policies already restrict every write here to `is_admin()`, so the
 * service-role path exists only so a deployment that has not yet promoted
 * anyone still works through the allow-list.
 */
async function writeClient() {
  const sessionClient = await createSupabaseServerClient()
  if (sessionClient && (await resolveAdminSession())) return sessionClient
  return createSupabaseAdminClient()
}

type FontRow = { fonts: InstalledFont[] | null }

/**
 * Adds a face to the installed list if it is not already there.
 *
 * A brand face needs no entry - it is bundled. A Google face is registered the
 * moment it is chosen, which is what gives it a stylesheet link without an
 * explicit "install" step. Returns null for a family we cannot serve.
 */
function ensureFamily(fonts: InstalledFont[], family: string): InstalledFont[] | null {
  if (family === BRAND_FONT_BODY || family === BRAND_FONT_DISPLAY) return fonts
  if (fonts.some((font) => font.family === family)) return fonts
  if (!googleFont(family)) return null

  return [...fonts, { family, kind: 'google', path: null, weights: requestableWeights(family) }]
}

/**
 * Rebuilds the installed list from whatever is already stored.
 *
 * Read server-side rather than taken from the form: the list is a hidden input
 * otherwise, and hidden inputs are not evidence.
 */
function readFonts(row: FontRow | null): InstalledFont[] {
  return normalizeDesign({ fonts: row?.fonts ?? [] }).fonts
}

/* -------------------------------------------------------------------------- */
/*  Theme                                                                      */
/* -------------------------------------------------------------------------- */

export async function saveTheme(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await resolveAdminSession()
  if (!session) return { status: 'error', message: 'unauthorised' }

  const input = {
    accent: String(formData.get('accent') ?? '').trim().toLowerCase(),
    lightBackground: String(formData.get('lightBackground') ?? '').trim().toLowerCase(),
    lightSurface: String(formData.get('lightSurface') ?? '').trim().toLowerCase(),
    darkBackground: String(formData.get('darkBackground') ?? '').trim().toLowerCase(),
    darkSurface: String(formData.get('darkSurface') ?? '').trim().toLowerCase(),
    fontBody: String(formData.get('fontBody') ?? '').trim(),
    fontDisplay: String(formData.get('fontDisplay') ?? '').trim(),
  }

  const fieldErrors: Record<string, string[]> = {}
  for (const key of ['accent', 'lightBackground', 'lightSurface', 'darkBackground', 'darkSurface'] as const) {
    if (!isHex(input[key])) fieldErrors[key] = ['format']
  }
  if (!isFamilyName(input.fontBody)) fieldErrors.fontBody = ['format']
  if (!isFamilyName(input.fontDisplay)) fieldErrors.fontDisplay = ['format']
  if (Object.keys(fieldErrors).length) {
    return { status: 'error', message: 'validation', fieldErrors }
  }

  const supabase = await writeClient()
  if (!supabase) return { status: 'error', message: 'not-configured' }

  const { data: row, error: readError } = await supabase
    .from('site_design')
    .select('fonts')
    .maybeSingle<FontRow>()

  if (readError) {
    console.error('[design] font list read failed:', readError.message)
    return { status: 'error', message: 'save-failed' }
  }

  let fonts = readFonts(row)
  const withBody = ensureFamily(fonts, input.fontBody)
  if (!withBody) {
    return { status: 'error', message: 'unknown-font', fieldErrors: { fontBody: ['unknown'] } }
  }
  const withDisplay = ensureFamily(withBody, input.fontDisplay)
  if (!withDisplay) {
    return { status: 'error', message: 'unknown-font', fieldErrors: { fontDisplay: ['unknown'] } }
  }
  fonts = withDisplay

  // Google entries are a cache of "this face is in use"; anything no longer
  // chosen is dropped so the list cannot grow every time someone browses the
  // catalogue. Uploads are kept, because deleting an admin's file is not this
  // action's job - `removeFont` is.
  const inUse = new Set([input.fontBody, input.fontDisplay])
  fonts = fonts.filter((font) => font.kind === 'upload' || inUse.has(font.family))

  const { data: updated, error } = await supabase
    .from('site_design')
    .update({
      accent: input.accent,
      light_background: input.lightBackground,
      light_surface: input.lightSurface,
      dark_background: input.darkBackground,
      dark_surface: input.darkSurface,
      radius: clampRadius(formData.get('radius')),
      font_body: input.fontBody,
      font_display: input.fontDisplay,
      fonts,
      updated_by: session.userId,
    })
    .eq('id', true)
    .select('id')

  if (error) {
    console.error('[design] save failed:', error.message)
    return { status: 'error', message: 'save-failed' }
  }

  // No row matched: the singleton was never seeded, which means 0005 has not
  // been run against this database.
  if (!updated?.length) return { status: 'error', message: 'not-configured' }

  revalidateTag(DESIGN_TAG, 'max')
  return { status: 'success', message: 'saved' }
}

/* -------------------------------------------------------------------------- */
/*  Custom fonts                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Registers a file the browser has already uploaded to Storage.
 *
 * The upload itself happens client-side under the admin's own session, so
 * Storage RLS is what authorises it. This action only records the result.
 */
export async function registerUploadedFont(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await resolveAdminSession()
  if (!session) return { status: 'error', message: 'unauthorised' }

  const family = String(formData.get('family') ?? '').trim()
  const path = String(formData.get('path') ?? '').trim()
  const slot = String(formData.get('slot') ?? 'display')

  // A brand name would shadow the bundled face, and `Gropled` in particular is
  // not something an upload should be able to impersonate.
  if (!isFamilyName(family) || family === BRAND_FONT_BODY || family === BRAND_FONT_DISPLAY) {
    return { status: 'error', message: 'invalid-family' }
  }
  if (!isStoragePath(path)) return { status: 'error', message: 'invalid-file' }

  const supabase = await writeClient()
  if (!supabase) return { status: 'error', message: 'not-configured' }

  const { data: row, error: readError } = await supabase
    .from('site_design')
    .select('fonts')
    .maybeSingle<FontRow>()

  if (readError) {
    console.error('[design] font list read failed:', readError.message)
    return { status: 'error', message: 'save-failed' }
  }

  const kept = readFonts(row).filter((font) => font.family !== family)
  const fonts: InstalledFont[] = [
    ...kept,
    { family, kind: 'upload', path, weights: ['400', '700'] },
  ]

  const payload: Record<string, unknown> = { fonts, updated_by: session.userId }
  if (slot === 'body') payload.font_body = family
  else payload.font_display = family

  const { data: updated, error } = await supabase
    .from('site_design')
    .update(payload)
    .eq('id', true)
    .select('id')

  if (error) {
    console.error('[design] font registration failed:', error.message)
    return { status: 'error', message: 'save-failed' }
  }
  if (!updated?.length) return { status: 'error', message: 'not-configured' }

  revalidateTag(DESIGN_TAG, 'max')
  return { status: 'success', message: 'fontInstalled' }
}

export async function removeFont(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await resolveAdminSession()
  if (!session) return { status: 'error', message: 'unauthorised' }

  const family = String(formData.get('family') ?? '').trim()
  if (!isFamilyName(family)) return { status: 'error', message: 'invalid-family' }

  const supabase = await writeClient()
  if (!supabase) return { status: 'error', message: 'not-configured' }

  const { data: row, error: readError } = await supabase
    .from('site_design')
    .select('fonts, font_body, font_display')
    .maybeSingle<FontRow & { font_body: string; font_display: string }>()

  if (readError) {
    console.error('[design] font list read failed:', readError.message)
    return { status: 'error', message: 'save-failed' }
  }

  const current = readFonts(row)
  const removed = current.find((font) => font.family === family)
  const payload: Record<string, unknown> = {
    fonts: current.filter((font) => font.family !== family),
    updated_by: session.userId,
  }

  // Removing a face that is currently in use would leave the site referring to
  // a family with no source, so the slot falls back to the bundled brand face.
  if (row?.font_body === family) payload.font_body = BRAND_FONT_BODY
  if (row?.font_display === family) payload.font_display = BRAND_FONT_DISPLAY

  const { data: updated, error } = await supabase
    .from('site_design')
    .update(payload)
    .eq('id', true)
    .select('id')

  if (error) {
    console.error('[design] font removal failed:', error.message)
    return { status: 'error', message: 'save-failed' }
  }
  if (!updated?.length) return { status: 'error', message: 'not-configured' }

  // Best effort: the file is now unreferenced, and Storage RLS allows an admin
  // to delete it. A failure here must not undo the removal.
  if (removed?.kind === 'upload' && removed.path) {
    const { error: storageError } = await supabase.storage.from(FONTS_BUCKET).remove([removed.path])
    if (storageError) {
      console.warn('[design] font file left behind:', storageError.message)
    }
  }

  revalidateTag(DESIGN_TAG, 'max')
  return { status: 'success', message: 'fontRemoved' }
}

/* -------------------------------------------------------------------------- */
/*  Reset                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Restores the shipped colours and faces.
 *
 * Uploaded files are deliberately kept in the library. "Reset to brand" is
 * meant to undo a styling experiment, not to delete something an admin paid to
 * have drawn; the font list has its own remove button for that.
 */
export async function resetDesign(
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const session = await resolveAdminSession()
  if (!session) return { status: 'error', message: 'unauthorised' }

  const supabase = await writeClient()
  if (!supabase) return { status: 'error', message: 'not-configured' }

  const { data: row, error: readError } = await supabase
    .from('site_design')
    .select('fonts')
    .maybeSingle<FontRow>()

  if (readError) {
    console.error('[design] font list read failed:', readError.message)
    return { status: 'error', message: 'save-failed' }
  }

  const uploads = readFonts(row).filter((font) => font.kind === 'upload')

  const { data: updated, error } = await supabase
    .from('site_design')
    .update({
      accent: DEFAULT_DESIGN.accent,
      light_background: DEFAULT_DESIGN.lightBackground,
      light_surface: DEFAULT_DESIGN.lightSurface,
      dark_background: DEFAULT_DESIGN.darkBackground,
      dark_surface: DEFAULT_DESIGN.darkSurface,
      radius: DEFAULT_DESIGN.radius,
      font_body: DEFAULT_DESIGN.fontBody,
      font_display: DEFAULT_DESIGN.fontDisplay,
      fonts: uploads,
      updated_by: session.userId,
    })
    .eq('id', true)
    .select('id')

  if (error) {
    console.error('[design] reset failed:', error.message)
    return { status: 'error', message: 'save-failed' }
  }
  if (!updated?.length) return { status: 'error', message: 'not-configured' }

  revalidateTag(DESIGN_TAG, 'max')
  return { status: 'success', message: 'reset' }
}
