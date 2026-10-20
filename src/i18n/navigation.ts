import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Locale-aware replacements for `next/link` and the Next.js navigation hooks.
 * Always import `Link` from here inside the `[locale]` segment so hrefs keep
 * the active locale prefix.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
