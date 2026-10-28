/**
 * Design settings: the shape, the brand defaults, and the guards.
 *
 * Deliberately a pure module. The admin editor derives its live preview in the
 * browser from the same functions the server uses to build the stylesheet, so
 * what an admin previews is what ships, and there is no second implementation
 * to drift.
 */

/** Cache tag invalidated by the design Server Actions after every write. */
export const DESIGN_TAG = 'site-design'

/** Public bucket holding uploaded font files. */
export const FONTS_BUCKET = 'design-fonts'

export type FontKind = 'google' | 'upload'

export interface InstalledFont {
  family: string
  kind: FontKind
  /** Storage object path. Only meaningful for `upload` fonts. */
  path: string | null
  /** Weights the source actually serves, as CSS numeric strings. */
  weights: string[]
}

export interface SiteDesign {
  accent: string
  lightBackground: string
  lightSurface: string
  darkBackground: string
  darkSurface: string
  /** Corner radius in px. */
  radius: number
  fontBody: string
  fontDisplay: string
  fonts: InstalledFont[]
}

/**
 * The self-hosted, build-time faces matching Vantra Studio's typography:
 * Instrument Sans for body/UI/mono labels, Inter for display/headings.
 */
export const BRAND_FONT_BODY = 'Instrument Sans'
export const BRAND_FONT_DISPLAY = 'Inter'

/**
 * The shipped design: Vantra Studio's Warm Bone (#f5f4f0) + Deep Ink (#0a0a0a)
 * architecture paired with Virtue & Co. Webworks' Rich Gold (#dcaa28) accent.
 */
export const DEFAULT_DESIGN: SiteDesign = {
  accent: '#dcaa28',
  lightBackground: '#f5f4f0',
  lightSurface: '#ffffff',
  darkBackground: '#0a0a0a',
  darkSurface: '#141416',
  radius: 16,
  fontBody: BRAND_FONT_BODY,
  fontDisplay: BRAND_FONT_DISPLAY,
  fonts: [],
}

/** Lowercase `#rrggbb`. Anything else is refused rather than repaired. */
export const HEX_PATTERN = /^#[0-9a-f]{6}$/i

/**
 * Family names as they are published: letters, digits, spaces and hyphens.
 *
 * Apostrophes are excluded on purpose. The name is interpolated into a
 * single-quoted CSS string, and no family on the shortlist contains one, so
 * refusing them removes the escaping question entirely.
 */
export const FAMILY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]{0,48}$/

export const MIN_RADIUS = 0
export const MAX_RADIUS = 32

export const MIN_WEIGHT = 300
export const MAX_WEIGHT = 900

export function isHex(value: unknown): value is string {
  return typeof value === 'string' && HEX_PATTERN.test(value)
}

export function isFamilyName(value: unknown): value is string {
  return typeof value === 'string' && FAMILY_PATTERN.test(value)
}

export function clampRadius(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_DESIGN.radius
  return Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, Math.round(parsed)))
}

/**
 * A bucket-relative object path. No scheme, no leading slash and no `..`, so it
 * can be appended to a bucket URL without escaping anything.
 */
export function isStoragePath(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length < 200 &&
    /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value) &&
    !value.includes('..')
  )
}

export function isBrandFont(family: string): boolean {
  return (
    family === BRAND_FONT_BODY ||
    family === BRAND_FONT_DISPLAY ||
    family === 'Gropled' ||
    family === 'Questrial'
  )
}

/**
 * A CSS reference for one of the design's faces.
 *
 * `Instrument Sans`, `Inter`, and `Gropled` resolve to the variables `next/font`
 * already placed on `<html>`, so choosing them keeps the bundled, preloaded files
 * instead of re-downloading the same family from a CDN under a different name.
 */
export function familyRef(family: string): string {
  if (family === 'Instrument Sans' || family === 'Questrial') {
    return 'var(--font-instrument-sans)'
  }
  if (family === 'Inter') {
    return 'var(--font-inter)'
  }
  if (family === 'Gropled') {
    return 'var(--font-gropled)'
  }
  return `'${family}'`
}

