'use client'

import * as React from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { gsap } from 'gsap'

export type ChartTone = 'coral' | 'ink' | 'teal' | 'ochre'
export type CountFormat = 'number' | 'usd' | 'compact' | 'percent'

const numberFmt = new Intl.NumberFormat('en-US')
const usdFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})
const usdCompactFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const formatGlassyCount: Record<CountFormat, (value: number) => string> = {
  number: (value) => numberFmt.format(Math.round(value)),
  usd: (value) => usdFmt.format(value),
  compact: (value) => usdCompactFmt.format(value),
  percent: (value) => `${value.toFixed(1)}%`,
}

export function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    update()
    return () => media.removeEventListener('change', update)
  }, [])
  return reduced
}

export function useGlassyAnimations(
  scopeRef: React.RefObject<HTMLElement | null>,
  deps: unknown[],
) {
  const reduced = useReducedMotionPref()

  React.useEffect(() => {
    const layer = scopeRef.current
    if (!layer) return

    const counts = layer.querySelectorAll<HTMLElement>('[data-gd-count]')
    if (reduced) {
      counts.forEach((el) => {
        const format = (el.dataset.format as CountFormat) || 'number'
        el.textContent = formatGlassyCount[format](Number(el.dataset.gdCount || 0))
      })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(layer, { clearProps: 'opacity,filter' })
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(
        layer,
        { opacity: 0.55, filter: 'blur(5px)' },
        { opacity: 1, filter: 'blur(0px)', clearProps: 'opacity,filter', duration: 0.32 },
        0,
      )
      const enterEls = layer.querySelectorAll('[data-gd-enter]')
      if (enterEls.length) {
        tl.from(
          enterEls,
          { y: 18, opacity: 0, stagger: 0.045, duration: 0.5, clearProps: 'transform,opacity' },
          0.035,
        )
      }
      const bars = layer.querySelectorAll('.gd-stack-bar')
      const line = layer.querySelector('.gd-line-reveal')
      const ring = layer.querySelector('.gd-donut-draw')
      const meters = layer.querySelectorAll('.gd-fill')
      if (bars.length) {
        tl.from(bars, { scaleY: 0, stagger: 0.034, duration: 0.46, clearProps: 'transform' }, 0.17)
      }
      if (line) {
        tl.fromTo(
          line,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.74, clearProps: 'clipPath' },
          0.14,
        )
      }
      if (ring) {
        tl.fromTo(
          ring,
          { attr: { 'stroke-dasharray': '0 100' } },
          { attr: { 'stroke-dasharray': '100 0' }, duration: 0.76 },
          0.16,
        )
      }
      if (meters.length) {
        tl.from(meters, { scaleX: 0, duration: 0.58, stagger: 0.045, clearProps: 'transform' }, 0.18)
      }
      counts.forEach((el, index) => {
        const value = Number(el.dataset.gdCount || 0)
        const format = (el.dataset.format as CountFormat) || 'number'
        const fn = formatGlassyCount[format]
        const counter = { value: 0 }
        tl.to(
          counter,
          {
            value,
            duration: 0.75,
            onUpdate: () => {
              el.textContent = fn(counter.value)
            },
          },
          0.09 + index * 0.02,
        )
      })
    }, scopeRef)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ...deps])
}

export function GlassyCounter({
  value,
  format = 'number',
}: {
  value: number
  format?: CountFormat
}) {
  const text = formatGlassyCount[format](value)
  return (
    <>
      <span data-gd-count={value} data-format={format} aria-hidden="true">
        {text}
      </span>
      <span className="gd-sr">{text}</span>
    </>
  )
}

