'use client'

import * as React from 'react'
import {
  MailCheck,
  UserPlus,
  Sun,
  Moon,
  Laptop,
  Clock,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Mail,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpAction, verifyOtpAction, resendOtpAction } from '@/lib/actions/auth'
import { SIGN_UP_IDLE } from '@/lib/actions/state'
import { PwaInstallPrompt } from '@/components/pwa/pwa-install-prompt'
import { CodeInput } from '@/components/auth/code-input'
import { PasswordInput } from '@/components/auth/password-input'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { GoogleIcon } from '@/components/brand/google-icon'

type ThemeChoice = 'light' | 'dark' | 'system'

/**
 * Client sign-up.
 *
 * First presents a clear choice between Google Sign-Up and Email Sign-Up.
 * When choosing email, users configure their preferred interface theme and password.
 * After email creation, prompts 6-digit verification code with live countdown.
 */
export function SignupForm({ locale }: { locale: string }) {
  const t = useTranslations('Signup')
  const searchParams = useSearchParams()
  const initialMethod = searchParams.get('method') === 'email' ? 'email' : 'choose'
  const [method, setMethod] = React.useState<'choose' | 'email'>(initialMethod)

  const [state, action, pending] = React.useActionState(signUpAction, SIGN_UP_IDLE)
  const [preferredTheme, setPreferredTheme] = React.useState<ThemeChoice>('light')

  React.useEffect(() => {
    // Read current theme from storage or default to light
    try {
      const stored = localStorage.getItem('vcw:theme')
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        setPreferredTheme(stored)
      }
    } catch {
      // ignore
    }
  }, [])

  const handleThemeChange = (choice: ThemeChoice) => {
    setPreferredTheme(choice)
    try {
      localStorage.setItem('vcw:theme', choice)
      const root = document.documentElement
      if (choice === 'system') {
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', dark)
        root.style.colorScheme = dark ? 'dark' : 'light'
      } else {
        const isDark = choice === 'dark'
        root.classList.toggle('dark', isDark)
        root.style.colorScheme = isDark ? 'dark' : 'light'
      }
    } catch {
      // ignore
    }
  }

  const errorText = state.status === 'error' ? t(`errors.${state.message}`) : null

  // If user has submitted email signup, always stay in the OTP verification view
  if (state.status === 'confirm-email') {
    return <SignupVerificationStep email={state.email} locale={locale} />
  }

  // Initial Choice View: Choose Google or Email
  if (method === 'choose') {
    return (
      <div className="flex flex-col gap-5 font-sans">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Sign Up Options
          </span>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Choose how you would like to create your client workspace.
          </p>
        </div>

        {/* Primary Option: Google */}
        <div className="flex flex-col gap-2">
          <GoogleSignInButton
            locale={locale}
            text="Sign up with Google"
            subtext="Fastest · 1 click"
          />
        </div>

        {/* Divider */}
        <div className="relative my-1 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative bg-card px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            or continue with
          </div>
        </div>

        {/* Secondary Option: Email Card */}
        <button
          type="button"
          onClick={() => setMethod('email')}
          className="group relative flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-foreground/30 hover:bg-muted/40 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-gold-700 dark:text-gold-300">
              <Mail className="size-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-semibold text-foreground">Sign up with Email</span>
              </div>
              <span className="text-[12px] text-muted-foreground">
                Set a custom password and verify via 6-digit code
              </span>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground shrink-0" />
        </button>

        {/* Legal Disclaimer */}
        <p className="text-[11.5px] leading-relaxed text-muted-foreground pt-1">
          {t.rich('legal', {
            terms: (chunks) => (
              <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
                {chunks}
              </Link>
            ),
          })}
        </p>

        {/* Link to Login */}
        <p className="border-t border-border pt-4 text-[12.5px] text-muted-foreground">
          {t('haveAccount')}{' '}
          <Link
            href="/login"
            className="font-medium text-gold-700 underline-offset-4 hover:underline dark:text-gold-300"
          >
            {t('signIn')}
          </Link>
        </p>
      </div>
    )
  }

  // Email Sign Up Form View
  return (
    <form action={action} className="flex flex-col gap-5 font-sans">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="theme" value={preferredTheme} />

      {/* Back to Options Banner */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setMethod('choose')}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>All sign up options</span>
        </button>

        <button
          type="button"
          onClick={() => setMethod('choose')}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gold-700 hover:underline dark:text-gold-300"
        >
          <GoogleIcon className="size-3.5" />
          <span>Use Google instead</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-name">{t('name')}</Label>
        <Input
          id="signup-name"
          name="fullName"
          autoComplete="name"
          required
          autoFocus
          placeholder={t('namePlaceholder')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-email">{t('email')}</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-company">
          {t('company')} <span className="text-muted-foreground">{t('companyHint')}</span>
        </Label>
        <Input id="signup-company" name="company" autoComplete="organization" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-phone">
          {t('phone')} <span className="text-muted-foreground">{t('phoneHint')}</span>
        </Label>
        <Input id="signup-phone" name="phone" type="tel" autoComplete="tel" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-password">{t('password')}</Label>
        <PasswordInput
          id="signup-password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          showRequirements
          placeholder="Create a strong password"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-confirm">{t('confirmPassword')}</Label>
        <PasswordInput
          id="signup-confirm"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="Confirm your password"
        />
      </div>

      {/* Preferred Interface Theme Selector */}
      <div className="flex flex-col gap-2 pt-1">
        <Label className="text-xs font-semibold">Preferred Interface Theme</Label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all ${
              preferredTheme === 'light'
                ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>Light (Default)</span>
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all ${
              preferredTheme === 'dark'
                ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all ${
              preferredTheme === 'system'
                ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>System</span>
          </button>
        </div>
      </div>

      {errorText ? (
        <p className="text-[12.5px] text-destructive" role="alert">
          {errorText}
        </p>
      ) : null}

      <Button type="submit" variant="gold" size="lg" disabled={pending} className="mt-2">
        {pending ? (
          <>
            <VirtueSpinner className="size-4" />
            {t('submitting')}
          </>
        ) : (
          <>
            <UserPlus className="size-4" />
            {t('submit')}
          </>
        )}
      </Button>

      <p className="text-[11.5px] leading-relaxed text-muted-foreground">
        {t.rich('legal', {
          terms: (chunks) => (
            <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
              {chunks}
            </Link>
          ),
        })}
      </p>

      <p className="border-t border-border pt-5 text-[12.5px] text-muted-foreground">
        {t('haveAccount')}{' '}
        <Link
          href="/login"
          className="font-medium text-gold-700 underline-offset-4 hover:underline dark:text-gold-300"
        >
          {t('signIn')}
        </Link>
      </p>
    </form>
  )
}

/**
 * 10-Minute Verification Step with live countdown and one-click resend.
 */
function SignupVerificationStep({ email, locale }: { email: string; locale: string }) {
  // 10 minutes = 600 seconds
  const [timeLeft, setTimeLeft] = React.useState(600)
  const [otpError, setOtpError] = React.useState<string | null>(null)
  const [otpPending, setOtpPending] = React.useState(false)
  const [resendPending, setResendPending] = React.useState(false)
  const [resendStatus, setResendStatus] = React.useState<string | null>(null)
  const [codeKey, setCodeKey] = React.useState(0)

  // 10-minute countdown timer
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
      setResendStatus('A fresh 6-digit code has been sent to your email. You have 10 minutes to enter it.')
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
    <div className="flex flex-col gap-5 font-sans">
      <div className="flex items-center gap-3 rounded-xl bg-gold-500/10 p-3.5 text-gold-800 ring-1 ring-gold-500/25 ring-inset dark:text-gold-300">
        <MailCheck aria-hidden="true" className="size-5 shrink-0 text-gold-500" />
        <p className="text-[13px] font-medium">Check your email for your 6-digit verification code</p>
      </div>

      <p className="text-sm text-muted-foreground">
        We sent a verification code to <strong className="text-foreground">{email}</strong>. Enter the 6-digit code below to activate your client workspace.
      </p>

      {/* Countdown timer badge */}
      <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3.5 py-2.5 text-xs text-muted-foreground border border-border/70">
        <span className="flex items-center gap-2">
          <Clock className="size-4 text-gold-500" />
          <span>
            {timeLeft > 0 ? (
              <>Code valid for: <strong className="font-mono text-foreground font-bold">{formattedTime}</strong></>
            ) : (
              <strong className="text-destructive font-semibold">Code has expired (00:00)</strong>
            )}
          </span>
        </span>

        {timeLeft > 0 && timeLeft <= 570 ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={resendPending}
            className="text-primary hover:underline font-semibold disabled:opacity-50 text-[11.5px]"
          >
            {resendPending ? 'Sending...' : 'Resend code'}
          </button>
        ) : null}
      </div>

      {resendStatus ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-gold-500/30 bg-gold-500/10 p-3 text-xs text-gold-800 dark:text-gold-300">
          <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-gold-500" />
          <p>{resendStatus}</p>
        </div>
      ) : null}

      <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="locale" value={locale} />

        <div className="flex flex-col gap-2">
          <Label className="sr-only">6-Digit Verification Code</Label>
          <CodeInput key={codeKey} name="token" autoFocus disabled={timeLeft <= 0} />
        </div>

        {otpError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <p className="font-medium">{otpError}</p>
          </div>
        ) : null}

        {timeLeft > 0 ? (
          <Button type="submit" variant="gold" size="lg" disabled={otpPending} className="w-full">
            {otpPending ? (
              <>
                <VirtueSpinner className="size-4" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify &amp; Enter Portal</span>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant="gold"
            size="lg"
            onClick={handleResend}
            disabled={resendPending}
            className="w-full flex items-center justify-center gap-2"
          >
            {resendPending ? (
              <>
                <VirtueSpinner className="size-4" />
                <span>Sending fresh code...</span>
              </>
            ) : (
              <>
                <RefreshCw className="size-4" />
                <span>Request a New Code</span>
              </>
            )}
          </Button>
        )}
      </form>

      {/* PWA App Install & Notification prompt upon account creation */}
      <PwaInstallPrompt autoShow />

      <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <span>Didn&apos;t receive it?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendPending}
          className="font-semibold text-primary hover:underline disabled:opacity-50"
        >
          {resendPending ? 'Sending...' : 'Request another code'}
        </button>
      </div>
    </div>
  )
}
