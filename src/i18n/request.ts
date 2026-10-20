import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

/**
 * Messages are statically imported (rather than dynamically) so that every
 * locale is bundled deterministically and Turbopack can tree-shake unused ones.
 */
const messages = {
  en: () => import('../messages/en.json').then((m) => m.default),
  fr: () => import('../messages/fr.json').then((m) => m.default),
  es: () => import('../messages/es.json').then((m) => m.default),
  de: () => import('../messages/de.json').then((m) => m.default),
  ar: () => import('../messages/ar.json').then((m) => m.default),
} satisfies Record<string, () => Promise<unknown>>

type Messages = Record<string, unknown>

function isPlainObject(value: unknown): value is Messages {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Merges the active locale over the default locale.
 *
 * The default locale is the base and the active locale overrides it, so a key
 * that exists only in English still renders real copy in every language instead
 * of printing a raw message path. Arrays are replaced wholesale — they are
 * content, not containers to be merged element-wise.
 */
function mergeMessages(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base }

  for (const [key, value] of Object.entries(override)) {
    const existing = out[key]
    out[key] =
      isPlainObject(existing) && isPlainObject(value)
        ? mergeMessages(existing, value)
        : value
  }

  return out
}

export default getRequestConfig(async ({ locale }) => {
  /**
   * `locale` is only populated for edge cases (e.g. an explicit override).
   * The normal source in Next.js 16 is the `[locale]` root param, which
   * `resolveLocale()` reads. Both paths are guarded so route handlers and
   * non-localised routes never crash the request.
   */
  const resolved = locale && hasLocale(routing.locales, locale) ? locale : await resolveLocale()

  const base = (await messages[routing.defaultLocale]()) as Messages
  const active =
    resolved === routing.defaultLocale ? base : ((await messages[resolved]()) as Messages)

  return {
    locale: resolved,
    messages: resolved === routing.defaultLocale ? base : mergeMessages(base, active),
    timeZone: 'UTC',
    now: new Date(),
    formats: {
      dateTime: {
        long: { day: 'numeric', month: 'long', year: 'numeric' },
        short: { day: '2-digit', month: 'short', year: 'numeric' },
      },
      number: {
        currency: { style: 'currency', currency: 'USD' },
      },
    },
    onError(error) {
      // Missing keys shouldn't take down a marketing page in production.
      if (process.env.NODE_ENV !== 'production') console.warn('[next-intl]', error.message)
    },
    getMessageFallback({ key, namespace }) {
      return process.env.NODE_ENV === 'production'
        ? (namespace ? `${namespace}.${key}` : key)
        : `⚠ ${namespace ? `${namespace}.` : ''}${key}`
    },
  }
})

async function resolveLocale() {
  try {
    // Available by default from Next.js 16.3+. Reads the root `[locale]` param.
    const rootParams = await import('next/root-params')
    const value = await rootParams.locale()
    if (hasLocale(routing.locales, value)) return value
  } catch {
    // Route handlers and static metadata routes have no root `locale` param.
  }
  return routing.defaultLocale
}
