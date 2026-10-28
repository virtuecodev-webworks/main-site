import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { welcomeEmail } from '@/lib/email/templates'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en/portal'
  const errorDescription = requestUrl.searchParams.get('error_description')
  const oauthError = requestUrl.searchParams.get('error')

  // Safe internal path redirect target
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/en/portal'

  if (oauthError || errorDescription) {
    console.warn('[auth-callback] OAuth provider error:', oauthError, errorDescription)
    const loginUrl = new URL('/en/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'oauth')
    if (errorDescription) {
      loginUrl.searchParams.set('message', errorDescription)
    }
    return NextResponse.redirect(loginUrl)
  }

  if (code) {
    const supabase = await createSupabaseServerClient()
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[auth-callback] exchangeCodeForSession failed:', error.message)
        const loginUrl = new URL('/en/login', requestUrl.origin)
        loginUrl.searchParams.set('error', 'exchange_failed')
        return NextResponse.redirect(loginUrl)
      }

      if (data?.user) {
        const user = data.user
        const admin = createSupabaseAdminClient()

        if (admin && user.email) {
          const email = user.email.toLowerCase()
          const fullName =
            (user.user_metadata?.full_name as string | undefined) ||
            (user.user_metadata?.name as string | undefined) ||
            email.split('@')[0] ||
            'Client'

          // Ensure profile exists with client role
          try {
            await admin.from('profiles').upsert(
              {
                id: user.id,
                email,
                full_name: fullName,
                role: 'client',
              },
              { onConflict: 'id', ignoreDuplicates: true },
            )
          } catch (profileErr) {
            console.warn('[auth-callback] profile sync error:', profileErr)
          }

          // Auto-subscribe to newsletter as verified active subscriber
          try {
            await admin.from('newsletter_subscribers').upsert(
              {
                email,
                status: 'active',
                source: 'google-oauth',
                confirmed_at: new Date().toISOString(),
              },
              { onConflict: 'email', ignoreDuplicates: false },
            )
            await admin.from('subscribers').upsert(
              { email, locale: 'en', source: 'google-oauth' },
              { onConflict: 'email', ignoreDuplicates: false },
            )
          } catch (subErr) {
            console.warn('[auth-callback] newsletter sync error:', subErr)
          }

          // If the account was created right now (within 90s), send welcome email
          const createdAt = new Date(user.created_at).getTime()
          const isBrandNew = Date.now() - createdAt < 90000
          if (isBrandNew) {
            try {
              const rendered = await welcomeEmail({ name: fullName })
              await sendEmail({ to: email, email: rendered })
            } catch (emailErr) {
              console.warn('[auth-callback] welcome email failed:', emailErr)
            }
          }
        }
      }
    }
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin))
}
