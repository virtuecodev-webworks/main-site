import {
  isLiveOrderStatus,
  type MilestoneStatus,
  type OrderStatus,
} from '@/lib/constants'

/**
 * Which statuses an order may move to next.
 *
 * The database records every transition but deliberately does not enforce this
 * map: the studio sometimes has to correct a mistake, reopen something, or jump a
 * stalled order forward, and a hard constraint in the schema would make an
 * honest fix impossible. What the map *does* do is keep the console's buttons and
 * the Server Action's validation reading from one source, so the UI can never
 * offer a move the action will reject.
 *
 * `cancelled → inquiry` exists so a project that was called off can be picked
 * back up without creating a duplicate order.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  inquiry: ['scoping', 'quoted', 'cancelled'],
  scoping: ['quoted', 'active', 'cancelled'],
  quoted: ['active', 'scoping', 'cancelled'],
  active: ['review', 'delivered', 'cancelled'],
  review: ['active', 'delivered', 'cancelled'],
  delivered: ['closed', 'active'],
  closed: ['active'],
  cancelled: ['inquiry'],
}

export function nextStatuses(status: OrderStatus): readonly OrderStatus[] {
  return ORDER_TRANSITIONS[status] ?? []
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return nextStatuses(from).includes(to)
}

/**
 * Where an order sits in the five visible phases.
 *
 * Eight stored statuses is the right level of detail for the studio, but it is
 * too much for a client wondering "is this being worked on?". The progress bar
 * shows five steps and maps the eight onto them.
 */
export const ORDER_PHASES = ['request', 'planning', 'building', 'review', 'done'] as const
export type OrderPhase = (typeof ORDER_PHASES)[number]

const PHASE_BY_STATUS: Record<OrderStatus, OrderPhase> = {
  inquiry: 'request',
  scoping: 'planning',
  quoted: 'planning',
  active: 'building',
  review: 'review',
  delivered: 'done',
  closed: 'done',
  cancelled: 'request',
}

export function phaseFor(status: OrderStatus): OrderPhase {
  return PHASE_BY_STATUS[status]
}

export function phaseIndex(status: OrderStatus): number {
  return ORDER_PHASES.indexOf(phaseFor(status))
}

/* -------------------------------------------------------------------------- */
/*  Milestones                                                                 */
/* -------------------------------------------------------------------------- */

export interface MilestoneTotals {
  /** Billed total, per currency. An order is normally single-currency. */
  billed: Record<string, number>
  /** Already paid, per currency. */
  paid: Record<string, number>
  count: number
  paidCount: number
}

export function summariseMilestones(
  milestones: Array<{ amount: number; currency: string; status: MilestoneStatus }>,
): MilestoneTotals {
  const totals: MilestoneTotals = { billed: {}, paid: {}, count: milestones.length, paidCount: 0 }

  for (const milestone of milestones) {
    const amount = Number(milestone.amount ?? 0)
    totals.billed[milestone.currency] = (totals.billed[milestone.currency] ?? 0) + amount
    if (milestone.status === 'paid') {
      totals.paidCount += 1
      totals.paid[milestone.currency] = (totals.paid[milestone.currency] ?? 0) + amount
    }
  }

  return totals
}

/** Live work first, then closed history. Used to split the portal list. */
export function partitionByLiveness<T extends { status: OrderStatus }>(
  orders: T[],
): { live: T[]; past: T[] } {
  const live: T[] = []
  const past: T[] = []
  for (const order of orders) {
    ;(isLiveOrderStatus(order.status) ? live : past).push(order)
  }
  return { live, past }
}
