'use client'

import * as React from 'react'
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Dot,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MailCheck,
  Phone,
  RefreshCw,
  User,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { signUpAction, verifyOtpAction, resendOtpAction } from '@/lib/actions/auth'
import { SIGN_UP_IDLE } from '@/lib/actions/state'
import { PwaInstallPrompt } from '@/components/pwa/pwa-install-prompt'
import { CodeInput } from '@/components/auth/code-input'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { useAuthPortalHover } from '@/components/auth/auth-portal-shell'
import { cn } from '@/lib/utils'

/**
 * Client sign-up styled for the concentric orbital portal.
 * Preserves full email + OTP verification, Google OAuth, and theme preference sync.
 */
export function SignupForm({ locale }: { locale: string }) {
  const t = useTranslations('Signup')
  const searchParams = useSearchParams()
  const { setHovering } = useAuthPortalHover()

  const paramEmail = searchParams.get('email') || ''

  const [state, action, pending] = React.useActionState(signUpAction, SIGN_UP_IDLE)
  const [preferredTheme, setPreferredTheme] = React.useState<'light' | 'dark' | 'system'>('light')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('vcw:theme')
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        setPreferredTheme(stored)
      }
    } catch {
      // ignore
    }
  }, [])

  const errorText = state.status === 'error' ? t(`errors.${state.message}`) : null

  if (state.status === 'confirm-email') {
    return <SignupVerificationStep email={state.email} locale={locale} />
  }

  const requirements = [
    { label: '8+ chars', valid: password.length >= 8 },
    { label: 'Number', valid: /[0-9]/.test(password) },
    { label: 'Uppercase', valid: /[A-Z]/.test(password) },
    { label: 'Symbol', valid: /[^A-Za-z0-9]/.test(password) },
  ]

  return (
    <form action={action} className="flex w-full flex-col gap-3 font-sans">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="theme" value={preferredTheme} />

      <label className="virtue-auth-field">
        <User className="ic" aria-hidden="true" />
        <input
          id="signup-name"
          name="fullName"
          autoComplete="name"
          required
          autoFocus
          aria-label={t('name')}
          placeholder={t('namePlaceholder') ? `Full name (e.g. ${t('namePlaceholder')})` : t('name')}
        />
      </label>

      <label className="virtue-auth-field">
        <Mail className="ic" aria-hidden="true" />
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={paramEmail}
          aria-label={t('email')}
          placeholder={t('email')}
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="virtue-auth-field">
          <Building2 className="ic" aria-hidden="true" />
          <input
            id="signup-company"
            name="company"
            autoComplete="organization"
            aria-label={t('company')}
            placeholder="Company (optional)"
          />
        </label>

        <label className="virtue-auth-field">
          <Phone className="ic" aria-hidden="true" />
          <input
            id="signup-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            aria-label={t('phone')}
            placeholder="Phone (optional)"
          />
        </label>
      </div>

      <div className="virtue-auth-field">
        <Lock className="ic" aria-hidden="true" />
        <input
          id="signup-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label={t('password')}
          placeholder="Create password (8+ chars)"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="virtue-auth-eye"
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {password.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px]">
          {requirements.map((req) => (
            <span
              key={req.label}
              className={cn(
                'inline-flex items-center gap-1 transition-colors',
                req.valid ? 'font-medium text-gold-400' : 'text-[#f5f4f0]/45',
              )}
            >
              {req.valid ? <Check className="size-3" /> : <Dot className="size-3" />}
              {req.label}
            </span>
          ))}
        </div>
      )}

      <div className="virtue-auth-field">
        <Lock className="ic" aria-hidden="true" />
        <input
          id="signup-confirm"
          name="confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          minLength={8}
          required
          aria-label={t('confirmPassword')}
          placeholder={t('confirmPassword')}
        />
        <button
          type="button"
          onClick={() => setShowConfirm((prev) => !prev)}
          tabIndex={-1}
          aria-label={showConfirm ? 'Hide password' : 'Show password'}
          className="virtue-auth-eye"
        >
          {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {errorText ? (
        <p className="text-[12.5px] text-[#ffb4ab]" role="alert">
          {errorText}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        className="virtue-auth-primary mt-1"
      >
        {pending ? (
          <>
            <VirtueSpinner className="size-4" />
            <span>{t('submitting')}</span>
          </>
        ) : (
          <>
            <span>{t('submit')}</span>
            <ArrowRight aria-hidden="true" />
          </>
        )}
      </button>

      <div className="virtue-auth-or my-1">
        <i />
        <span>or</span>
        <i />
      </div>

      <GoogleSignInButton
        variant="portal"
        locale={locale}
        text="Continue with Google"
      />

      <p className="pt-1 text-center text-[11.5px] leading-relaxed text-[#f5f4f0]/50">
        {t.rich('legal', {
          terms: (chunks) => (
            <Link href="/terms" className="text-[#f5f4f0]/75 underline underline-offset-4 hover:text-gold-400">
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link href="/privacy" className="text-[#f5f4f0]/75 underline underline-offset-4 hover:text-gold-400">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </form>
  )
}

/**
 * 10-Minute Verification Step with live countdown and one-click resend.
 */
function SignupVerificationStep({ email, locale }: { email: string; locale: string }) {
  const { setHovering } = useAuthPortalHover()
  const [timeLeft, setTimeLeft] = React.useState(600)
  const [otpError, setOtpError] = React.useState<string | null>(null)
  const [otpPending, setOtpPending] = React.useState(false)
  const [resendPending, setResendPending] = React.useState(false)
  const [resendStatus, setResendStatus] = React.useState<string | null>(null)
  const [codeKey, setCodeKey] = React.useState(0)

  React.useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setOtpPending(true)
    setOtpError(null)

    const formData = new FormData(e.currentTarget)
    const res = await verifyOtpAction(formData)

    if (res && !res.ok) {
      setOtpError(res.message ?? 'Invalid verification code. Please check and try again.')
      setOtpPending(false)
      setCodeKey((k) => k + 1)
    }
  }

  const handleResend = async () => {
    setResendPending(true)
    setOtpError(null)
    setResendStatus(null)

    const formData = new FormData()
    formData.set('email', email)
    formData.set('locale', locale)

    const res = await resendOtpAction(formData)
    setResendPending(false)

    if (res.ok) {
      setTimeLeft(600)
      setResendStatus(
        'A fresh 6-digit code has been sent to your email. You have 10 minutes to enter it.',
      )
      setCodeKey((k) => k + 1)
    } else if ((res as { alreadyConfirmed?: boolean }).alreadyConfirmed) {
      setResendStatus(null)
      setOtpError('Your account is already verified! Redirecting to sign in...')
      setTimeout(() => {
        window.location.href = `/${locale}/login?confirmed=true`
      }, 1200)
    } else {
      setOtpError(res.message ?? 'Failed to resend code. Please wait a moment and try again.')
    }
  }

  return (
    <div className="flex w-full flex-col gap-4 font-sans">
      <div className="flex items-center gap-3 rounded-xl border border-gold-500/30 bg-gold-500/10 p-3.5 text-gold-200">
        <MailCheck aria-hidden="true" className="size-5 shrink-0 text-gold-400" />
        <p className="text-[13px] font-medium">
          Check your email for your 6-digit verification code
        </p>
      </div>

      <p className="text-center text-sm text-[#f5f4f0]/70">
        We sent a verification code to <strong className="text-[#f5f4f0]">{email}</strong>. Enter
        the 6-digit code below to activate your client workspace.
      </p>

      <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-xs text-[#f5f4f0]/70">
        <span className="flex items-center gap-2">
          <Clock className="size-4 text-gold-400" aria-hidden="true" />
          <span>
            {timeLeft > 0 ? (
              <>
                Code valid for:{' '}
                <strong className="font-mono font-bold text-[#f5f4f0]">{formattedTime}</strong>
              </>
            ) : (
              <strong className="font-semibold text-[#ffb4ab]">Code has expired (00:00)</strong>
            )}
          </span>
        </span>

        {timeLeft > 0 && timeLeft <= 570 ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={resendPending}
            className="text-[11.5px] font-semibold text-gold-400 hover:underline disabled:opacity-50"
          >
            {resendPending ? 'Sending...' : 'Resend code'}
          </button>
        ) : null}
      </div>

      {resendStatus ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-gold-500/30 bg-gold-500/10 p-3 text-xs text-gold-200">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden="true" />
          <p>{resendStatus}</p>
        </div>
      ) : null}

      <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="locale" value={locale} />

        <div className="flex flex-col gap-2">
          <span className="sr-only">6-Digit Verification Code</span>
          <CodeInput key={codeKey} name="token" autoFocus disabled={timeLeft <= 0} />
        </div>

        {otpError ? (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/15 p-3 text-xs text-[#ffb4ab]">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p className="font-medium">{otpError}</p>
          </div>
        ) : null}

        {timeLeft > 0 ? (
          <button
            type="submit"
            disabled={otpPending}
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
            className="virtue-auth-primary"
          >
            {otpPending ? (
              <>
                <VirtueSpinner className="size-4" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify &amp; Enter Portal</span>
                <ArrowRight aria-hidden="true" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resendPending}
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
            className="virtue-auth-primary"
          >
            {resendPending ? (
              <>
                <VirtueSpinner className="size-4" />
                <span>Sending fresh code...</span>
              </>
            ) : (
              <>
                <RefreshCw className="size-4" aria-hidden="true" />
                <span>Request a New Code</span>
              </>
            )}
          </button>
        )}
      </form>

      <PwaInstallPrompt autoShow />

      <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#f5f4f0]/60">
        <span>Didn&apos;t receive it?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendPending}
          className="font-semibold text-gold-400 hover:underline disabled:opacity-50"
        >
          {resendPending ? 'Sending...' : 'Request another code'}
        </button>
      </div>
    </div>
  )
}
