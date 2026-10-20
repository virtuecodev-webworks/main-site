import { getTranslations } from 'next-intl/server'
import { Timeline, type TimelineItem } from '@/components/ui/timeline'
import { PHOTOS } from '@/lib/photos'

/** The five authored stages, in order. Kept as a tuple so the copy is exhaustive. */
const STEPS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const

/**
 * "How a project runs" — the home page's process story.
 *
 * The copy lives in the message catalogue and is resolved on the server, so the
 * client component receives plain strings and stays purely presentational.
 */
export async function ProjectJourney({ className }: { className?: string }) {
  const t = await getTranslations('Home.journey')
  const tPhotos = await getTranslations('Photos')

  const items: TimelineItem[] = STEPS.map((step) => ({
    id: step,
    label: t(`${step}Title`),
    content: t(`${step}Body`),
  }))

  return (
    <Timeline
      className={className}
      eyebrow={t('eyebrow')}
      title={t('title')}
      subtitle={t('subtitle')}
      imageUrl={PHOTOS.process}
      imageAlt={tPhotos('process.alt')}
      items={items}
    />
  )
}
