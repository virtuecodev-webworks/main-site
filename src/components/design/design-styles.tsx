import { designCss, fontFaceCss } from '@/lib/design/css'
import { googleFontHref, googleFontsInUse } from '@/lib/design/fonts'
import { FONTS_BUCKET, type SiteDesign } from '@/lib/design/tokens'
import { publicStorageUrl } from '@/lib/supabase/env'

/**
 * The design's contribution to `<head>`.
 *
 * Rendered as the first child of `<body>` rather than through the Metadata API,
 * because a metadata call is a string of declarations whereas this is the whole
 * token set plus, sometimes, a third-party stylesheet.
 *
 * Placement is not a problem for the cascade: the rules are unlayered and use
 * `html:root` / `html.dark`, so they outrank the `@theme` tokens in
 * `globals.css` without depending on which stylesheet the document lists first.
 * Being the first thing in `<body>` also means they are parsed before anything
 * they style, so there is no flash of the old design.
 *
 * `precedence` is what lets React hoist the font stylesheet into `<head>` and
 * deduplicate it, rather than leaving a render-blocking link in the middle of
 * the document.
 *
 * Both `designCss` and `fontFaceCss` interpolate only values that have already
 * been validated - six-digit hex colours and family names matching
 * `[A-Za-z0-9][A-Za-z0-9 -]*` - so nothing here can carry a `url(...)`, a
 * closing brace or a semicolon out of the database and into the stylesheet.
 */
export function DesignStyles({ design }: { design: SiteDesign }) {
  const stylesheet = googleFontHref(googleFontsInUse(design))
  const faces = fontFaceCss(design, (path) => publicStorageUrl(FONTS_BUCKET, path))

  return (
    <>
      <style id="vcw-design" dangerouslySetInnerHTML={{ __html: designCss(design) }} />
      {faces ? (
        <style id="vcw-design-fonts" dangerouslySetInnerHTML={{ __html: faces }} />
      ) : null}
      {stylesheet ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={stylesheet} precedence="vcw-fonts" />
        </>
      ) : null}
    </>
  )
}
