/**
 * Virtue & Co. Webworks — brand geometry.
 *
 * Single source of truth for the VW combined monogram mark.
 * Imported by both the Next.js site (`src/components/brand/*`) and the
 * Remotion compositions (`src/remotion/*`).
 * Keep it free of framework imports so either bundler can consume it.
 *
 * The identity is a combined V+W filled-polygon monogram on a charcoal tile.
 * The silhouette reads as an outer V enclosing an inner W:
 * 5 prongs at the top converging to a single point at the bottom.
 */

/** Square canvas for the icon. */
export const MARK_VIEWBOX = '0 0 96 96'

/** The tile runs edge-to-edge in the 96pt canvas. Charcoal. */
export const MARK_TILE = { x: 0, y: 0, size: 96, radius: 20 } as const

/** Scale factor applied to the polygon within the tile canvas. */
export const MARK_V_SCALE = 0.68

/** The centre of the canvas — used for transform origins. */
export const MARK_CENTER = 48

export interface MarkStroke {
  /** SVG `d` attribute. */
  d: string
  /** stroke-width in viewBox units (0 = filled polygon, not stroked). */
  width: number
  /** Order in the reveal timeline (lower draws first). */
  order: number
}

/**
 * The VW combined monogram as a filled polygon (100×82 coordinate space).
 * Shape: outer V silhouette + inner W valley, all converging at bottom point.
 *   Top-left arm → left-W valley → W center peak → right-W valley → top-right arm → bottom tip
 */
export const VW_POLYGON = '5,2 23,2 37,32 50,20 63,32 77,2 95,2 50,80'

/** Closed path version of the polygon for animation or SVG path use. */
export const VW_PATH = 'M 5,2 L 23,2 L 37,32 L 50,20 L 63,32 L 77,2 L 95,2 L 50,80 Z'

/** Brand gold gradient stops. */
export const GOLD_START = '#E8C84A'
export const GOLD_END = '#B8922A'

/**
 * Legacy MarkStroke array — kept for backwards-compatible imports in Remotion.
 * Now a single entry representing the filled polygon outline.
 */
export const MARK_STROKES: MarkStroke[] = [
  { d: VW_PATH, width: 0, order: 0 },
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
