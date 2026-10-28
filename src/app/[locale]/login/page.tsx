import * as React from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'
import { getSession, landingFor } from '@/lib/supabase/auth'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'

// Reads the session cookie, so it can never be prerendered.
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Login' })
  return { title: t('title'), robots: { index: false, follow: false } }
}

/**
 * Sign-in for everyone.
 *
 * There is one door: clients and studio staff both land here, and an account
 * that is already signed in is sent straight on to whichever console its role
 * belongs to rather than being shown the form again.
 */
export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (session) redirect(landingFor(locale, session.role))

  const t = await getTranslations('Login')

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <VirtueSpinner className="size-5" />
          </div>
        }
      >
        <LoginForm locale={locale} />
      </React.Suspense>
    </AuthShell>
  )
}
