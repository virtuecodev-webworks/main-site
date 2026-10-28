import { ArrowUpRight, Check, CircleDashed, CreditCard, FileText } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/i18n/navigation'
import { ORDER_PHASES, phaseFor, summariseMilestones } from '@/lib/orders'
import { cn, formatMoney } from '@/lib/utils'
import type { Order, OrderEvent, OrderMilestone } from '@/lib/supabase/types'
import type { OrderStatus } from '@/lib/constants'

export async function StatusBadge({ status }: { status: OrderStatus }) {
  const t = await getTranslations('Orders.status')

  const variant =
    status === 'cancelled'
      ? 'destructive'
      : status === 'delivered' || status === 'closed'
        ? 'success'
        : status === 'inquiry'
          ? 'outline'
          : 'gold'

  return <Badge variant={variant}>{t(status)}</Badge>
}

export async function OrderProgress({ status }: { status: OrderStatus }) {
  const t = await getTranslations('Orders.phase')
  const tOrders = await getTranslations('Orders.status')
  const current = phaseFor(status)
  const currentIndex = ORDER_PHASES.indexOf(current)
  const cancelled = status === 'cancelled'

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-4">
      <ol className="flex items-center gap-2">
        {ORDER_PHASES.map((phase, index) => {
          const done = !cancelled && index < currentIndex
          const active = !cancelled && index === currentIndex

          return (
            <li key={phase} className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-1.5 w-full rounded-full transition-all duration-300',
                    cancelled
                      ? 'bg-muted'
                      : done
                        ? 'bg-emerald-500'
                        : active
                          ? 'bg-primary shadow-[0_0_8px_rgba(220,170,40,0.5)]'
                          : 'bg-border',
                  )}
                />
                {active && (
                  <span className="relative flex size-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] leading-tight font-medium tracking-[0.04em] uppercase',
                  active
                    ? 'font-semibold text-primary'
                    : done
                      ? 'text-foreground'
                      : 'text-muted-foreground/75',
                )}
              >
                {t(phase)}
              </span>
            </li>
          )
        })}
      </ol>

      <p className="sr-only">{tOrders(status)}</p>
    </div>
  )
}

export async function OrderTimeline({ events }: { events: OrderEvent[] }) {
  const t = await getTranslations('Portal')
  const tStatus = await getTranslations('Orders.status')

  if (!events.length) {
    return <p className="text-sm text-muted-foreground">{t('historyEmpty')}</p>
  }

  return (
    <ol className="flex flex-col">
      {events.map((event, index) => (
        <li key={event.id} className="flex gap-3.5">
          <div className="flex flex-col items-center">
            <span
              aria-hidden="true"
              className="mt-1.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30 ring-inset"
            >
              <Check className="size-3" />
            </span>
            {index < events.length - 1 ? (
              <span aria-hidden="true" className="w-px flex-1 bg-border" />
            ) : null}
          </div>

          <div className={cn('flex min-w-0 flex-col gap-0.5', index < events.length - 1 && 'pb-5')}>
            <p className="text-[13.5px] font-medium">
              {event.to_status ? tStatus(event.to_status) : t('updated')}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {new Date(event.created_at).toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export async function MilestoneList({
  milestones,
  locale,
  orderReference,
  showTotals = true,
}: {
  milestones: OrderMilestone[]
  locale: string
  orderReference?: string
  showTotals?: boolean
}) {
  const t = await getTranslations('Portal')
  const tMilestone = await getTranslations('Orders.milestone')

  if (!milestones.length) {
    return <p className="text-sm text-muted-foreground">{t('paymentsEmpty')}</p>
  }

  const totals = summariseMilestones(milestones)

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col">
        {milestones.map((milestone) => {
          const isPaid = milestone.status === 'paid'
          return (
            <li
              key={milestone.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3.5 last:border-b-0"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-[13.5px] font-medium">{milestone.title}</span>
                {milestone.due_at ? (
                  <span className="text-[12px] text-muted-foreground">
                    {t('dueOn')}{' '}
                    {new Date(milestone.due_at).toLocaleDateString(locale, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2.5">
                <span className="font-mono text-[13.5px] font-semibold tabular-nums">
                  {formatMoney(Number(milestone.amount), milestone.currency, locale)}
                </span>
                <Badge variant={isPaid ? 'success' : 'outline'}>
                  {tMilestone(milestone.status)}
                </Badge>

                {!isPaid && orderReference ? (
                  <Link
                    href={{
                      pathname: '/payment',
                      query: {
                        amount: String(milestone.amount),
                        currency: milestone.currency,
                        purpose: `${milestone.title} (${orderReference})`,
                        reference: orderReference,
                        orderReference,
                        milestoneId: milestone.id,
                      },
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
                  >
                    <CreditCard className="size-3" />
                    <span>Pay</span>
                  </Link>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      {showTotals ? (
        <>
          <Separator />
          {Object.keys(totals.billed)
            .sort()
            .map((currency) => {
              const billed = totals.billed[currency] ?? 0
              const paid = totals.paid[currency] ?? 0

              return (
                <dl key={currency} className="grid gap-3 text-[13px] sm:grid-cols-3">
                  {(['billed', 'paid', 'due'] as const).map((key) => (
                    <div key={key} className="flex flex-col gap-1">
                      <dt className="label-mono-xs text-muted-foreground">
                        {t(`totals.${key}`)}
                      </dt>
                      <dd className="font-mono font-semibold tabular-nums">
                        {formatMoney(
                          key === 'billed' ? billed : key === 'paid' ? paid : billed - paid,
                          currency,
                          locale,
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )
            })}
        </>
      ) : null}
    </div>
  )
}

export async function OrderCard({
  order,
  unread,
  locale,
}: {
  order: Order
  unread: number
  locale: string
}) {
  const t = await getTranslations('Portal')

  return (
    <li>
      <Link
        href={`/portal/orders/${order.reference}`}
        className="group flex flex-col gap-4 rounded-[20px] border border-border bg-card p-6 transition-all duration-300 hover:border-primary/60"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-display truncate text-lg font-semibold tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary">
              {order.title}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {t('reference')} {order.reference}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {unread > 0 ? (
              <Badge variant="gold" aria-label={t('newMessages', { count: unread })}>
                {unread}
              </Badge>
            ) : null}
            <StatusBadge status={order.status} />
          </div>
        </div>

        <OrderProgress status={order.status} />

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {t('updated')}{' '}
            {new Date(order.updated_at).toLocaleDateString(locale, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground uppercase tracking-[0.04em] transition-colors group-hover:text-primary">
            <FileText className="size-3.5 text-primary" />
            <span>{t('open')}</span>
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </Link>
    </li>
  )
}

export async function PortalEmpty() {
  const t = await getTranslations('Portal')

  return (
    <div className="flex flex-col items-start gap-3 rounded-[20px] border border-border bg-card p-8">
      <span
        aria-hidden="true"
        className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary"
      >
        <CircleDashed className="size-5" />
      </span>
      <h3 className="heading-style-h4">{t('empty.title')}</h3>
      <p className="max-w-prose text-sm text-muted-foreground">{t('empty.body')}</p>
    </div>
  )
}
