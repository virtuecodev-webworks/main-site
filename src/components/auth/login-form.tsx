'use client'

import * as React from 'react'
import { LogIn } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInAction } from '@/lib/actions/auth'
import { AUTH_IDLE } from '@/lib/actions/state'
import { PasswordInput } from '@/components/auth/password-input'

/**
 * The single sign-in form.
 *
 * Clients and studio staff use the same door; the Server Action reads the
 * account's role afterwards and sends each to the right place, so nobody has to
 * know in advance which one they are.
 */
export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('Login')
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
          autoFocus
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

      {error ? (
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
