'use client'

import * as React from 'react'
import { ArrowLeft, CheckCircle2, KeyRound, Lock, MailCheck, ShieldCheck } from 'lucide-react'
import { Link, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { forgotPasswordAction, verifyRecoveryOtpAndUpdatePasswordAction } from '@/lib/actions/auth'

export function ForgotPasswordForm({ locale }: { locale: string }) {
  const router = useRouter()
  const [step, setStep] = React.useState<'request' | 'verify' | 'done'>('request')
  const [email, setEmail] = React.useState('')
  const [token, setToken] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')

  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Step 1: Send 6-digit code
  const handleRequestCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData()
    formData.set('email', email)
    formData.set('locale', locale)

    const res = await forgotPasswordAction(formData)
    setPending(false)
    if (res.ok) {
      setStep('verify')
    } else {
      setError(res.message ?? 'Failed to send recovery code. Please check your email and try again.')
    }
  }

  // Step 2: Verify 6-digit code & set new password
  const handleVerifyAndReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (token.trim().length !== 6) {
      setError('Please enter the 6-digit code sent to your email.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setPending(true)
    const formData = new FormData()
    formData.set('email', email)
    formData.set('token', token.trim())
    formData.set('password', password)
    formData.set('confirmPassword', confirmPassword)
    formData.set('locale', locale)

    const res = await verifyRecoveryOtpAndUpdatePasswordAction(formData)
    setPending(false)

    if (res.ok) {
      setStep('done')
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 2500)
    } else {
      setError(res.message ?? 'Invalid code or recovery session expired. Please try again.')
    }
  }

  // Step 3: Success state
  if (step === 'done') {
    return (
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="size-14 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500">
          <CheckCircle2 className="size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Password reset complete</h2>
          <p className="text-sm text-muted-foreground">
            Your new password has been secured. Redirecting you to sign in...
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

  // Step 2: Enter 6-digit code + new password
  if (step === 'verify') {
    return (
      <form onSubmit={handleVerifyAndReset} className="flex flex-col gap-5">
        <div className="rounded-xl border border-gold-500/20 bg-gold-500/10 p-3.5 flex items-start gap-3">
          <ShieldCheck className="size-5 text-gold-500 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            A 6-digit recovery code was sent to <span className="font-semibold text-foreground">{email}</span>. Enter the code and your new password below.
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="reset-otp" className="text-sm font-medium">
            6-Digit Verification Code
          </Label>
          <Input
            id="reset-otp"
            name="token"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoFocus
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="123456"
            className="h-12 bg-background/50 border-border text-center font-mono text-2xl tracking-[0.35em] font-bold"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password" className="text-sm font-medium">
            New Password
          </Label>
          <Input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="h-11 bg-background/50 border-border"
          />
          <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-new-password" className="text-sm font-medium">
            Confirm New Password
          </Label>
          <Input
            id="confirm-new-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            className="h-11 bg-background/50 border-border"
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
              Verifying code & saving password...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Lock className="size-4" />
              Reset Password With Code
            </span>
          )}
        </Button>

        <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => setStep('request')}
            className="hover:text-foreground transition-colors underline underline-offset-4"
          >
            Change email / Resend code
          </button>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    )
  }

  // Step 1: Request code
  return (
    <form onSubmit={handleRequestCode} className="flex flex-col gap-5">
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
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alex@acme.com"
          className="h-11 bg-background/50 border-border"
        />
        <p className="text-xs text-muted-foreground">
          We will send a 6-digit verification code to this address. No magic link required.
        </p>
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
            Sending 6-digit code...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <KeyRound className="size-4" />
            Send 6-Digit Recovery Code
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
