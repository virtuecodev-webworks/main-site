import { NextResponse } from 'next/server'
import { resolveSession } from '@/lib/supabase/auth'

/**
 * Who is signed in, for the browser.
 *
 * The marketing layout is deliberately session-free so those pages can be
 * statically rendered. The header therefore cannot know the visitor's role at
 * build time, and asks this endpoint after paint instead. It answers with the
 * minimum needed to choose a link — never an email or a name.
 *
 * `/api/*` is excluded from the i18n proxy matcher, so this route is plain JSON
 * with no locale handling.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await resolveSession()

  return NextResponse.json(
    session
      ? { signedIn: true, isStaff: session.isStaff, role: session.role }
      : { signedIn: false, isStaff: false, role: null },
    { headers: { 'cache-control': 'no-store' } },
  )
}
