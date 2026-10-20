import { getTranslations, setRequestLocale } from 'next-intl/server'
import { InquiriesTable } from '@/components/admin/inquiries-table'
import { listInquiries } from '@/lib/supabase/queries'
import { requireAdmin } from '@/lib/supabase/auth'

export default async function AdminInquiriesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // CMS and lead routes stay admin-only: an agent belongs in the orders console.
  await requireAdmin(locale)

  const t = await getTranslations('Admin.inquiries')
  const inquiries = await listInquiries()

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <InquiriesTable inquiries={inquiries} locale={locale} />
    </div>
  )
}
