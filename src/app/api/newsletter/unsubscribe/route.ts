import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, message: 'Invalid email address.' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()
    if (supabase) {
      const now = new Date().toISOString()
      await supabase
        .from('newsletter_subscribers')
        .update({ status: 'unsubscribed', unsubscribed_at: now })
        .eq('email', email)

      await supabase
        .from('subscribers')
        .update({ unsubscribed_at: now })
        .eq('email', email)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, message: 'Failed to unsubscribe.' }, { status: 500 })
  }
}
