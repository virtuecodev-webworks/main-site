/**
 * Virtue & Co. Webworks — architectural brand geometry.
 *
 * Single source of truth for the redesigned Virtue architectural monogram mark.
 * Clean, bold, and iconic — legible at both 16px mobile header size and full billboard scale.
 */

/** Square canvas for the icon. */
export const MARK_VIEWBOX = '0 0 96 96'

/** The tile runs edge-to-edge in the 96pt canvas. Charcoal (#0a0a0a) with rounded corners. */
export const MARK_TILE = { x: 0, y: 0, size: 96, radius: 20 } as const

/** Center of the canvas. */
export const MARK_CENTER = 48

/** Scale factor applied to the monogram. */
export const MARK_V_SCALE = 1.0

/**
 * Architectural Virtue "V" Monogram:
 * Two bold, precision-angled architectural beams that converge into a sharp,
 * confident apex, separated by a microscopic laser center-slit for modern elegance.
 */
export const VIRTUE_LEFT_WING = 'M 22,22 L 42,22 L 47,68 L 33,74 Z'
export const VIRTUE_RIGHT_WING = 'M 74,22 L 54,22 L 49,68 L 63,74 Z'

/** Combined polygon points for backward compatibility. */
export const VW_POLYGON = '22,22 42,22 48,66 54,22 74,22 56,76 40,76'

/** Combined path string for ambient animations. */
export const VW_PATH = 'M 22,22 L 42,22 L 47,68 L 33,74 Z M 74,22 L 54,22 L 49,68 L 63,74 Z'

/** Brand gold gradient stops. */
export const GOLD_START = '#f3d052'
export const GOLD_END = '#c49619'

export interface MarkStroke {
  d: string
  width: number
  order: number
}

export const MARK_STROKES: MarkStroke[] = [
  { d: `M 22,22 L 42,22 L 47,68 L 33,74 Z M 74,22 L 54,22 L 49,68 L 63,74 Z`, width: 0, order: 0 },
]

/* -------------------------------------------------------------------------- */
/*  Wordmark                                                                   */
/* -------------------------------------------------------------------------- */

export const WORDMARK = {
  lead: 'Virtue',
  ampersand: '&',
  trail: 'Co.',
  descriptor: 'Webworks',
} as const
