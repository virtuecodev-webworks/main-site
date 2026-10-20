'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Code2, FileText, Minus, Package, Palette, Plus, Search, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS: Record<string, LucideIcon> = {
  palette: Palette,
  code: Code2,
  search: Search,
  package: Package,
}

export interface GlassFolderProps {
  /** Drives the flat decoration and the big display numeral. */
  index: number
  title: string
  caption: string
  /** Key into the local icon map. */
  icon: string
  /** What is inside the folder. */
  files: string[]
  /** The affordance line shown on the closed cover. */
  hint: string
  className?: string
}

/**
 * Folder card.
 *
 * Adapted from a supplied "glass folder" component. The mechanism is kept — a
 * cover that swings open on a hinged bottom edge to reveal the folder's
 * contents — but four things changed to fit this brand and this codebase:
 *
 *  1. **Flat, not frosted.** `backdrop-blur`, blur halos and coloured shadow are
 *     banned here, so the cover is a solid charcoal surface with one gold
 *     hairline and a tab. Nothing glows.
 *  2. **CSS artwork, not canvas.** The original drew a random composition into a
 *     `<canvas>` on mount. A deterministic set of flat bars and one display
 *     numeral gives the same per-folder variety with no canvas, no
 *     device-pixel-ratio maths, no `ResizeObserver` and no hydration risk.
 *  3. **Valid, accessible markup.** The first pass put the file list inside the
 *     toggle `<button>`, which is invalid — a button may only contain phrasing
 *     content. The list is now a sibling `<ul>`, and the control is a
 *     transparent, always-flat overlay button that owns `aria-expanded` and
 *     `aria-controls`, so clicking anywhere on the card works and the contents
 *     stay readable by assistive tech.
 *  4. **Reduced motion is respected** by removing the hinge rotation entirely
 *     while keeping the disclosure functional.
 */
export function GlassFolder({
  index,
  title,
  caption,
  icon,
  files,
  hint,
  className,
}: GlassFolderProps) {
  const [open, setOpen] = React.useState(false)
  const reduced = useReducedMotion()
  const panelId = React.useId()
  const Icon = ICONS[icon] ?? FileText

  /*
   * A small, stable set of decorative bars: each folder differs slightly, and
   * none of it is random, so server and client always agree.
   */
  const bars = [
    { width: `${48 + ((index * 13) % 30)}%`, opacity: 0.5 },
    { width: `${30 + ((index * 21) % 26)}%`, opacity: 0.32 },
    { width: `${62 + ((index * 7) % 20)}%`, opacity: 0.2 },
  ]

  return (
    <div className={cn('folder relative', className)} style={{ perspective: 1400 }}>
      {/* The tab that makes it read as a folder rather than a card. */}
      <span
        aria-hidden
        className="absolute -top-2.5 left-5 z-30 h-3.5 w-24 rounded-t-lg border border-b-0 border-border bg-ink-900 transition-colors duration-300 peer-hover:bg-ink-800 dark:bg-ink-100"
      />

      {/* ---------------------------------------------------------------- */}
      {/* Inside the folder — always in the DOM, revealed by the cover       */}
      {/* ---------------------------------------------------------------- */}
      <div
        id={panelId}
        className="relative flex min-h-[272px] flex-col gap-2.5 rounded-2xl border border-border bg-card p-5 pt-7 sm:min-h-[288px]"
      >
        <ul className="flex flex-col gap-2">
          {files.map((file, fileIndex) => (
            <motion.li
              key={file}
              initial={false}
              animate={
                reduced
                  ? { opacity: 1, y: 0 }
                  : { opacity: open ? 1 : 0.3, y: open ? 0 : 8 + fileIndex * 2 }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      duration: 0.32,
                      delay: open ? 0.1 + fileIndex * 0.05 : 0,
                      ease: [0.22, 1, 0.36, 1],
                    }
              }
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/60 px-3.5 py-2.5"
            >
              <FileText
                className="size-3.5 shrink-0 text-gold-600 dark:text-gold-400"
                aria-hidden
              />
              <span className="text-[13px] leading-snug">{file}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* The cover, hinged on its bottom edge                               */}
      {/* ---------------------------------------------------------------- */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ rotateX: open ? -78 : 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'bottom', transformStyle: 'preserve-3d' }}
        className="pointer-events-none absolute inset-0 z-20 block overflow-hidden rounded-2xl border border-ink-800 bg-ink-950"
      >
        {/* One gold hairline, no glow. */}
        <span className="absolute inset-x-0 top-0 h-px bg-gold-500/60" />

        {/* Flat decorative bars. */}
        <span className="absolute inset-0 block p-6">
          <span className="flex flex-col gap-2.5 pt-8">
            {bars.map((bar, barIndex) => (
              <span
                key={barIndex}
                className="block h-1.5 rounded-full bg-gold-400"
                style={{ width: bar.width, opacity: bar.opacity }}
              />
            ))}
          </span>
        </span>

        <span className="absolute inset-x-0 bottom-0 flex flex-col gap-3.5 p-6">
          <span className="flex items-center justify-between">
            <span className="grid size-11 place-items-center rounded-xl border border-gold-500/35 text-gold-400">
              <Icon className="size-5" strokeWidth={1.8} />
            </span>
            <span className="font-display text-[2.25rem] leading-none font-bold text-gold-500/35">
              {String(index + 1).padStart(2, '0')}
            </span>
          </span>

          <span className="flex flex-col gap-1.5">
            <span className="font-display text-xl leading-tight font-bold text-white">
              {title}
            </span>
            <span className="text-[13px] leading-relaxed text-white/60">{caption}</span>
          </span>

          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-gold-400 uppercase">
            {open ? <Minus className="size-3" /> : <Plus className="size-3" />}
            {hint}
          </span>
        </span>
      </motion.div>

      {/* ---------------------------------------------------------------- */}
      {/* The control: transparent, never rotated, always covering the card  */}
      {/* ---------------------------------------------------------------- */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={title}
        data-folder-toggle
        className="focus-ring peer absolute inset-0 z-30 cursor-pointer rounded-2xl"
      />
    </div>
  )
}

export default GlassFolder
