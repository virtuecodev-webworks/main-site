'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getAdminAllowlist } from '@/lib/supabase/env'
import type { ProfileRole } from '@/lib/constants'
import { COUNTRY_COOKIE, GEO_COOKIE } from '@/lib/geo/countries'
import { landingFor } from '@/lib/supabase/auth'
import { absoluteUrl } from '@/lib/utils'
import type { AuthState, SignUpState } from './state'

/** Minimum password length. Supabase's own floor is 6; the studio asks for more. */
const MIN_PASSWORD = 8

/**
 * Email + password sign-in.
 *
 * The role is read from the freshly authenticated client (not through React's
 * request cache) so a just-signed-in user is evaluated correctly. An account with
 * no role and no allow-list entry is signed straight back out rather than left
 * holding a session it cannot use anywhere.
 */
export async function signInAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')
  const locale = String(formData.get('locale') ?? 'en')

  if (!email || !password) return { status: 'error', message: 'invalid' }

  const supabase = await createSupabaseServerClient()
  if (!supabase) return { status: 'error', message: 'not-configured' }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return { status: 'error', message: 'invalid' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle<{ role: ProfileRole }>()

  const role =
    profile?.role ?? (getAdminAllowlist().includes(email) ? ('admin' as ProfileRole) : null)

  if (!role) {
    await supabase.auth.signOut()
    return { status: 'error', message: 'not-authorised' }
  }

  redirect(landingFor(locale, role))
}

/**
 * Self-serve client sign-up.
 *
 * The account is always a client — `handle_new_user` pins the role and ignores
 * anything the payload claims about it. If email confirmation is on, Supabase
 * returns no session and we tell the visitor to go and open the message; if it
 * is off, they are signed in and land in the portal immediately.
 */
export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const fullName = String(formData.get('fullName') ?? '').trim()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirmPassword') ?? '')
  const phone = String(formData.get('phone') ?? '').trim()
  const company = String(formData.get('company') ?? '').trim()
  const locale = String(formData.get('locale') ?? 'en')

  if (!fullName) return { status: 'error', message: 'missing-name' }
  if (!email.includes('@')) return { status: 'error', message: 'invalid-email' }
  if (password.length < MIN_PASSWORD) return { status: 'error', message: 'weak-password' }
  if (password !== confirm) return { status: 'error', message: 'password-mismatch' }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    const jar = await cookies()
    jar.set(
      'vcw:demo_session',
      JSON.stringify({
        userId: 'demo-new-client-id',
        email,
        name: fullName || 'Client User',
        role: 'client',
      }),
      { path: '/', httpOnly: true, sameSite: 'lax' },
    )
    redirect(`/${locale}/portal`)
  }

  /*
   * Region is taken from the cookies the proxy already set, so the account
   * carries the country the visitor was browsing from without asking again.
   * Only used for invoicing context — never to gate anything.
   */
  const jar = await cookies()
  const country = jar.get(COUNTRY_COOKIE)?.value ?? jar.get(GEO_COOKIE)?.value ?? null

  const theme = String(formData.get('theme') ?? 'light').trim()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: absoluteUrl(`/${locale}/portal`),
      data: {
        full_name: fullName,
        preferred_theme: theme,
        ...(phone ? { phone } : {}),
        ...(company ? { company } : {}),
        ...(country ? { country } : {}),
      },
    },
  })

  if (error) {
    const message = error.message.toLowerCase()
    if (error.status === 429 || message.includes('rate limit')) {
      return { status: 'error', message: 'rate-limited' }
    }
    if (message.includes('already registered') || message.includes('already been registered')) {
      return { status: 'error', message: 'email-taken' }
    }
    if (message.includes('password')) return { status: 'error', message: 'weak-password' }
    console.warn('[auth] sign-up failed:', error.message)
    return { status: 'error', message: 'unknown' }
  }

  if (data.session) redirect(`/${locale}/portal`)

  return { status: 'confirm-email', email }
}

/**
 * Sign out, then land somewhere that makes sense for whoever was signed in.
 *
 * `next` is checked against in-app paths so a crafted form cannot turn the
 * sign-out button into an open redirect: it must be the current locale's root
 * (`/en`) or something beneath it (`/en/portal`).
 */
export async function signOutAction(formData: FormData): Promise<void> {
  const locale = String(formData.get('locale') ?? 'en')
  const requested = String(formData.get('next') ?? '')
  const inApp = requested === `/${locale}` || requested.startsWith(`/${locale}/`)
  const jar = await cookies()
  jar.delete('vcw:demo_session')

  const supabase = await createSupabaseServerClient()
  await supabase?.auth.signOut()
  const target = inApp ? requested : `/${locale}`
  redirect(target)
}
