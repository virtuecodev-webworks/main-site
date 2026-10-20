// Self-check for src/lib/design/*.
//
// Asserts the three things that are easy to get wrong and hard to notice:
//   1. The default design reproduces the brand's own palette, so switching the
//      site over to the design engine does not silently restyle it.
//   2. The derivation stays legible for any accent an admin might choose, and
//      explains the ones it cannot make work.
//   3. Everything the stylesheet interpolates is a validated value.
//
// Run with: npm run verify:design
//
// The compiled design modules are a hard dependency, so the script takes the
// directory they were written to as its only argument.

import path from 'node:path'
import { createRequire } from 'node:module'

// The design modules are compiled to CommonJS so this script can load them
// without a bundler; `createRequire` is how ESM reaches them.
const require = createRequire(import.meta.url)

if (!process.argv[2]) {
  console.error('Pass the directory the compiled design modules were written to.')
  process.exit(1)
}

const OUT = path.resolve(process.argv[2])
const D = (name) => require(path.join(OUT, name))

const tokens = D('tokens.js')
const palette = D('palette.js')
const css = D('css.js')
const fonts = D('fonts.js')

let pass = 0
const failures = []

function check(label, condition, detail = '') {
  if (condition) {
    pass += 1
    console.log(`  ok   ${label}${detail ? `  (${detail})` : ''}`)
  } else {
    failures.push(`${label}${detail ? `  (${detail})` : ''}`)
    console.log(`  FAIL ${label}${detail ? `  (${detail})` : ''}`)
  }
}

const rgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]

function delta(actual, expected) {
  const a = rgb(actual)
  const e = rgb(expected)
  return Math.max(...a.map((v, i) => Math.abs(v - e[i])))
}

function nearCheck(label, actual, expected, tolerance) {
  const d = delta(actual, expected)
  check(label, d <= tolerance, `${actual} vs ${expected}, delta ${d}`)
}

const design = tokens.DEFAULT_DESIGN
const p = palette.derivePalette(design)
const ratio = palette.contrastRatio

console.log('\n-- exact structural tokens')
check('light background is the brand white', p.light.background === '#ffffff', p.light.background)
check('light surface is the brand white', p.light.card === '#ffffff', p.light.card)
check('dark background is the brand near-black', p.dark.background === '#0c0c0d', p.dark.background)
check('dark surface is the brand card', p.dark.card === '#141416', p.dark.card)
check('light ink is the brand near-black', p.light.foreground === '#141414', p.light.foreground)
check('dark ink is the brand bone', p.dark.foreground === '#f2f2f3', p.dark.foreground)
check('light button label is the brand ink', p.light.primaryForeground === '#191308', p.light.primaryForeground)
check('light primary is the accent, untouched', p.light.primary === design.accent, p.light.primary)
check('light hover flips to ink', p.light.primaryHover === '#141414', p.light.primaryHover)
check('dark hover flips to bone', p.dark.primaryHover === '#f2f2f3', p.dark.primaryHover)
check('dark hover label is the dark surface', p.dark.primaryHoverForeground === '#141416', p.dark.primaryHoverForeground)

console.log('\n-- derived tokens approximate the shipped palette')
// These are derived from four inputs rather than stored, so they are close to
// the hand-tuned values rather than identical. 14/255 is under 6% per channel.
nearCheck('light muted', p.light.muted, '#f6f6f7', 14)
nearCheck('light border', p.light.border, '#e7e7ea', 14)
nearCheck('light muted foreground', p.light.mutedForeground, '#6b6b70', 14)
nearCheck('light secondary hover', p.light.secondaryHover, '#26262b', 14)
nearCheck('dark muted', p.dark.muted, '#1a1a1d', 14)
nearCheck('dark border', p.dark.border, '#26262b', 14)
nearCheck('dark muted foreground', p.dark.mutedForeground, '#a0a0a8', 14)
nearCheck('dark secondary hover', p.dark.secondaryHover, '#e3e3e6', 14)
nearCheck('dark primary is the lifted accent', p.dark.primary, '#e6bb44', 10)
nearCheck('light ring is the deep accent', p.light.ring, '#8a6608', 14)
check('lifted accent is lighter than the chosen one', palette.luminance(p.dark.primary) > palette.luminance(design.accent))

