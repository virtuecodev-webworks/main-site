import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PortalEmpty, OrderCard } from '@/components/portal/order-view'
import { NewRequestForm } from '@/components/portal/new-request-form'
import { ClientMobileDashboard } from '@/components/portal/client-mobile-dashboard'
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
      {/* 1. Mobile App Dashboard (Mockup Inspired: Hero card & 2x2 Action Tiles) */}
      <ClientMobileDashboard
        orders={orders}
        unreadSummary={unread}
        clientName={session.name}
        clientEmail={session.email}
        locale={locale}
        currency={region.currency}
      />

      {/* 2. Desktop Header */}
      <header className="hidden lg:flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          {t('signedInAs')} <span className="text-foreground">{session.email ?? '-'}</span>
        </p>
      </header>

      {unread.total > 0 ? (
        <p className="surface px-5 py-4 text-[13px] font-medium hidden lg:block" role="status">
          {t('newMessages', { count: unread.total })}
        </p>
      ) : null}

      {orders.length === 0 ? <PortalEmpty /> : null}

      {live.length ? (
        <section id="active-orders" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {t('active')} ({live.length})
            </h2>
            <span className="text-xs text-primary font-mono hidden sm:inline">Active Production</span>
          </div>
          <ul className="flex flex-col gap-4">
            {live.map((order) => (
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

      <div id="new-request">
        <NewRequestForm
          locale={locale}
          currency={region.currency}
          defaultOpen={orders.length === 0}
        />
      </div>

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
