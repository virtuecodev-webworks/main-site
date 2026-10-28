import { notFound } from 'next/navigation'

/**
 * Catch-all route inside `[locale]` so any unknown URL triggers the custom
 * Vantra Studio `src/app/[locale]/not-found.tsx` boundary rather than Next.js's
 * unstyled default 404.
 */
export default function CatchAllPage() {
  notFound()
}
