import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AdminNav } from '@/components/admin/admin-nav'
import { AppInstallAdvisor } from '@/components/pwa/app-install-advisor'
import { requireStaff } from '@/lib/supabase/auth'

// The gate below reads the request cookie jar, which is only available per
// request. Force dynamic rendering so the session check always runs at runtime
// even when the build environment has no Supabase env vars configured.
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Admin' })
  return { title: t('metaTitle'), robots: { index: false, follow: false } }
}

/**
 * Staff shell.
 *
 * Agents get in here too, because the orders console lives under `/admin` and
 * agents are the people who use it. The console itself shows them only the work
 * assigned to them — enforced by Row Level Security rather than by this layout.
 * The CMS routes are held to admins individually, in the pages that own them.
 */
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await requireStaff(locale)

  return (
    <AdminNav
      locale={locale}
      email={session.email}
      isAdmin={session.isAdmin}
      name={session.name}
    >
      <div className="flex flex-col gap-5">
        <AppInstallAdvisor className="w-full" />
        {children}
      </div>
    </AdminNav>
  )
}
