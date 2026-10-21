import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { countryFromHeaders, localeFromCountry } from './lib/geo/detect'
import { COUNTRY_COOKIE, GEO_COOKIE, REGION_COOKIE_MAX_AGE } from './lib/geo/countries'

const handleI18n = createMiddleware(routing)

/** Top-level segments that require a signed-in account. */
const GUARDED = ['portal', 'admin'] as const

/**
 * Supabase's session cookie, including the `.0`, `.1` chunks it splits long
 * sessions into (`sb-<project-ref>-auth-token`).
 */
const AUTH_COOKIE = /^sb-.+-auth-token(\.\d+)?$/

/**
 * A real HTTP redirect for signed-out visitors, before anything renders.
 *
 * Without this, a guard inside a layout can only ever be a *soft* redirect: the
 * Suspense boundary opened by `[locale]/loading.tsx` means Next has already
 * flushed the document shell by the time the layout runs, so `redirect()` is
 * delivered as a `<meta http-equiv="refresh">` after a one-second delay, with a
 * 200 status. That is slow for a person and invisible to a crawler.
 *
 * The check is deliberately cheap and *stateless*: the mere presence of a
 * session cookie is enough to stop here. Proving the cookie is still valid needs
 * a network round trip, so a stale cookie falls through to the layout's
 * `requireSession`, which already handles it. It never lets anybody in on its
 * own — Row Level Security does that.
 *
 * It returns null unless the request is unmistakably wrong, so the ordinary path
 * through this proxy is unchanged.
 */
function signedOutGuard(request: NextRequest): NextResponse | null {
  const segments = request.nextUrl.pathname.split('/').filter(Boolean)
  const [maybeLocale, section] = segments

  if (typeof maybeLocale !== 'string' || typeof section !== 'string') return null

  // A path with no locale prefix is next-intl's to redirect, and the follow-up
  // request will arrive with the prefix and be checked then.
  if (!(routing.locales as readonly string[]).includes(maybeLocale)) return null
  if (!(GUARDED as readonly string[]).includes(section)) return null

  const hasSession = request.cookies
    .getAll()
    .some((cookie) => AUTH_COOKIE.test(cookie.name) || cookie.name === 'vcw:demo_session')
  if (hasSession) return null

  const url = request.nextUrl.clone()
  url.pathname = `/${maybeLocale}/login`
  url.search = ''
  return NextResponse.redirect(url)
}

/**
 * Next.js 16 renamed the `middleware` convention to `proxy` (nodejs runtime).
 * next-intl's handler is wrapped so we can layer on cheap request-scoped
 * concerns without a second pass over the request.
 */
export default function proxy(request: NextRequest) {
  // Respect explicit user choice; otherwise verify visitor location from geo IP headers
  const hasLocaleCookie = request.cookies.has('NEXT_LOCALE')
  const detectedCountry = countryFromHeaders(request.headers)
  const detectedLocale = localeFromCountry(detectedCountry)

  // When a first-time visitor lands on '/', redirect immediately to their location's native language
  if (request.nextUrl.pathname === '/' && !hasLocaleCookie && detectedLocale !== routing.defaultLocale) {
    const url = request.nextUrl.clone()
    url.pathname = `/${detectedLocale}`
    const redirectResponse = NextResponse.redirect(url)

    if (detectedCountry) {
      redirectResponse.cookies.set(GEO_COOKIE, detectedCountry, {
        path: '/',
        maxAge: REGION_COOKIE_MAX_AGE,
        sameSite: 'lax',
      })
    }
    redirectResponse.cookies.set('NEXT_LOCALE', detectedLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return redirectResponse
  }

  // Pre-seed NEXT_LOCALE on the incoming request so Next-Intl respects location-aware routing
  if (!hasLocaleCookie && detectedLocale) {
    request.cookies.set('NEXT_LOCALE', detectedLocale)
  }

  const response = signedOutGuard(request) ?? handleI18n(request)

  // Helpful correlation id for checkout webhooks and background tasks.
  if (!response.headers.has('x-vcw-runtime')) {
    response.headers.set('x-vcw-runtime', 'nodejs')
  }

  /*
   * Cache the IP-derived country in a cookie on the first request.
   */
  if (!request.cookies.has(COUNTRY_COOKIE) && !request.cookies.has(GEO_COOKIE)) {
    if (detectedCountry) {
      response.cookies.set(GEO_COOKIE, detectedCountry, {
        path: '/',
        maxAge: REGION_COOKIE_MAX_AGE,
        sameSite: 'lax',
      })
    }
  }

  return response
}

export const config = {
  // Skip API routes, Next internals, and anything with a file extension.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
}
