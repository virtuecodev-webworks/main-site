import { getTranslations, setRequestLocale } from 'next-intl/server'
import { DesignEditor } from '@/components/admin/design-editor'
import { getSiteDesign } from '@/lib/design/read'
import { requireAdmin } from '@/lib/supabase/auth'

export default async function AdminDesignPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  // One design serves the marketing site, the client portal and this console,
  // so it is a studio-wide decision rather than an operational one: admins only.
  await requireAdmin(locale)

  const t = await getTranslations('Admin.design')
  const design = await getSiteDesign()

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{t('subtitle')}</p>
      </header>

      <DesignEditor design={design} />
    </div>
  )
}
