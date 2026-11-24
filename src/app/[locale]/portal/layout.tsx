import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PortalNav } from '@/components/portal/portal-nav'
import { AppInstallAdvisor } from '@/components/pwa/app-install-advisor'
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
    <PortalNav locale={locale} name={session.name} email={session.email}>
      <div className="flex flex-col gap-5">
        <AppInstallAdvisor className="w-full" />
        {children}
      </div>
    </PortalNav>
  )
}
