'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import {
  BatteryFull,
  Check,
  ChevronRight,
  Code2,
  Flag,
  Globe2,
  Layers,
  LoaderCircle,
  MapPin,
  Rocket,
  ShieldCheck,
  Signal,
  Star,
  Wifi,
  Zap,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { VirtueMark } from '@/components/brand/virtue-mark'
import { VantraButton } from '@/components/ui/vantra-button'
import { LaunchBadge } from '@/components/site/launch-badge'
import { cn } from '@/lib/utils'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const STUDIO_CITIES = [
  { name: 'London', builds: 48 },
  { name: 'New York', builds: 36 },
  { name: 'Lagos', builds: 62 },
  { name: 'Toronto', builds: 29 },
  { name: 'Dubai', builds: 24 },
]

const HERO_PHRASES = [
  'to grow your business.',
  'for sub-second speed.',
  'with fixed pricing.',
  'you 100% own.',
]

const BLUEPRINT = {
  spacing: 46,
  spacingSmall: 38,
  spacingLarge: 58,
  angle: -12,
  avenueEvery: 4,
  centerY: 0.55,
  roads: ['Next.js 16', 'TypeScript', 'Edge CDN', 'Supabase', 'Stripe', 'Lighthouse', 'Tailwind'],
  districts: [
    { name: 'Custom Apps', x: 0.56, y: 0.24 },
    { name: 'Edge CDN', x: 0.87, y: 0.19 },
    { name: 'Luxury Stores', x: 0.65, y: 0.54 },
    { name: 'Client Portal', x: 0.9, y: 0.65 },
    { name: 'SEO Schema', x: 0.52, y: 0.84 },
    { name: 'Multi-Currency', x: 0.81, y: 0.91 },
  ],
  parks: [
    { x: 0.6, y: 0.4 },
    { x: 0.84, y: 0.82 },
    { x: 0.44, y: 0.62 },
    { x: 0.74, y: 0.12 },
  ],
}

const BUILD_TIERS = [
  { id: 'landing', label: 'Landing', price: 150, days: '5 days', stack: 'Next.js Edge Site' },
  { id: 'store', label: 'Store', price: 650, days: '3 wks', stack: 'Global E-Commerce' },
  { id: 'app', label: 'Web App', price: 950, days: '4 wks', stack: 'Full-Stack Platform' },
] as const

const CLIENT_AVATARS = [
  { name: 'Aurum Capital', src: '/work/aurum-hero.jpg' },
  { name: 'Maison Finery', src: '/work/finery-hero.jpg' },
  { name: 'Meridian Review', src: '/work/meridian-hero.jpg' },
]

const LENS_ZOOM = 1.42
const LENS_PIN_Y = 0.41

type NodeCoord = { i: number; j: number }
type Point2D = { x: number; y: number }
type BuildStatus = 'idle' | 'scoping' | 'building' | 'live'

