'use server'

import { handleInquiry, type InquiryResult } from '@/lib/inquiries/handler'

/**
 * Server Action backing the contact form. The client posts a plain object so
 * the same pipeline can also be hit from `/api/contact`.
 */
export async function submitInquiry(payload: unknown): Promise<InquiryResult> {
  return handleInquiry(payload)
}
