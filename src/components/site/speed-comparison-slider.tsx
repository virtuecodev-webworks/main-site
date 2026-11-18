'use client'

import * as React from 'react'
import { ArrowLeftRight, CheckCircle2, Gauge, Sparkles, Timer, TriangleAlert, Zap } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export function SpeedComparisonSlider() {
  const [sliderPos, setSliderPos] = React.useState(68)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const draggingRef = React.useRef(false)

  const updateFromClientX = React.useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.max(8, Math.min(92, Math.round(pct))))
  }, [])

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      updateFromClientX(e.clientX)
    }
    const onUp = () => {
      draggingRef.current = false
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [updateFromClientX])

  return (
    <section className="padding-global padding-section border-t border-border">
      <div className="container-max">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <span className="label-mono text-primary">
              ( &nbsp;&nbsp;&nbsp;Performance Benchmark&nbsp;&nbsp;&nbsp; )
            </span>
            <h2 className="heading-style-h2 mt-2 max-w-2xl">
              From sluggish Wix &amp; WordPress bloat to sub-second Next.js 16.
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSliderPos(20)}
              className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Inspect Legacy Wix
            </button>
            <button
              type="button"
              onClick={() => setSliderPos(85)}
              className="rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-[#0a0a0a] shadow-sm hover:opacity-90 transition-opacity"
            >
              Inspect Virtue Next.js 16
            </button>
          </div>
        </div>

        {/* Interactive Before / After Comparison Canvas */}
        <div
          ref={containerRef}
          onPointerDown={(e) => {
            draggingRef.current = true
            updateFromClientX(e.clientX)
          }}
          className="relative h-[440px] sm:h-[400px] w-full overflow-hidden rounded-[24px] border border-border select-none cursor-ew-resize shadow-xl"
        >
          {/* RIGHT LAYER: AFTER (Virtue & Co. Next.js 16) */}
          <div className="absolute inset-0 bg-[#0a0a0a] text-[#f5f4f0] p-6 sm:p-10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-mono uppercase text-emerald-400">
                <Zap className="size-3.5" />
                After · Virtue &amp; Co. Next.js 16
              </span>
              <span className="font-mono text-xs text-primary">100 / 100 Lighthouse</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-auto py-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-mono uppercase text-[#f5f4f0]/60">First Load</p>
                <p className="font-display text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">0.28s</p>
                <p className="text-[11px] text-[#f5f4f0]/60 mt-1">Edge cached globally</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-mono uppercase text-[#f5f4f0]/60">Lighthouse</p>
                <p className="font-display text-2xl sm:text-3xl font-bold text-primary mt-1">100</p>
                <p className="text-[11px] text-[#f5f4f0]/60 mt-1">Zero layout shift (0 CLS)</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-mono uppercase text-[#f5f4f0]/60">Payload Size</p>
                <p className="font-display text-2xl sm:text-3xl font-bold text-[#f5f4f0] mt-1">420 KB</p>
                <p className="text-[11px] text-[#f5f4f0]/60 mt-1">97% lighter assets</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-mono uppercase text-[#f5f4f0]/60">Conversions</p>
                <p className="font-display text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">+210%</p>
                <p className="text-[11px] text-[#f5f4f0]/60 mt-1">Instant checkout &amp; RSVP</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="size-4" />
                <span>Real-time database sync, custom SEO schema, zero monthly template bloat</span>
              </div>
              <Link
                href="/contact"
                onPointerDown={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 font-semibold text-[#0a0a0a] hover:opacity-90"
              >
                <Sparkles className="size-3.5" />
                <span>Migrate My Site</span>
              </Link>
            </div>
          </div>

          {/* LEFT CLIPPED LAYER: BEFORE (Legacy Wix / Bloated Template) */}
          <div
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            className="absolute inset-0 bg-[#e8e5dc] dark:bg-[#1c1c21] text-foreground p-6 sm:p-10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[11px] font-mono uppercase text-rose-600 dark:text-rose-400">
                <TriangleAlert className="size-3.5" />
                Before · Legacy Wix / Bloated CMS
              </span>
              <span className="font-mono text-xs text-rose-600 dark:text-rose-400">42 / 100 Lighthouse</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-auto py-4">
              <div className="rounded-2xl border border-border bg-card/90 p-4">
                <p className="text-[11px] font-mono uppercase text-muted-foreground">First Load</p>
                <p className="font-display text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1">5.8s</p>
                <p className="text-[11px] text-muted-foreground mt-1">Heavy script waterfall</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/90 p-4">
                <p className="text-[11px] font-mono uppercase text-muted-foreground">Lighthouse</p>
                <p className="font-display text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1">42</p>
                <p className="text-[11px] text-muted-foreground mt-1">Severe mobile CLS lag</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/90 p-4">
                <p className="text-[11px] font-mono uppercase text-muted-foreground">Payload Size</p>
                <p className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">14.8 MB</p>
                <p className="text-[11px] text-muted-foreground mt-1">Uncompressed bundles</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/90 p-4">
                <p className="text-[11px] font-mono uppercase text-muted-foreground">Bounce Rate</p>
                <p className="font-display text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1">62%</p>
                <p className="text-[11px] text-muted-foreground mt-1">Visitors drop before CTA</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Timer className="size-4 text-rose-500" />
                <span>Plugin conflicts, slow mobile checkout, weak Google ranking signals</span>
              </span>
              <span className="hidden sm:inline font-mono text-[11px]">Drag slider to compare →</span>
            </div>
          </div>

          {/* Interactive Drag Handle */}
          <div
            style={{ left: `${sliderPos}%` }}
            className="pointer-events-none absolute inset-y-0 z-20 -ml-0.5 w-1 bg-primary shadow-[0_0_20px_rgba(220,170,40,0.8)]"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full border-2 border-[#0a0a0a] bg-primary text-[#0a0a0a] shadow-xl">
              <ArrowLeftRight className="size-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