function createGrid(width: number, height: number, spacing: number) {
  const angle = (BLUEPRINT.angle * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const center = { x: width / 2, y: height * BLUEPRINT.centerY }
  const reach = Math.ceil(Math.hypot(width, height) / spacing / 2) + 2

  const toWorld = (i: number, j: number): Point2D => ({
    x: center.x + i * spacing * cos - j * spacing * sin,
    y: center.y + i * spacing * sin + j * spacing * cos,
  })

  const nearestNode = (x: number, y: number): NodeCoord => {
    const dx = x - center.x
    const dy = y - center.y
    return {
      i: Math.round((dx * cos + dy * sin) / spacing),
      j: Math.round((-dx * sin + dy * cos) / spacing),
    }
  }

  const districtAt = (x: number, y: number) =>
    BLUEPRINT.districts.reduce((best, item) =>
      Math.hypot(item.x * width - x, item.y * height - y) <
      Math.hypot(best.x * width - x, best.y * height - y)
        ? item
        : best,
    ).name

  return { width, height, spacing, center, reach, toWorld, nearestNode, districtAt }
}

type StudioGrid = ReturnType<typeof createGrid>

function walkGrid(a: NodeCoord, b: NodeCoord): NodeCoord[] {
  const steps: NodeCoord[] = []
  const cursor = { ...a }
  while (cursor.i !== b.i) {
    cursor.i += Math.sign(b.i - cursor.i)
    steps.push({ ...cursor })
  }
  while (cursor.j !== b.j) {
    cursor.j += Math.sign(b.j - cursor.j)
    steps.push({ ...cursor })
  }
  return steps
}

function pathFromPoints(points: Point2D[]) {
  return points
    .map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ')
}

const riverPath = (width: number, height: number) =>
  `M ${width * 0.36} ${height * 1.04} C ${width * 0.5} ${height * 0.74}, ${width * 0.6} ${height * 0.66}, ${width * 0.74} ${height * 0.5} S ${width * 0.93} ${height * 0.12}, ${width * 1.04} ${height * 0.02}`

const tone = (i: number, j: number) => {
  const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function BlueprintPlanSvg({
  variant,
  width,
  height,
  spacing,
  center,
  reach,
  river,
  parks,
  labels = [],
  roads = [],
  className,
}: {
  variant: 'ink' | 'app'
  width: number
  height: number
  spacing: number
  center: Point2D
  reach: number
  river: string
  parks: NodeCoord[]
  labels?: { name: string; x: number; y: number }[]
  roads?: string[]
  className?: string
}) {
  const id = React.useId()
  const app = variant === 'app'
  const far = reach * spacing
  const lines = Array.from({ length: reach * 2 + 1 }, (_, k) => k - reach)
  const rad = (BLUEPRINT.angle * Math.PI) / 180
  const gap = spacing * (app ? 0.1 : 0.09)

  const blocks = app
    ? []
    : lines.flatMap((i) =>
        lines
          .map((j) => ({ i, j, shade: tone(i, j) }))
          .filter(({ i: bi, j: bj, shade }) => {
            const cx =
              center.x + (bi + 0.5) * spacing * Math.cos(rad) - (bj + 0.5) * spacing * Math.sin(rad)
            const cy =
              center.y + (bi + 0.5) * spacing * Math.sin(rad) + (bj + 0.5) * spacing * Math.cos(rad)
            return (
              shade > 0.28 &&
              cx > -spacing &&
              cx < width + spacing &&
              cy > -spacing &&
              cy < height + spacing
            )
          }),
      )

  const avenues = lines.filter((k) => k % BLUEPRINT.avenueEvery === 0 && Math.abs(k) < reach - 1)

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <pattern id={id} width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="0.9" className="fill-[var(--gr-ink)]" fillOpacity="0.16" />
        </pattern>
      </defs>

      {app && <rect width={width} height={height} className="fill-[var(--gr-map-block)]" />}

      <g transform={`translate(${center.x} ${center.y}) rotate(${BLUEPRINT.angle})`}>
        {blocks.map((block) => (
          <rect
            key={`${block.i}:${block.j}`}
            x={block.i * spacing + gap}
            y={block.j * spacing + gap}
            width={spacing - gap * 2}
            height={spacing - gap * 2}
            rx="2"
            className="fill-[var(--gr-paper-block)]"
            fillOpacity={0.35 + block.shade * 0.65}
          />
        ))}

        {parks.map((park) => (
          <g key={`${park.i}:${park.j}`}>
            <rect
              x={park.i * spacing + gap}
              y={park.j * spacing + gap}
              width={spacing * 2 - gap * 2}
              height={spacing - gap * 2}
              rx={app ? spacing * 0.12 : 3}
              className={app ? 'fill-[var(--gr-map-park)]' : 'fill-[var(--gr-paper-park)]'}
            />
            {!app && (
              <rect
                x={park.i * spacing + gap}
                y={park.j * spacing + gap}
                width={spacing * 2 - gap * 2}
                height={spacing - gap * 2}
                rx="3"
                fill={`url(#${id})`}
              />
            )}
          </g>
        ))}
      </g>

      <path
        d={river}
        strokeWidth={spacing * 0.8}
        strokeLinecap="round"
        className={app ? 'stroke-[var(--gr-map-water)]' : 'stroke-[var(--gr-paper-water)]'}
      />

      <g transform={`translate(${center.x} ${center.y}) rotate(${BLUEPRINT.angle})`}>
        {lines.map((k) => {
          const avenue = k % BLUEPRINT.avenueEvery === 0
          const stroke = app ? (avenue ? spacing * 0.32 : spacing * 0.2) : avenue ? spacing * 0.2 : 1
          const paint = app || avenue ? 'stroke-[var(--gr-map-road)]' : 'stroke-[var(--gr-ink)]'
          const opacity = app || avenue ? 1 : 0.07

          return (
            <g key={k}>
              <line
                x1={k * spacing}
                x2={k * spacing}
                y1={-far}
                y2={far}
                strokeWidth={stroke}
                className={paint}
                strokeOpacity={opacity}
              />
              <line
                x1={-far}
                x2={far}
                y1={k * spacing}
                y2={k * spacing}
                strokeWidth={stroke}
                className={paint}
                strokeOpacity={opacity}
              />
            </g>
          )
        })}

        {!app &&
          roads.length > 0 &&
          avenues.map((k, index) => (
            <g key={`road-${k}`} className="fill-[var(--gr-ink)]" fillOpacity="0.32">
              <text
                x={k * spacing}
                y={(index % 2 ? 1.5 : -2.5) * spacing}
                transform={`rotate(-90 ${k * spacing} ${(index % 2 ? 1.5 : -2.5) * spacing})`}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={spacing * 0.16}
                fontWeight="600"
                letterSpacing="0.16em"
              >
                {roads[index % roads.length].toUpperCase()}
              </text>
              <text
                x={(index % 2 ? -1.5 : 2.5) * spacing}
                y={k * spacing}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={spacing * 0.16}
                fontWeight="600"
                letterSpacing="0.16em"
              >
                {roads[(index + 3) % roads.length].toUpperCase()}
              </text>
            </g>
          ))}
      </g>

      {app &&
        labels.map((label) => (
          <text
            key={label.name}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            className="fill-[var(--gr-ink)] font-semibold"
            fillOpacity="0.52"
            fontSize={spacing * 0.19}
            letterSpacing="0.04em"
          >
            {label.name.toUpperCase()}
          </text>
        ))}
    </svg>
  )
}

function Phrase({ text }: { text: string }) {
  return (
    <span className="inline-flex flex-wrap gap-x-[0.24em]">
      {text.split(' ').map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{
            opacity: 0,
            y: -10,
            filter: 'blur(8px)',
            transition: { duration: 0.32, delay: index * 0.04, ease: [0.4, 0, 1, 1] },
          }}
          transition={{ duration: 0.65, delay: 0.08 + index * 0.07, ease: EASE_OUT }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

function LiveCounter({ value }: { value: number }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const shown = useMotionValue(value)

  useMotionValueEvent(shown, 'change', (latest) => {
    if (ref.current) ref.current.textContent = String(Math.round(latest))
  })

  React.useEffect(() => {
    const controls = animate(shown, value, { duration: 0.85, ease: EASE_OUT })
    return () => controls.stop()
  }, [shown, value])

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  )
}

function HoldToDeploy({
  label,
  busy,
  onTrigger,
}: {
  label: string
  busy: boolean
  onTrigger: () => void
}) {
  const runRef = React.useRef<{ stop: () => void } | null>(null)
  const fill = useMotionValue(0)
  const reveal = useTransform(fill, (v) => `inset(0 ${100 - v * 100}% 0 0)`)

  const startHold = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (busy || e.button !== 0) return
    runRef.current?.stop()
    runRef.current = animate(fill, 1, {
      duration: 0.55 * (1 - fill.get()),
      ease: 'linear',
      onComplete: () => {
        onTrigger()
        fill.set(0)
      },
    })
  }

  const stopHold = () => {
    if (fill.get() >= 1) return
    runRef.current?.stop()
    runRef.current = animate(fill, 0, { duration: 0.2, ease: EASE_OUT })
  }

  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (busy || (e.key !== 'Enter' && e.key !== ' ')) return
    e.preventDefault()
    onTrigger()
  }

  return (
    <button
      type="button"
      disabled={busy}
      onPointerDown={startHold}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      onClick={() => {
        if (!busy && fill.get() < 0.25) onTrigger()
      }}
      onKeyDown={handleKey}
      aria-label={busy ? label : `${label}. Click or hold to simulate launch`}
      className="gr-hold gr-focus relative mt-3 flex h-10 w-full cursor-pointer items-center justify-center overflow-hidden rounded-[11px] text-[12.5px] font-semibold select-none disabled:cursor-progress"
    >
      <motion.span
        aria-hidden="true"
        style={{ scaleX: fill }}
        className="bg-[var(--gr-accent)] absolute inset-0 origin-left"
      />
      <span className="relative flex items-center gap-2 text-white">
        {busy ? <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" /> : <Rocket aria-hidden="true" className="size-3.5 text-[var(--gr-accent)]" />}
        {label}
      </span>
      <motion.span
        aria-hidden="true"
        style={{ clipPath: reveal }}
        className="text-[#14161B] absolute inset-0 flex items-center justify-center gap-2 font-bold"
      >
        {label}
      </motion.span>
    </button>
  )
}

export function Hero() {
  const t = useTranslations('Home.hero')
  const locale = useLocale()
  const prefersReduced = useReducedMotion() ?? false

  const sectionRef = React.useRef<HTMLElement>(null)
  const copyRef = React.useRef<HTMLDivElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const phoneRef = React.useRef<HTMLDivElement>(null)
  const screenRef = React.useRef<HTMLDivElement>(null)
  const mapRef = React.useRef<HTMLDivElement>(null)
  const previewRef = React.useRef<SVGPathElement>(null)
  const pagePreviewRef = React.useRef<SVGPathElement>(null)
  const cursorRef = React.useRef<HTMLDivElement>(null)

  const [grid, setGrid] = React.useState<StudioGrid | null>(null)
  const [tierIndex, setTierIndex] = React.useState(1)
  const [buildStatus, setBuildStatus] = React.useState<BuildStatus>('idle')
  const [targetNode, setTargetNode] = React.useState<NodeCoord | null>(null)
  const [hoverDistrict, setHoverDistrict] = React.useState<string | null>(null)
  const [activeDistrict, setActiveDistrict] = React.useState('Luxury Stores')
  const [phraseIdx, setPhraseIdx] = React.useState(0)
  const [cityIdx, setCityIdx] = React.useState(0)
  const [rating, setRating] = React.useState(5)

  const progress = useMotionValue(0)
  const progressWidth = useTransform(progress, (v) => `${Math.round(v * 100)}%`)

  // Measure copy bottom for mobile phone placement
  React.useEffect(() => {
    const section = sectionRef.current
    const copy = copyRef.current
    if (!section || !copy) return

    const measure = () => {
      const bottom = copy.getBoundingClientRect().bottom - section.getBoundingClientRect().top
      section.style.setProperty('--gr-copy-bottom', `${Math.round(bottom)}px`)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(copy)
    observer.observe(section)
    measure()
    return () => observer.disconnect()
  }, [])

  // Rotate hero phrases & live city ticker
  React.useEffect(() => {
    if (prefersReduced) return
    const phraseTimer = window.setInterval(() => {
      setPhraseIdx((i) => (i + 1) % HERO_PHRASES.length)
    }, 3000)
    const cityTimer = window.setInterval(() => {
      setCityIdx((i) => (i + 1) % STUDIO_CITIES.length)
    }, 3400)
    return () => {
      window.clearInterval(phraseTimer)
      window.clearInterval(cityTimer)
    }
  }, [prefersReduced])

  // Build responsive architectural blueprint grid
  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (!width || !height) return
      const spacing =
        width >= 1800
          ? BLUEPRINT.spacingLarge
          : width >= 1024
            ? BLUEPRINT.spacing
            : BLUEPRINT.spacingSmall
      setGrid(createGrid(width, height, spacing))
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  const river = React.useMemo(
    () => (grid ? riverPath(grid.width, grid.height) : ''),
    [grid],
  )
  const parks = React.useMemo(
    () =>
      grid
        ? BLUEPRINT.parks.map((p) => grid.nearestNode(p.x * grid.width, p.y * grid.height))
        : [],
    [grid],
  )

  // Synchronize phone screen blueprint lens with stage coordinates
  React.useEffect(() => {
    const phone = phoneRef.current
    const screen = screenRef.current
    const map = mapRef.current
    if (!grid || !phone || !screen || !map) return

    const syncLens = () => {
      const boxW = screen.offsetWidth
      const boxH = screen.offsetHeight
      const boxL = phone.offsetLeft + screen.offsetLeft
      const boxT = phone.offsetTop + screen.offsetTop
      if (!boxW) return

      const pin = { x: boxW / 2, y: boxH * LENS_PIN_Y }
      const focus = { x: boxL + pin.x, y: boxT + pin.y }

      map.style.transform = `translate(${pin.x - focus.x * LENS_ZOOM}px, ${pin.y - focus.y * LENS_ZOOM}px) scale(${LENS_ZOOM})`

      const district = grid.districtAt(focus.x, focus.y)
      setActiveDistrict(district)

      const startNode = grid.nearestNode(focus.x, focus.y)
      const dest = targetNode
      const preview =
        dest ? [startNode, ...walkGrid(startNode, dest)].map((n) => grid.toWorld(n.i, n.j)) : []

      const toScreen = (pt: Point2D) => ({
        x: (pt.x - focus.x) * LENS_ZOOM + pin.x,
        y: (pt.y - focus.y) * LENS_ZOOM + pin.y,
      })

      previewRef.current?.setAttribute(
        'd',
        preview.length > 1 ? pathFromPoints(preview.map(toScreen)) : '',
      )
      pagePreviewRef.current?.setAttribute(
        'd',
        preview.length > 1 ? pathFromPoints(preview) : '',
      )
    }

    const observer = new ResizeObserver(syncLens)
    observer.observe(phone)
    observer.observe(screen)
    if (stageRef.current) observer.observe(stageRef.current)
    syncLens()
    window.addEventListener('resize', syncLens)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncLens)
    }
  }, [grid, targetNode])

  const triggerSimulation = () => {
    if (buildStatus !== 'idle') return
    setBuildStatus('scoping')
    progress.set(0)
    animate(progress, 0.45, { duration: 0.9, ease: EASE_OUT })

    window.setTimeout(() => {
      setBuildStatus('building')
      animate(progress, 1, { duration: 1.2, ease: EASE_OUT })
      window.setTimeout(() => {
        setBuildStatus('live')
        window.setTimeout(() => {
          setBuildStatus('idle')
          progress.set(0)
        }, 3600)
      }, 1250)
    }, 950)
  }

  const onPhoneTarget = (target: EventTarget | null) =>
    target instanceof Element && !!target.closest('.gr-phone-spot')

  const onCopyArea = (stage: HTMLElement, clientX: number, clientY: number) => {
    const copy = copyRef.current?.getBoundingClientRect()
    const margin = 32
    return (
      !!copy &&
      clientX > copy.left - margin &&
      clientX < copy.right + margin &&
      clientY > copy.top - margin &&
      clientY < copy.bottom + margin
    )
  }

  const handleStageTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!grid || onPhoneTarget(e.target) || buildStatus !== 'idle') return
    if (onCopyArea(e.currentTarget, e.clientX, e.clientY)) return
    const rect = e.currentTarget.getBoundingClientRect()
    setTargetNode(grid.nearestNode(e.clientX - rect.left, e.clientY - rect.top))
  }

  const handleStagePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const tag = cursorRef.current
    if (!grid || !tag) return
    const free =
      e.pointerType === 'mouse' &&
      !onPhoneTarget(e.target) &&
      buildStatus === 'idle' &&
      !onCopyArea(e.currentTarget, e.clientX, e.clientY)

    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    tag.style.transform = `translate(${px}px, ${py}px)`
    tag.style.opacity = free ? '1' : '0'
    e.currentTarget.style.cursor = free ? 'crosshair' : ''

    const name = free ? grid.districtAt(px, py) : null
    if (name !== hoverDistrict) setHoverDistrict(name)
  }

  const dropPoint = grid && targetNode ? grid.toWorld(targetNode.i, targetNode.j) : null
  const dropDistrict =
    grid && dropPoint ? grid.districtAt(dropPoint.x, dropPoint.y) : null
  const activeTier = BUILD_TIERS[tierIndex]
  const currentCity = STUDIO_CITIES[cityIdx]

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        aria-labelledby="gr-title"
        className="gr-panel relative isolate overflow-hidden border-b border-[var(--gr-line)]"
      >
        {/* Interactive Architectural Blueprint Stage */}
        <div
          ref={stageRef}
          onClick={handleStageTap}
          onPointerMove={handleStagePointer}
          onPointerLeave={() => {
            if (cursorRef.current) cursorRef.current.style.opacity = '0'
            setHoverDistrict(null)
          }}
          className="absolute inset-0"
        >
          {grid && (
            <>
              <motion.div
                aria-hidden="true"
                initial={{ '--gr-reveal': prefersReduced ? '170%' : '0%' } as Record<string, string>}
                animate={{ '--gr-reveal': '170%' } as Record<string, string>}
                transition={{ duration: prefersReduced ? 0 : 1.5, ease: EASE_OUT }}
                className="gr-reveal pointer-events-none absolute inset-0"
              >
                <div className="gr-plan absolute inset-0">
                  <BlueprintPlanSvg
                    variant="ink"
                    width={grid.width}
                    height={grid.height}
                    spacing={grid.spacing}
                    center={grid.center}
                    reach={grid.reach}
                    river={river}
                    parks={parks}
                    roads={BLUEPRINT.roads}
                    className="absolute inset-0"
                  />

                  {BLUEPRINT.districts.map((item) => (
                    <span
                      key={item.name}
                      style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%` }}
                      className={cn(
                        'gr-district font-display absolute -translate-x-1/2 -translate-y-1/2 font-semibold whitespace-nowrap',
                        item.name === activeDistrict && 'gr-district-on',
                        item.name === hoverDistrict &&
                          item.name !== activeDistrict &&
                          'gr-district-hover',
                      )}
                    >
                      {item.name}
                    </span>
                  ))}

                  <svg
                    aria-hidden="true"
                    className="absolute inset-0 size-full overflow-visible"
                  >
                    <path
                      ref={pagePreviewRef}
                      fill="none"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="1 9"
                      className="stroke-[var(--gr-ink)]"
                      strokeOpacity={0.6}
                    />
                  </svg>
                </div>
              </motion.div>

              {/* Target Stack Flag when user taps the blueprint */}
              <AnimatePresence>
                {dropPoint && dropDistrict && (
                  <motion.div
                    key={`${targetNode?.i}:${targetNode?.j}`}
                    initial={{ opacity: 0, y: -14, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                    style={{ left: dropPoint.x, top: dropPoint.y }}
                    className="pointer-events-none absolute z-10"
                  >
                    <span className="gr-flag absolute bottom-[18px] left-0 flex -translate-x-1/2 items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5 text-[12px] font-semibold whitespace-nowrap">
                      <span className="bg-[var(--gr-ink)] text-[var(--gr-card)] grid size-6 place-items-center rounded-full">
                        <Flag aria-hidden="true" className="size-3" />
                      </span>
                      {dropDistrict}
                      <span className="text-[var(--gr-grey)] font-medium">
                        ${activeTier.price} · {activeTier.days}
                      </span>
                    </span>
                    <span className="gr-flag-stem absolute bottom-0 left-0 h-[18px] w-[2px] -translate-x-1/2" />
                    <span className="bg-[var(--gr-ink)] absolute top-0 left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating Blueprint Hover Tag */}
              <div
                ref={cursorRef}
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute top-0 left-0 z-10 opacity-0 transition-opacity duration-200',
                  buildStatus !== 'idle' && 'invisible',
                )}
              >
                <span className="gr-cursor-ring absolute top-0 left-0 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                <span className="gr-cursor-tag absolute top-4 left-4 rounded-full px-3 py-1.5 text-[11.5px] font-semibold whitespace-nowrap">
                  Scope {hoverDistrict}
                </span>
              </div>

              {/* Interactive Studio Phone Lens */}
              <div ref={phoneRef} className="gr-phone-spot absolute z-20">
                <span aria-hidden="true" className="gr-phone-glow pointer-events-none absolute" />
                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, y: -48, rotate: -4 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.1 }}
                  className="relative"
                >
                  <div className="gr-phone relative">
                    <div className="gr-bezel">
                      <div ref={screenRef} className="gr-screen relative overflow-hidden">
                        {/* Magnified Blueprint Layer inside Phone */}
                        <div className="absolute inset-0">
                          <div
                            ref={mapRef}
                            className="absolute top-0 left-0 origin-top-left will-change-transform"
                          >
                            <BlueprintPlanSvg
                              variant="app"
                              width={grid.width}
                              height={grid.height}
                              spacing={grid.spacing}
                              center={grid.center}
                              reach={grid.reach}
                              river={river}
                              parks={parks}
                              labels={BLUEPRINT.districts.map((item) => ({
                                name: item.name,
                                x: item.x * grid.width,
                                y: item.y * grid.height,
                              }))}
                            />
                          </div>

                          <svg
                            aria-hidden="true"
                            className="absolute inset-0 size-full overflow-visible"
                          >
                            <path
                              ref={previewRef}
                              fill="none"
                              strokeWidth={4}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="1 8"
                              className="stroke-[var(--gr-ink)]"
                              strokeOpacity={0.55}
                            />
                          </svg>

                          {/* Center Pin */}
                          <div
                            className="absolute left-1/2"
                            style={{ top: `${LENS_PIN_Y * 100}%` }}
                          >
                            <div className="absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center">
                              <span className="bg-[var(--gr-ink)] text-[var(--gr-card)] mb-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold whitespace-nowrap">
                                {buildStatus === 'live'
                                  ? '100/100'
                                  : buildStatus === 'idle'
                                    ? activeTier.days
                                    : 'Building…'}
                              </span>
                              <span className="bg-[var(--gr-accent)] border-[var(--gr-ink)] grid size-[16px] place-items-center rounded-full border-[2.5px]">
                                <span className="bg-[var(--gr-ink)] size-[4px] rounded-full" />
                              </span>
                              <span className="bg-[var(--gr-ink)] h-[9px] w-[2px] rounded-full" />
                            </div>
                          </div>
                        </div>

                        {/* Top Phone Screen Header Gradient & Status Bar */}
                        <span
                          aria-hidden="true"
                          className="gr-screen-top pointer-events-none absolute inset-x-0 top-0 z-10 h-[140px]"
                        />

                        <div className="text-[var(--gr-ink)] pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-[10px] text-[10.5px] font-semibold">
                          <span>9:41</span>
                          <span className="flex items-center gap-1">
                            <Signal aria-hidden="true" className="size-2.5" />
                            <Wifi aria-hidden="true" className="size-2.5" />
                            <BatteryFull aria-hidden="true" className="size-3" />
                          </span>
                        </div>
                        <span className="absolute top-[7px] left-1/2 z-10 h-[18px] w-[64px] -translate-x-1/2 rounded-full bg-black" />

                        {/* Studio App Top Search Card */}
                        <div className="absolute inset-x-3 top-[34px] z-10">
                          <div className="flex items-center justify-between px-1">
                            <span className="flex items-center gap-1.5 text-[12px] font-bold tracking-[-0.02em]">
                              <span className="flex size-[17px] items-center justify-center rounded-[5px] bg-[var(--gr-accent)] p-0.5 text-[#14161B]">
                                <VirtueMark className="size-full" animate={false} />
                              </span>
                              Virtue &amp; Co.
                            </span>
                            <span className="gr-avatar grid size-5.5 place-items-center rounded-full text-[8.5px] font-bold">
                              VC
                            </span>
                          </div>

                          <div className="gr-search mt-1.5 rounded-[12px] px-2.5 py-2">
                            <span className="flex items-center gap-2">
                              <MapPin aria-hidden="true" className="size-3 shrink-0 text-[var(--gr-accent)]" />
                              <span className="min-w-0">
                                <span className="text-[var(--gr-grey)] block text-[9px] leading-tight">
                                  Active Stack
                                </span>
                                <span className="block truncate text-[11.5px] leading-tight font-semibold">
                                  {dropDistrict ?? activeDistrict}
                                </span>
                              </span>
                            </span>
                            <span className="border-[var(--gr-line)] mt-1.5 flex items-center gap-2 border-t pt-1.5">
                              <Flag aria-hidden="true" className="size-3 shrink-0" />
                              <span className="text-[var(--gr-grey)] truncate text-[10.5px]">
                                {dropDistrict
                                  ? `${activeTier.stack} · $${activeTier.price}`
                                  : 'Tap the blueprint to scope'}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Interactive Bottom Sheet */}
                        <div
                          onPointerDown={(e) => e.stopPropagation()}
                          className="gr-sheet absolute inset-x-0 bottom-0 z-10 flex min-h-[37%] flex-col rounded-t-[20px] px-3 pt-2 pb-2.5"
                        >
                          <span className="bg-[var(--gr-ink)]/15 mx-auto mb-1.5 block h-1 w-7 shrink-0 rounded-full" />

                          <AnimatePresence mode="wait" initial={false}>
                            {buildStatus === 'idle' && (
                              <motion.div
                                key="plan"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.24, ease: EASE_OUT }}
                                className="flex flex-1 flex-col"
                              >
                                <div className="flex items-baseline justify-between gap-2">
                                  <p className="truncate text-[12px] font-semibold">
                                    Choose build tier
                                  </p>
                                  <span className="text-[var(--gr-grey)] shrink-0 text-[10px]">
                                    Fixed USD
                                  </span>
                                </div>

                                <div
                                  role="radiogroup"
                                  aria-label="Build tier"
                                  className="mt-1.5 grid grid-cols-3 gap-1.5"
                                >
                                  {BUILD_TIERS.map((tier, idx) => (
                                    <button
                                      key={tier.id}
                                      type="button"
                                      role="radio"
                                      aria-checked={idx === tierIndex}
                                      onClick={() => setTierIndex(idx)}
                                      className={cn(
                                        'gr-focus flex cursor-pointer flex-col items-center rounded-[10px] border py-1.5 transition-colors',
                                        idx === tierIndex
                                          ? 'border-[var(--gr-ink)] bg-[var(--gr-accent)]/15'
                                          : 'border-[var(--gr-line)] hover:border-[var(--gr-ink)]/30',
                                      )}
                                    >
                                      {idx === 0 ? (
                                        <Zap aria-hidden="true" className="size-3.5" />
                                      ) : idx === 1 ? (
                                        <Layers aria-hidden="true" className="size-3.5" />
                                      ) : (
                                        <Code2 aria-hidden="true" className="size-3.5" />
                                      )}
                                      <span className="mt-0.5 text-[10.5px] font-semibold">
                                        {tier.label}
                                      </span>
                                      <span className="text-[var(--gr-grey)] text-[9.5px]">
                                        ${tier.price} · {tier.days}
                                      </span>
                                    </button>
                                  ))}
                                </div>

                                <div className="border-[var(--gr-line)] mt-1.5 flex items-center gap-2 border-t pt-1.5 text-[10px]">
                                  <span className="bg-[var(--gr-ink)] text-[var(--gr-card)] flex h-4.5 shrink-0 items-center gap-1 rounded-[5px] px-1.5 text-[8.5px] font-semibold">
                                    <ShieldCheck className="size-2.5 text-[var(--gr-accent)]" />
                                    Escrow
                                  </span>
                                  <span className="text-[var(--gr-grey)] min-w-0 flex-1 truncate">
                                    100% code &amp; IP ownership
                                  </span>
                                  <ChevronRight aria-hidden="true" className="size-3 text-[var(--gr-grey)]" />
                                </div>

                                <HoldToDeploy
                                  label={`Hold to preview ${activeTier.label}`}
                                  busy={false}
                                  onTrigger={triggerSimulation}
                                />
                              </motion.div>
                            )}

                            {(buildStatus === 'scoping' || buildStatus === 'building') && (
                              <motion.div
                                key="building"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.24, ease: EASE_OUT }}
                                className="flex flex-1 flex-col justify-between py-1"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="gr-avatar grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold">
                                    VC
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11.5px] font-semibold">
                                      {buildStatus === 'scoping'
                                        ? 'Scoping architecture…'
                                        : 'Deploying to Edge CDN…'}
                                    </p>
                                    <p className="text-[var(--gr-grey)] truncate text-[9.5px]">
                                      {activeTier.stack} · {activeTier.days}
                                    </p>
                                  </div>
                                </div>

                                <div className="my-2">
                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--gr-ink)]/10">
                                    <motion.div
                                      style={{ width: progressWidth }}
                                      className="h-full rounded-full bg-[var(--gr-accent)]"
                                    />
                                  </div>
                                  <div className="mt-1.5 flex justify-between text-[9.5px] text-[var(--gr-grey)]">
                                    <span>TypeScript + Next.js 16</span>
                                    <span>0.28s TTFB</span>
                                  </div>
                                </div>

                                <div className="rounded-[10px] bg-[var(--gr-panel)] px-2.5 py-2 text-[10px] font-medium text-[var(--gr-ink)]">
                                  Fixed price locked at ${activeTier.price} USD
                                </div>
                              </motion.div>
                            )}

                            {buildStatus === 'live' && (
                              <motion.div
                                key="live"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.24, ease: EASE_OUT }}
                                className="flex flex-1 flex-col items-center justify-between py-1 text-center"
                              >
                                <span className="bg-[var(--gr-accent)] text-[#14161B] grid size-8 place-items-center rounded-full">
                                  <Check aria-hidden="true" className="size-4" strokeWidth={3} />
                                </span>
                                <div>
                                  <p className="text-[13.5px] font-bold leading-tight">
                                    100/100 Lighthouse Ready
                                  </p>
                                  <p className="text-[var(--gr-grey)] mt-0.5 text-[10px]">
                                    {activeTier.stack} · Ready to start
                                  </p>
                                </div>
                                <div className="flex w-full items-center justify-between rounded-[10px] bg-[var(--gr-panel)] px-2.5 py-1.5">
                                  <span className="text-[10px] font-semibold">Rate spec</span>
                                  <span className="flex gap-0.5">
                                    {Array.from({ length: 5 }, (_, i) => (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => setRating(i + 1)}
                                        aria-label={`${i + 1} stars`}
                                      >
                                        <Star
                                          className={cn(
                                            'size-3.5',
                                            i < rating
                                              ? 'fill-[var(--gr-accent)] text-[var(--gr-accent)]'
                                              : 'text-[var(--gr-ink)]/20',
                                          )}
                                        />
                                      </button>
                                    ))}
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>

        {/* Left Copy Column */}
        <div className="gr-frame gr-layout pointer-events-none relative">
          <div className="gr-inset w-full">
            <div ref={copyRef} className="gr-container">
              <div className="gr-copy pointer-events-auto relative z-10 flex flex-col items-start">
                {/* Live Studio Ticker */}
                <motion.p
                  initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE_OUT }}
                  className="gr-ticker flex items-center gap-2.5 rounded-[12px] py-1.5 pr-3.5 pl-1.5 text-[12.5px]"
                >
                  <span className="gr-ticker-tag flex items-center gap-1.5 rounded-[8px] px-2 py-1 text-[10px] font-bold tracking-[0.12em]">
                    <span aria-hidden="true" className="gr-live-dot" />
                    LIVE
                  </span>
                  <span className="text-[var(--gr-ink)]/75">
                    <span className="text-[var(--gr-ink)] font-semibold">
                      <LiveCounter value={currentCity.builds} />
                    </span>{' '}
                    <span className="hidden sm:inline">sites engineered for clients in </span>
                    <span className="sm:hidden">builds in </span>
                    <span className="relative inline-grid overflow-hidden align-bottom">
                      {STUDIO_CITIES.map((c) => (
                        <span
                          key={c.name}
                          aria-hidden="true"
                          className="invisible col-start-1 row-start-1 font-semibold"
                        >
                          {c.name}
                        </span>
                      ))}
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={currentCity.name}
                          initial={{ y: '100%', opacity: 0 }}
                          animate={{ y: '0%', opacity: 1 }}
                          exit={{ y: '-100%', opacity: 0 }}
                          transition={{ duration: 0.4, ease: EASE_OUT }}
                          className="text-[var(--gr-ink)] col-start-1 row-start-1 inline-block font-semibold"
                        >
                          {currentCity.name}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </span>
                </motion.p>

                {/* 2-Line Editorial Headline */}
                <h1 id="gr-title" className="gr-title font-display mt-5 font-semibold text-[var(--gr-ink)]">
                  {locale === 'en' ? (
                    <>
                      <span className="block overflow-hidden pb-[0.06em]">
                        <motion.span
                          initial={prefersReduced ? false : { y: '100%' }}
                          animate={{ y: '0%' }}
                          transition={{ duration: 0.85, delay: 0.06, ease: EASE_OUT }}
                          className="block"
                        >
                          Websites designed
                        </motion.span>
                      </span>
                      <span className="sr-only">{t('title')}</span>
                      <span
                        aria-hidden="true"
                        className="gr-title-line text-[var(--gr-accent)] block min-h-[1em] pb-[0.08em]"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <Phrase key={HERO_PHRASES[phraseIdx]} text={HERO_PHRASES[phraseIdx]} />
                        </AnimatePresence>
                      </span>
                    </>
                  ) : (
                    <motion.span
                      initial={prefersReduced ? false : { opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.75, ease: EASE_OUT }}
                      className="block"
                    >
                      {t('title')}
                    </motion.span>
                  )}
                </h1>

                <motion.p
                  initial={prefersReduced ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.16, ease: EASE_OUT }}
                  className="text-[var(--gr-ink)]/70 mt-4 max-w-[30rem] text-[15.5px] leading-[1.6] sm:text-[17px]"
                >
                  {t('subtitle')}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.24, ease: EASE_OUT }}
                  className="mt-7 flex w-full flex-wrap items-center gap-3 sm:w-auto"
                >
                  <VantraButton href="/contact" variant="dark" hoverLabel="Get fixed quote">
                    {t('primaryCta')}
                  </VantraButton>

                  <Link href="/portfolio" className="gr-ghost gr-focus group">
                    <Globe2 aria-hidden="true" className="size-[17px]" />
                    <span>{t('secondaryCta')}</span>
                  </Link>
                </motion.div>

                {/* Launch Verification Badge */}
                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: EASE_OUT }}
                  className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] text-[var(--gr-ink)]/60"
                >
                  <LaunchBadge theme="auto" variant="compact" className="scale-90 origin-left" />
                </motion.div>

                {/* Avatar Stack + 5 Animated Stars + Lighthouse Stat */}
                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.36, ease: EASE_OUT }}
                  className="mt-6 flex items-center gap-4"
                >
                  <span className="flex">
                    {CLIENT_AVATARS.map((avatar, idx) => (
                      <Image
                        key={avatar.name}
                        src={avatar.src}
                        alt={avatar.name}
                        width={40}
                        height={40}
                        style={{ zIndex: CLIENT_AVATARS.length - idx }}
                        className="gr-rider relative -ml-2.5 size-9 rounded-full object-cover first:ml-0"
                      />
                    ))}
                  </span>

                  <span className="leading-tight">
                    <span className="flex items-center gap-1.5">
                      <span className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, idx) => (
                          <motion.span
                            key={idx}
                            initial={prefersReduced ? false : { scale: 0.4, opacity: 0.3 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 480,
                              damping: 18,
                              delay: prefersReduced ? 0 : 0.45 + idx * 0.06,
                            }}
                          >
                            <Star
                              aria-hidden="true"
                              className="size-3.5 fill-[var(--gr-accent)] text-[var(--gr-accent)]"
                            />
                          </motion.span>
                        ))}
                      </span>
                      <span className="text-[var(--gr-ink)] text-[13.5px] font-bold">5.0</span>
                    </span>
                    <span className="text-[var(--gr-ink)]/65 text-[12px] whitespace-nowrap">
                      Verified client rating
                    </span>
                  </span>

                  <span aria-hidden="true" className="bg-[var(--gr-ink)]/12 hidden h-8 w-px sm:block" />

                  <span className="hidden leading-tight whitespace-nowrap sm:block">
                    <span className="text-[var(--gr-ink)] block text-[14.5px] font-bold">
                      100/100
                    </span>
                    <span className="text-[var(--gr-ink)]/65 text-[12px]">Lighthouse SLA</span>
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}
