/**
 * Virtue & Co. Webworks — brand geometry.
 *
 * Single source of truth for the mark, imported by BOTH the Next.js site
 * (`src/components/brand/*`) and the Remotion compositions (`src/remotion/*`).
 * Keep it free of framework imports so either bundler can consume it.
 *
 * The identity is an architectural vector monogram:
 * Interlocking "V" (Virtue) and "W" (Webworks) structural wireframe on a charcoal tile.
 */

/** Square canvas for the icon. */
export const MARK_VIEWBOX = '0 0 96 96'

/** The tile runs edge to edge in the 96pt canvas. Charcoal, never gold. */
export const MARK_TILE = { x: 0, y: 0, size: 96, radius: 22 } as const

/** The mark scale factor about the canvas centre. */
export const MARK_V_SCALE = 1.05

/** The centre of the canvas — used for transform origins. */
export const MARK_CENTER = 48

export interface MarkStroke {
  /** SVG `d` attribute. */
  d: string
  /** stroke-width in viewBox units. */
  width: number
  /** Order in the reveal timeline (lower draws first). */
  order: number
}

/** Precision illustrated monogram: Outer V + Inner Architectural W facet + Anchor bar */
export const V_PATH = 'M 25 31 L 48 68 L 71 31'
export const W_PATH = 'M 35 49 L 48 29 L 61 49'
export const ANCHOR_PATH = 'M 30 29 L 66 29'

export const MARK_STROKES: MarkStroke[] = [
  { d: V_PATH, width: 7.5, order: 0 },
  { d: W_PATH, width: 6.0, order: 1 },
  { d: ANCHOR_PATH, width: 3.5, order: 2 },
]

/* -------------------------------------------------------------------------- */
/*  Wordmark                                                                   */
/* -------------------------------------------------------------------------- */

export const WORDMARK = {
  lead: 'Virtue',
  ampersand: '&',
  trail: 'Co.',
  /** Flat string for metadata, alt text and JSON-LD. */
  title: 'Virtue & Co.',
  /** Small tracked line under the wordmark. */
  descriptor: 'WEBWORKS',
} as const
