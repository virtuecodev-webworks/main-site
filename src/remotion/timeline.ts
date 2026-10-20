/**
 * Side-effect-free timeline constants for the logo intro.
 *
 * Kept separate from `LogoIntro.tsx` on purpose: that module calls Remotion's
 * `loadFont()` at import time, which touches `document`. Anything rendered on
 * the server (Server Components, static metadata routes) must import *this*
 * file instead, and load the composition only through a `ssr: false` dynamic
 * import.
 */

export const LOGO_INTRO_FPS = 30
export const LOGO_INTRO_DURATION = 150

/** Seconds, plus a beat for the fade-out. Used by the first-load veil. */
export const LOGO_INTRO_SECONDS = LOGO_INTRO_DURATION / LOGO_INTRO_FPS

/**
 * Props for the logo intro composition.
 *
 * Extends `Record<string, unknown>` so it satisfies Remotion's `Props`
 * constraint (which requires an index signature).
 */
export interface LogoIntroProps extends Record<string, unknown> {
  /** `dark` paints the studio backdrop; `transparent` exports alpha video. */
  background: 'dark' | 'transparent'
  /** Show the "VIRTUE & CO. / WEBWORKS" lockup beneath the monogram. */
  showWordmark: boolean
  /** Show the brand motto/tagline beneath the rule. */
  showMotto?: boolean
  /** Custom motto text override. Defaults to brand motto. */
  mottoText?: string
}
