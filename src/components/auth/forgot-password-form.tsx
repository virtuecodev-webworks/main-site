'use client'

import * as React from 'react'
import { ArrowLeft, KeyRound, MailCheck } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { forgotPasswordAction } from '@/lib/actions/auth'

export function ForgotPasswordForm({ locale }: { locale: string }) {
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

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
          <MailCheck className="size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Check your inbox</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            We sent a secure password reset link to <span className="font-semibold text-foreground">{email}</span>. Click the link in the email to set your new password.
          </p>
        </div>
        <div className="pt-4 flex flex-col gap-3 w-full">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full h-11 border-border">
              <ArrowLeft className="mr-2 size-4" />
              Back to Sign in
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Didn't receive the email? Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="forgot-email" className="text-sm font-medium">
          Account Email
        </Label>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alex@acme.com"
          className="h-11 bg-background/50 border-border"
        />
        <p className="text-xs text-muted-foreground">
          We will send a one-time link and security token to recover your account.
        </p>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full bg-emerald-500 font-semibold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
      >
        {pending ? (
          <span className="flex items-center gap-2">
            <VirtueSpinner className="size-4 text-slate-950" />
            Sending link...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <KeyRound className="size-4" />
            Send Password Reset Link
          </span>
        )}
      </Button>

      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Sign in
        </Link>
      </div>
    </form>
  )
}
