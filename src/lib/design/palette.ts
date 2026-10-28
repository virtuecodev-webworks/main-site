/**
 * Colour derivation.
 *
 * An admin picks six things - an accent, a background and a surface for each
 * mode, and a radius - and this file turns them into the full token set. The
 * point is that nobody has to hand-tune thirty variables to change one colour,
 * and that dark mode cannot drift out of sync with light mode because both are
 * produced by the same function.
 *
 * Two rules from the brand survive every combination:
 *
 *   1. Depth comes from surfaces and hairlines, never from glow. Nothing here
 *      emits a coloured shadow, a gradient or a brightness filter.
 *   2. A button's hover state is a decisive colour flip, not a lighter shade.
 *
 * The mix ratios below are tuned so `DEFAULT_DESIGN` reproduces the studio's
 * own palette; `design-selfcheck.cjs` asserts that, and also sweeps the whole
 * hue circle to prove any accent stays legible and gets a visible flip.
 */

import { DEFAULT_DESIGN, type SiteDesign } from './tokens'

export interface ModePalette {
  background: string
  foreground: string
  card: string
  muted: string
  mutedForeground: string
  border: string
  primary: string
  primaryForeground: string
  primaryHover: string
  primaryHoverForeground: string
  secondary: string
  secondaryForeground: string
  secondaryHover: string
  ring: string
}

export interface Palette {
  light: ModePalette
  dark: ModePalette
}

/* -------------------------------------------------------------------------- */
/*  Colour maths                                                               */
/* -------------------------------------------------------------------------- */

type Rgb = [number, number, number]

const INK_DEEP = '#0a0a0a'
const INK_LIGHT = '#f5f4f0'
const BUTTON_INK = '#191308'
const WHITE = '#ffffff'
const BLACK = '#000000'

/**
 * The worst label contrast physically available on a filled button.
 *
 * A fill of middling luminance is equidistant from both label poles, so the
 * best label colour for it is at the crossing point. Computed rather than
 * written down, because the number depends on the exact ink: for the studio's
 * near-black it works out at 4.30:1.
 *
 * That is below WCAG AA for small text, which is why the editor *reports* this
 * range rather than silently accepting it. Refusing it would mean refusing a
 * whole band of perfectly reasonable brand colours, including mid-greys; the
 * honest move is to let an admin see the number and decide.
 */
export const LABEL_FLOOR = (() => {
  const ink = luminance(BUTTON_INK)
  const crossing = Math.sqrt((1 + 0.05) * (ink + 0.05)) - 0.05
  return (crossing + 0.05) / (ink + 0.05)
})()

/** AA for small text. Above this, a label is comfortable. */
export const LABEL_COMFORT = 4.5

/** WCAG's large-text threshold, the point at which a label becomes a problem. */
export const LABEL_MINIMUM = 3

/**
 * A hover state has to look like a different colour, not a nearby one.
 *
 * Measured as a perceptual distance on a 0-100 scale rather than as a contrast
 * ratio, because a contrast ratio only looks at lightness. The brand's own
 * dark-mode hover - gold to bone - scores 1.6:1 while reading as an obviously
 * different button, since the two differ far more in colour than in brightness.
 * Ten percent of the Oklab range is a change nobody could miss; the derivation
 * is checked never to go below it.
 */
export const FLIP_MIN_DISTANCE = 10

export function toRgb(hex: string): Rgb {
  const value = hex.replace('#', '')
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

function toHex([r, g, b]: Rgb): string {
  const part = (channel: number) =>
    Math.min(255, Math.max(0, Math.round(channel)))
      .toString(16)
      .padStart(2, '0')
  return `#${part(r)}${part(g)}${part(b)}`
}

/** Linear blend. `t` of 0 returns `a`, 1 returns `b`. */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = toRgb(a)
  const [br, bg, bb] = toRgb(b)
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t])
}

