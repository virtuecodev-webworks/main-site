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
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/email/templates'

/** Minimum password length. Supabase's own floor is 6; the studio asks for more. */
const MIN_PASSWORD = 8

/**
 * Email + password sign-in.
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
    if (process.env.NODE_ENV !== 'production') {
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
    return { status: 'error', message: 'not-configured' }
  }

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
    if (message.includes('sending confirmation email') || message.includes('smtp')) {
      return { status: 'error', message: 'not-configured' }
    }
    console.warn('[auth] sign-up failed:', error.message)
    return { status: 'error', message: 'unknown' }
  }

  const admin = createSupabaseAdminClient()
  if (admin) {
    try {
      await admin.from('newsletter_subscribers').upsert(
        {
          email,
          status: 'active',
          source: 'signup',
          confirmed_at: new Date().toISOString(),
        },
        { onConflict: 'email', ignoreDuplicates: false },
      )
      await admin.from('subscribers').upsert(
        { email, locale, source: 'signup' },
        { onConflict: 'email', ignoreDuplicates: false },
      )
    } catch (subErr) {
      console.warn('[auth] newsletter auto-subscribe failed:', subErr)
    }

    if (data.session) {
      try {
        const rendered = await welcomeEmail({ name: fullName })
        await sendEmail({ to: email, email: rendered })
      } catch (emailErr) {
        console.warn('[auth] welcome email failed:', emailErr)
      }
    }
  }

  if (data.session) redirect(`/${locale}/portal`)

  return { status: 'confirm-email', email }
}

/**
 * Sign out, then land somewhere that makes sense for whoever was signed in.
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
 */
export async function verifyRecoveryOtpAndUpdatePasswordAction(
  formData: FormData,
): Promise<{ ok: boolean; message?: string }> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const token = String(formData.get('token') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirmPassword') ?? '')

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
    return { ok: false, message: error.message }
  }

  // Send welcome email upon successful OTP confirmation
  if (data?.user) {
    try {
      const fullName =
        (data.user.user_metadata?.full_name as string | undefined) ??
        email.split('@')[0]
      const rendered = await welcomeEmail({ name: fullName })
      await sendEmail({ to: email, email: rendered })
    } catch (emailErr) {
      console.warn('[auth] welcome email after OTP failed:', emailErr)
    }
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
    const msg = error.message.toLowerCase()
    if (msg.includes('already confirmed') || msg.includes('already registered')) {
      return {
        ok: false,
        alreadyConfirmed: true,
        message: 'Your account is already verified! You can sign in immediately.',
      }
    }
    console.warn('[auth] resend OTP failed:', error.message)
    return { ok: false, message: error.message }
  }

  return { ok: true }
}
