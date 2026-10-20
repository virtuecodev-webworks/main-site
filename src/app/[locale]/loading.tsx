import { RouteLoader } from '@/components/site/route-loader'

/**
 * Segment-level Suspense fallback. Next.js streams this while a navigation is in
 * flight, so moving between routes shows the brand spinner instead of a frozen
 * screen.
 */
export default function Loading() {
  return <RouteLoader />
}
