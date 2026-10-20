import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PortalNav } from '@/components/portal/portal-nav'
import { requireClient } from '@/lib/supabase/auth'

// Reads the session cookie on every request.
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Portal' })
  return { title: t('title'), robots: { index: false, follow: false } }
}

/**
 * Client portal shell.
 *
 * Staff are redirected out by `requireClient` — an agent opening `/portal` wants
 * the orders console, not a client's view of their own project.
 */
export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await requireClient(locale)

  return (
    <div className="min-h-dvh bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8 lg:py-10">
        <PortalNav locale={locale} name={session.name} email={session.email} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
