import 'server-only'

import { unstable_cache } from 'next/cache'
import { createSupabasePublicClient } from '@/lib/supabase/admin'
import {
  DEFAULT_DESIGN,
  DESIGN_TAG,
  normalizeDesign,
  type InstalledFont,
  type SiteDesign,
} from './tokens'

/** The raw row, snake_case, exactly as Postgres stores it. */
interface SiteDesignRow {
  accent: string
  light_background: string
  light_surface: string
  dark_background: string
  dark_surface: string
  radius: number
  font_body: string
  font_display: string
  fonts: InstalledFont[] | null
}

const COLUMNS =
  'accent, light_background, light_surface, dark_background, dark_surface, radius, font_body, font_display, fonts'

async function fetchDesign(): Promise<SiteDesign> {
  // Cookie-free client, so this is safe inside `unstable_cache` and keeps the
  // marketing pages statically rendered. RLS already limits the anon role to a
  // read of this one row.
  const supabase = createSupabasePublicClient()
  if (!supabase) return DEFAULT_DESIGN

  const { data, error } = await supabase
    .from('site_design')
    .select(COLUMNS)
    .maybeSingle<SiteDesignRow>()

  if (error) {
    // A missing migration or a policy mistake must not take the site down: the
    // brand defaults are always a valid design.
    console.warn('[design] site_design read failed:', error.message)
    return DEFAULT_DESIGN
  }

  if (!data) return DEFAULT_DESIGN

  return normalizeDesign({
    accent: data.accent,
    lightBackground: data.light_background,
    lightSurface: data.light_surface,
    darkBackground: data.dark_background,
    darkSurface: data.dark_surface,
    radius: data.radius,
    fontBody: data.font_body,
    fontDisplay: data.font_display,
    fonts: data.fonts ?? [],
  })
}

/**
 * The site's design, cached across requests.
 *
 * Cached rather than read per request so the marketing pages stay static: the
 * stylesheet is part of the prerendered HTML, and an admin saving the design
 * calls `revalidateTag(DESIGN_TAG, 'max')`, which is what makes every page
 * rebuild with the new values. Without a configured Supabase project this
 * resolves to the brand defaults, so the site renders before any keys exist.
 */
export const getSiteDesign = unstable_cache(fetchDesign, ['site-design'], {
  revalidate: 3600,
  tags: [DESIGN_TAG],
})
