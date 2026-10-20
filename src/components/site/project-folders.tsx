import { getTranslations } from 'next-intl/server'
import { GlassFolder } from '@/components/ui/glass-folder'
import { SectionHeading } from '@/components/site/section-heading'
import { Reveal } from '@/components/motion/reveal'

/** Fixed order, and the icon each folder opens with. */
const FOLDERS = [
  { key: 'design', icon: 'palette' },
  { key: 'build', icon: 'code' },
  { key: 'content', icon: 'search' },
  { key: 'handover', icon: 'package' },
] as const

/**
 * "What you actually get" — four folders, one per phase of the work.
 *
 * Deliberately not a project list: the grid below it already shows the work.
 * This section answers the question a buyer actually asks, which is what lands
 * in their hands at the end.
 */
export async function ProjectFolders({ className }: { className?: string }) {
  const t = await getTranslations('Portfolio.inside')

  return (
    <div className={className}>
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      <div className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
        {FOLDERS.map((folder, index) => (
          <Reveal key={folder.key} delay={index * 0.07}>
            <GlassFolder
              index={index}
              title={t(`items.${folder.key}.title`)}
              caption={t(`items.${folder.key}.caption`)}
              files={(t.raw(`items.${folder.key}.files`) as string[]) ?? []}
              icon={folder.icon}
              hint={t('hint')}
            />
          </Reveal>
        ))}
      </div>
    </div>
  )
}
