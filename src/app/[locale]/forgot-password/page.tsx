import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AuthShell } from '@/components/auth/auth-shell'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { getSession, landingFor } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Reset Password — Virtue & Co. Webworks',
    robots: { index: false, follow: false },
  }
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (session) redirect(landingFor(locale, session.role))

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email to receive recovery instructions."
    >
      <ForgotPasswordForm locale={locale} />
    </AuthShell>
  )
}
