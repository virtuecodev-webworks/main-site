'use client'

import * as React from 'react'
import { ArrowLeft, KeyRound, MailCheck } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { forgotPasswordAction } from '@/lib/actions/auth'

export default function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = React.use(params)
  const [email, setEmail] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const res = await forgotPasswordAction(formData)
    setPending(false)
    if (res.ok) {
      setSent(true)
    } else {
      setError(res.message ?? 'Failed to send password reset email. Please try again.')
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a secure password reset link."
    >
      {sent ? (
        <div className="flex flex-col gap-5 font-sans">
          <div className="flex items-center gap-3 rounded-xl bg-gold-500/10 p-3.5 text-gold-800 ring-1 ring-gold-500/25 ring-inset dark:text-gold-300">
            <MailCheck aria-hidden="true" className="size-5 shrink-0 text-emerald-500" />
            <p className="text-[13px] font-medium">Check your email</p>
          </div>
          <p className="text-sm text-muted-foreground">
            We sent a secure password reset link to <strong className="text-foreground">{email}</strong>. Open the link to choose a new password.
          </p>
          <Button asChild variant="outline" size="lg" className="mt-2">
            <Link href="/login">
              <ArrowLeft className="size-4 mr-2" />
              Back to Sign in
            </Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 font-sans">
          <input type="hidden" name="locale" value={locale} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="forgot-email">Email address</Label>
            <Input
              id="forgot-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              autoFocus
              placeholder="you@company.com"
            />
          </div>

          {error ? (
            <p className="text-xs text-destructive font-medium" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" variant="gold" size="lg" disabled={pending} className="mt-1">
            {pending ? (
              <>
                <VirtueSpinner className="size-4" />
                <span>Sending link...</span>
              </>
            ) : (
              <>
                <KeyRound className="size-4 mr-1" />
                <span>Send Reset Link</span>
              </>
            )}
          </Button>

          <div className="border-t border-border pt-4 text-center text-xs">
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Remember your password? <span className="font-semibold text-primary">Sign in</span>
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  )
}
