'use client'

import * as React from 'react'
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react'
import { Link, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { updatePasswordAction } from '@/lib/actions/auth'
import { PasswordInput } from '@/components/auth/password-input'

export function ResetPasswordForm({ locale }: { locale: string }) {
  const router = useRouter()
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setPending(true)
    const formData = new FormData(e.currentTarget)
    const res = await updatePasswordAction(formData)
    setPending(false)

    if (res.ok) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2500)
    } else {
      setError(res.message ?? 'Failed to update password. Your reset link may have expired.')
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="size-14 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500">
          <CheckCircle2 className="size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Password updated</h2>
          <p className="text-sm text-muted-foreground">
            Your new password has been securely saved. Redirecting you to sign in...
          </p>
        </div>
        <div className="pt-3 w-full">
          <Link href="/login" className="w-full">
            <Button variant="gold" size="lg" className="w-full">
              Sign In Now
            </Button>
          </Link>
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
        <Label htmlFor="new-password" className="text-sm font-medium">
          New Password
        </Label>
        <PasswordInput
          id="new-password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          placeholder="Create a strong password"
          showRequirements
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-password" className="text-sm font-medium">
          Confirm New Password
        </Label>
        <PasswordInput
          id="confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
          placeholder="Repeat your new password"
        />
      </div>

      <Button
        type="submit"
        variant="gold"
        size="lg"
        disabled={pending}
        className="w-full"
      >
        {pending ? (
          <span className="flex items-center gap-2">
            <VirtueSpinner className="size-4" />
            Updating password...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Lock className="size-4" />
            Save New Password
          </span>
        )}
      </Button>

      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Cancel and Return to Sign in
        </Link>
      </div>
    </form>
  )
}
