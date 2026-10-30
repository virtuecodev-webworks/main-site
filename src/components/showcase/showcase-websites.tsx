'use client'

import * as React from 'react'
import { ArrowLeft, ArrowUpRight, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { AurumCapitalSite } from './sites/aurum-site'
import { MaisonFinerySite } from './sites/finery-site'
import { MeridianEditorialSite } from './sites/meridian-site'
import { NorthlineStudioSite } from './sites/northline-site'
import { KinetixAiCloudSite } from './sites/kinetix-site'
import { SolaceHealthPortalSite } from './sites/solace-site'
import { RoyalBanquetSite } from './sites/royal-banquet-site'

const SHOWCASE_DIRECTORY = [
  { slug: 'aurum-capital-platform', name: 'Aurum Private Treasury', tag: 'FinTech' },
  { slug: 'finery-commerce', name: 'Maison Finery Paris', tag: 'Luxury Store' },
  { slug: 'the-royal-banquet', name: 'The Royal Banquet UK', tag: 'Luxury Event' },
  { slug: 'meridian-editorial', name: 'The Meridian Review', tag: 'Editorial' },
  { slug: 'northline-studio', name: 'Northline Prefab', tag: 'Architecture' },
  { slug: 'kinetix-ai-cloud', name: 'Kinetix AI Cloud', tag: 'AI Cloud' },
  { slug: 'solace-health-portal', name: 'Solace Longevity', tag: 'Healthcare' },
] as const

/**
 * Floating unobtrusive studio badge shown only when viewing a showcase website in a full tab
 * (automatically hidden when embedded inside the portfolio `<iframe>` preview).
 */
function FloatingStudioDock({ slug }: { slug: string }) {
  const [inIframe, setInIframe] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('embed') === '1' || window.self !== window.top) {
        setInIframe(true)
      }
    } catch {
      setInIframe(true)
    }
  }, [])

  if (inIframe) return null

  return (
    <div className="fixed bottom-4 left-4 z-[90] font-sans">
      {expanded && (
        <div className="mb-2 w-72 rounded-2xl border border-white/15 bg-[#0a0a0a]/95 p-3 text-[#f5f4f0] shadow-2xl backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2 text-[11px] font-semibold text-white/60 uppercase">
            <span>Switch Live Showcase Site</span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-white/50 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="space-y-1">
            {SHOWCASE_DIRECTORY.map((item) => {
              const active = item.slug === slug
              return (
                <Link
                  key={item.slug}
                  href={`/showcase/${item.slug}`}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                    active
                      ? 'bg-[#dcaa28] font-semibold text-[#0a0a0a]'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{item.name}</span>
                  <span
                    className={`font-mono text-[10px] ${
                      active ? 'text-[#0a0a0a]/75' : 'text-white/45'
                    }`}
                  >
                    {item.tag}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0a0a0a]/90 p-1.5 text-xs text-[#f5f4f0] shadow-2xl backdrop-blur-xl">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-medium text-white transition-colors hover:bg-white/20"
        >
          <ArrowLeft className="size-3.5 text-[#dcaa28]" />
          <span>Back to Virtue &amp; Co.</span>
        </Link>

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Sparkles className="size-3.5 text-[#dcaa28]" />
          <span className="hidden sm:inline">Switch Site (7)</span>
        </button>

        <Link
          href="/contact"
          className="inline-flex items-center gap-1 rounded-full bg-[#dcaa28] px-3 py-1.5 font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
        >
          <span>Build Yours</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}

export function ShowcaseWebsiteRenderer({ slug }: { slug: string }) {
  return (
    <div className="min-h-dvh w-full">
      <FloatingStudioDock slug={slug} />
      {slug === 'aurum-capital-platform' && <AurumCapitalSite />}
      {slug === 'finery-commerce' && <MaisonFinerySite />}
      {slug === 'the-royal-banquet' && <RoyalBanquetSite />}
      {slug === 'meridian-editorial' && <MeridianEditorialSite />}
      {slug === 'northline-studio' && <NorthlineStudioSite />}
      {slug === 'kinetix-ai-cloud' && <KinetixAiCloudSite />}
      {slug === 'solace-health-portal' && <SolaceHealthPortalSite />}
      {![
        'aurum-capital-platform',
        'finery-commerce',
        'the-royal-banquet',
        'meridian-editorial',
        'northline-studio',
        'kinetix-ai-cloud',
        'solace-health-portal',
      ].includes(slug) && <AurumCapitalSite />}
    </div>
  )
}
