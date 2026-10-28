'use client'

import * as React from 'react'
import { GoogleIcon } from '@/components/brand/google-icon'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle } from 'lucide-react'

interface GoogleSignInButtonProps {
  locale: string
  text?: string
  subtext?: string
  next?: string
  className?: string
}

export function GoogleSignInButton({
  locale,
  text = 'Continue with Google',
  subtext,
  next,
  className = '',
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const targetNext = next || `/${locale}/portal`
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetNext)}`

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (oauthError) {
        throw oauthError
      }

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: unknown) {
      console.warn('[GoogleSignIn] error:', err)
      const msg = err instanceof Error ? err.message : String(err)
      if (
        msg.toLowerCase().includes('provider is not enabled') ||
        msg.toLowerCase().includes('unsupported provider')
      ) {
        setError(
          'Google authentication is being enabled on Supabase. Use email signup below or contact support.',
        )
      } else {
        setError(msg || 'Unable to connect to Google. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-[14px] font-semibold text-foreground shadow-xs transition-all hover:border-foreground/30 hover:bg-muted/50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        {loading ? (
          <>
            <VirtueSpinner className="size-4" />
            <span>Connecting to Google…</span>
          </>
        ) : (
          <>
            <GoogleIcon className="size-5 shrink-0" />
            <div className="flex flex-col items-start text-left sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold tracking-[-0.01em]">{text}</span>
              {subtext ? (
                <span className="text-[11px] font-normal text-muted-foreground hidden sm:inline">
                  — {subtext}
                </span>
              ) : null}
            </div>
          </>
        )}
      </button>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 text-[12px] text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p className="leading-snug">{error}</p>
        </div>
      ) : null}
    </div>
  )
}