console.log('\n-- the generated ramp reproduces the hand-tuned brand ramp')
// These are the values in `src/app/globals.css`, which are what the site shipped
// before the design engine existed. Reproducing them is what makes switching the
// site over to the engine a no-op at the default settings.
const BRAND_RAMP = {
  50: '#fdf9ee',
  100: '#faf0d0',
  200: '#f4e1a4',
  300: '#edcd6d',
  400: '#e8bb3f',
  500: '#dcaa28',
  600: '#b8860b',
  700: '#8a6608',
  800: '#68500a',
  900: '#483807',
}
const generated = palette.goldRamp(design.accent, false)
let worstStep = 0
for (const [step, expected] of Object.entries(BRAND_RAMP)) {
  const delta = Math.abs(
    rgb(generated[`--color-gold-${step}`]).reduce((worst, channel, index) => {
      return Math.max(worst, Math.abs(channel - rgb(expected)[index]))
    }, 0),
  )
  worstStep = Math.max(worstStep, delta)
  nearCheck(`gold-${step}`, generated[`--color-gold-${step}`], expected, 3)
}
check(
  'the whole ramp is within a rounding step per channel',
  worstStep <= 3,
  `worst ${worstStep}/255 (${((worstStep / 255) * 100).toFixed(1)}%)`,
)
check('the ramp keeps the brand hue throughout', (() => {
  const hue = (hex) => {
    const [r0, g0, b0] = rgb(hex)
    const [r, g, b] = [r0 / 255, g0 / 255, b0 / 255]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    if (d === 0) return 0
    let h
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    return h < 0 ? h + 360 : h
  }
  const hues = Object.values(generated).map(hue)
  const accentHue = hue(design.accent)
  // Tolerance, not equality: at the pale end the channels are nearly equal, so a
  // single step of rounding moves the measured hue by a few degrees. The ramp is
  // one hue; that is what this proves.
  return hues.every((value) => Math.abs(value - accentHue) < 5)
})(), 'one hue')
check('the ramp gets darker as it descends', Object.keys(BRAND_RAMP).map((step) => palette.luminance(generated[`--color-gold-${step}`])).every((value, index, all) => index === 0 || value < all[index - 1]))

console.log('\n-- contrast at the default accent')
const PAIRS = [
  ['button label on light gold', p.light.primary, p.light.primaryForeground, 4.5],
  ['button label on dark gold', p.dark.primary, p.dark.primaryForeground, 4.5],
  ['light body text on page', p.light.foreground, p.light.background, 12],
  ['dark body text on page', p.dark.foreground, p.dark.background, 12],
  ['light body text on card', p.light.foreground, p.light.card, 12],
  ['dark body text on card', p.dark.foreground, p.dark.card, 12],
  ['light muted text on page', p.light.mutedForeground, p.light.background, 4.5],
  ['dark muted text on page', p.dark.mutedForeground, p.dark.background, 4.5],
  ['light muted text on card', p.light.mutedForeground, p.light.card, 4.5],
  ['dark muted text on card', p.dark.mutedForeground, p.dark.card, 4.5],
  ['light focus ring on page', p.light.ring, p.light.background, 3],
  ['dark focus ring on page', p.dark.ring, p.dark.background, 3],
  ['hover label on hover fill, light', p.light.primaryHoverForeground, p.light.primaryHover, 4.5],
  ['hover label on hover fill, dark', p.dark.primaryHoverForeground, p.dark.primaryHover, 4.5],
  ['secondary label, light', p.light.secondaryForeground, p.light.secondary, 4.5],
  ['secondary label, dark', p.dark.secondaryForeground, p.dark.secondary, 4.5],
  ['border on card, light', p.light.border, p.light.card, 1],
  ['border on card, dark', p.dark.border, p.dark.card, 1],
]
for (const [label, a, b, min] of PAIRS) {
  check(label, ratio(a, b) >= min, `${ratio(a, b).toFixed(2)}:1`)
}

