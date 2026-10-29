'use client'

import * as React from 'react'
import { Save } from 'lucide-react'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MediaUploader } from './media-uploader'
import { useRouter } from '@/i18n/navigation'
import { saveProject } from '@/lib/actions/projects'
import { IDLE_STATE } from '@/lib/actions/state'
import { PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/constants'
import type { Project } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

export interface ProjectFormProps {
  project?: Project | null
  className?: string
}

/** Create / edit form for a portfolio item. */
export function ProjectForm({ project, className }: ProjectFormProps) {
  const t = useTranslations('Admin.projectForm')
  const tPortfolio = useTranslations('Portfolio')
  const tErrors = useTranslations('Admin.errors')
  const router = useRouter()

  const [state, action, pending] = React.useActionState(saveProject, IDLE_STATE)

  const isNew = !project?.id
  const isLiveInitial = isNew
    ? true
    : Boolean(project?.live_url && project.live_url !== 'hidden')
  const [showLiveSite, setShowLiveSite] = React.useState(isLiveInitial)

  const [category, setCategory] = React.useState<ProjectCategory>(project?.category ?? 'custom')
  const [featured, setFeatured] = React.useState(project?.featured ?? false)
  const [published, setPublished] = React.useState(project?.published ?? false)
  const handled = React.useRef<unknown>(null)

  React.useEffect(() => {
    if (handled.current === state || state.status === 'idle') return
    handled.current = state

    if (state.status === 'success') {
      toast.success(t('saved'))
      if (isNew && state.projectId) {
        router.replace(`/admin/portfolio/${state.projectId}/edit`)
      } else {
        router.refresh()
      }
      return
    }

    if (state.status === 'error') {
      toast.error(
        state.message === 'duplicate-slug'
          ? 'That URL slug is already in use.'
          : state.message === 'unauthorised'
            ? tErrors('unauthorised')
            : state.message === 'not-configured'
              ? tErrors('notConfigured')
              : tErrors('saveFailed'),
      )
    }
  }, [state, isNew, router, t, tErrors])

  const fieldErrors = state.status === 'error' ? (state.fieldErrors ?? {}) : {}

  return (
    <form action={action} className={cn('flex flex-col gap-6', className)}>
      {project?.id ? <input type="hidden" name="id" value={project.id} /> : null}

      <section className="surface flex flex-col gap-5 p-6">
        <h2 className="text-base font-semibold">{isNew ? t('createTitle') : t('editTitle')}</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t('title')} name="title" errors={fieldErrors.title} required>
            <Input
              id="pf-title"
              name="title"
              defaultValue={project?.title ?? ''}
              required
              minLength={3}
              maxLength={160}
            />
          </Field>

          <Field label={t('slug')} name="slug" hint={t('slugHint')} errors={fieldErrors.slug}>
            <Input
              id="pf-slug"
              name="slug"
              defaultValue={project?.slug ?? ''}
              maxLength={160}
              placeholder="my-project-slug"
            />
          </Field>

          <Field label={`${t('client')}`} name="client" errors={fieldErrors.client}>
            <Input id="pf-client" name="client" defaultValue={project?.client ?? ''} maxLength={140} />
          </Field>

          <Field label={t('category')} name="category" errors={fieldErrors.category} required>
            <Select value={category} onValueChange={(value) => setCategory(value as ProjectCategory)}>
              <SelectTrigger id="pf-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {tPortfolio(`filters.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="category" value={category} />
          </Field>
        </div>

        <Field label={t('summary')} name="summary" errors={fieldErrors.summary}>
          <Input
            id="pf-summary"
            name="summary"
            defaultValue={project?.summary ?? ''}
            maxLength={320}
          />
        </Field>

        <Field label={t('description')} name="description" errors={fieldErrors.description}>
          <Textarea
            id="pf-description"
            name="description"
            rows={6}
            defaultValue={project?.description ?? ''}
            maxLength={6000}
          />
        </Field>
      </section>

      <section className="surface flex flex-col gap-5 p-6">
        <h2 className="text-base font-semibold">Live Preview &amp; Links</h2>

        {/* Live Site Visibility Toggle */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-5">
          <ToggleRow
            id="pf-showLiveSite"
            label="Show 'Open Live Interactive Site' Button"
            checked={showLiveSite}
            onChange={setShowLiveSite}
            name="showLiveSite"
          />
          <p className="text-[12.5px] text-muted-foreground leading-relaxed">
            {showLiveSite
              ? 'Active: The gold "Open Live Interactive Site ↗" button will be visible to visitors on this portfolio project page.'
              : 'Hidden: The live interactive site button will be completely hidden from visitors on the public portfolio page.'}
          </p>

          {showLiveSite && (
            <div className="mt-2 border-t border-border pt-4">
              <Field
                label="Custom Live Website URL (Optional)"
                name="liveUrl"
                hint="Leave empty to automatically launch the built-in interactive showcase (/showcase/[slug]), or provide a custom client website URL (https://...)."
                errors={fieldErrors.liveUrl}
              >
                <Input
                  id="pf-liveUrl"
                  name="liveUrl"
                  defaultValue={project?.live_url === 'hidden' ? '' : (project?.live_url ?? '')}
                  placeholder="https://example.com or /showcase/your-slug"
                  maxLength={500}
                />
              </Field>
            </div>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t('repoUrl')} name="repoUrl" errors={fieldErrors.repoUrl}>
            <Input
              id="pf-repoUrl"
              name="repoUrl"
              type="url"
              defaultValue={project?.repo_url ?? ''}
              placeholder="https://"
              maxLength={500}
            />
          </Field>

          <Field label={t('techTags')} name="techTags" hint={t('techTagsHint')} errors={fieldErrors.techTags}>
            <Input
              id="pf-techTags"
              name="techTags"
              defaultValue={(project?.tech_tags ?? []).join(', ')}
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <MediaUploader
            name="coverImagePath"
            label={t('cover')}
            hint={t('coverHint')}
            maxFiles={1}
            initialPaths={project?.cover_image_path ? [project.cover_image_path] : []}
          />

          <MediaUploader
            name="galleryPaths"
            label={t('gallery')}
            hint={t('coverHint')}
            maxFiles={8}
            initialPaths={project?.gallery_paths ?? []}
          />
        </div>
      </section>

      <section className="surface flex flex-col gap-6 p-6">
        <ToggleRow
          id="pf-featured"
          label={t('featured')}
          checked={featured}
          onChange={setFeatured}
          name="featured"
        />
        <ToggleRow
          id="pf-published"
          label={t('publishedLabel')}
          checked={published}
          onChange={setPublished}
          name="published"
        />

        <div className="grid gap-5 sm:max-w-xs">
          <Field label={t('sortOrder')} name="sortOrder" errors={fieldErrors.sortOrder}>
            <Input
              id="pf-sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              max={9999}
              defaultValue={project?.sort_order ?? 0}
            />
          </Field>
        </div>

        <div className="flex justify-end border-t border-border pt-5">
          <Button type="submit" variant="gold" size="lg" disabled={pending}>
            {pending ? (
              <>
                <VirtueSpinner className="size-4" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="size-4" />
                {isNew ? t('create') : t('save')}
              </>
            )}
          </Button>
        </div>
      </section>
    </form>
  )
}

function ToggleRow({
  id,
  label,
  checked,
  onChange,
  name,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  name: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-muted-foreground">{checked ? 'On' : 'Off'}</span>
        <Switch id={id} checked={checked} onCheckedChange={onChange} />
        <input type="hidden" name={name} value={checked ? 'true' : 'false'} />
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  hint,
  errors,
  required,
  children,
}: {
  label: string
  name: string
  hint?: string
  errors?: string[]
  required?: boolean
  children: React.ReactNode
}) {
  const invalid = Boolean(errors?.length)

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`pf-${name}`} className={cn(invalid && 'text-destructive')}>
        {label}
        {required ? <span className="text-gold-600">*</span> : null}
      </Label>
      {children}
      {hint && !invalid ? <p className="text-[11.5px] text-muted-foreground">{hint}</p> : null}
      {invalid ? (
        <p className="text-[11.5px] text-destructive" role="alert">
          {errors?.join(' ')}
        </p>
      ) : null}
    </div>
  )
}
