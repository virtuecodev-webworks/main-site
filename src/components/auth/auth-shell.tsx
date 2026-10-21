import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { AmbientBackground } from '@/components/brand/ambient-background'

/**
 * Frame shared by sign-in, sign-up, and password recovery.
 * Modeled after the high-contrast squircle badge & elevated card design.
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
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-background px-5 py-14 font-sans">
      {/* Radiant ambient backdrop */}
      <div
        aria-hidden
        className="grid-backdrop pointer-events-none absolute inset-0 opacity-25 [mask-image:radial-gradient(circle_at_50%_50%,#000_60%,transparent_100%)]"
      />
      <AmbientBackground size="xl" speed={160} align="center" opacity={0.35} />

      <div className="relative w-full max-w-md">
        {/* Centered Squircle Logo Badge matching email reference */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="size-16 rounded-2xl bg-zinc-950 border border-white/10 shadow-xl flex items-center justify-center p-3">
            <Image
              src="/brand/logo-mark.png"
              alt="Virtue &amp; Co."
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold-500">
              Virtue &amp; Co.
            </span>
          </div>
        </div>

        {/* Floating Auth Card */}
        <div className="surface mt-6 flex flex-col gap-6 p-7 sm:p-9 shadow-2xl rounded-3xl border border-border">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <div className="border-t border-border pt-4 text-center sm:text-left">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              {tNav('home')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
