import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { VirtueWordmark } from '@/components/brand/virtue-wordmark'
import { PHOTOS } from '@/lib/photos'

/**
 * Calm, Simple, Client-Friendly Auth Shell.
 * Free of developer jargon and complex security technicalities.
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
    <main className="min-h-dvh bg-background p-3 sm:p-5 font-sans">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] sm:min-h-[calc(100dvh-2.5rem)] max-w-6xl grid-cols-1 overflow-hidden rounded-[24px] border border-border bg-card shadow-xl lg:grid-cols-12">
        {/* Left 5 Columns: Calm Dark Studio Panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0a0a0a] p-10 text-[#f5f4f0] lg:col-span-5 lg:flex">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
            <Image
              src={PHOTOS.studio}
              alt=""
              fill
              priority
              sizes="50vw"
              className="object-cover opacity-35"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.4) 45%, rgba(10,10,10,0.96) 100%)',
              }}
            />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <Link href="/">
              <VirtueWordmark tone="invert" />
            </Link>
          </div>

          <div className="relative z-10 my-auto max-w-md">
            <h2 className="font-display text-2xl font-semibold leading-tight text-[#f5f4f0] sm:text-3xl">
              Welcome to your client workspace.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#f5f4f0]/70">
              Track project milestones, review live designs, and manage your invoices in one calm, private space.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-[#f5f4f0]/60">
            <span>Private Client Portal</span>
            <span className="font-mono">Virtue &amp; Co.</span>
          </div>
        </div>

        {/* Right 7 Columns: Simple, Clean Form */}
        <div className="flex flex-col justify-between p-6 sm:p-12 lg:col-span-7 lg:p-14">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to home</span>
            </Link>
            <div className="lg:hidden">
              <VirtueWordmark descriptor={false} />
            </div>
          </div>

          <div className="mx-auto my-auto w-full max-w-sm py-8">
            <div className="mb-7">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            </div>

            {children}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-5 text-xs text-muted-foreground">
            <span>Virtue &amp; Co. Webworks</span>
            <Link href="/contact" className="hover:text-foreground underline underline-offset-4">
              Need assistance?
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
