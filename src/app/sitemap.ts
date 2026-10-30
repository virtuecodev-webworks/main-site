import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { absoluteUrl } from '@/lib/utils'
import { PLACEHOLDER_PROJECTS } from '@/lib/portfolio'
import { PLACEHOLDER_POSTS } from '@/lib/content'

/** Public core marketing routes that belong in the index. */
const CORE_PATHS = [
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

  const projectPaths = PLACEHOLDER_PROJECTS.map((project) => `/portfolio/${project.slug}`)
  const showcasePaths = PLACEHOLDER_PROJECTS.map((project) => `/showcase/${project.slug}`)
  const blogPaths = PLACEHOLDER_POSTS.map((post) => `/blog/${post.slug}`)

  const allEntries = [
    ...CORE_PATHS.map((path) => ({
      path,
      priority: path === '/' ? 1.0 : 0.8,
      changeFrequency: 'weekly' as const,
    })),
    ...projectPaths.map((path) => ({
      path,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    })),
    ...showcasePaths.map((path) => ({
      path,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    })),
    ...blogPaths.map((path) => ({
      path,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    })),
  ]

  return routing.locales.flatMap((locale) =>
    allEntries.map(({ path, priority, changeFrequency }) => {
      const suffix = path === '/' ? '' : path
      const languages: Record<string, string> = Object.fromEntries(
        routing.locales.map((code) => [code, absoluteUrl(`/${code}${suffix}`)]),
      )
      languages['x-default'] = absoluteUrl(`/${routing.defaultLocale}${suffix}`)

      return {
        url: absoluteUrl(`/${locale}${suffix}`),
        lastModified,
        changeFrequency,
        priority,
        alternates: { languages },
      }
    }),
  )
}
