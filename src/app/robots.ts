import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/utils'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep the CMS, auth screens, client portal and API out of search index across every locale.
        disallow: [
          '/api/',
          '/admin',
          '/*/admin',
          '/portal',
          '/*/portal',
          '/login',
          '/*/login',
          '/signup',
          '/*/signup',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  }
}
