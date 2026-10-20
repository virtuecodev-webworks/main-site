import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ProjectForm } from '@/components/admin/project-form'
import { getProjectById } from '@/lib/supabase/queries'
import { requireAdmin } from '@/lib/supabase/auth'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)

  // CMS and lead routes stay admin-only: an agent belongs in the orders console.
  await requireAdmin(locale)

  const project = await getProjectById(id)
  if (!project) notFound()

  const t = await getTranslations('Admin.projectForm')

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-3">
        <Link
          href="/admin/portfolio"
          className="inline-flex items-center gap-2 text-[12.5px] text-muted-foreground transition-colors hover:text-gold-700"
        >
          <ArrowLeft className="size-3.5" />
          {t('editTitle')}
        </Link>
        <h1 className="text-2xl font-semibold">{project.title}</h1>
      </header>

      <ProjectForm project={project} />
    </div>
  )
}
