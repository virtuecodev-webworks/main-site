'use client'

import * as React from 'react'
import { ArrowUpRight, Monitor, RotateCw, Smartphone, Tablet } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export interface LiveShowcaseBrowserProps {
  slug: string
  title: string
  liveUrl: string
  className?: string
}

export function LiveShowcaseBrowser({
  slug,
  title,
  liveUrl,
  className,
}: LiveShowcaseBrowserProps) {
  const [viewport, setViewport] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [reloadKey, setReloadKey] = React.useState(0)

  const domainLabel = `https://${slug}.vcw.studio`

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[22px] border border-[#f5f4f024] bg-[#0a0a0a] p-3 text-[#f5f4f0] shadow-2xl sm:p-5',
        className,
      )}
    >
      {/* Top Browser Chrome */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f5f4f01a] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500/80" />
            <span className="size-2.5 rounded-full bg-amber-400/80" />
            <span className="size-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-[#f5f4f01a] bg-white/[0.04] px-3 py-1 font-mono text-xs text-[#f5f4f0]/75 sm:flex">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span>{domainLabel}</span>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              aria-label="Reload live preview"
              className="ml-1 text-[#f5f4f0]/50 hover:text-primary"
            >
              <RotateCw className="size-3" />
            </button>
          </div>
        </div>

        {/* Device Viewport Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-[#f5f4f01f] bg-white/[0.04] p-1">
            {(
              [
                { id: 'desktop', label: 'Desktop', icon: Monitor },
                { id: 'tablet', label: 'Tablet', icon: Tablet },
                { id: 'mobile', label: 'Mobile', icon: Smartphone },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setViewport(id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                  viewport === id
                    ? 'bg-primary text-[#0a0a0a]'
                    : 'text-[#f5f4f0]/65 hover:text-[#f5f4f0]',
                )}
              >
                <Icon className="size-3.5" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>

          <Link
            href={liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#f5f4f0] px-3.5 py-1.5 text-xs font-semibold text-[#0a0a0a] transition-colors hover:bg-primary"
          >
            <span>Open Full Site</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Interactive Live Iframe Stage */}
      <div className="mt-4 flex justify-center rounded-xl bg-[#121214] p-2 sm:p-4">
        <div
          className={cn(
            'overflow-hidden rounded-xl border border-[#f5f4f024] bg-white shadow-2xl transition-all duration-500',
            viewport === 'desktop' && 'h-[760px] w-full',
            viewport === 'tablet' && 'h-[760px] w-[768px] max-w-full',
            viewport === 'mobile' && 'h-[760px] w-[390px] max-w-full',
          )}
        >
          <iframe
            key={reloadKey}
            title={`Live Interactive Website — ${title}`}
            src={liveUrl.includes('?') ? `${liveUrl}&embed=1` : `${liveUrl}?embed=1`}
            className="size-full border-0 bg-white"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  )
}