console.log('\n-- every accent an admin can pick gets a legible label and a visible flip')
// The label floor is a mathematical limit rather than a target, so the margin
// is float noise, not slack.
const EPSILON = 0.005
const ACCENTS = [
  ['teal', '#0d9488'],
  ['crimson', '#b91c1c'],
  ['violet', '#7c3aed'],
  ['ink blue', '#1d4ed8'],
  ['rose', '#e11d48'],
  ['deep green', '#14532d'],
  ['pale sand', '#e8d9a0'],
  ['soft lilac', '#c4b5fd'],
  ['near black', '#1c1c1c'],
  ['mid grey', '#7a7a7a'],
  ['near white', '#f7f7f7'],
]
for (const [name, accent] of ACCENTS) {
  const m = palette.accentMetrics({ ...design, accent })
  check(
    `accent ${name}`,
    m.lightLabel >= palette.LABEL_FLOOR - EPSILON &&
      m.darkLabel >= palette.LABEL_FLOOR - EPSILON &&
      m.lightFlip >= palette.FLIP_MIN_DISTANCE &&
      m.darkFlip >= palette.FLIP_MIN_DISTANCE,
    `labels ${m.lightLabel.toFixed(2)}/${m.darkLabel.toFixed(2)}, flips ${m.lightFlip.toFixed(1)}/${m.darkFlip.toFixed(1)}`,
  )
}

function hslToHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = (((h % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let rgb
  if (hp < 1) rgb = [c, x, 0]
  else if (hp < 2) rgb = [x, c, 0]
  else if (hp < 3) rgb = [0, c, x]
  else if (hp < 4) rgb = [0, x, c]
  else if (hp < 5) rgb = [x, 0, c]
  else rgb = [c, 0, x]
  const m = l - c / 2
  const part = (v) =>
    Math.min(255, Math.max(0, Math.round((v + m) * 255)))
      .toString(16)
      .padStart(2, '0')
  return `#${part(rgb[0])}${part(rgb[1])}${part(rgb[2])}`
}

// The whole hue circle crossed with plausible saturations and lightnesses. This
// is the assertion that makes "any accent works" a fact rather than a claim.
let worstLabel = Infinity
let worstFlip = Infinity
let swept = 0
let worstAccent = ''
for (let hue = 0; hue < 360; hue += 10) {
  for (const saturation of [0, 0.2, 0.5, 0.8, 1]) {
    for (const lightness of [0.12, 0.25, 0.4, 0.55, 0.7, 0.85, 0.96]) {
      const accent = hslToHex(hue, saturation, lightness)
      const m = palette.accentMetrics({ ...design, accent })
      swept += 1
      const label = Math.min(m.lightLabel, m.darkLabel)
      const flip = Math.min(m.lightFlip, m.darkFlip)
      if (label < worstLabel) {
        worstLabel = label
        worstAccent = accent
      }
      worstFlip = Math.min(worstFlip, flip)
    }
  }
}
check(
  `all ${swept} swept accents keep their label legible`,
  worstLabel >= palette.LABEL_FLOOR - EPSILON,
  `worst ${worstLabel.toFixed(3)}:1 at ${worstAccent}, computed floor ${palette.LABEL_FLOOR.toFixed(3)}`,
)
check(`all ${swept} swept accents keep a visible flip`, worstFlip >= palette.FLIP_MIN_DISTANCE, `worst ${worstFlip.toFixed(1)}%, floor ${palette.FLIP_MIN_DISTANCE}%`)
check('the brand accent sits well clear of both floors', (() => {
  const m = palette.accentMetrics(design)
  return m.lightLabel > 8 && m.darkLabel > 8
})())

console.log('\n-- a light "dark" surface self-corrects its text colour')
const inverted = palette.derivePalette({ ...design, darkBackground: '#f7f7f5', darkSurface: '#ffffff' })
check(
  'a light dark-mode background gets dark text',
  ratio(inverted.dark.foreground, inverted.dark.background) >= 12,
  `${inverted.dark.foreground} on ${inverted.dark.background} = ${ratio(inverted.dark.foreground, inverted.dark.background).toFixed(2)}`,
)

console.log('\n-- generated stylesheet')
const sheet = css.designCss(design)

function parse(block) {
  return Object.fromEntries(
    block
      .split(';')
      .filter(Boolean)
      .map((declaration) => {
        const at = declaration.indexOf(':')
        return [declaration.slice(0, at), declaration.slice(at + 1)]
      }),
  )
}
const lightMatch = sheet.match(/html:root\{([^}]*)\}/)
const darkMatch = sheet.match(/html\.dark\{([^}]*)\}/)
check('has a light block', Boolean(lightMatch))
check('has a dark block', Boolean(darkMatch))
const lightVars = parse(lightMatch[1])
const darkVars = parse(darkMatch[1])

