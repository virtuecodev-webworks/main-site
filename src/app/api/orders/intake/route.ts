import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { isEmailConfigured, leadRecipient, sendMany } from '@/lib/email'

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

    if (!projectName || !clientEmail || !clientName) {
      return NextResponse.json(
        { ok: false, message: 'Please provide all required fields.' },
        { status: 400 },
      )
    }

    const year = new Date().getFullYear()
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase()
    const reference = `VCW-${year}-${randomHex}`

    const supabase = createSupabaseAdminClient()
    if (supabase) {
      // 1. Record as verified lead inquiry
      await supabase.from('inquiries').insert({
        name: clientName,
        email: clientEmail,
        service: packageId ? String(packageId).split('-')[0] : 'custom',
        budget: tier ?? 'starter',
        timeline: deadline ?? '2-4-weeks',
        message: `[Package Order: ${serviceTitle} - ${tier?.toUpperCase()}]\nProject: ${projectName}\nAudience: ${targetAudience || 'N/A'}\nReferences: ${referenceUrls || 'N/A'}\n\nBrief:\n${description}`,
        locale: 'en',
        status: 'new',
        source: 'package_intake_modal',
      })
    }

    // 2. Email alert to studio if email is configured
    if (isEmailConfigured()) {
      const recipient = leadRecipient()
      if (recipient) {
        await sendMany([
          {
            to: recipient,
            email: {
              subject: `[New Order Brief: ${reference}] ${clientName} - ${serviceTitle}`,
              text: `A new productized order brief was submitted!\n\nReference: ${reference}\nService: ${serviceTitle} (${tier})\nClient: ${clientName} (${clientEmail})\nProject: ${projectName}\nCurrency: ${currency}\n\nBrief:\n${description}`,
              html: `<p><strong>A new productized order brief was submitted!</strong></p><p><strong>Reference:</strong> ${reference}<br/><strong>Service:</strong> ${serviceTitle} (${tier})<br/><strong>Client:</strong> ${clientName} (${clientEmail})<br/><strong>Project:</strong> ${projectName}<br/><strong>Currency:</strong> ${currency}</p><p><strong>Brief:</strong><br/>${description.replace(/\n/g, '<br/>')}</p>`,
            },
          },
        ])
      }
    }

    return NextResponse.json({
      ok: true,
      reference,
      message: 'Order brief received successfully!',
      portalUrl: `/portal`,
    })
  } catch (error) {
    console.error('[intake-error]', error)
    return NextResponse.json(
      { ok: false, message: 'Failed to process order brief.' },
      { status: 500 },
    )
  }
}
