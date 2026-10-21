'use client'

import * as React from 'react'
import { CheckCircle2, Lock } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { updatePasswordAction } from '@/lib/actions/auth'

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = React.use(params)
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const res = await updatePasswordAction(formData)
    setPending(false)
    if (res && !res.ok) {
      setError(res.message ?? 'Failed to update password. Please try again.')
    } else {
      setSuccess(true)
    }
  }

  return (
    <AuthShell
      title="Create new password"
      subtitle="Enter a new secure password for your Virtue & Co. account."
    >
      {success ? (
        <div className="flex flex-col gap-5 font-sans">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-3.5 text-emerald-800 ring-1 ring-emerald-500/25 ring-inset dark:text-emerald-300">
            <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-emerald-500" />
            <p className="text-[13px] font-medium">Password updated successfully</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Your password has been reset. You can now sign in with your new credentials.
          </p>
          <Button asChild variant="gold" size="lg" className="mt-2">
            <Link href="/login">Sign in to your account</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 font-sans">
          <input type="hidden" name="locale" value={locale} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              autoFocus
              placeholder="••••••••"
            />
            <p className="text-[11.5px] text-muted-foreground">Minimum 8 characters.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
              placeholder="••••••••"
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
                <span>Updating password...</span>
              </>
            ) : (
              <>
                <Lock className="size-4 mr-1" />
                <span>Update Password</span>
              </>
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
