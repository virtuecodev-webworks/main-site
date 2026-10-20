import { Plus } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { ProjectsTable } from '@/components/admin/projects-table'
import { listAllProjects } from '@/lib/supabase/queries'
import { requireAdmin } from '@/lib/supabase/auth'

export default async function AdminPortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // CMS and lead routes stay admin-only: an agent belongs in the orders console.
  await requireAdmin(locale)

  const t = await getTranslations('Admin.portfolio')
  const projects = await listAllProjects()

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        <Button asChild variant="gold" size="default">
          <Link href="/admin/portfolio/new">
            <Plus className="size-4" />
            {t('new')}
          </Link>
        </Button>
      </header>

      <ProjectsTable projects={projects} locale={locale} />
    </div>
  )
}
