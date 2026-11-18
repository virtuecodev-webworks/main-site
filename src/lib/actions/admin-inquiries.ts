'use server'

import { revalidatePath } from 'next/cache'
import { getAdminSession } from '@/lib/supabase/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { inquiryStatusUpdateSchema } from '@/lib/validation'

export interface StatusResult {
  ok: boolean
  message?: string
  reference?: string
}

/** Moves a lead through the pipeline: new → contacted → won / archived. */
export async function updateInquiryStatus(formData: FormData): Promise<StatusResult> {
  const session = await getAdminSession()
  if (!session) return { ok: false, message: 'unauthorised' }

  const parsed = inquiryStatusUpdateSchema.safeParse({
    id: String(formData.get('id') ?? ''),
    status: String(formData.get('status') ?? 'new'),
  })
  if (!parsed.success) return { ok: false, message: 'validation' }

  const supabase = (await createSupabaseServerClient()) ?? createSupabaseAdminClient()
  if (!supabase) return { ok: false, message: 'not-configured' }

  const { error } = await supabase
    .from('inquiries')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)

  if (error) {
    console.error('[inquiries] status update failed:', error.message)
    return { ok: false, message: 'save-failed' }
  }

  return { ok: true }
}

/** Converts an inquiry into a tracked studio Order in 1 click. */
export async function convertInquiryToOrder(formData: FormData): Promise<StatusResult> {
  const session = await getAdminSession()
  if (!session) return { ok: false, message: 'unauthorised' }

  const inquiryId = String(formData.get('id') ?? '').trim()
  if (!inquiryId) return { ok: false, message: 'validation' }

  const supabase = createSupabaseAdminClient() ?? (await createSupabaseServerClient())
  if (!supabase) return { ok: false, message: 'not-configured' }

  const { data: inquiry, error: fetchErr } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', inquiryId)
    .maybeSingle()

  if (fetchErr || !inquiry) {
    return { ok: false, message: 'Inquiry not found' }
  }

  // Check if an order already exists for this inquiry
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('reference')
    .eq('inquiry_id', inquiryId)
    .maybeSingle()

  if (existingOrder?.reference) {
    return { ok: true, reference: existingOrder.reference }
  }

  // Resolve client profile by email, or fall back to admin userId so the order is immediately tracked
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', inquiry.email.toLowerCase().trim())
    .maybeSingle()

  const clientId = profile?.id ?? session.userId
  const year = new Date().getFullYear()
  const hex = Math.random().toString(36).substring(2, 8).toUpperCase()
  const reference = `VCW-${year}-${hex}`

  const { data: order, error: insertErr } = await supabase
    .from('orders')
    .insert({
      reference,
      client_id: clientId,
      title: `${inquiry.company || inquiry.name} — ${inquiry.service || 'Custom Build'}`.slice(0, 140),
      brief: inquiry.message,
      service: inquiry.service || 'custom',
      scope: inquiry.budget || null,
      status: 'scoping',
      currency: 'USD',
      locale: inquiry.locale || 'en',
      inquiry_id: inquiry.id,
    })
    .select('reference')
    .single()

  if (insertErr || !order) {
    console.error('[inquiries] convertInquiryToOrder failed:', insertErr?.message)
    return { ok: false, message: 'Could not create order' }
  }

  await supabase.from('inquiries').update({ status: 'won' }).eq('id', inquiryId)
  revalidatePath('/[locale]/admin/inquiries', 'page')
  revalidatePath('/[locale]/admin/orders', 'page')

  return { ok: true, reference: order.reference }
}
