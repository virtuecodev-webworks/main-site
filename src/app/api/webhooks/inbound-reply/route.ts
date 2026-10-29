import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { notifyOrderMessage } from '@/lib/orders/notifications'

/**
 * Strips quoted conversation history from an email reply so only the
 * author's new response is preserved.
 */
function cleanEmailBody(raw: string): string {
  if (!raw) return ''

  let text = raw.trim()

  // 1. Remove Brevo / Outlook / Apple / Gmail quote markers:
  // "On Mon, Oct 29, 2026 at ... wrote:"
  text = text.replace(/(?:^|\n)(?:On\s+.+?\s+wrote:[\s\S]*$)/i, '')
  // "Le ... a écrit :" (French)
  text = text.replace(/(?:^|\n)(?:Le\s+.+?\s+a écrit\s*:[\s\S]*$)/i, '')
  // "El ... escribió:" (Spanish)
  text = text.replace(/(?:^|\n)(?:El\s+.+?\s+escribió\s*:[\s\S]*$)/i, '')
  // "Am ... schrieb ...:" (German)
  text = text.replace(/(?:^|\n)(?:Am\s+.+?\s+schrieb\s*:[\s\S]*$)/i, '')

  // 2. Outlook / Exchange original message headers
  text = text.replace(/(?:^|\n)(?:-{3,}\s*Original Message\s*-{3,}[\s\S]*$)/i, '')
  text = text.replace(/(?:^|\n)(?:From:\s+.+?[\r\n]+Sent:\s+.+?[\r\n]+To:\s+.+?[\s\S]*$)/i, '')

  // 3. Remove lines starting with '>'
  const lines = text.split('\n')
  const unquotedLines = lines.filter((line) => !line.trim().startsWith('>'))
  text = unquotedLines.join('\n').trim()

  // 4. Strip standard trailing email signature delimiters ("-- \n")
  text = text.replace(/\n--\s*[\r\n][\s\S]*$/, '')

  // 5. Strip common mobile signatures
  text = text.replace(/\n\s*Sent from my (?:iPhone|iPad|Android|Galaxy|mobile device)[\s\S]*$/i, '')
  text = text.replace(/\n\s*Get Outlook for (?:iOS|Android)[\s\S]*$/i, '')

  return text.trim()
}

/**
 * Extracts a pure email address from a string like "Alex Vance <alex@domain.com>".
 */
function extractEmail(str: string): string {
  const match = str.match(/<([^>]+)>/)
  if (match && match[1]) return match[1].toLowerCase().trim()
  const rawMatch = str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  return rawMatch ? rawMatch[0].toLowerCase().trim() : str.toLowerCase().trim()
}

/**
 * Extracts the order reference (e.g. VCW-2026-DEV001) from recipient addresses
 * (such as reply+VCW-2026-DEV001@...) or the email subject line.
 */
function extractOrderReference(toAddresses: string[], subject: string): string | null {
  // Check 'To' / 'Cc' headers for reply+<ref>@ pattern
  for (const addr of toAddresses) {
    const match = addr.match(/reply\+([a-zA-Z0-9-_]+)@/i)
    if (match && match[1]) return match[1].toUpperCase()
  }

  // Fallback: Check subject for [VCW-xxxx] or VCW-xxxx pattern
  const subjectMatch = subject.match(/VCW-\d{4}-[A-Z0-9]+/i)
  if (subjectMatch) return subjectMatch[0].toUpperCase()

  return null
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/inbound-reply',
    description: 'Inbound email reply parser for Virtue & Co. client/admin conversations.',
    timestamp: new Date().toISOString(),
  })
}

