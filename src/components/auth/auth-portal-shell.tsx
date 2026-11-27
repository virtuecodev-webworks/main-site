'use client'

import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { VirtueMark } from '@/components/brand/virtue-mark'
import { VirtueWordmark } from '@/components/brand/virtue-wordmark'
import { ThemeToggle } from '@/components/theme/theme-toggle'

const RING_SIZES = [300, 372, 452, 542, 644, 758, 884, 1000] as const

interface AuthPortalContextValue {
  setHovering: (value: boolean) => void
}

const AuthPortalContext = React.createContext<AuthPortalContextValue>({
  setHovering: () => {},
})

export function useAuthPortalHover() {
  return React.useContext(AuthPortalContext)
}

export interface AuthPortalShellProps {
  title: string
  subtitle: string
  mode?: 'login' | 'signup' | 'recovery'
  children: React.ReactNode
}

/**
 * Concentric orbital auth portal shell styled in Virtue & Co. Webworks
 * Deep Ink (#0a0a0a), Warm Bone (#f5f4f0), and Rich Gold (#dcaa28).
 */
export function AuthPortalShell({
  title,
  subtitle,
  mode = 'login',
  children,
}: AuthPortalShellProps) {
  const portalRef = React.useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = React.useState(false)

  React.useEffect(() => {
    const portal = portalRef.current
    if (!portal) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    let frame = 0
    let px = 0
    let py = 0
    let targetX = 0
    let targetY = 0

    const handlePointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth) * 2 - 1
      targetY = (event.clientY / window.innerHeight) * 2 - 1
    }

    const animate = () => {
      px += (targetX - px) * 0.05
      py += (targetY - py) * 0.05

      portal.style.setProperty('--tx', `${px * -14}px`)
      portal.style.setProperty('--ty', `${py * -10}px`)

      frame = requestAnimationFrame(animate)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    frame = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  const contextValue = React.useMemo(() => ({ setHovering }), [])

  return (
    <AuthPortalContext.Provider value={contextValue}>
      <div
        ref={portalRef}
        className={`virtue-auth ${hovering ? 'is-hovering' : ''}`}
      >
        {/* Background Gold Glow */}
        <div className="virtue-auth-glow" aria-hidden="true" />

        {/* Concentric Orbital Rings */}
        <svg
          className="virtue-auth-rings"
          viewBox="0 0 2000 2000"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="virtue-arc-gradient"
              gradientUnits="userSpaceOnUse"
              x1="300"
              y1="300"
              x2="1700"
              y2="1700"
            >
              <stop stopColor="#e8bb3f" />
              <stop offset="0.55" stopColor="#dcaa28" />
              <stop offset="1" stopColor="#8a6608" />
            </linearGradient>
          </defs>

          <circle className="wave" cx="1000" cy="1000" r="300" />
          <circle className="wave wave-b" cx="1000" cy="1000" r="300" />

          {RING_SIZES.map((radius, index) => {
            const length = 9 + (index % 3) * 5
            return (
              <React.Fragment key={radius}>
                <circle className="base" cx="1000" cy="1000" r={radius} />
                <circle
                  className={`arc ${index % 2 ? 'reverse' : ''}`}
                  cx="1000"
                  cy="1000"
                  r={radius}
                  pathLength="100"
                  strokeDasharray={`${length} ${100 - length}`}
                  style={
                    {
                      '--duration': `${38 + index * 12}s`,
                      animationDelay: `${-index * 7.3}s`,
                    } as React.CSSProperties
                  }
                />
              </React.Fragment>
            )
          })}
        </svg>

        {/* Top Bar */}
        <header className="virtue-auth-top">
          <Link href="/" aria-label="Virtue & Co. Webworks Home">
            <VirtueWordmark />
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle
              label="Toggle theme"
              className="size-9 rounded-full border border-border bg-card/75 backdrop-blur-md"
            />
            <div className="virtue-auth-join">
              {mode === 'login' ? (
                <>
                  <span>New to Virtue &amp; Co.?</span>
                  <Link href="/signup">
                    Create account
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </>
              ) : mode === 'signup' ? (
                <>
                  <span>Already have an account?</span>
                  <Link href="/login">
                    Sign in
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </>
              ) : (
                <>
                  <span>Remembered your password?</span>
                  <Link href="/login">
                    Back to sign in
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Center Portal Column */}
        <main className="virtue-auth-col">
          <div className="virtue-auth-mark virtue-auth-rise">
            <VirtueMark className="size-12" animate={false} />
          </div>

          <h1 className="virtue-auth-title virtue-auth-rise virtue-auth-rise-1">
            {title}
          </h1>
          <p className="virtue-auth-sub virtue-auth-rise virtue-auth-rise-2">
            {subtitle}
          </p>

          <div className="virtue-auth-body virtue-auth-rise virtue-auth-rise-3">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="virtue-auth-foot">
          <span>Virtue &amp; Co. Webworks · Private Client Portal</span>
          <nav aria-label="Legal and support">
            <Link href="/contact">Need assistance?</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </footer>
      </div>
    </AuthPortalContext.Provider>
  )
}