check('light primary is the accent', lightVars['--primary'] === '#dcaa28', lightVars['--primary'])
check('dark primary is lifted off the accent', darkVars['--primary'] !== lightVars['--primary'], `${darkVars['--primary']} vs ${lightVars['--primary']}`)
check('radius is emitted', lightVars['--radius'] === '12px', lightVars['--radius'])
check('body font resolves to the bundled face', lightVars['--font-sans'].startsWith('var(--font-questrial)'), lightVars['--font-sans'].slice(0, 40))
check('display font resolves to the bundled face', lightVars['--font-display'].startsWith('var(--font-questrial)'), lightVars['--font-display'].slice(0, 40))
check('dark block carries no font or radius', !('--font-sans' in darkVars) && !('--radius' in darkVars))
check('ramp step 500 equals the accent', lightVars['--color-gold-500'] === '#dcaa28', lightVars['--color-gold-500'])
check('the ramp is emitted for both modes', Object.keys(lightVars).filter((k) => k.startsWith('--color-gold-')).length === 10 && Object.keys(darkVars).filter((k) => k.startsWith('--color-gold-')).length === 10, '10 steps each')
check('accent text is lifted in dark mode', darkVars['--color-gold-700'] === darkVars['--color-gold-400'], `${darkVars['--color-gold-700']}`)
check('every declaration is a hex or a quoted family', Object.entries(lightVars).every(([, v]) => /^#[0-9a-f]{6}$/i.test(v) || /^\d+px$/.test(v) || /^var\(|^'/.test(v)), 'validated values only')
check('no glow: no shadow, filter or gradient anywhere', !/box-shadow|filter:|gradient/.test(sheet))
check('no brightness hack', !/brightness/.test(sheet))

const tealSheet = css.designCss({ ...design, accent: '#0d9488' })
const tealLight = parse(tealSheet.match(/html:root\{([^}]*)\}/)[1])
check('the ramp follows a different accent', tealLight['--color-gold-500'] !== '#dcaa28', tealLight['--color-gold-500'])
check('the ramp keeps the new hue saturated', Number.parseInt(tealLight['--color-gold-500'].slice(5, 7), 16) > Number.parseInt(tealLight['--color-gold-500'].slice(1, 3), 16), tealLight['--color-gold-500'])

console.log('\n-- font plumbing')
check('no google link when only brand faces are used', fonts.googleFontHref(tokens.usedFonts(design)) === null)
const href = fonts.googleFontHref([
  { family: 'Playfair Display', weights: ['700'] },
  { family: 'Source Sans 3', weights: ['400', '700'] },
])
check('the href encodes every family and weight', href.includes('family=Playfair+Display:wght@700') && href.includes('family=Source+Sans+3:wght@400;700'), href)
check('unknown families are dropped rather than requested', fonts.googleFontHref([{ family: 'Not A Real Face', weights: ['400'] }]) === null)
check('weights are filtered to what a family serves', JSON.stringify(fonts.requestableWeights('Lato')) === JSON.stringify(['400', '700']), JSON.stringify(fonts.requestableWeights('Lato')))
check('a single-weight family requests one weight', JSON.stringify(fonts.requestableWeights('Bebas Neue')) === JSON.stringify(['400']), JSON.stringify(fonts.requestableWeights('Bebas Neue')))
check('every catalogue family has at least one usable weight', fonts.GOOGLE_FONTS.every((f) => f.weights.length > 0))
check('every catalogue family name is valid css', fonts.GOOGLE_FONTS.every((f) => tokens.isFamilyName(f.family)))
check('catalogue families are unique', new Set(fonts.GOOGLE_FONTS.map((f) => f.family)).size === fonts.GOOGLE_FONTS.length)
check('questrial becomes the bundled variable before the CDN', tokens.familyRef('Questrial') === 'var(--font-questrial)')
check('a chosen google font becomes a quoted family', tokens.familyRef('Playfair Display') === "'Playfair Display'")

const uploadDesign = {
  ...design,
  fontDisplay: 'Studio Sans',
  fonts: [{ family: 'Studio Sans', kind: 'upload', path: 'fonts/studio-sans.woff2', weights: ['400', '700'] }],
}
const faces = css.fontFaceCss(uploadDesign, (value) => `https://cdn.example.com/${value}`)
check('an uploaded face emits both weights', faces.split('@font-face').length === 3, 'two rules')
check('the uploaded face uses the resolved url', faces.includes("url('https://cdn.example.com/fonts/studio-sans.woff2')"))
check('the uploaded face declares woff2', faces.includes("format('woff2')"))
check('an unresolvable upload emits nothing', css.fontFaceCss(uploadDesign, () => null) === '')
check('brand faces emit no @font-face', css.fontFaceCss(design, () => 'x') === '')
check('the google and upload paths do not overlap', fonts.googleFontsInUse(uploadDesign).length === 0 && fonts.uploadedFontsInUse(uploadDesign).length === 1)

console.log('\n-- normalisation refuses junk')
const junk = tokens.normalizeDesign({
  accent: 'red; background:url(x)',
  lightBackground: '#FFF',
  darkBackground: '#0c0c0d',
  radius: 999,
  fontBody: "Evil'; }",
  fonts: [
    { family: 'ok face', kind: 'google' },
    { family: "bad'name", kind: 'google' },
    { family: 'x', kind: 'nope' },
    'nonsense',
  ],
})
check('a malformed accent falls back', junk.accent === tokens.DEFAULT_DESIGN.accent, junk.accent)
check('a short hex falls back', junk.lightBackground === tokens.DEFAULT_DESIGN.lightBackground, junk.lightBackground)
check('the radius is clamped', junk.radius === 32, String(junk.radius))
check('a quoted family falls back', junk.fontBody === tokens.DEFAULT_DESIGN.fontBody, junk.fontBody)
check('only the valid font row survives', junk.fonts.length === 1 && junk.fonts[0].family === 'ok face', JSON.stringify(junk.fonts))
check('a null row yields the defaults', tokens.normalizeDesign(null) === tokens.DEFAULT_DESIGN)
check('an undefined row yields the defaults', tokens.normalizeDesign(undefined) === tokens.DEFAULT_DESIGN)
check('a path traversal is refused', !tokens.isStoragePath('../secret.woff2'))
check('an absolute path is refused', !tokens.isStoragePath('/etc/passwd'))
check('an ordinary path is accepted', tokens.isStoragePath('2026/studio-sans.woff2'))
check('the brand faces cannot be installed twice', tokens.normalizeDesign({ ...design, fonts: [{ family: 'Questrial', kind: 'google' }] }).fonts.length === 0)

console.log(`\n${pass} passed, ${failures.length} failed`)
if (failures.length) {
  console.log('\nfailures:')
  for (const failure of failures) console.log(`  - ${failure}`)
  process.exitCode = 1
}