export function bodyFontStack(design: SiteDesign): string {
  return [
    familyRef(design.fontBody),
    'var(--font-instrument-sans)',
    'var(--font-inter)',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    "'Segoe UI'",
    'Roboto',
    "'Helvetica Neue'",
    'Arial',
    'sans-serif',
  ].join(', ')
}

/**
 * The display stack keeps the body face immediately behind the chosen face, so
 * any glyph the display font lacks is drawn in the site's own body face.
 */
export function displayFontStack(design: SiteDesign): string {
  return [
    familyRef(design.fontDisplay),
    'var(--font-inter)',
    'var(--font-instrument-sans)',
    'ui-sans-serif',
    'system-ui',
    'sans-serif',
  ].join(', ')
}

export function findFont(design: SiteDesign, family: string): InstalledFont | undefined {
  return design.fonts.find((font) => font.family === family)
}

/**
 * The fonts actually in use, deduplicated.
 *
 * Only these get a stylesheet link or an `@font-face`. An installed-but-unused
 * family costs nothing on the public site; the admin editor loads candidates on
 * demand instead.
 */
export function usedFonts(design: SiteDesign): InstalledFont[] {
  const seen = new Set<string>()
  const used: InstalledFont[] = []

  for (const family of [design.fontDisplay, design.fontBody]) {
    if (seen.has(family) || isBrandFont(family)) continue
    seen.add(family)
    const font = findFont(design, family)
    if (font) used.push(font)
  }

  return used
}

function normalizeWeights(input: unknown, fallback: string[]): string[] {
  if (!Array.isArray(input)) return fallback
  const weights = input
    .map((entry) => String(entry).trim())
    .filter((entry) => /^[1-9]00$/.test(entry))
  return weights.length ? [...new Set(weights)].sort() : fallback
}

function normalizeFonts(input: unknown): InstalledFont[] {
  if (!Array.isArray(input)) return []

  const fonts: InstalledFont[] = []
  for (const entry of input) {
    if (!entry || typeof entry !== 'object') continue
    const { family, kind, path, weights } = entry as Record<string, unknown>
    if (!isFamilyName(family) || isBrandFont(family)) continue
    if (kind !== 'google' && kind !== 'upload') continue

    fonts.push({
      family,
      kind,
      path: kind === 'upload' && isStoragePath(path) ? path : null,
      weights: normalizeWeights(weights, ['400', '700']),
    })
  }

  // One entry per family, last one wins.
  const byFamily = new Map<string, InstalledFont>()
  for (const font of fonts) byFamily.set(font.family, font)
  return [...byFamily.values()]
}

/**
 * Coerces a database row (or anything else) into a usable design. Every field
 * falls back independently, so one bad column cannot blank the whole site.
 */
export function normalizeDesign(row: Partial<SiteDesign> | null | undefined): SiteDesign {
  if (!row || typeof row !== 'object') return DEFAULT_DESIGN

  const rawBody = isFamilyName(row.fontBody) ? row.fontBody : DEFAULT_DESIGN.fontBody
  const fontBody = rawBody === 'Questrial' ? DEFAULT_DESIGN.fontBody : rawBody

  const rawDisplay = isFamilyName(row.fontDisplay) ? row.fontDisplay : DEFAULT_DESIGN.fontDisplay
  const fontDisplay = rawDisplay === 'Questrial' ? DEFAULT_DESIGN.fontDisplay : rawDisplay

  return {
    accent: isHex(row.accent) ? row.accent : DEFAULT_DESIGN.accent,
    lightBackground: isHex(row.lightBackground)
      ? row.lightBackground
      : DEFAULT_DESIGN.lightBackground,
    lightSurface: isHex(row.lightSurface) ? row.lightSurface : DEFAULT_DESIGN.lightSurface,
    darkBackground: isHex(row.darkBackground) ? row.darkBackground : DEFAULT_DESIGN.darkBackground,
    darkSurface: isHex(row.darkSurface) ? row.darkSurface : DEFAULT_DESIGN.darkSurface,
    radius: clampRadius(row.radius),
    fontBody,
    fontDisplay,
    fonts: normalizeFonts(row.fonts),
  }
}
