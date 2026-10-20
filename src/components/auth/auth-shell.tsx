import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { VirtueWordmark } from '@/components/brand/virtue-wordmark'
import { AmbientBackground } from '@/components/brand/ambient-background'

/**
 * Frame shared by sign-in and sign-up.
 *
 * Both screens sit outside the marketing shell — no header, no footer, and no
 * cookie notice over the form — so the dark panel and the way back to the site
 * are defined once here rather than in each page.
 */
export async function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  const tNav = await getTranslations('Nav')

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-background px-5 py-16 font-sans">
      {/* Subtle ambient grid backdrop & rotating architectural logo wireframe */}
      <div
        aria-hidden
        className="grid-backdrop pointer-events-none absolute inset-0 opacity-25 [mask-image:radial-gradient(circle_at_50%_50%,#000_60%,transparent_100%)]"
      />
      <AmbientBackground size="xl" speed={160} align="center" opacity={0.45} />

      <div className="relative w-full max-w-md">
        <div className="flex justify-center">
          <VirtueWordmark className="items-center text-[26px]" />
        </div>

        <div className="surface mt-8 flex flex-col gap-6 p-7 shadow-elevation-3 sm:p-8 rounded-2xl border border-border">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12.5px] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            {tNav('home')}
          </Link>
        </div>
      </div>
    </main>
  )
}
