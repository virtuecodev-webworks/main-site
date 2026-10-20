# `public/media` — drop your assets here

Files in this folder are served from the site root, and everything under
`/media/*` is sent with `Cache-Control: public, max-age=31536000, immutable`
(see `next.config.ts`), so **never overwrite a file without changing its name**.

## Expected files

| File                 | Used by                         | Notes                                                            |
| -------------------- | ------------------------------- | ---------------------------------------------------------------- |
| `brand-intro-v2.mp4` | `BrandLoader` (first-load veil) | The logo motion — **this _is_ the preloader**. 1920×1080, H.264. Versioned per the immutable-cache rule above. |
| `photos/*.jpg`       | Hero, about, blog, case studies | Real photography, committed locally so nothing is hot-linked.     |
| `projects/*.svg`     | `PLACEHOLDER_PROJECTS` covers   | Demo cover art shown when Supabase is not configured.             |
| `avatars/*.svg`      | `Testimonials`                  | Monogram avatars for the sample testimonials.                     |

`brand-intro-v2.mp4` is **optional**: `BrandLoader` falls back to the animated
vector mark if it is missing, so a fresh clone renders correctly with no media at
all. The `photos/` set is referenced by `src/lib/photos.ts` — swap a file and
keep the name, or update the manifest.

## Rendering the assets

The intro is produced from the Remotion composition in `src/remotion`:

```bash
# the logo motion used by the preloader
# Bump the version in the file name AND in BrandLoader's VIDEO_SRC whenever the
# film changes — /media/* is cached immutably, so an in-place overwrite would
# leave returning visitors watching the old film.
npm run remotion:render
copy out\virtue-logo-intro.mp4 public\media\brand-intro-v2.mp4   # Windows
cp   out/virtue-logo-intro.mp4 public/media/brand-intro-v2.mp4   # macOS / Linux

# other useful renders (all registered in src/remotion/Root.tsx)
npm run remotion:studio    # interactive preview of every composition
npm run remotion:gif       # animated GIF cutdown of the intro
npm run remotion:still     # 1080×1080 PNG of the logo mark
```

The composition draws the tile and the "V" from the **same**
`src/lib/brand/mark-geometry.ts` constants the site's SVG mark uses, so the video
and the on-page logo are identical by construction — change the geometry once and
re-render.

The wordmark is set in **Gropled**, loaded from the same
`public/fonts/gropled-bold.otf` that `next/font` self-hosts for the site, so the
preloader and the header share the face as well as the geometry.

> **zod note.** `@remotion/*` pins zod to `4.5.4` while the app uses `^4.6.7`, so
> the CLI prints a version-mismatch warning. Renders succeed regardless; pin zod
> to `4.5.4` if you ever hit a Remotion-specific failure.

## Notes

- There is deliberately **no hero video**. The home hero uses a committed
  photograph from `photos/` instead, which keeps the first paint fast and the
  look flat rather than glowy.
- Portfolio screenshots for **real** projects do not live here — they are
  uploaded to the Supabase Storage bucket `project-media` from the dashboard.
- The `projects/` and `avatars/` SVGs exist purely to make the unconfigured
  demo feel like a real site; delete them once you publish real work.
