'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
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

  const isAllowlisted = Boolean(email && getAdminAllowlist().includes(email))
  const role = isAllowlisted
    ? ('admin' as ProfileRole)
    : (profile?.role ?? null)

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
    // Supabase throws "Error sending confirmation email" when no SMTP is configured.
    // Treat it as a configuration gap, not a user error.
    if (message.includes('sending confirmation email') || message.includes('smtp')) {
      return { status: 'error', message: 'not-configured' }
    }
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

/**
 * Request a password reset link/code to the user's email.
 */
export async function forgotPasswordAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const locale = String(formData.get('locale') ?? 'en')

  if (!email || !email.includes('@')) {
    return { ok: false, message: 'Please enter a valid email address.' }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { ok: true }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: absoluteUrl(`/${locale}/reset-password`),
  })

  if (error) {
    console.warn('[auth] resetPasswordForEmail failed:', error.message)
    return { ok: false, message: error.message }
  }

  return { ok: true }
}

/**
 * Verify 6-digit recovery OTP code and update password immediately.
 * Zero links needed — pure 6-digit code recovery!
 */
export async function verifyRecoveryOtpAndUpdatePasswordAction(
  formData: FormData,
): Promise<{ ok: boolean; message?: string }> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const token = String(formData.get('token') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirmPassword') ?? '')
  const locale = String(formData.get('locale') ?? 'en')

  if (!email || !token || token.length < 6) {
    return { ok: false, message: 'Please enter the 6-digit recovery code.' }
  }

  if (password.length < MIN_PASSWORD) {
    return { ok: false, message: `Password must be at least ${MIN_PASSWORD} characters.` }
  }

  if (password !== confirm) {
    return { ok: false, message: 'Passwords do not match.' }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { ok: true }
  }

  // 1. Verify 6-digit recovery OTP code
  const { data, error: otpError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery',
  })

  if (otpError || !data.user) {
    return {
      ok: false,
      message: otpError?.message || 'Invalid or expired 6-digit code. Please request a new one.',
    }
  }

  // 2. Set the new password immediately
  const { error: updateError } = await supabase.auth.updateUser({ password })
  if (updateError) {
    return { ok: false, message: updateError.message }
  }

  return { ok: true }
}

/**
 * Update password once user lands on reset-password page with active recovery session.
 */
export async function updatePasswordAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirmPassword') ?? '')
  const locale = String(formData.get('locale') ?? 'en')

  if (password.length < MIN_PASSWORD) {
    return { ok: false, message: `Password must be at least ${MIN_PASSWORD} characters.` }
  }

  if (password !== confirm) {
    return { ok: false, message: 'Passwords do not match.' }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    redirect(`/${locale}/login`)
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { ok: false, message: error.message }
  }

  redirect(`/${locale}/login?reset=success`)
}

/**
 * Verify 6-digit confirmation code (OTP) for signup.
 */
export async function verifyOtpAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const token = String(formData.get('token') ?? '').trim()
  const locale = String(formData.get('locale') ?? 'en')

  if (!email || !email.includes('@')) {
    return { ok: false, message: 'Please enter a valid email address.' }
  }

  // If the user's account is already verified, take them straight to sign-in
  const admin = createSupabaseAdminClient()
  if (admin) {
    const { data: userList } = await admin.auth.admin.listUsers()
    const existing = userList?.users?.find((u) => u.email === email)
    if (existing?.email_confirmed_at) {
      redirect(`/${locale}/login?confirmed=true`)
    }
  }

  if (!token || token.length < 6) {
    return { ok: false, message: 'Please enter the complete 6-digit verification code.' }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    redirect(`/${locale}/portal`)
  }

  // 1. Try 'signup' verification type
  let { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  })

  // 2. Fallback to 'email' if GoTrue expects 'email' OTP type
  if (error && (error.message.toLowerCase().includes('token') || error.message.toLowerCase().includes('invalid'))) {
    const emailAttempt = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    if (!emailAttempt.error) {
      data = emailAttempt.data
      error = null
    }
  }

  if (error) {
    // Check if user is already confirmed (e.g. verified in another tab or earlier)
    const admin = createSupabaseAdminClient()
    if (admin) {
      const { data: userList } = await admin.auth.admin.listUsers()
      const existing = userList?.users?.find((u) => u.email === email)
      if (existing?.email_confirmed_at) {
        redirect(`/${locale}/login?confirmed=true`)
      }
    }
    return { ok: false, message: error.message }
  }

  redirect(`/${locale}/portal`)
}

/**
 * Resend 6-digit confirmation code (OTP) for signup.
 */
export async function resendOtpAction(formData: FormData): Promise<{ ok: boolean; alreadyConfirmed?: boolean; message?: string }> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const locale = String(formData.get('locale') ?? 'en')

  if (!email || !email.includes('@')) {
    return { ok: false, message: 'Invalid email address.' }
  }

  // If the user's account is already confirmed, do not attempt resending signup OTP.
  const admin = createSupabaseAdminClient()
  if (admin) {
    const { data: userList } = await admin.auth.admin.listUsers()
    const existing = userList?.users?.find((u) => u.email === email)
    if (existing?.email_confirmed_at) {
      return {
        ok: false,
        alreadyConfirmed: true,
        message: 'Your account is already verified! You can sign in immediately.',
      }
    }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { ok: true }
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: absoluteUrl(`/${locale}/portal`),
    },
  })

  if (error) {
    console.warn('[auth] resend OTP failed:', error.message)
    return { ok: false, message: error.message }
  }

  return { ok: true }
}
