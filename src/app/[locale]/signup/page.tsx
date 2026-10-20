import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AuthShell } from '@/components/auth/auth-shell'
import { SignupForm } from '@/components/auth/signup-form'
import { getSession, landingFor } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Signup' })
  return { title: t('title'), robots: { index: false, follow: false } }
}

/** Self-serve client sign-up. Staff accounts are created in the database. */
export default async function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (session) redirect(landingFor(locale, session.role))

  const t = await getTranslations('Signup')

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <SignupForm locale={locale} />
    </AuthShell>
  )
}
