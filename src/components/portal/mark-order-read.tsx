'use client'

import * as React from 'react'
import { markOrderRead } from '@/lib/actions/orders'

/**
 * Moves the viewer's read marker for this order to now.
 *
 * Deliberately a client effect rather than something the page does while
 * rendering: a Server Component render should not write to the database, and
 * doing it in the browser also means the marker only moves for people who
 * actually opened the thread.
 *
 * The ref guard keeps React's development double-invoke from posting twice.
 */
export function MarkOrderRead({ orderId }: { orderId: string }) {
  const sent = React.useRef(false)

  React.useEffect(() => {
    if (sent.current) return
    sent.current = true
    void markOrderRead(orderId)
  }, [orderId])

  return null
}
