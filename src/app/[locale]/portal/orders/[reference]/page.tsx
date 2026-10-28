import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Separator } from '@/components/ui/separator'
import { EditBrief } from '@/components/portal/edit-brief'
import { MarkOrderRead } from '@/components/portal/mark-order-read'
import { MessageComposer } from '@/components/portal/message-composer'
import { MessageList } from '@/components/portal/message-list'
import {
  MilestoneList,
  OrderProgress,
  OrderTimeline,
  StatusBadge,
} from '@/components/portal/order-view'
import { requireClient } from '@/lib/supabase/auth'
import { getOrderByReference, getOrderThread } from '@/lib/supabase/orders'

export const dynamic = 'force-dynamic'

/**
 * One project, as the client sees it.
 *
 * A reference that is not theirs simply is not found — Row Level Security filters
 * the row out before the page can decide otherwise, so there is no branch here
 * that could accidentally confirm the existence of somebody else's order.
 *
 * The brief stays editable only while the status is `inquiry`, which is the same
 * condition the update policy applies.
 */
export default async function PortalOrderPage({
  params,
}: {
  params: Promise<{ locale: string; reference: string }>
}) {
  const { locale, reference } = await params
  setRequestLocale(locale)

  const session = await requireClient(locale)
  const order = await getOrderByReference(reference)
  if (!order) notFound()

  const t = await getTranslations('Portal')
  const { messages, events, milestones } = await getOrderThread(order.id, false)

  return (
    <div className="flex flex-col gap-7">
      <MarkOrderRead orderId={order.id} />

      <div className="flex flex-col gap-4">
        <Link
          href="/portal"
          className="inline-flex w-fit items-center gap-2 text-[12.5px] text-muted-foreground transition-colors hover:text-gold-700 dark:hover:text-gold-300"
        >
          <ArrowLeft className="size-3.5" />
          {t('title')}
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="text-2xl font-semibold">{order.title}</h1>
            <p className="text-[13px] text-muted-foreground">
              {t('reference')} {order.reference} · {t('opened')}{' '}
              {new Date(order.created_at).toLocaleDateString(locale, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>

          <StatusBadge status={order.status} />
        </div>
      </div>

      <section className="surface flex flex-col gap-4 p-6">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {t('progress')}
        </h2>
        <OrderProgress status={order.status} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="surface flex flex-col gap-5 p-6">
          <h2 className="text-base font-semibold">{t('conversation')}</h2>

          <MessageList messages={messages} viewerId={session.userId} locale={locale} />

          <Separator />

          <MessageComposer locale={locale} orderId={order.id} reference={order.reference} />
        </section>

        <div className="flex flex-col gap-6">
          <section className="surface flex flex-col gap-4 p-6">
            <h2 className="text-base font-semibold">{t('brief')}</h2>
            <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {order.brief ?? '-'}
            </p>

            {order.status === 'inquiry' ? (
              <EditBrief
                locale={locale}
                orderId={order.id}
                reference={order.reference}
                title={order.title}
                brief={order.brief ?? ''}
              />
            ) : null}
          </section>

          <section className="surface flex flex-col gap-4 p-6">
            <h2 className="text-base font-semibold">{t('payments')}</h2>
            <MilestoneList
              milestones={milestones}
              locale={locale}
              orderReference={order.reference}
            />
          </section>

          <section className="surface flex flex-col gap-4 p-6">
            <h2 className="text-base font-semibold">{t('history')}</h2>
            <OrderTimeline events={events} />
          </section>
        </div>
      </div>
    </div>
  )
}
