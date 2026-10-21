import { getTranslations, setRequestLocale } from 'next-intl/server'
import { requireAdmin } from '@/lib/supabase/auth'
import { getNewsletterDashboardData } from '@/lib/supabase/newsletter-queries'
import { NewsletterConsole } from '@/components/admin/newsletter-console'

export default async function AdminNewsletterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  await requireAdmin(locale)

  const data = await getNewsletterDashboardData()

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">Studio Dispatch &amp; Newsletter</h1>
        <p className="text-sm text-muted-foreground">
          Autonomous AI-powered weekly newsletter engine &amp; subscriber communications.
        </p>
      </header>

      <NewsletterConsole
        subscribersCount={data.subscribersCount}
        dispatchesCount={data.dispatchesCount}
        recentDispatches={data.recentDispatches}
      />
    </div>
  )
}
