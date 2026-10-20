/**
 * Turns a design into the stylesheet the site actually loads.
 *
 * Pure: no environment, no database. The caller supplies a resolver for storage
 * URLs, which keeps this module importable from a browser bundle and keeps
 * `process.env` out of the client graph. The live preview in the admin editor
 * uses the same `modeVars` mapping, so what is previewed is what ships.
 */

import { bodyFontStack, displayFontStack, type SiteDesign } from './tokens'
import { modeVars } from './palette'
import { fontFormat, uploadedFontsInUse } from './fonts'

/** The tokens that do not change between light and dark. */
export function sharedVars(design: SiteDesign): Record<string, string> {
  return {
    '--radius': `${design.radius}px`,
    '--font-sans': bodyFontStack(design),
    '--font-display': displayFontStack(design),
  }
}

function declare(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(';')
}

/**
 * The full stylesheet.
 *
 * `html:root` and `html.dark` are used rather than the plain `:root` / `.dark`
 * that `globals.css` declares. Both carry one extra point of specificity, so the
 * override wins outright instead of depending on which stylesheet the document
 * happens to list first - something React does not promise once a second
 * `<style>` is in the page.
 */
export function designCss(design: SiteDesign): string {
  const shared = declare(sharedVars(design))
  return [
    `html:root{${declare(modeVars(design, 'light'))};${shared}}`,
    `html.dark{${declare(modeVars(design, 'dark'))}}`,
  ].join('')
}

/**
 * `@font-face` rules for custom uploads.
 *
 * Two weights are declared from the same file so the browser does not synthesise
 * a bold face for headings. A variable font serves both properly; a static one
 * simply renders at its own weight.
 */
export function fontFaceCss(
  design: SiteDesign,
  resolve: (path: string) => string | null,
): string {
  const rules: string[] = []

  for (const font of uploadedFontsInUse(design)) {
    if (!font.path) continue
    const url = resolve(font.path)
    if (!url) continue

    for (const weight of ['400', '700']) {
      rules.push(
        `@font-face{font-family:'${font.family}';src:url('${url}') format('${fontFormat(font.path)}');font-weight:${weight};font-style:normal;font-display:swap}`,
      )
    }
  }

  return rules.join('')
}
