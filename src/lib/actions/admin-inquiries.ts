'use server'

import { getAdminSession } from '@/lib/supabase/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { inquiryStatusUpdateSchema } from '@/lib/validation'

export interface StatusResult {
  ok: boolean
  message?: string
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
