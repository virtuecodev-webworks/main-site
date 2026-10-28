import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Secondary callback alias redirecting to /auth/callback with all parameters preserved.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const target = new URL('/auth/callback', url.origin)
  target.search = url.search
  return NextResponse.redirect(target)
}
