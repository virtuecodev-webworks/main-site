import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { AuthShell } from '@/components/auth/auth-shell'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Set New Password — Virtue & Co. Webworks',
    robots: { index: false, follow: false },
  }
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <AuthShell
      title="Create new password"
      subtitle="Choose a secure password for your account."
    >
      <ResetPasswordForm locale={locale} />
    </AuthShell>
  )
}