function toLinear(channel: number): number {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/** WCAG contrast ratio. Used by the live readout in the design editor. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] =
    luminance(a) > luminance(b) ? [luminance(a), luminance(b)] : [luminance(b), luminance(a)]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * Oklab coordinates. Perceptually uniform, so a straight-line distance in this
 * space is close to how different two colours actually look.
 */
function oklab(hex: string): Rgb {
  const [r, g, b] = toRgb(hex).map(toLinear) as Rgb

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

/**
 * How different two colours look, from 0 (identical) to about 100 (black
 * against white).
 *
 * Reported to the admin instead of a contrast ratio for anything that is not
 * text, because contrast answers "can I read this?" and this answers "is this
 * actually a different colour?".
 */
export function colourDistance(a: string, b: string): number {
  const [l1, a1, b1] = oklab(a)
  const [l2, a2, b2] = oklab(b)
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2) * 100
}

function toHsl(hex: string): [number, number, number] {
  const [r, g, b] = (toRgb(hex).map((channel) => channel / 255) as Rgb)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const delta = max - min

  if (delta === 0) return [0, 0, l]

  const s = delta / (1 - Math.abs(2 * l - 1))
  let h: number
  if (max === r) h = ((g - b) / delta) % 6
  else if (max === g) h = (b - r) / delta + 2
  else h = (r - g) / delta + 4

  h *= 60
  if (h < 0) h += 360
  return [h, s, l]
}

function fromHsl(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = (((h % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))

  let rgb: Rgb
  if (hp < 1) rgb = [c, x, 0]
  else if (hp < 2) rgb = [x, c, 0]
  else if (hp < 3) rgb = [0, c, x]
  else if (hp < 4) rgb = [0, x, c]
  else if (hp < 5) rgb = [x, 0, c]
  else rgb = [c, 0, x]

  const m = l - c / 2
  return toHex([(rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255])
}

/** Keeps the hue, replaces lightness, optionally scales saturation. */
export function setLightness(hex: string, lightness: number, saturationScale = 1): string {
  const [h, s] = toHsl(hex)
  const scaled = Math.min(1, Math.max(0, s * saturationScale))
  return fromHsl(h, scaled, Math.min(1, Math.max(0, lightness)))
}

/* -------------------------------------------------------------------------- */
/*  Derivation                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * How far each derived token is pushed from the surface it sits on.
 *
 * Tuned against the brand palette: white and charcoal surfaces with a
 * mid-lightness gold produce the values the studio already ships.
 */
const RATIOS = {
  light: { muted: 0.035, border: 0.1, mutedForeground: 0.37 },
  dark: { muted: 0.03, border: 0.085, mutedForeground: 0.37 },
} as const

/**
 * Where the accent sits when it is used as a fill or an outline in each mode.
 *
 * Light keeps the accent exactly as chosen, because it sits on a light page.
 * Dark lifts it to the brand's own dark-gold lightness, because a mid-lightness
 * gold on near-black loses the warmth it has on white.
 *
 * The outline is the deep step from the ramp - the same value as `gold-700` in
 * light mode - because a mid-lightness gold on white only reaches about 2.2:1
 * and a focus ring has to be seen.
 */
const ACCENT_LIGHTNESS = { dark: 0.585, darkScale: 1.1, ring: 0.286, ringScale: 1.23 } as const

/**
 * The label colour for a filled element.
 *
 * Chosen by contrast rather than hard-coded, so an admin can pick a dark brand
 * colour - a crimson or a violet - without the label disappearing into it. For
 * the brand gold this resolves to the studio's own near-black ink.
 */
function labelFor(fill: string): string {
  return contrastRatio(BUTTON_INK, fill) >= contrastRatio(WHITE, fill) ? BUTTON_INK : WHITE
}

/**
 * The hover state for a filled button.
 *
 * Normally the fill flips to the mode's own pole - ink on a light page, bone on
 * a dark one - which is the studio's own behaviour and reads as a deliberate
 * change rather than a shade of the same colour.
 *
 * A lifted cyan on near-black is close enough to bone that the flip would be
 * invisible, so in that case it flips the other way instead. Between the two
 * poles, one of them is always far enough away, so the hover is never a
 * non-event.
 */
function hoverPair(
  primary: string,
  foreground: string,
  surface: string,
  accent: string,
  isLightText: boolean,
): { fill: string; label: string } {
  if (colourDistance(primary, foreground) >= FLIP_MIN_DISTANCE) {
    return {
      fill: foreground,
      // A warm tint of the brand colour, as on the studio's own buttons.
      label: isLightText ? surface : mix(accent, WHITE, 0.72),
    }
  }

  const other = isLightText ? INK_DEEP : INK_LIGHT
  return { fill: other, label: labelFor(other) }
}

function deriveMode(
  background: string,
  surface: string,
  accent: string,
  ratios: { muted: number; border: number; mutedForeground: number },
  isDark: boolean,
): ModePalette {
  // Whichever pole reads better on this background, rather than assuming the
  // mode: an admin is free to set a light "dark" background, and the text has
  // to stay legible when they do.
  const foreground =
    contrastRatio(INK_DEEP, background) >= contrastRatio(INK_LIGHT, background)
      ? INK_DEEP
      : INK_LIGHT
  const isLightText = foreground === INK_LIGHT

  const primary = isDark
    ? setLightness(accent, ACCENT_LIGHTNESS.dark, ACCENT_LIGHTNESS.darkScale)
    : accent
  const hover = hoverPair(primary, foreground, surface, accent, isLightText)

  return {
    background,
    foreground,
    card: surface,
    muted: mix(surface, foreground, ratios.muted),
    mutedForeground: mix(foreground, background, ratios.mutedForeground),
    border: mix(surface, foreground, ratios.border),
    primary,
    primaryForeground: labelFor(primary),
    primaryHover: hover.fill,
    primaryHoverForeground: hover.label,
    secondary: foreground,
    secondaryForeground: isLightText ? surface : WHITE,
    secondaryHover: mix(foreground, background, 0.08),
    // The focus outline has to be visible on the page it sits on, which a
    // mid-lightness gold is not on white.
    ring: isDark ? primary : setLightness(accent, ACCENT_LIGHTNESS.ring, ACCENT_LIGHTNESS.ringScale),
  }
}

export function derivePalette(design: SiteDesign): Palette {
  return {
    light: deriveMode(
      design.lightBackground,
      design.lightSurface,
      design.accent,
      RATIOS.light,
      false,
    ),
    dark: deriveMode(design.darkBackground, design.darkSurface, design.accent, RATIOS.dark, true),
  }
}

export interface AccentMetrics {
  /** Contrast ratios: text legibility. */
  lightLabel: number
  darkLabel: number
  /** Perceptual distances: whether the hover reads as a different colour. */
  lightFlip: number
  darkFlip: number
}

/**
 * The four numbers that matter for a chosen accent, for the editor's live
 * readout. Nothing here needs to be refused: `labelFor` and `hoverPair` already
 * pick the legible option for whatever accent arrives, so the readout is
 * reassurance rather than a gate.
 */
export function accentMetrics(design: SiteDesign): AccentMetrics {
  const palette = derivePalette(design)
  return {
    lightLabel: contrastRatio(palette.light.primary, palette.light.primaryForeground),
    darkLabel: contrastRatio(palette.dark.primary, palette.dark.primaryForeground),
    lightFlip: colourDistance(palette.light.primary, palette.light.primaryHover),
    darkFlip: colourDistance(palette.dark.primary, palette.dark.primaryHover),
  }
}

/** Re-exported so the editor can render the same poles the derivation uses. */
export const POLES = {
  deep: INK_DEEP,
  light: INK_LIGHT,
  buttonInk: BUTTON_INK,
  white: WHITE,
  black: BLACK,
}

/* -------------------------------------------------------------------------- */
/*  CSS custom properties                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The accent ramp's lightness and saturation profile, read off the brand's own
 * ramp.
 *
 * The steps are generated from the chosen accent's hue at these fixed
 * lightnesses, which is what makes one accent colour reach everything: the
 * components that fill, stroke and tint with `gold-*` follow the accent, not
 * just the ones that use `--primary`.
 *
 * Lightness is fixed rather than offset from the accent, deliberately: an offset
 * ramp built from a dark accent ends up with a mid-tone where the pale `gold-50`
 * tint should be, and every pill and wash on the site would lose its contrast.
 *
 * The scale column exists because the hand-tuned brand ramp is not a single
 * saturation: it runs 72% at the accent and 89% in the deep steps, because deep
 * shades of a warm colour read as muddy at their own saturation. Keeping that
 * profile means the default design reproduces `globals.css` exactly - to within
 * a rounding step per channel - while a new accent still gets the same shape.
 * The self-check asserts both.
 */
const RAMP_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const
const RAMP_LIGHTNESS = [0.963, 0.898, 0.8, 0.678, 0.578, 0.51, 0.382, 0.286, 0.224, 0.155] as const
const RAMP_SATURATION_SCALE = [1.025, 1.145, 1.135, 1.125, 1.105, 1, 1.215, 1.23, 1.18, 1.19] as const

/** The step lifted in dark mode so accent text stays legible on near-black. */
const LIFTED_STEP = 700
/** Lifted to the value of gold-400, the brand's own dark-mode accent. */
const LIFT_TO_INDEX = RAMP_STEPS.indexOf(400)

export function goldRamp(accent: string, dark: boolean): Record<string, string> {
  const ramp: Record<string, string> = {}
  RAMP_STEPS.forEach((step, index) => {
    const lifted = dark && step === LIFTED_STEP
    const at = lifted ? LIFT_TO_INDEX : index
    ramp[`--color-gold-${step}`] = setLightness(
      accent,
      RAMP_LIGHTNESS[at],
      RAMP_SATURATION_SCALE[at],
    )
  })
  return ramp
}

/**
 * Everything one mode owns, as CSS custom properties.
 *
 * This is the single mapping used by both the stylesheet the site loads and the
 * live preview an admin watches while choosing, so the preview cannot drift
 * from the result.
 *
 * Note what is *absent*: the emerald accent, the destructive and success
 * colours, the neutral `ink-*` ramp and the elevation shadows keep their values
 * from `globals.css`. A design change therefore cannot quietly alter the parts
 * of the system that were never exposed.
 */
export function modeVars(design: SiteDesign, mode: 'light' | 'dark'): Record<string, string> {
  const values = derivePalette(design)[mode]

  return {
    '--background': values.background,
    '--foreground': values.foreground,
    '--card': values.card,
    '--card-foreground': values.foreground,
    '--popover': values.card,
    '--popover-foreground': values.foreground,
    '--muted': values.muted,
    '--muted-foreground': values.mutedForeground,
    '--accent': values.muted,
    '--accent-foreground': values.foreground,
    '--border': values.border,
    '--input': values.border,
    '--primary': values.primary,
    '--primary-foreground': values.primaryForeground,
    '--primary-hover': values.primaryHover,
    '--primary-hover-foreground': values.primaryHoverForeground,
    '--secondary': values.secondary,
    '--secondary-foreground': values.secondaryForeground,
    '--secondary-hover': values.secondaryHover,
    '--ring': values.ring,
    ...goldRamp(design.accent, mode === 'dark'),
  }
}

/** A readable starting accent for a fresh install. */
export const SUGGESTED_ACCENT = DEFAULT_DESIGN.accent
