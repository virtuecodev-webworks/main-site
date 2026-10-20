'use client'

import * as React from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  addMilestone,
  assignOrder,
  removeMilestone,
  setMilestoneStatus,
  setOrderStatus,
} from '@/lib/actions/orders'
import { IDLE_STATE, type ActionState } from '@/lib/actions/state'
import { MILESTONE_STATUSES } from '@/lib/constants'
import { nextStatuses } from '@/lib/orders'
import type { OrderMilestone } from '@/lib/supabase/types'
import type { OrderStatus } from '@/lib/constants'

/*
 * Staff controls for one order.
 *
 * Every select here is a native one. The design system's Radix `Select` looks
 * better in a toolbar, but it will not submit with a plain `<form action={...}>`
 * without a hidden input mirroring its value — and a mirrored value is one more
 * thing that can disagree with what is on screen. For forms that write, the
 * control that cannot lie is the right trade.
 */

const CONTROL_CLASS =
  'h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-gold-400 focus-visible:ring-3 focus-visible:ring-gold-500/18'

const COMPACT_CONTROL_CLASS =
  'h-9 rounded-xl border border-input bg-background px-3 text-[13px] text-foreground outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-gold-400 focus-visible:ring-3 focus-visible:ring-gold-500/18'

/**
 * Success wording for the console.
 *
 * Namespaced separately from the field labels above so "Assigned." can never
 * collide with the "Assigned to" label. Failures are phrased from
 * `Portal.errors`, which already covers every message an order action can
 * return — reusing those translations beats keeping a second copy in step.
 */
const SUCCESS_KEYS: Record<string, string> = {
  'status-updated': 'saved.status',
  assigned: 'saved.assigned',
  unassigned: 'saved.unassigned',
  'milestone-added': 'saved.milestoneAdded',
  removed: 'saved.removed',
}

function Feedback({ state, pending }: { state: ActionState; pending: boolean }) {
  const t = useTranslations('Portal')
  const tOrders = useTranslations('Admin.orders')

  if (pending) return null

  if (state.status === 'error') {
    return (
      <p className="text-[12.5px] text-destructive" role="alert">
        {t(`errors.${state.message}`)}
      </p>
    )
  }

  if (state.status === 'success') {
    const key = state.message ? (SUCCESS_KEYS[state.message] ?? 'saved.generic') : 'saved.generic'
    return (
      <p className="text-[12.5px] text-[var(--success)]" role="status">
        {tOrders(key)}
      </p>
    )
  }

  return null
}

/** Move the order along its lifecycle. Admins and agents both. */
export function StatusForm({
  locale,
  orderId,
  reference,
  status,
}: {
  locale: string
  orderId: string
  reference: string
  status: OrderStatus
}) {
  const t = useTranslations('Admin.orders')
  const tStatus = useTranslations('Orders.status')
  const [state, action, pending] = React.useActionState(setOrderStatus, IDLE_STATE)

  const options = nextStatuses(status)

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="reference" value={reference} />

      <div className="flex flex-col gap-2">
        <Label htmlFor={`status-${orderId}`}>{t('newStatus')}</Label>
        <select
          id={`status-${orderId}`}
          name="status"
          defaultValue={options[0] ?? ''}
          disabled={!options.length}
          className={CONTROL_CLASS}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {tStatus(option)}
            </option>
          ))}
        </select>
        {options.length ? null : (
          <p className="text-[12px] text-muted-foreground">{t('noTransitions')}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`note-${orderId}`}>{t('note')}</Label>
        <textarea
          id={`note-${orderId}`}
          name="note"
          rows={2}
          maxLength={8000}
          aria-describedby={`note-hint-${orderId}`}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-gold-400 focus-visible:ring-3 focus-visible:ring-gold-500/18"
        />
        <p id={`note-hint-${orderId}`} className="text-[12px] text-muted-foreground">
          {t('noteHint')}
        </p>
        <div className="flex items-center gap-2.5">
          <input
            id={`note-internal-${orderId}`}
            name="noteInternal"
            type="checkbox"
            value="true"
            className="size-4 rounded border-input accent-[var(--color-gold-500)]"
          />
          <Label htmlFor={`note-internal-${orderId}`} className="text-[12.5px] font-normal">
            {t('noteInternal')}
          </Label>
        </div>
      </div>

      <Feedback state={state} pending={pending} />

      <div>
        <Button type="submit" variant="gold" size="default" disabled={pending || !options.length}>
          {pending ? <VirtueSpinner className="size-4" /> : <Save className="size-4" />}
          {t('update')}
        </Button>
      </div>
    </form>
  )
}

