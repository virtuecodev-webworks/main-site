/**
 * The installable font catalogue.
 *
 * Every family and every weight in this file was verified against the Google
 * Fonts CSS API, because that endpoint rejects a request for a weight a family
 * does not serve - and the design combines families into a single stylesheet
 * request, so one wrong weight would break every font on the site at once.
 *
 * The two brand faces are not listed here. They are self-hosted through
 * `next/font` and always available, so the editor presents them separately
 * rather than pretending they are installable.
 */

import { isFamilyName, type InstalledFont, type SiteDesign, usedFonts } from './tokens'

export type FontUse = 'display' | 'body' | 'both'

export interface GoogleFont {
  family: string
  /** Where the face is worth using. Drives which picker it appears in. */
  use: FontUse
  /** Human note about the tone of the face. */
  note: string
  /** Weights the family actually serves, as CSS numeric strings. */
  weights: string[]
}

const W300 = ['300', '400', '500', '600', '700']
const W400 = ['400', '500', '600', '700']

export const GOOGLE_FONTS: GoogleFont[] = [
  // Display faces -----------------------------------------------------------
  { family: 'Playfair Display', use: 'display', note: 'High-contrast serif. Editorial headlines.', weights: ['400', '500', '600', '700', '800'] },
  { family: 'Fraunces', use: 'display', note: 'Soft, characterful serif with a modern edge.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Cormorant Garamond', use: 'display', note: 'Delicate classical serif. Best large.', weights: W300 },
  { family: 'Libre Baskerville', use: 'display', note: 'Sturdy book serif, very readable.', weights: W400 },
  { family: 'DM Serif Display', use: 'display', note: 'Single-weight display serif. Bold by default.', weights: ['400'] },
  { family: 'Instrument Serif', use: 'display', note: 'Compact modern serif. Single weight.', weights: ['400'] },
  { family: 'Bodoni Moda', use: 'display', note: 'Fashion-magazine contrast. Strong at scale.', weights: ['400', '500', '600', '700', '800'] },
  { family: 'Lora', use: 'display', note: 'Contemporary serif that also reads well small.', weights: W400 },
  { family: 'Bebas Neue', use: 'display', note: 'Tall condensed caps. Headlines only.', weights: ['400'] },
  { family: 'Anton', use: 'display', note: 'Heavy condensed poster face.', weights: ['400'] },
  { family: 'Unbounded', use: 'display', note: 'Wide geometric display. Statement headings.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Syne', use: 'display', note: 'Unusual widths. Art-direction friendly.', weights: ['400', '500', '600', '700', '800'] },

  // Faces that work either way ---------------------------------------------
  { family: 'Inter', use: 'both', note: 'The brand body face, also available from Google.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Inter Tight', use: 'both', note: 'Inter with tighter spacing. Punchier headings.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'DM Sans', use: 'both', note: 'Low-contrast geometric. Clean and neutral.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Plus Jakarta Sans', use: 'both', note: 'Friendly geometric with distinct shapes.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Manrope', use: 'both', note: 'Semi-rounded, modern, quietly technical.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Figtree', use: 'both', note: 'Soft geometric. Approachable and tidy.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Space Grotesk', use: 'both', note: 'Technical grotesque with personality.', weights: W300 },
  { family: 'Sora', use: 'both', note: 'Geometric, slightly futuristic.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Outfit', use: 'both', note: 'Neutral geometric. Very versatile.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Bricolage Grotesque', use: 'both', note: 'Expressive grotesque with quirks.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Archivo', use: 'both', note: 'Grotesque built for screens and print.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Epilogue', use: 'both', note: 'Geometric with a slight optical curve.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Geist', use: 'both', note: 'Modern neutral sans. Developer-tool feel.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Poppins', use: 'both', note: 'Very round geometric. Popular and bold.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Montserrat', use: 'both', note: 'Urban geometric. Strong uppercase.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Raleway', use: 'both', note: 'Elegant sans with a distinctive W.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Mulish', use: 'both', note: 'Minimal, low-contrast, easy to read.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Instrument Sans', use: 'both', note: 'Compact neo-grotesque. Crisp UI text.', weights: W400 },
  { family: 'Onest', use: 'both', note: 'Warm geometric with open counters.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Schibsted Grotesk', use: 'both', note: 'News-grade grotesque. Very legible.', weights: ['400', '500', '600', '700', '800'] },

  // Body faces --------------------------------------------------------------
  { family: 'Work Sans', use: 'body', note: 'Optimised for mid-size screen text.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Rubik', use: 'body', note: 'Slightly rounded, friendly body text.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Karla', use: 'body', note: 'Grotesque with a little grit. Good long copy.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Public Sans', use: 'body', note: 'Civic, neutral, very plain in a good way.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Source Sans 3', use: 'body', note: 'Adobe body face. Excellent at length.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'IBM Plex Sans', use: 'body', note: 'Engineered feel. Pairs with IBM Plex Mono.', weights: ['300', '400', '500', '600', '700'] },
  { family: 'Lato', use: 'body', note: 'Classic warm sans. Long-established pairing.', weights: ['300', '400', '700'] },
  { family: 'Nunito Sans', use: 'body', note: 'Rounded terminals, gentle body text.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Roboto', use: 'body', note: 'Android default. Utterly familiar.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Open Sans', use: 'body', note: 'Neutral humanist. Safe everywhere.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Noto Sans', use: 'body', note: 'Broad language coverage. Reliable fallback.', weights: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Atkinson Hyperlegible', use: 'body', note: 'Designed for low-vision legibility.', weights: ['400', '700'] },
]

const BY_FAMILY = new Map(GOOGLE_FONTS.map((font) => [font.family, font]))

export function googleFont(family: string): GoogleFont | undefined {
  return BY_FAMILY.get(family)
}

/** Weights to request for a family, filtered to what it actually serves. */
export function requestableWeights(family: string): string[] {
  const entry = BY_FAMILY.get(family)
  if (!entry) return ['400']
  const wanted = ['400', '500', '600', '700'].filter((weight) => entry.weights.includes(weight))
  return wanted.length ? wanted : [entry.weights[0]]
}

/**
 * One stylesheet request for every Google family in use.
 *
 * Returns null when no Google font is in use, which is the default and the
 * reason the shipped site makes no third-party font request at all.
 */
export function googleFontHref(
  fonts: Array<Pick<InstalledFont, 'family' | 'weights'>>,
): string | null {
  const usable = fonts.filter((font) => isFamilyName(font.family) && getGoogleFont(font))
  if (!usable.length) return null

  const parts = usable.map((font) => {
    const weights = font.weights.length ? font.weights : ['400']
    const family = encodeURIComponent(font.family).replace(/%20/g, '+')
    return `family=${family}:wght@${weights.join(';')}`
  })

  return `https://fonts.googleapis.com/css2?${parts.join('&')}&display=swap`
}

function getGoogleFont(font: Pick<InstalledFont, 'family'>): GoogleFont | undefined {
  return BY_FAMILY.get(font.family)
}

/* -------------------------------------------------------------------------- */
/*  Uploaded files                                                             */
/* -------------------------------------------------------------------------- */

/** The CSS `format()` hint for an uploaded file, from its extension. */
export function fontFormat(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase()
  if (extension === 'woff2') return 'woff2'
  if (extension === 'woff') return 'woff'
  if (extension === 'otf') return 'opentype'
  return 'truetype'
}

/** File extensions a custom upload may use, in order of preference. */
export const FONT_EXTENSIONS = ['.woff2', '.woff', '.otf', '.ttf'] as const

export const FONT_FILE_ACCEPT = '.woff2,.woff,.otf,.ttf'

/** Google families in use, ready for `googleFontHref`. */
export function googleFontsInUse(design: SiteDesign) {
  return usedFonts(design).filter((font) => font.kind === 'google')
}

/** Uploaded families in use, ready for `@font-face` emission. */
export function uploadedFontsInUse(design: SiteDesign) {
  return usedFonts(design).filter((font) => font.kind === 'upload' && font.path)
}
