import Image from 'next/image'
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmSubmit } from './confirm-submit'
import { deleteProject, setProjectPublished } from '@/lib/actions/projects'
import { publicMediaUrl } from '@/lib/supabase/env'
import { CATEGORY_STYLES } from '@/lib/studio'
import type { Project } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

export async function ProjectsTable({
  projects,
  locale,
}: {
  projects: Project[]
  locale: string
}) {
  const t = await getTranslations('Admin.portfolio')
  const tPortfolio = await getTranslations('Portfolio')

  if (!projects.length) {
    return (
      <div className="surface flex flex-col items-center gap-4 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">{tPortfolio('emptyAdminHint')}</p>
        <Button asChild variant="gold" size="sm">
          <Link href="/admin/portfolio/new">
            <Plus className="size-4" />
            {t('new')}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="surface overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('title')}</TableHead>
            <TableHead className="hidden lg:table-cell">{tPortfolio('services')}</TableHead>
            <TableHead>{t('published')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('updated')}</TableHead>
            <TableHead className="text-right">{t('edit')}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {projects.map((project) => {
            const cover = publicMediaUrl(project.cover_image_path)
            return (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      {cover ? (
                        <Image src={cover} alt="" fill sizes="40px" unoptimized className="object-cover" />
                      ) : (
                        <span className="grid size-full place-items-center text-[11px] font-semibold text-muted-foreground">
                          {project.title.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">{project.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-[11px] text-muted-foreground">
                          /{project.slug}
                        </span>
                        {project.live_url && project.live_url !== 'hidden' ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-gold-500/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-gold-700 dark:text-gold-300">
                            Live Button Visible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                            Live Button Hidden
                          </span>
                        )}
                      </div>
                    </span>
                  </div>
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  <Badge className={cn('border', CATEGORY_STYLES[project.category])}>
                    {tPortfolio(`filters.${project.category}`)}
                  </Badge>
                </TableCell>

                <TableCell>
                  <form action={setProjectPublished}>
                    <input type="hidden" name="id" value={project.id} />
                    <input type="hidden" name="next" value={project.published ? 'false' : 'true'} />
                    <button
                      type="submit"
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                        project.published
                          ? 'border-gold-500/40 bg-gold-500/12 text-gold-800 hover:bg-gold-500/20'
                          : 'border-border bg-muted text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {project.published ? t('published') : t('draft')}
                    </button>
                  </form>
                </TableCell>

                <TableCell className="hidden text-[12.5px] text-muted-foreground md:table-cell">
                  {new Date(project.updated_at).toLocaleDateString(locale, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-end gap-1.5">
                    {project.live_url ? (
                      <Button asChild variant="ghost" size="icon-sm" aria-label={tPortfolio('viewLive')}>
                        <a href={project.live_url} target="_blank" rel="noreferrer noopener">
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>
                    ) : null}

                    <Button asChild variant="ghost" size="icon-sm" aria-label={t('edit')}>
                      <Link href={`/admin/portfolio/${project.id}/edit`}>
                        <Pencil className="size-3.5" />
                      </Link>
                    </Button>

                    <form action={deleteProject}>
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="locale" value={locale} />
                      <ConfirmSubmit
                        variant="ghost"
                        size="icon-sm"
                        message={t('deleteConfirm')}
                        aria-label={t('delete')}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </ConfirmSubmit>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
