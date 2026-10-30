import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/utils'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep private consoles and backend API endpoints out of crawler scope.
        // Public auth screens (/login, /signup) use <meta name="robots" content="noindex" />
        // so Googlebot can see the noindex tag cleanly without triggering robots.txt blocks.
        disallow: [
          '/api/',
          '/*/api/',
          '/admin/',
          '/*/admin/',
          '/portal/',
          '/*/portal/',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  }
}
