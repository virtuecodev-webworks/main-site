'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, MailX } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') ?? ''

  const [email, setEmail] = React.useState(initialEmail)
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = React.useState<string | null>(null)

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return
    setStatus('loading')
    setMessage(null)

    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Could not unsubscribe right now.')
      }
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Could not unsubscribe right now.')
    }
  }

  return (
    <div className="padding-global pt-32 pb-24">
      <div className="container-max">
        <div className="mx-auto max-w-lg rounded-[20px] border border-border bg-card p-8 sm:p-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            {status === 'done' ? <CheckCircle2 className="size-6" /> : <MailX className="size-6" />}
          </div>

          <span className="label-mono mt-5 block text-primary">
            ( &nbsp;&nbsp;&nbsp;Studio Dispatch&nbsp;&nbsp;&nbsp; )
          </span>

          <h1 className="heading-style-h3 mt-2 text-foreground">
            {status === 'done' ? 'You have been unsubscribed.' : 'Manage newsletter preferences'}
          </h1>

          {status === 'done' ? (
            <div className="mt-4 space-y-6">
              <p className="text-sm text-muted-foreground">
                We have removed <strong className="text-foreground">{email}</strong> from future Studio Dispatch editions.
              </p>
              <Button asChild variant="gold">
                <Link href="/">Return to studio</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleUnsubscribe} className="mt-6 space-y-4 text-left">
              <p className="text-center text-sm text-muted-foreground">
                Confirm your email address below to unsubscribe from the Virtue &amp; Co. Studio Dispatch.
              </p>
              <div>
                <label htmlFor="unsub-email" className="label-mono-xs text-muted-foreground">
                  Email Address
                </label>
                <input
                  id="unsub-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="vantra-input mt-1"
                />
              </div>
              {status === 'error' && message && (
                <p className="text-xs text-destructive" role="alert">
                  {message}
                </p>
              )}
              <Button type="submit" variant="default" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? <VirtueSpinner className="size-4" /> : null}
                <span>Confirm Unsubscribe</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <React.Suspense fallback={<div className="min-h-[60vh]" />}>
      <UnsubscribeContent />
    </React.Suspense>
  )
}
