import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PortalEmpty, OrderCard } from '@/components/portal/order-view'
import { NewRequestForm } from '@/components/portal/new-request-form'
import { ClientMobileDashboard } from '@/components/portal/client-mobile-dashboard'
import { ClientDesktopDashboard } from '@/components/portal/client-desktop-dashboard'
import { requireClient } from '@/lib/supabase/auth'
import { listOrders, getUnreadSummary } from '@/lib/supabase/orders'
import { partitionByLiveness } from '@/lib/orders'
import { resolveServerCountry } from '@/lib/geo/server'

/**
 * A client's own work, in two groups.
 *
 * Everything on this page comes from queries that Row Level Security has already
 * narrowed to the signed-in account, so there is no filter here to get wrong.
 */
export default async function PortalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await requireClient(locale)
  const t = await getTranslations('Portal')

  const [orders, region] = await Promise.all([listOrders(), resolveServerCountry()])

  const unread = await getUnreadSummary(orders.map((order) => order.id))
  const { live, past } = partitionByLiveness(orders)

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Mobile App Dashboard (< lg) (Mockup Screen 1: Hero card & 2x2 Action Tiles) */}
      <ClientMobileDashboard
        orders={orders}
        unreadSummary={unread}
        clientName={session.name}
        clientEmail={session.email}
        locale={locale}
        currency={region.currency}
      />

      {/* 2. Desktop Workspace Dashboard (>= lg) (Mockup "Mondays" Desktop Layout) */}
      <ClientDesktopDashboard
        orders={orders}
        unreadSummary={unread}
        clientName={session.name}
        clientEmail={session.email}
        locale={locale}
        currency={region.currency}
      />

      {/* 3. New Project Request Modal / Form Anchor */}
      <div id="new-request" className="pt-4">
        <NewRequestForm
          locale={locale}
          currency={region.currency}
          defaultOpen={orders.length === 0}
        />
      </div>

      {/* 4. Past / Archived Builds (Collapsible if present) */}
      {past.length ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {t('past')} ({past.length})
          </h2>
          <ul className="flex flex-col gap-4">
            {past.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                unread={unread.byOrder[order.id] ?? 0}
                locale={locale}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
