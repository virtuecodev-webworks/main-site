import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { absoluteUrl } from '@/lib/utils'

/** Public marketing routes that belong in the index. */
const PATHS = [
  '/',
  '/services',
  '/portfolio',
  '/about',
  '/blog',
  '/contact',
  '/payment',
  '/privacy',
  '/terms',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return routing.locales.flatMap((locale) =>
    PATHS.map((path) => {
      const suffix = path === '/' ? '' : path
      const languages = Object.fromEntries(
        routing.locales.map((code) => [code, absoluteUrl(`/${code}${suffix}`)]),
      )

      return {
        url: absoluteUrl(`/${locale}${suffix}`),
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: path === '/' ? 1 : 0.7,
        alternates: { languages },
      }
    }),
  )
}
