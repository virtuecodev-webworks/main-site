import * as React from 'react'
import { modeVars } from '@/lib/design/palette'
import { sharedVars } from '@/lib/design/css'
import type { SiteDesign } from '@/lib/design/tokens'

/**
 * A miniature of the real surfaces, rendered from the design the admin is
 * currently drafting.
 *
 * The tokens are applied as CSS custom properties on the wrapper, so the markup
 * below uses the same `bg-background` / `text-muted-foreground` / `bg-primary`
 * classes the actual site does. That is what makes this a preview rather than a
 * mock-up: if a combination looks wrong here, it looks wrong on the site.
 *
 * The one thing that cannot be expressed that way is a `dark:` utility, since
 * those key off the document's own theme class rather than the mode being
 * previewed. The handful of places the real components branch that way are
 * branched here in JavaScript instead, using the same class names.
 */
export function DesignPreview({ design, mode }: { design: SiteDesign; mode: 'light' | 'dark' }) {
  const vars = {
    ...modeVars(design, mode),
    ...sharedVars(design),
  } as React.CSSProperties

  const dark = mode === 'dark'
  const pill = dark
    ? 'bg-gold-500/12 text-gold-300'
    : 'border border-gold-500/30 bg-gold-50 text-gold-800'

  return (
    <div style={vars} className="rounded-2xl border border-border bg-background p-4">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase ${pill}`}
      >
        <span className="size-1.5 rounded-full bg-gold-500" aria-hidden />
        Preview
      </span>

      <p className="font-sans mt-3.5 text-xl leading-tight font-bold text-foreground">
        We build websites that look great and work even better.
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        A small studio building sites that are easy to use and easy to run. Prices in the
        currency you actually pay in.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary px-3.5 py-2 text-[12.5px] font-medium text-primary-foreground">
          Get a price
        </span>
        <span className="rounded-full bg-secondary px-3.5 py-2 text-[12.5px] font-medium text-secondary-foreground">
          See our work
        </span>
        <span
          className="rounded-full px-3.5 py-2 text-[12.5px] font-medium"
          style={{
            backgroundColor: 'var(--primary-hover)',
            color: 'var(--primary-hover-foreground)',
          }}
        >
          On hover
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-3">
        <p className="text-[12.5px] font-semibold text-foreground">Pricing</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
          Cards, panels and every raised block use the surface colour.
        </p>
        <p className="mt-2 text-[11.5px] font-semibold text-gold-700">From USD 1,200</p>
      </div>
    </div>
  )
}
