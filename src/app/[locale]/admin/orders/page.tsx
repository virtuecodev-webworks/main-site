import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/portal/order-view'
import { requireStaff } from '@/lib/supabase/auth'
import { getUnreadSummary, listOrdersWithClients } from '@/lib/supabase/orders'
import { isLiveOrderStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const FILTERS = ['all', 'live', 'past', 'unassigned'] as const
type Filter = (typeof FILTERS)[number]

function isFilter(value: string | undefined): value is Filter {
  return value !== undefined && (FILTERS as readonly string[]).includes(value)
}

/**
 * The orders console.
 *
 * Agents see exactly what they have been assigned, because
 * `orders_staff_read` filters on `can_staff_order(id)` rather than on anything
 * this page does. That is also why there is no "mine only" toggle: for an agent
 * every list is already theirs, and for an admin the whole list is the point.
 */
export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await requireStaff(locale)
  const t = await getTranslations('Admin.orders')
  // The unread pill reuses the client-facing plural, so the two views of the
  // same number cannot drift apart in wording.
  const tUnread = await getTranslations('Portal')

  const query = await searchParams
  const requested = Array.isArray(query.filter) ? query.filter[0] : query.filter
  const filter: Filter = isFilter(requested) ? requested : 'all'

  const orders = await listOrdersWithClients()
  const unread = await getUnreadSummary(orders.map((order) => order.id))

  const filtered = orders.filter((order) => {
    if (filter === 'live') return isLiveOrderStatus(order.status)
    if (filter === 'past') return !isLiveOrderStatus(order.status)
    if (filter === 'unassigned') return order.agent_id === null
    return true
  })

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <nav className="flex flex-wrap items-center gap-2" aria-label={t('title')}>
        {FILTERS.map((option) => {
          const active = option === filter
          return (
            <Link
              key={option}
              href={option === 'all' ? '/admin/orders' : `/admin/orders?filter=${option}`}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors',
                active
                  ? 'bg-gold-50 text-gold-800 dark:bg-gold-500/12 dark:text-gold-300'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {t(`filter.${option}`)}
            </Link>
          )
        })}
      </nav>

      {filtered.length ? (
        <ul className="flex flex-col gap-3">
          {filtered.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/orders/${order.reference}`}
                className="surface flex flex-col gap-3 p-5 transition-colors hover:border-gold-300 dark:hover:border-gold-500/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-[15px] font-semibold">{order.title}</span>
                    <span className="truncate text-[12px] text-muted-foreground">
                      {order.reference}
                      {' · '}
                      {order.client?.full_name ?? order.client?.email ?? '-'}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {(unread.byOrder[order.id] ?? 0) > 0 ? (
                      <Badge
                        variant="gold"
                        aria-label={tUnread('newMessages', {
                          count: unread.byOrder[order.id] ?? 0,
                        })}
                      >
                        {unread.byOrder[order.id]}
                      </Badge>
                    ) : null}
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-muted-foreground">
                  <span>
                    {t('agent')}:{' '}
                    {order.agent?.full_name ?? order.agent?.email ?? t('unassigned')}
                  </span>
                  <span>
                    {t('updated')}{' '}
                    {new Date(order.updated_at).toLocaleDateString(locale, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="surface p-6 text-sm text-muted-foreground">
          {orders.length === 0 && !session.isAdmin ? t('emptyForAgent') : t('empty')}
        </p>
      )}
    </div>
  )
}
