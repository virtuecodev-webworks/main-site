'use client'

import * as React from 'react'
import { MailCheck, UserPlus, Sun, Moon, Laptop } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpAction } from '@/lib/actions/auth'
import { SIGN_UP_IDLE } from '@/lib/actions/state'
import { PwaInstallPrompt } from '@/components/pwa/pwa-install-prompt'

type ThemeChoice = 'light' | 'dark' | 'system'

/**
 * Client sign-up.
 *
 * When creating an account at signup, users choose their preferred interface theme.
 * Upon account creation, prompts for PWA installation and real-time push notifications.
 */
export function SignupForm({ locale }: { locale: string }) {
  const t = useTranslations('Signup')
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

  const errorText =
    state.status === 'error' ? t(`errors.${state.message}`) : null

  if (state.status === 'confirm-email') {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-xl bg-gold-500/10 p-3.5 text-gold-800 ring-1 ring-gold-500/25 ring-inset dark:text-gold-300">
          <MailCheck aria-hidden="true" className="size-5 shrink-0" />
          <p className="text-[13px] font-medium">{t('confirmTitle')}</p>
        </div>

        <p className="text-sm text-muted-foreground">
          {t('confirmBody', { email: state.email })}
        </p>

        {/* PWA App Install & Notification prompt upon account creation */}
        <PwaInstallPrompt autoShow />

        <Button asChild variant="outline" size="lg">
          <Link href="/login">{t('confirmAction')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-5 font-sans">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="theme" value={preferredTheme} />

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
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          aria-describedby="signup-password-hint"
        />
        <p id="signup-password-hint" className="text-[12px] text-muted-foreground">
          {t('passwordHint')}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-confirm">{t('confirmPassword')}</Label>
        <Input
          id="signup-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
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
