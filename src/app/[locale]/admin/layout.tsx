import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AdminNav } from '@/components/admin/admin-nav'
import { PwaInstallBanner } from '@/components/admin/pwa-install-banner'
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
    <div className="min-h-dvh bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 lg:py-10">
        <AdminNav
          locale={locale}
          email={session.email}
          isAdmin={session.isAdmin}
          name={session.name}
        />
        <main className="min-w-0">{children}</main>
      </div>
      <PwaInstallBanner />
    </div>
  )
}
