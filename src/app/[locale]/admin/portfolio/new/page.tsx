import { ArrowLeft } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ProjectForm } from '@/components/admin/project-form'
import { requireAdmin } from '@/lib/supabase/auth'

export default async function NewProjectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  // CMS and lead routes stay admin-only: an agent belongs in the orders console.
  await requireAdmin(locale)

  const t = await getTranslations('Admin.portfolio')

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-3">
        <Link
          href="/admin/portfolio"
          className="inline-flex items-center gap-2 text-[12.5px] text-muted-foreground transition-colors hover:text-gold-700"
        >
          <ArrowLeft className="size-3.5" />
          {t('title')}
        </Link>
        <h1 className="text-2xl font-semibold">{t('new')}</h1>
      </header>

      <ProjectForm />
    </div>
  )
}