export async function POST(req: NextRequest) {
  try {
    // 1. Webhook Secret verification (optional if secret is configured)
    const secret = process.env.INBOUND_WEBHOOK_SECRET
    if (secret) {
      const authHeader = req.headers.get('x-webhook-secret') || req.headers.get('authorization')
      const urlSecret = req.nextUrl.searchParams.get('secret')
      if (authHeader !== secret && authHeader !== `Bearer ${secret}` && urlSecret !== secret) {
        return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 })
      }
    }

    const contentType = req.headers.get('content-type') || ''
    let from = ''
    let toAddresses: string[] = []
    let subject = ''
    let rawBody = ''

    // 2. Parse payload based on Content-Type
    if (contentType.includes('application/json')) {
      const json = await req.json()

      // Support Brevo inbound structure (items array)
      if (Array.isArray(json.items) && json.items.length > 0) {
        const item = json.items[0]
        from = typeof item.From === 'object' ? item.From.Address || '' : String(item.From || '')
        subject = item.Subject || ''
        toAddresses = Array.isArray(item.To)
          ? item.To.map((t: { Address?: string } | string) => (typeof t === 'object' ? t.Address || '' : t))
          : [String(item.To || '')]
        // Brevo provides pre-extracted message in ExtractedMarkdownMessage / ExtractedText
        rawBody = item.ExtractedMarkdownMessage || item.ExtractedText || item.RawTextBody || item.RawHtmlBody || ''
      }
      // Support Resend inbound structure
      else if (json.from && (json.to || json.subject)) {
        from = json.from
        subject = json.subject || ''
        toAddresses = Array.isArray(json.to) ? json.to : [json.to]
        rawBody = json.text || json.html || ''
      }
      // Support Postmark inbound structure
      else if (json.From && (json.To || json.Subject)) {
        from = json.From
        subject = json.Subject || ''
        toAddresses = Array.isArray(json.To) ? json.To : [json.To]
        rawBody = json.StrippedTextReply || json.TextBody || json.HtmlBody || ''
      }
      // Generic JSON fallback
      else {
        from = json.from || json.sender || ''
        subject = json.subject || ''
        toAddresses = Array.isArray(json.to) ? json.to : [json.to || '']
        rawBody = json.body || json.text || json.message || ''
      }
    } else {
      // Support multipart/form-data (SendGrid, Mailgun)
      const formData = await req.formData()
      from = (formData.get('from') as string) || (formData.get('sender') as string) || ''
      subject = (formData.get('subject') as string) || ''
      const to = (formData.get('to') as string) || (formData.get('recipient') as string) || ''
      toAddresses = [to]
      rawBody =
        (formData.get('stripped-text') as string) ||
        (formData.get('text') as string) ||
        (formData.get('html') as string) ||
        ''
    }

    const senderEmail = extractEmail(from)
    const cleanBody = cleanEmailBody(rawBody)
    const orderRef = extractOrderReference(toAddresses, subject)

    if (!orderRef) {
      console.warn('[inbound-reply] No order reference found in incoming email headers or subject:', {
        toAddresses,
        subject,
      })
      // Return 200 so mail delivery agent does not endlessly bounce
      return NextResponse.json({ received: true, ignored: 'no-order-reference' })
    }

    if (!cleanBody) {
      console.warn('[inbound-reply] Empty body extracted for order:', orderRef)
      return NextResponse.json({ received: true, ignored: 'empty-body' })
    }

    const supabase = createSupabaseAdminClient()
    if (!supabase) {
      console.error('[inbound-reply] Supabase admin client unavailable')
      return NextResponse.json({ error: 'database-unavailable' }, { status: 500 })
    }

    // 3. Find the matching order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, reference, title, client_id, agent_id, locale')
      .eq('reference', orderRef)
      .maybeSingle<{
        id: string
        reference: string
        title: string
        client_id: string
        agent_id: string | null
        locale: string | null
      }>()

    if (orderErr || !order) {
      console.warn('[inbound-reply] Order not found for reference:', orderRef)
      return NextResponse.json({ received: true, ignored: 'order-not-found' })
    }

    // 4. Determine Author Role & Author ID
    let authorId: string = order.client_id
    let authorRole: 'client' | 'admin' | 'agent' = 'client'

    // Look up sender in profiles
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .ilike('email', senderEmail)
      .maybeSingle<{ id: string; email: string; role: string; full_name: string | null }>()

    if (senderProfile) {
      authorId = senderProfile.id
      if (senderProfile.role === 'admin' || senderProfile.role === 'agent') {
        authorRole = senderProfile.role as 'admin' | 'agent'
      } else {
        authorRole = 'client'
      }
    } else {
      // If not in profiles, check if sender is the client for this order
      const { data: clientUser } = await supabase.auth.admin.getUserById(order.client_id)
      if (clientUser?.user?.email?.toLowerCase() === senderEmail) {
        authorId = order.client_id
        authorRole = 'client'
      } else {
        // Assume external client or note author
        authorId = order.client_id
        authorRole = 'client'
      }
    }

    // 5. Insert new message into order_messages
    const { data: inserted, error: insertErr } = await supabase
      .from('order_messages')
      .insert({
        order_id: order.id,
        author_id: authorId,
        author_role: authorRole,
        body: cleanBody,
        internal: false,
      })
      .select('id')
      .single<{ id: string }>()

    if (insertErr || !inserted) {
      console.error('[inbound-reply] Failed to insert message:', insertErr?.message)
      return NextResponse.json({ error: 'insert-failed' }, { status: 500 })
    }

    // 6. Revalidate cache on order pages
    const locale = order.locale || 'en'
    try {
      revalidatePath(`/${locale}/portal/orders/${order.reference}`)
      revalidatePath(`/${locale}/admin/orders/${order.reference}`)
    } catch {
      /* non-blocking */
    }

    // 7. Dispatch reciprocal notification email so the other party receives the reply
    notifyOrderMessage({
      orderId: order.id,
      reference: order.reference,
      body: cleanBody,
      authorRole,
      authorId,
      locale,
    }).catch((err) => {
      console.warn('[inbound-reply] Reciprocal notification dispatch failed:', err)
    })

    return NextResponse.json({
      success: true,
      messageId: inserted.id,
      orderReference: order.reference,
      authorRole,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[inbound-reply] Webhook handler caught error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
