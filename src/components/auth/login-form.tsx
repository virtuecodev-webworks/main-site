'use client'

import * as React from 'react'
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { signInAction } from '@/lib/actions/auth'
import { AUTH_IDLE } from '@/lib/actions/state'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { useAuthPortalHover } from '@/components/auth/auth-portal-shell'

/**
 * The single sign-in form styled for the concentric orbital portal.
 */
export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('Login')
  const searchParams = useSearchParams()
  const { setHovering } = useAuthPortalHover()

  const isConfirmed = searchParams.get('confirmed') === 'true'
  const isReset = searchParams.get('reset') === 'success'
  const isOauthError =
    searchParams.get('error') === 'oauth' || searchParams.get('error') === 'exchange_failed'
  const oauthMsg = searchParams.get('message')

  const [state, action, pending] = React.useActionState(signInAction, AUTH_IDLE)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)

  const error =
    state.status === 'error'
      ? state.message === 'not-authorised'
        ? t('notAuthorised')
        : state.message === 'not-configured'
          ? t('notConfigured')
          : t('invalid')
      : null

  return (
    <form action={action} className="flex w-full flex-col gap-3.5 font-sans">
      <input type="hidden" name="locale" value={locale} />

      {isConfirmed ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-gold-500/30 bg-gold-500/10 p-3 text-xs text-gold-800 dark:text-gold-200">
          <CheckCircle2 className="size-4 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden="true" />
          <p className="font-medium">
            Account verified successfully! Please sign in with your password.
          </p>
        </div>
      ) : null}

      {isReset ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-gold-500/30 bg-gold-500/10 p-3 text-xs text-gold-800 dark:text-gold-200">
          <CheckCircle2 className="size-4 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden="true" />
          <p className="font-medium">
            Password updated! Please sign in with your new password.
          </p>
        </div>
      ) : null}

      {isOauthError ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/35 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="font-medium">
            {oauthMsg ||
              'Google sign-in could not be completed. Please try again or sign in with your password below.'}
          </p>
        </div>
      ) : null}

      <label className="virtue-auth-field" data-invalid={error ? 'true' : undefined}>
        <Mail className="ic" aria-hidden="true" />
        <input
          id="login-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          aria-label={t('email')}
          placeholder={t('email')}
          aria-invalid={error ? true : undefined}
        />
      </label>

      <div className="virtue-auth-field" data-invalid={error ? 'true' : undefined}>
        <Lock className="ic" aria-hidden="true" />
        <input
          id="login-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          aria-label={t('password')}
          placeholder={t('password')}
          aria-invalid={error ? true : undefined}
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

      <Link href="/forgot-password" className="virtue-auth-forgot">
        Forgot password?
      </Link>

      {state.status === 'error' && state.message === 'not-registered' ? (
        <div className="flex flex-col gap-2.5 rounded-xl border border-gold-500/35 bg-gold-500/10 p-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-foreground">Account Not Found</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                The email <strong className="text-foreground">{email}</strong> has not been
                registered yet.
              </p>
            </div>
          </div>
          <Link
            href={`/signup?email=${encodeURIComponent(email)}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gold-500 py-2 text-xs font-semibold text-[#191308] transition-colors hover:bg-gold-400"
          >
            Create Your Account Now →
          </Link>
        </div>
      ) : error ? (
        <p className="text-[12.5px] text-destructive" role="alert">
          {error}
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
    </form>
  )
}
