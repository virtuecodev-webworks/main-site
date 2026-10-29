'use client'

import * as React from 'react'
import { LogIn, CheckCircle2, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInAction } from '@/lib/actions/auth'
import { AUTH_IDLE } from '@/lib/actions/state'
import { PasswordInput } from '@/components/auth/password-input'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'

/**
 * The single sign-in form.
 *
 * Clients and studio staff use the same door; the Server Action reads the
 * account's role afterwards and sends each to the right place, so nobody has to
 * know in advance which one they are.
 */
export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('Login')
  const searchParams = useSearchParams()
  const isConfirmed = searchParams.get('confirmed') === 'true'
  const isReset = searchParams.get('reset') === 'success'
  const isOauthError =
    searchParams.get('error') === 'oauth' || searchParams.get('error') === 'exchange_failed'
  const oauthMsg = searchParams.get('message')

  const [state, action, pending] = React.useActionState(signInAction, AUTH_IDLE)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const error =
    state.status === 'error'
      ? state.message === 'not-authorised'
        ? t('notAuthorised')
        : state.message === 'not-configured'
          ? t('notConfigured')
          : t('invalid')
      : null

  return (
    <form action={action} className="flex flex-col gap-5 font-sans">
      <input type="hidden" name="locale" value={locale} />

      {/* Primary 1-Click Option: Google */}
      <div className="flex flex-col gap-2">
        <GoogleSignInButton locale={locale} text="Sign in with Google" />
      </div>

      {/* Divider */}
      <div className="relative my-1 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative bg-card px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          or sign in with email
        </div>
      </div>

      {isConfirmed ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-gold-500/30 bg-gold-500/10 p-3 text-xs text-gold-800 dark:text-gold-300">
          <CheckCircle2 className="size-4 shrink-0 text-gold-500" />
          <p className="font-medium">Account verified successfully! Please sign in with your password.</p>
        </div>
      ) : null}

      {isReset ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-gold-500/30 bg-gold-500/10 p-3 text-xs text-gold-800 dark:text-gold-300">
          <CheckCircle2 className="size-4 shrink-0 text-gold-500" />
          <p className="font-medium">Password updated! Please sign in with your new password.</p>
        </div>
      ) : null}

      {isOauthError ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p className="font-medium">
            {oauthMsg || 'Google sign-in could not be completed. Please try again or sign in with your password below.'}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">{t('email')}</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          placeholder="you@company.com"
          aria-invalid={error ? true : undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">{t('password')}</Label>
          <Link
            href="/forgot-password"
            className="text-[12px] font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="login-password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          placeholder="••••••••"
          aria-invalid={error ? true : undefined}
        />
      </div>

      {state.status === 'error' && state.message === 'not-registered' ? (
        <div className="rounded-2xl border border-gold-500/30 bg-gold-500/10 p-4 flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="size-4 text-gold-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">Account Not Found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                The email <strong className="text-foreground">{email}</strong> has not been registered yet. Please create an account to get started.
              </p>
            </div>
          </div>
          <Link
            href={`/signup?email=${encodeURIComponent(email)}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-obsidian font-semibold py-2 text-xs transition-colors"
          >
            Create Your Account Now →
          </Link>
        </div>
      ) : error ? (
        <p className="text-[12.5px] text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="gold" size="lg" disabled={pending} className="mt-1">
        {pending ? (
          <>
            <VirtueSpinner className="size-4" />
            {t('submitting')}
          </>
        ) : (
          <>
            <LogIn className="size-4" />
            {t('submit')}
          </>
        )}
      </Button>

      <div className="flex flex-col gap-1.5 border-t border-border pt-5 text-[12.5px]">
        <p className="text-muted-foreground">
          {t('newHere')}{' '}
          <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            {t('createAccount')}
          </Link>
        </p>
      </div>
    </form>
  )
}
