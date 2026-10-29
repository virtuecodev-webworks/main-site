import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { sendEmail, leadRecipient } from '@/lib/email'
import { orderMessageNotificationEmail } from '@/lib/email/templates'
import { absoluteUrl } from '@/lib/utils'
import { AGENCY } from '@/lib/constants'

export interface NotifyOrderMessageParams {
  orderId: string
  reference?: string
  body: string
  authorRole: 'admin' | 'agent' | 'client'
  authorId?: string
  locale?: string
}

/**
 * Sends a transactional email notification whenever an order message is posted.
 *
 * If author is 'client' -> notifies the Admin / Staff team.
 * If author is 'admin' or 'agent' -> notifies the Client.
 *
 * Sets `replyTo` header to `reply+{reference}@{inboundDomain}` so the recipient
 * can directly reply to the email to continue the conversation.
 */
export async function notifyOrderMessage({
  orderId,
  reference,
  body,
  authorRole,
  authorId,
  locale = 'en',
}: NotifyOrderMessageParams): Promise<{ sent: boolean; error?: string }> {
  try {
    const supabase = createSupabaseAdminClient()
    if (!supabase) {
      console.warn('[notifications] Supabase admin client unavailable — skipping notification')
      return { sent: false, error: 'supabase-unavailable' }
    }

    // 1. Fetch order details
    const orderQuery = reference
      ? supabase.from('orders').select('id, reference, title, client_id, agent_id, locale').eq('reference', reference)
      : supabase.from('orders').select('id, reference, title, client_id, agent_id, locale').eq('id', orderId)

    const { data: order, error: orderErr } = await orderQuery.maybeSingle<{
      id: string
      reference: string
      title: string
      client_id: string
      agent_id: string | null
      locale: string | null
    }>()

    if (orderErr || !order) {
      console.warn('[notifications] Order not found for notification:', orderId || reference, orderErr?.message)
      return { sent: false, error: 'order-not-found' }
    }

    const orderRef = order.reference
    const orderTitle = order.title || 'Client Project'
    const orderLocale = locale || order.locale || 'en'

    // Inbound reply address configuration
    const inboundDomain = process.env.INBOUND_EMAIL_DOMAIN || process.env.EMAIL_DOMAIN || AGENCY.domain
    const replyToAddress = `reply+${orderRef}@${inboundDomain}`

    // 2. Client sent message -> Notify Admin & Staff
    if (authorRole === 'client') {
      let clientName = 'Client'
      if (authorId) {
        const { data: authorProf } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', authorId)
          .maybeSingle<{ full_name: string | null }>()
        if (authorProf?.full_name) clientName = authorProf.full_name
      }

      const actionUrl = absoluteUrl(`/${orderLocale}/admin/orders/${orderRef}`)
      const adminEmail = leadRecipient()

      const email = await orderMessageNotificationEmail({
        recipientName: 'Virtue & Co. Team',
        senderName: clientName,
        senderRole: 'client',
        orderReference: orderRef,
        orderTitle,
        messageBody: body,
        actionUrl,
        isStaffRecipient: true,
      })

      const res = await sendEmail({
        to: adminEmail,
        email,
        replyTo: replyToAddress,
      })

      return { sent: res.ok, error: res.error }
    }

    // 3. Admin / Staff sent message -> Notify Client
    if (authorRole === 'admin' || authorRole === 'agent') {
      let clientEmail: string | null = null
      let clientName: string | null = null

      // Check profile
      const { data: clientProf } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', order.client_id)
        .maybeSingle<{ email: string | null; full_name: string | null }>()

      if (clientProf?.email) {
        clientEmail = clientProf.email
        clientName = clientProf.full_name
      } else {
        // Fallback to auth.users
        const { data: userData } = await supabase.auth.admin.getUserById(order.client_id)
        if (userData?.user?.email) {
          clientEmail = userData.user.email
          clientName = (userData.user.user_metadata?.full_name as string) || (userData.user.user_metadata?.name as string) || null
        }
      }

      if (!clientEmail) {
        console.warn('[notifications] No client email found for order:', orderRef, 'client_id:', order.client_id)
        return { sent: false, error: 'no-client-email' }
      }

      let authorName = 'Virtue & Co. Lead Engineer'
      if (authorId) {
        const { data: authorProf } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', authorId)
          .maybeSingle<{ full_name: string | null }>()
        if (authorProf?.full_name) authorName = authorProf.full_name
      }

      const actionUrl = absoluteUrl(`/${orderLocale}/portal/orders/${orderRef}`)

      const email = await orderMessageNotificationEmail({
        recipientName: clientName || undefined,
        senderName: authorName,
        senderRole: authorRole,
        orderReference: orderRef,
        orderTitle,
        messageBody: body,
        actionUrl,
        isStaffRecipient: false,
      })

      const res = await sendEmail({
        to: clientEmail,
        email,
        replyTo: replyToAddress,
      })

      return { sent: res.ok, error: res.error }
    }

    return { sent: false, error: 'unsupported-role' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown notification error'
    console.error('[notifications] notifyOrderMessage failed:', message)
    return { sent: false, error: message }
  }
}