/** Hand the order to an agent, or take it back off one. Admin only. */
export function AssignForm({
  locale,
  orderId,
  reference,
  agentEmail,
}: {
  locale: string
  orderId: string
  reference: string
  agentEmail: string | null
}) {
  const t = useTranslations('Admin.orders')
  const [state, action, pending] = React.useActionState(assignOrder, IDLE_STATE)
  const [clearState, clearAction, clearPending] = React.useActionState(assignOrder, IDLE_STATE)

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="orderId" value={orderId} />
        <input type="hidden" name="reference" value={reference} />

        <div className="flex flex-col gap-2">
          <Label htmlFor={`agent-${orderId}`}>{t('agentEmail')}</Label>
          <Input
            id={`agent-${orderId}`}
            name="agentEmail"
            type="email"
            defaultValue={agentEmail ?? ''}
            aria-describedby={`agent-hint-${orderId}`}
          />
          <p id={`agent-hint-${orderId}`} className="text-[12px] text-muted-foreground">
            {t('agentHint')}
          </p>
        </div>

        <Feedback state={state} pending={pending} />

        <div>
          <Button type="submit" variant="outline" size="default" disabled={pending}>
            {pending ? <VirtueSpinner className="size-4" /> : <Save className="size-4" />}
            {t('save')}
          </Button>
        </div>
      </form>

      {agentEmail ? (
        <form action={clearAction} className="flex flex-col gap-3 border-t border-border pt-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="reference" value={reference} />
          <input type="hidden" name="agentEmail" value="" />
          <Feedback state={clearState} pending={clearPending} />
          <div>
            <Button type="submit" variant="ghost" size="sm" disabled={clearPending}>
              {t('clear')}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}

/** One row of the payment schedule, with its own two actions. */
function MilestoneRow({
  locale,
  reference,
  milestone,
}: {
  locale: string
  reference: string
  milestone: OrderMilestone
}) {
  const t = useTranslations('Admin.orders')
  const tMilestone = useTranslations('Orders.milestone')
  const [state, setAction, pending] = React.useActionState(setMilestoneStatus, IDLE_STATE)
  const [removeState, removeAction, removePending] = React.useActionState(
    removeMilestone,
    IDLE_STATE,
  )

  return (
    <li className="flex flex-col gap-2.5 border-b border-border py-3.5 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[13.5px] font-medium">{milestone.title}</span>
        <span className="text-[13.5px] font-semibold tabular-nums">
          {milestone.currency} {Number(milestone.amount).toLocaleString()}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form action={setAction} className="flex items-center gap-2">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="reference" value={reference} />
          <input type="hidden" name="milestoneId" value={milestone.id} />

          <Label htmlFor={`ms-status-${milestone.id}`} className="sr-only">
            {t('milestoneStatus')}
          </Label>
          <select
            id={`ms-status-${milestone.id}`}
            name="milestoneStatus"
            defaultValue={milestone.status}
            // Submitting on change is the whole interaction; the button below
            // stays for the no-JavaScript case and for keyboard users.
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            className={COMPACT_CONTROL_CLASS}
          >
            {MILESTONE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {tMilestone(status)}
              </option>
            ))}
          </select>

          <Button type="submit" variant="outline" size="sm" disabled={pending}>
            {pending ? <VirtueSpinner className="size-3.5" /> : <Save className="size-3.5" />}
            {t('save')}
          </Button>
        </form>

        <form action={removeAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="reference" value={reference} />
          <input type="hidden" name="milestoneId" value={milestone.id} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={removePending}
            aria-label={`${t('remove')}: ${milestone.title}`}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </form>
      </div>

      <Feedback state={state} pending={pending} />
      <Feedback state={removeState} pending={removePending} />
    </li>
  )
}

/** The payment schedule: add, re-status and remove. */
export function MilestoneEditor({
  locale,
  orderId,
  reference,
  milestones,
  currency,
}: {
  locale: string
  orderId: string
  reference: string
  milestones: OrderMilestone[]
  currency: string
}) {
  const t = useTranslations('Admin.orders')
  const [addState, addAction, addPending] = React.useActionState(addMilestone, IDLE_STATE)

  return (
    <div className="flex flex-col gap-5">
      {milestones.length ? (
        <ul className="flex flex-col">
          {milestones.map((milestone) => (
            <MilestoneRow
              key={milestone.id}
              locale={locale}
              reference={reference}
              milestone={milestone}
            />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{t('noMilestones')}</p>
      )}

      <form action={addAction} className="flex flex-col gap-3 border-t border-border pt-5">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="orderId" value={orderId} />
        <input type="hidden" name="reference" value={reference} />
        <input type="hidden" name="currency" value={currency} />

        <p className="text-[13px] font-medium">{t('addMilestone')}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`ms-title-${orderId}`}>{t('milestoneTitle')}</Label>
            <Input id={`ms-title-${orderId}`} name="title" required maxLength={140} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`ms-amount-${orderId}`}>{t('amount')}</Label>
            <Input
              id={`ms-amount-${orderId}`}
              name="amount"
              type="number"
              min={0}
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`ms-due-${orderId}`}>{t('dueDate')}</Label>
          <Input id={`ms-due-${orderId}`} name="dueAt" type="date" />
        </div>

        <Feedback state={addState} pending={addPending} />

        <div>
          <Button type="submit" variant="gold" size="default" disabled={addPending}>
            {addPending ? <VirtueSpinner className="size-4" /> : <Plus className="size-4" />}
            {t('add')}
          </Button>
        </div>
      </form>
    </div>
  )
}
