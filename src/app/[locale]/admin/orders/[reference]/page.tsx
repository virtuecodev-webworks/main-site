import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Separator } from '@/components/ui/separator'
import { AssignForm, MilestoneEditor, StatusForm } from '@/components/admin/order-controls'
import { MessageComposer } from '@/components/portal/message-composer'
import { MessageList } from '@/components/portal/message-list'
import { MarkOrderRead } from '@/components/portal/mark-order-read'
import { OrderProgress, OrderTimeline, StatusBadge } from '@/components/portal/order-view'
import { OrderInteractiveView } from '@/components/portal/order-interactive-view'
import { requireStaff } from '@/lib/supabase/auth'
import { getOrderThread, getOrderWithClient } from '@/lib/supabase/orders'

export const dynamic = 'force-dynamic'

/**
 * One order, as the studio sees it.
 *
 * `getOrderWithClient` returns nothing for an order that is not assigned to the
 * caller, so an agent who guesses a reference gets the same 404 as one who
 * mistypes it. The status history and the milestones come from the same
 * policy-scoped queries as the client's view of the page — the only difference is
 * that staff also receive the internal notes.
 */
export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ locale: string; reference: string }>
}) {
  const { locale, reference } = await params
  setRequestLocale(locale)

  const session = await requireStaff(locale)
  const order = await getOrderWithClient(reference)
  if (!order) notFound()

  const t = await getTranslations('Admin.orders')
  const { messages, events, milestones } = await getOrderThread(order.id, true)

  return (
    <div className="flex flex-col gap-7">
      <MarkOrderRead orderId={order.id} />

      <div className="flex flex-col gap-4">
        <Link
          href="/admin/orders"
          className="inline-flex w-fit items-center gap-2 text-[12.5px] text-muted-foreground transition-colors hover:text-gold-700 dark:hover:text-gold-300"
        >
          <ArrowLeft className="size-3.5" />
          {t('title')}
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="text-2xl font-semibold">{order.title}</h1>
            <p className="text-[13px] text-muted-foreground">
              {t('reference')} {order.reference} · {t('requested')}{' '}
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
        <OrderProgress status={order.status} />
      </section>

      <OrderInteractiveView
        conversationNode={
          <section className="surface flex flex-col gap-5 p-6">
            <h2 className="text-base font-semibold">{t('thread')}</h2>

            <MessageList
              messages={messages}
              viewerId={session.userId}
              clientName={order.client?.full_name ?? order.client?.email ?? null}
              locale={locale}
            />

            <Separator />

            <MessageComposer
              locale={locale}
              orderId={order.id}
              reference={order.reference}
              canPostInternal
            />
          </section>
        }
        detailsNode={
          <>
            <section className="surface flex flex-col gap-3 p-6">
              <h2 className="text-base font-semibold">{t('client')}</h2>
              <dl className="flex flex-col gap-2 text-[13px]">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                    {t('client')}
                  </dt>
                  <dd>{order.client?.full_name ?? '-'}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                    {t('contact')}
                  </dt>
                  <dd className="break-all">{order.client?.email ?? '-'}</dd>
                </div>
                {order.client?.company ? (
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                      {t('company')}
                    </dt>
                    <dd>{order.client.company}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className="surface flex flex-col gap-4 p-6">
              <h2 className="text-base font-semibold">{t('brief')}</h2>
              <div className="flex flex-wrap gap-2 text-[12px] text-muted-foreground">
                <span>{order.currency}</span>
                {order.service ? <span>· {order.service}</span> : null}
                {order.scope ? <span>· {order.scope}</span> : null}
              </div>
              <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {order.brief ?? '-'}
              </p>
            </section>

            <section className="surface flex flex-col gap-4 p-6">
              <h2 className="text-base font-semibold">{t('updateStatus')}</h2>
              <StatusForm
                locale={locale}
                orderId={order.id}
                reference={order.reference}
                status={order.status}
              />
            </section>

            {session.isAdmin ? (
              <section className="surface flex flex-col gap-4 p-6">
                <h2 className="text-base font-semibold">{t('assignment')}</h2>
                <AssignForm
                  locale={locale}
                  orderId={order.id}
                  reference={order.reference}
                  agentEmail={order.agent?.email ?? null}
                />
              </section>
            ) : null}

            <section className="surface flex flex-col gap-4 p-6">
              <h2 className="text-base font-semibold">{t('milestones')}</h2>
              <MilestoneEditor
                locale={locale}
                orderId={order.id}
                reference={order.reference}
                milestones={milestones}
                currency={order.currency}
              />
            </section>

            <section className="surface flex flex-col gap-4 p-6">
              <h2 className="text-base font-semibold">{t('history')}</h2>
              <OrderTimeline events={events} />
            </section>
          </>
        }
      />
    </div>
  )
}
