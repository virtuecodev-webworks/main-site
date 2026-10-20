import { Check, CircleDashed, FileText } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/i18n/navigation'
import { ORDER_PHASES, phaseFor, summariseMilestones } from '@/lib/orders'
import { cn, formatMoney } from '@/lib/utils'
import type { Order, OrderEvent, OrderMilestone } from '@/lib/supabase/types'
import type { OrderStatus } from '@/lib/constants'

/**
 * Read-only views of an order.
 *
 * These are server components on purpose: the only part of an order that needs
 * JavaScript is the composer, so everything else — the progress bar, the history,
 * the payment schedule — renders to HTML and costs nothing to interact with.
 */

/** Status pill, shared by the portal list and both detail pages. */
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

/**
 * Five steps, mapped from the eight stored statuses.
 *
 * A client does not need to know the difference between "scoping" and "quoted" —
 * both mean the studio is working out the plan. What they need is a glanceable
 * answer to "is this moving?".
 */
export async function OrderProgress({ status }: { status: OrderStatus }) {
  const t = await getTranslations('Orders.phase')
  const tOrders = await getTranslations('Orders.status')
  const current = phaseFor(status)
  const currentIndex = ORDER_PHASES.indexOf(current)
  const cancelled = status === 'cancelled'

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
      <ol className="flex items-center gap-2">
        {ORDER_PHASES.map((phase, index) => {
          const done = !cancelled && index < currentIndex
          const active = !cancelled && index === currentIndex

          return (
            <li key={phase} className="flex flex-1 flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-1.5 w-full rounded-full transition-all duration-300',
                    cancelled
                      ? 'bg-muted'
                      : done
                        ? 'bg-emerald'
                        : active
                          ? 'bg-gradient-to-r from-primary to-emerald shadow-[0_0_8px_rgba(220,170,40,0.5)]'
                          : 'bg-muted',
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
                  'text-[10px] leading-tight font-medium tracking-wide uppercase',
                  active
                    ? 'font-semibold text-primary'
                    : done
                      ? 'text-emerald'
                      : 'text-muted-foreground/80',
                )}
              >
                {t(phase)}
              </span>
            </li>
          )
        })}
      </ol>

      {/* The five steps are a summary; the exact status is the honest answer. */}
      <p className="sr-only">
        {tOrders(status)}
      </p>
    </div>
  )
}

/** Append-only history, written by a database trigger on every status change. */
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
              className="mt-1.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-700 ring-1 ring-gold-500/30 ring-inset dark:text-gold-300"
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

/**
 * Payment schedule.
 *
 * Amounts are shown in the currency the order was quoted in and nothing is
 * converted: inventing an exchange rate to display a friendlier number would be
 * a lie about what is owed.
 */
export async function MilestoneList({
  milestones,
  locale,
  showTotals = true,
}: {
  milestones: OrderMilestone[]
  locale: string
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
        {milestones.map((milestone) => (
          <li
            key={milestone.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
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

            <div className="flex shrink-0 items-center gap-3">
              <span className="text-[13.5px] font-semibold tabular-nums">
                {formatMoney(Number(milestone.amount), milestone.currency, locale)}
              </span>
              <Badge variant={milestone.status === 'paid' ? 'success' : 'outline'}>
                {tMilestone(milestone.status)}
              </Badge>
            </div>
          </li>
        ))}
      </ul>

      {showTotals ? (
        <>
          <Separator />
          {/*
            Totals are per currency, and nothing is converted. An order is
            normally quoted in one currency, but summing across two of them and
            labelling the result with either one would be a quietly wrong number.
          */}
          {Object.keys(totals.billed)
            .sort()
            .map((currency) => {
              const billed = totals.billed[currency] ?? 0
              const paid = totals.paid[currency] ?? 0

              return (
                <dl key={currency} className="grid gap-3 text-[13px] sm:grid-cols-3">
                  {(['billed', 'paid', 'due'] as const).map((key) => (
                    <div key={key} className="flex flex-col gap-1">
                      <dt className="text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                        {t(`totals.${key}`)}
                      </dt>
                      <dd className="font-semibold tabular-nums">
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

/** One row in the portal list. */
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
        className="surface flex flex-col gap-4 p-5 transition-colors hover:border-gold-300 dark:hover:border-gold-500/40"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-[15px] font-semibold">{order.title}</span>
            <span className="text-[12px] text-muted-foreground">
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

        <div className="flex items-center justify-between gap-3 text-[12px] text-muted-foreground">
          <span>
            {t('updated')}{' '}
            {new Date(order.updated_at).toLocaleDateString(locale, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-gold-700 dark:text-gold-300">
            <FileText className="size-3.5" />
            {t('open')}
          </span>
        </div>
      </Link>
    </li>
  )
}

/** Empty state for a client with nothing on file yet. */
export async function PortalEmpty() {
  const t = await getTranslations('Portal')

  return (
    <div className="surface flex flex-col items-start gap-3 p-7">
      <span
        aria-hidden="true"
        className="grid size-11 place-items-center rounded-xl bg-gold-500/12 text-gold-700 ring-1 ring-gold-500/25 ring-inset dark:text-gold-300"
      >
        <CircleDashed className="size-5" />
      </span>
      <h3 className="text-base font-semibold">{t('empty.title')}</h3>
      <p className="max-w-prose text-sm text-muted-foreground">{t('empty.body')}</p>
    </div>
  )
}
