import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { loadFont } from '@remotion/fonts'
import { loadFont as loadInter } from '@remotion/google-fonts/Inter'
import {
  MARK_TILE,
  MARK_V_SCALE,
  MARK_VIEWBOX,
  VIRTUE_LEFT_WING,
  VIRTUE_RIGHT_WING,
  WORDMARK,
} from '../lib/brand/mark-geometry'
import { LOGO_INTRO_DURATION, LOGO_INTRO_FPS, type LogoIntroProps } from './timeline'

/**
 * Gropled is loaded from `public/fonts` — the very same file `next/font`
 * self-hosts for the website. The video and the site are therefore the same face
 * by construction, not by two systems happening to agree.
 */
const gropledReady = loadFont({
  family: 'Gropled',
  url: staticFile('fonts/gropled-bold.otf'),
  weight: '700',
  style: 'normal',
  format: 'opentype',
  display: 'block',
})

// A font that fails to load must not take the whole render down with it: the
// composition degrades to the system stack and says so, loudly, in the console.
gropledReady.catch((error: unknown) => {
  console.error('[LogoIntro] Gropled could not be loaded', error)
})

/** The family name Gropled is registered under. */
const GROPLED = 'Gropled'

const inter = loadInter('normal', { weights: ['500'], subsets: ['latin'] })

export { LOGO_INTRO_DURATION, LOGO_INTRO_FPS }
export type { LogoIntroProps }

/* -------------------------------------------------------------------------- */
/*  Timeline (frames @ 30fps, 120 total)                                       */
/* -------------------------------------------------------------------------- */

const TILE_IN_END = 22
const DRAW_START = 10
const DRAW_END = 44
const WORDMARK_START = 38
const RULE_START = 48
const RULE_END = 86
const SUBTITLE_START = 52
const MOTTO_START = 64
const MOTTO_END = 88

const GOLD = '#D4AF37'
const BACKDROP = '#0B0B0D'
const TILE = '#0B0B0D'
const WHITE = '#F2F2F3'
const MUTED = '#9A9AA3'

/** Gropled at display size: geometric, rounded, a single Bold weight. */
const DISPLAY: React.CSSProperties = {
  fontFamily: GROPLED,
  fontWeight: 700,
  letterSpacing: '-0.022em',
}

const DEFAULT_MOTTO = 'Websites Built For Real Growth. Shipped On A Fixed Timeline.'

/**
 * `VirtueLogoIntro`
 *
 * The high-fidelity motion graphic for both Landscape (1920x1080) and Portrait (1080x1920):
 *   1. Ambient subtle radial glow blooms softly in the center
 *   2. The charcoal foundation tile settles with spring damping
 *   3. The gold & emerald architectural "V" strokes draw themselves on
 *   4. The "Virtue & Co." wordmark rises with the bespoke gold ampersand
 *   5. The "WEBWORKS" sub-brand fades with wide letter-spacing
 *   6. The gold architectural rule expands smoothly
 *   7. The brand motto gracefully rises and holds
 */
