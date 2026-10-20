import { getTranslations } from 'next-intl/server'
import { FeaturesPanel, type FeaturePanelItem } from '@/components/ui/features-panel'
import { SERVICES } from '@/lib/studio'
import { PHOTOS } from '@/lib/photos'
import { cn } from '@/lib/utils'

/**
 * The panel keys off the service, not the icon component, because everything in
 * `FeaturePanelItem` has to survive the server → client boundary.
 */
const ICON_KEYS: Record<string, string> = {
  custom: 'code',
  wordpress: 'wordpress',
  wix: 'wix',
  ecommerce: 'cart',
}

/** One real photograph per service line — no third-party image requests. */
const IMAGES: Record<string, string> = {
  custom: PHOTOS.services,
  wordpress: PHOTOS.collaboration,
  wix: PHOTOS.heroAlt,
  ecommerce: PHOTOS.workBand,
}

/**
 * Services showcase.
 *
 * Copy is resolved here on the server and handed to the client panel as plain
 * data, which keeps `next-intl` out of the browser bundle for this section.
 */
export async function ServiceShowcase({ className }: { className?: string }) {
  const t = await getTranslations('Services')
  const tCommon = await getTranslations('Common')

  const items: FeaturePanelItem[] = SERVICES.map((service) => ({
    id: service.key,
    icon: ICON_KEYS[service.key] ?? 'boxes',
    title: t(`items.${service.key}.title`),
    description: t(`items.${service.key}.summary`),
    bullets: (t.raw(`items.${service.key}.features`) as string[]) ?? [],
    imageUrl: IMAGES[service.key] ?? PHOTOS.services,
    imageAlt: t(`items.${service.key}.imageAlt`),
    stat: { label: tCommon('techStack'), value: service.stack.join(' · ') },
  }))

  return <FeaturesPanel items={items} className={cn(className)} />
}