export function GlassyLegend({
  entries,
}: {
  entries: { label: string; tone: ChartTone }[]
}) {
  return (
    <div className="gd-legend">
      {entries.map(({ label, tone }) => (
        <span key={label}>
          <i data-tone={tone} aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  )
}

export function GlassyPanel({
  title,
  subtitle,
  action,
  className = '',
  children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={`gd-panel ${className}`} data-gd-enter>
      <header className="gd-panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

export function GlassyMetric({
  title,
  icon,
  value,
  displayOverride,
  format = 'number',
  change,
  detail,
  tone,
}: {
  title: string
  icon: React.ReactNode
  value: number
  displayOverride?: string
  format?: CountFormat
  change?: string
  detail?: string
  tone?: 'teal' | 'coral'
}) {
  return (
    <article className="gd-metric" data-tone={tone} data-gd-enter>
      <div className="gd-metric-head">
        <span>{title}</span>
        <span className="gd-metric-icon" aria-hidden="true">
          {icon}
        </span>
      </div>
      <strong className="gd-metric-value">
        {displayOverride ? displayOverride : <GlassyCounter value={value} format={format} />}
      </strong>
      <div className="gd-metric-caption">
        {change && (
          <span className="gd-delta" data-attention={tone === 'coral'}>
            {change.startsWith('−') || change.startsWith('-') ? (
              <ArrowDownRight aria-hidden="true" />
            ) : (
              <ArrowUpRight aria-hidden="true" />
            )}
            {change}
          </span>
        )}
        <span>{detail ?? 'current cycle'}</span>
      </div>
    </article>
  )
}

export function GlassyBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const state =
    normalized.includes('complete') ||
    normalized.includes('running') ||
    normalized.includes('active') ||
    normalized.includes('delivered') ||
    normalized.includes('won') ||
    normalized.includes('paid')
      ? 'teal'
      : normalized.includes('review') ||
          normalized.includes('exception') ||
          normalized.includes('scoping') ||
          normalized.includes('new')
        ? 'coral'
        : normalized.includes('scheduled') || normalized.includes('quoted')
          ? 'ochre'
          : 'ink'

  return (
    <span className="gd-status" data-state={state}>
      <i aria-hidden="true" />
      {status}
    </span>
  )
}

export interface StackItem {
  label: string
  lower: number
  upper: number
}

export function GlassyStackChart({
  items,
  labels,
  tones,
  format = (v) => numberFmt.format(v),
  title,
}: {
  items: StackItem[]
  labels: [string, string]
  tones: [ChartTone, ChartTone]
  format?: (value: number) => string
  title: string
}) {
  const [active, setActive] = React.useState<number | null>(null)
  const max = Math.max(1, ...items.map((item) => item.lower + item.upper)) * 1.11
  const selected = active === null ? undefined : items[active]

  return (
    <figure className="gd-stack" aria-label={title}>
      <div className="gd-stack-meta">
        <GlassyLegend
          entries={labels.map((label, index) => ({ label, tone: tones[index] }))}
        />
        {selected && (
          <span className="gd-chart-readout">
            {selected.label} · {format(selected.lower + selected.upper)}
          </span>
        )}
      </div>
      <div
        className="gd-stack-plot"
        style={{ '--gd-series-count': items.length } as React.CSSProperties}
        onMouseLeave={() => setActive(null)}
      >
        {items.map((item, index) => (
          <button
            type="button"
            className="gd-stack-column"
            key={item.label}
            aria-label={`${item.label}: ${format(item.lower)} ${labels[0]}, ${format(item.upper)} ${labels[1]}`}
            aria-pressed={active === index}
            onFocus={() => setActive(index)}
            onBlur={() => setActive(null)}
            onMouseEnter={() => setActive(index)}
            onClick={() => setActive(index)}
          >
            <span className="gd-stack-track" aria-hidden="true">
              <span
                className="gd-stack-bar"
                style={{ height: `${((item.lower + item.upper) / max) * 100}%` }}
              >
                <i data-tone={tones[1]} style={{ flexGrow: Math.max(0.05, item.upper) }} />
                <i data-tone={tones[0]} style={{ flexGrow: Math.max(0.05, item.lower) }} />
              </span>
            </span>
            <span className="gd-stack-label" aria-hidden="true">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </figure>
  )
}

type Point = [number, number]

function curve(points: Point[]) {
  return points.reduce((path, [x, y], index) => {
    if (index === 0) return `M ${x} ${y}`
    const [previousX, previousY] = points[index - 1]
    const midpoint = (x + previousX) / 2
    return `${path} C ${midpoint} ${previousY}, ${midpoint} ${y}, ${x} ${y}`
  }, '')
}

export function GlassyRevenueChart({
  labels,
  primarySeries,
  secondarySeries,
  primaryLabel = 'Collected',
  secondaryLabel = 'Target',
}: {
  labels: string[]
  primarySeries: number[]
  secondarySeries: number[]
  primaryLabel?: string
  secondaryLabel?: string
}) {
  const fillId = `revenue-fill-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const [active, setActive] = React.useState<number | null>(null)
  const plotHeight = 204
  const width = 600
  const max = Math.max(2.5, Math.ceil((Math.max(...primarySeries, ...secondarySeries) * 1.14) / 2.5) * 2.5)
  const points = (values: number[]): Point[] =>
    values.map((value, index) => [
      (index * width) / Math.max(1, values.length - 1),
      plotHeight - (value / max) * plotHeight,
    ])
  const revenuePoints = points(primarySeries)
  const costPoints = points(secondarySeries)
  const revenueLine = curve(revenuePoints)
  const last = ((revenuePoints.length - 1) * width) / Math.max(1, revenuePoints.length - 1)
  const point = active === null ? undefined : revenuePoints[active]
  const costPoint = active === null ? undefined : costPoints[active]
  const ticks = [max, max * 0.75, max * 0.5, max * 0.25, 0]

  return (
    <figure className="gd-revenue-chart" aria-label={`${primaryLabel} and ${secondaryLabel} by period`}>
      <div className="gd-revenue-main">
        <div className="gd-chart-y" aria-hidden="true">
          {ticks.map((value) => (
            <span key={value}>{value === 0 ? '0' : `$${Number(value.toFixed(1))}k`}</span>
          ))}
        </div>
        <div className="gd-line-plot" onMouseLeave={() => setActive(null)}>
          <svg viewBox={`0 0 ${width} ${plotHeight}`} preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1" gradientUnits="objectBoundingBox">
                <stop offset="0" stopColor="var(--gd-coral)" stopOpacity=".30" />
                <stop offset="1" stopColor="var(--gd-coral)" stopOpacity=".025" />
              </linearGradient>
            </defs>
            {ticks.map((tick, index) => (
              <line
                className="gd-grid-line"
                key={tick}
                x1="0"
                x2={width}
                y1={(plotHeight * index) / 4}
                y2={(plotHeight * index) / 4}
              />
            ))}
            <g className="gd-line-reveal">
              <path d={`${revenueLine} L ${last} ${plotHeight} H 0 Z`} fill={`url(#${fillId})`} />
              <path className="gd-chart-path" data-tone="coral" d={revenueLine} />
              <path className="gd-chart-path" data-tone="ink" d={curve(costPoints)} />
            </g>
            {point && costPoint && (
              <g>
                <line className="gd-line-cursor" x1={point[0]} x2={point[0]} y1="0" y2={plotHeight} />
                <circle cx={point[0]} cy={point[1]} r="4" fill="var(--gd-coral)" />
                <circle cx={costPoint[0]} cy={costPoint[1]} r="4" fill="var(--gd-graph-ink)" />
              </g>
            )}
          </svg>
          <div className="gd-chart-zones">
            {labels.map((label, index) => (
              <button
                type="button"
                key={label}
                aria-label={`${label}, ${primaryLabel} ${usdFmt.format(primarySeries[index] * 1000)}, ${secondaryLabel} ${usdFmt.format(secondarySeries[index] * 1000)}`}
                aria-pressed={active === index}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                onMouseEnter={() => setActive(index)}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
          {active !== null && (
            <div
              className="gd-line-tooltip"
              style={{ '--gd-tooltip-x': `${(active / Math.max(1, labels.length - 1)) * 100}%` } as React.CSSProperties}
            >
              <strong>{labels[active]}</strong>
              <span>
                {primaryLabel} <b>{usdFmt.format(primarySeries[active] * 1000)}</b>
              </span>
              <span>
                {secondaryLabel} <b>{usdFmt.format(secondarySeries[active] * 1000)}</b>
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="gd-chart-axis" aria-hidden="true">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </figure>
  )
}

export function GlassyDonutChart({
  segments,
  total,
  totalLabel,
}: {
  segments: { label: string; percentage: number; tone: ChartTone }[]
  total: number
  totalLabel: string
}) {
  const maskId = `gd-ring-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const [active, setActive] = React.useState<number | null>(null)

  return (
    <div className="gd-device" aria-label={totalLabel}>
      <div className="gd-device-ring">
        <svg viewBox="0 0 124 124" aria-hidden="true">
          <defs>
            <mask id={maskId}>
              <circle
                className="gd-donut-draw"
                cx="62"
                cy="62"
                r="47"
                fill="none"
                stroke="white"
                strokeWidth="15"
                pathLength="100"
                strokeDasharray="100 0"
                transform="rotate(-90 62 62)"
              />
            </mask>
          </defs>
          <circle cx="62" cy="62" r="47" fill="none" stroke="var(--gd-track)" strokeWidth="14" />
          <g mask={`url(#${maskId})`} transform="rotate(-90 62 62)">
            {segments.map((seg, index) => (
              <circle
                key={seg.label}
                cx="62"
                cy="62"
                r="47"
                pathLength="100"
                fill="none"
                strokeWidth="14"
                data-tone={seg.tone}
                className="gd-device-segment"
                data-muted={active !== null && index !== active}
                strokeDasharray={`${Math.max(0, seg.percentage - 1.1)} 100`}
                strokeDashoffset={-segments.slice(0, index).reduce((sum, s) => sum + s.percentage, 0)}
              />
            ))}
          </g>
        </svg>
        <div className="gd-device-total">
          <strong>
            {active === null ? (
              <GlassyCounter value={total} />
            ) : (
              numberFmt.format(Math.round((total * segments[active].percentage) / 100))
            )}
          </strong>
          <span>{active === null ? totalLabel : segments[active].label}</span>
        </div>
      </div>

      <div className="gd-device-list">
        {segments.map((seg, index) => (
          <button
            type="button"
            key={seg.label}
            aria-pressed={active === index}
            aria-label={`${seg.label}, ${seg.percentage}%`}
            onClick={() => setActive(active === index ? null : index)}
          >
            <span>
              <i data-tone={seg.tone} aria-hidden="true" />
              {seg.label}
            </span>
            <span className="gd-mix-track" aria-hidden="true">
              <i className="gd-fill" data-tone={seg.tone} style={{ width: `${seg.percentage}%` }} />
            </span>
            <strong>{seg.percentage}%</strong>
          </button>
        ))}
      </div>
    </div>
  )
}
