# `public/fonts` — self-hosted type

## `gropled-bold.otf`

**Gropled** is the brand display face: headings (`h1`–`h4`), the wordmark, the hero
statistics, the social card and the preloader film all use it.

|                   |                                                                        |
| ----------------- | ---------------------------------------------------------------------- |
| Family / style    | Gropled Bold                                                           |
| Version           | 1.003 (Fontself Maker 3.5.6)                                           |
| Weight            | 700 — **a single weight. No italic, no variable axes.**                |
| Size              | 80 KB (OTF / CFF outlines)                                             |
| Coverage          | Latin and Cyrillic complete. **No Arabic, no Greek.**                  |
| Also absent       | `<` `[` `]` `_` `>` `~` `^` `` ` `` — the ellipsis, arrows, `™` `×` `÷` `±` `¶`, `ß` `œ` `¿`, `₦` `₹` |

### One weight, and what follows from it

There is no lighter cut, so every display element is pinned to `font-weight: 700`
and a request for anything else would be a request the font cannot satisfy. The
wordmark's ampersand is therefore an **upright gold glyph**: a synthesised slant on
a geometric face reads as a mistake, so size and colour carry the accent instead of
lean.

### Missing glyphs are handled, not discovered

Anything Gropled cannot draw falls through the stack — **Inter** first, so a stray
`<` or `¿` in a headline is drawn in the site's own body face rather than whatever
the browser defaults to, then the generic system families. Arabic, which neither
face carries, resolves to a system Arabic face as intended. The fallback chain
lives in the `localFont` config in `src/app/[locale]/layout.tsx`, with
`adjustFontFallback` off so its generated face cannot outrank Inter.

Run `display-font-audit.mjs` (in the scratch directory) against a build to list
every display-font glyph the face cannot draw.

### Provenance

Downloaded from [themeui.net](https://themeui.net/gropled-free-display-font/), which
distributes it as a free display font by **Daniyar Shape**. The download contained
the OTF alone — **no licence file was included**. Confirm the licence terms at the
source before relying on it commercially.

Everything in the table above was read from the font's own `name`, `OS/2` and `cmap`
tables rather than from the distributor's description.
