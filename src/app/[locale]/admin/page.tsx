import { setRequestLocale } from 'next-intl/server'
import { getStudioMetrics, listInquiries } from '@/lib/supabase/queries'
import { listOrdersWithClients } from '@/lib/supabase/orders'
import { getNewsletterDashboardData } from '@/lib/supabase/newsletter-queries'
import { requireAdmin } from '@/lib/supabase/auth'
import { AdminDesktopDashboard } from '@/components/admin/admin-desktop-dashboard'

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await requireAdmin(locale)

  const [metrics, inquiries, orders, newsletterData] = await Promise.all([
    getStudioMetrics(),
    listInquiries(12),
    listOrdersWithClients(20),
    getNewsletterDashboardData(),
  ])

  return (
    <AdminDesktopDashboard
      metrics={metrics}
      inquiries={inquiries}
      orders={orders}
      subscribersCount={newsletterData.subscribersCount}
      adminName={session.name}
      adminEmail={session.email}
      locale={locale}
    />
  )
}
