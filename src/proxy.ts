import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { countryFromHeaders, localeFromCountry } from './lib/geo/detect'
import { COUNTRY_COOKIE, GEO_COOKIE, REGION_COOKIE_MAX_AGE } from './lib/geo/countries'
import { isSupabaseConfigured } from './lib/supabase/env'

const handleI18n = createMiddleware(routing)

/** Top-level segments that require a signed-in account. */
const GUARDED = ['portal', 'admin'] as const

/**
 * Supabase's session cookie, including the `.0`, `.1` chunks it splits long
 * sessions into (`sb-<project-ref>-auth-token`).
 */
const AUTH_COOKIE = /^sb-.+-auth-token(\.\d+)?$/

function signedOutGuard(request: NextRequest): NextResponse | null {
  const segments = request.nextUrl.pathname.split('/').filter(Boolean)
  const [maybeLocale, section] = segments

  if (typeof maybeLocale !== 'string' || typeof section !== 'string') return null

  if (!(routing.locales as readonly string[]).includes(maybeLocale)) return null
  if (!(GUARDED as readonly string[]).includes(section)) return null

  const allowDemo = process.env.NODE_ENV !== 'production' && !isSupabaseConfigured()
  const hasSession = request.cookies
    .getAll()
    .some(
      (cookie) =>
        AUTH_COOKIE.test(cookie.name) || (allowDemo && cookie.name === 'vcw:demo_session'),
    )
  if (hasSession) return null

  const url = request.nextUrl.clone()
  url.pathname = `/${maybeLocale}/login`
  url.search = ''
  return NextResponse.redirect(url)
}

export default function proxy(request: NextRequest) {
  const hasLocaleCookie = request.cookies.has('NEXT_LOCALE')
  const detectedCountry = countryFromHeaders(request.headers)
  const detectedLocale = localeFromCountry(detectedCountry)

  if (
    request.nextUrl.pathname === '/' &&
    !hasLocaleCookie &&
    detectedLocale !== routing.defaultLocale
  ) {
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

  if (!hasLocaleCookie && detectedLocale) {
    request.cookies.set('NEXT_LOCALE', detectedLocale)
  }

  const response = signedOutGuard(request) ?? handleI18n(request)

  if (!response.headers.has('x-vcw-runtime')) {
    response.headers.set('x-vcw-runtime', 'nodejs')
  }

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
  matcher: '/((?!api|auth|_next|_vercel|.*\\..*).*)',
}