export function LogoIntro({
  background = 'dark',
  showWordmark = true,
  showMotto = true,
  mottoText = DEFAULT_MOTTO,
}: LogoIntroProps) {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  const isPortrait = height > width
  // Normalized base scale factor:
  const scale = isPortrait ? width / 1080 : width / 1920
  const markSize = (showWordmark ? (isPortrait ? 260 : 250) : (isPortrait ? 440 : 540)) * scale

  const tileScale = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.6 },
    durationInFrames: TILE_IN_END,
  })
  const tileOpacity = interpolate(frame, [0, TILE_IN_END * 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const wordmarkProgress = spring({
    frame: frame - WORDMARK_START,
    fps,
    config: { damping: 200, mass: 0.7 },
  })

  const subtitleOpacity = interpolate(frame, [SUBTITLE_START, SUBTITLE_START + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const ruleProgress = interpolate(frame, [RULE_START, RULE_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const mottoProgress = spring({
    frame: frame - MOTTO_START,
    fps,
    config: { damping: 180, mass: 0.8 },
  })

  const glowOpacity = interpolate(frame, [0, 40, 120], [0, 0.45, 0.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: background === 'dark' ? BACKDROP : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: GROPLED,
        overflow: 'hidden',
      }}
    >
      {/* Ambient background bloom */}
      {background === 'dark' ? (
        <div
          style={{
            position: 'absolute',
            width: (isPortrait ? 800 : 1200) * scale,
            height: (isPortrait ? 800 : 1200) * scale,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(197,160,89,0.18) 0%, rgba(197,160,89,0.12) 35%, transparent 70%)`,
            opacity: glowOpacity,
            pointerEvents: 'none',
            filter: 'blur(60px)',
          }}
        />
      ) : null}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          padding: `0 ${40 * scale}px`,
        }}
      >
        <div style={{ transform: `scale(${0.92 + tileScale * 0.08})`, opacity: tileOpacity }}>
          <svg width={markSize} height={markSize} viewBox={MARK_VIEWBOX} style={{ overflow: 'visible' }}>
            <rect
              x={MARK_TILE.x}
              y={MARK_TILE.y}
              width={MARK_TILE.size}
              height={MARK_TILE.size}
              rx={MARK_TILE.radius}
              fill={TILE}
            />
            {/* Dark-mode precision hairline */}
            <rect
              x={0.5}
              y={0.5}
              width={MARK_TILE.size - 1}
              height={MARK_TILE.size - 1}
              rx={MARK_TILE.radius}
              fill="none"
              stroke="rgba(246,245,243,0.18)"
              strokeWidth={1}
            />
            <defs>
              <linearGradient id="rmt-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E8C84A" />
                <stop offset="100%" stopColor="#B8922A" />
              </linearGradient>
            </defs>
            <g
              style={{
                opacity: interpolate(frame, [DRAW_START, DRAW_END], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              <path d={VIRTUE_LEFT_WING} fill="url(#rmt-gold)" />
              <path d={VIRTUE_RIGHT_WING} fill="url(#rmt-gold)" />
            </g>
          </svg>
        </div>

        {showWordmark ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: (isPortrait ? 42 : 36) * scale,
            }}
          >
            {/* Brand Title: Virtue & Co. */}
            <div
              style={{
                ...DISPLAY,
                display: 'flex',
                alignItems: 'baseline',
                fontSize: (isPortrait ? 82 : 72) * scale,
                color: WHITE,
                lineHeight: 1,
                opacity: wordmarkProgress,
                transform: `translateY(${(1 - wordmarkProgress) * 20 * scale}px)`,
              }}
            >
              <span>{WORDMARK.lead}</span>
              <span
                style={{
                  color: GOLD,
                  fontWeight: 700,
                  fontSize: '1.12em',
                  lineHeight: 0,
                  marginInline: '0.06em',
                }}
              >
                {WORDMARK.ampersand}
              </span>
              <span>{WORDMARK.trail}</span>
            </div>

            {/* Sub-brand: WEBWORKS */}
            <div
              style={{
                fontFamily: inter.fontFamily,
                fontWeight: 500,
                color: MUTED,
                fontSize: (isPortrait ? 22 : 18) * scale,
                letterSpacing: (isPortrait ? 14 : 11) * scale,
                marginTop: (isPortrait ? 18 : 14) * scale,
                opacity: subtitleOpacity,
                textTransform: 'uppercase',
              }}
            >
              {WORDMARK.descriptor}
            </div>

            {/* Golden architectural divider */}
            <div
              style={{
                height: 2,
                width: (isPortrait ? 380 : 320) * scale * ruleProgress,
                backgroundColor: GOLD,
                marginTop: (isPortrait ? 32 : 26) * scale,
                borderRadius: 1,
                boxShadow: '0 0 12px rgba(197,160,89,0.4)',
              }}
            />

            {/* Brand Motto */}
            {showMotto && mottoText ? (
              <div
                style={{
                  fontFamily: inter.fontFamily,
                  fontWeight: 400,
                  color: '#D4D4D8',
                  fontSize: (isPortrait ? 26 : 21) * scale,
                  lineHeight: 1.45,
                  maxWidth: (isPortrait ? 760 : 880) * scale,
                  textAlign: 'center',
                  marginTop: (isPortrait ? 28 : 22) * scale,
                  letterSpacing: '0.01em',
                  opacity: Math.max(0, Math.min(1, mottoProgress)),
                  transform: `translateY(${(1 - Math.max(0, Math.min(1, mottoProgress))) * 14 * scale}px)`,
                }}
              >
                {mottoText}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  )
}
