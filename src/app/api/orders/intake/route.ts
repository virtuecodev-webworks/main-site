import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/supabase/auth'
import { isEmailConfigured, leadRecipient, sendMany } from '@/lib/email'
import { enquiryAdminEmail, enquiryClientEmail } from '@/lib/email/templates'
import type { Inquiry } from '@/lib/supabase/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      packageId,
      serviceTitle,
      tier,
      projectName,
      description,
      targetAudience,
      referenceUrls,
      deadline,
      clientName,
      clientEmail,
      currency,
    } = body

    if (!projectName || !clientEmail || !clientName || !description) {
      return NextResponse.json(
        { ok: false, message: 'Please provide all required fields.' },
        { status: 400 },
      )
    }

    const normalizedEmail = String(clientEmail).trim().toLowerCase()
    const year = new Date().getFullYear()
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase()
    let reference = `VCW-${year}-${randomHex}`

    const serviceSlug = packageId ? String(packageId).split('-')[0] : 'custom'
    const formattedMessage = `[Package Order: ${serviceTitle} — ${String(tier ?? 'starter').toUpperCase()}]\nReference: ${reference}\nProject: ${projectName}\nTarget Audience: ${targetAudience || 'N/A'}\nReference Links: ${referenceUrls || 'N/A'}\n\nProject Brief:\n${description}`

    const supabase = createSupabaseAdminClient()
    let inquiryId: string | null = null
    let portalUrl = '/portal'

    if (supabase) {
      // 1. Record as verified lead inquiry
      const { data: inquiryRow } = await supabase
        .from('inquiries')
        .insert({
          name: clientName,
          email: normalizedEmail,
          service: serviceSlug,
          budget: tier ?? 'starter',
          timeline: deadline ?? '2-4-weeks',
          message: formattedMessage,
          locale: 'en',
          status: 'new',
          source: 'package_intake_modal',
        })
        .select('id')
        .maybeSingle<{ id: string }>()

      inquiryId = inquiryRow?.id ?? null

      // 2. Resolve client account (active session OR matching profile by email)
      let clientUserId: string | null = null
      const currentUser = await getCurrentUser()
      if (currentUser) {
        clientUserId = currentUser.id
      } else {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', normalizedEmail)
          .maybeSingle<{ id: string }>()
        if (existingProfile?.id) {
          clientUserId = existingProfile.id
        }
      }

      // 3. Create real Order in `public.orders` if client account exists
      if (clientUserId) {
        const { data: createdOrder } = await supabase
          .from('orders')
          .insert({
            reference,
            client_id: clientUserId,
            title: `${projectName} (${serviceTitle} · ${String(tier ?? 'starter').toUpperCase()})`.slice(0, 140),
            brief: formattedMessage,
            service: serviceSlug,
            scope: String(tier ?? 'starter'),
            status: 'inquiry',
            currency: currency === 'NGN' ? 'NGN' : 'USD',
            locale: 'en',
            inquiry_id: inquiryId,
          })
          .select('id, reference')
          .maybeSingle<{ id: string; reference: string }>()

        if (createdOrder) {
          reference = createdOrder.reference
          portalUrl = `/portal/orders/${createdOrder.reference}`
          await supabase.from('order_messages').insert({
            order_id: createdOrder.id,
            author_id: clientUserId,
            author_role: 'client',
            body: formattedMessage,
            internal: false,
          })
        }
      }
    }

    // 4. Send styled studio & client emails if configured
    if (isEmailConfigured()) {
      const mockInquiry: Inquiry = {
        id: inquiryId ?? reference,
        name: clientName,
        email: normalizedEmail,
        phone: null,
        company: projectName,
        service: `${serviceTitle} (${String(tier ?? 'starter').toUpperCase()})`,
        budget: `${String(tier ?? 'starter').toUpperCase()} (${currency || 'USD'})`,
        timeline: deadline ?? '2-4-weeks',
        message: formattedMessage,
        locale: 'en',
        status: 'new',
        source: 'package_intake_modal',
        notified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }

      const [adminMail, clientMail] = await Promise.all([
        enquiryAdminEmail(mockInquiry, 'English (Package Intake)'),
        enquiryClientEmail(mockInquiry),
      ])

      await sendMany([
        {
          to: leadRecipient(),
          replyTo: normalizedEmail,
          email: adminMail,
        },
        {
          to: normalizedEmail,
          email: clientMail,
        },
      ])
    }

    return NextResponse.json({
      ok: true,
      reference,
      message: 'Order brief received and synced!',
      portalUrl,
    })
  } catch (error) {
    console.error('[intake-error]', error)
    return NextResponse.json(
      { ok: false, message: 'Failed to process order brief.' },
      { status: 500 },
    )
  }
}
