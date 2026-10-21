import * as React from 'react'
import { cn } from '@/lib/utils'

interface QuoteItem {
  quote: string
  author: string
}

const QUOTES: QuoteItem[] = [
  { quote: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { quote: 'Good design is as little design as possible.', author: 'Dieter Rams' },
  { quote: 'Design is not just what it looks like. Design is how it works.', author: 'Steve Jobs' },
  { quote: 'Everything should be made as simple as possible, but not simpler.', author: 'Albert Einstein' },
  { quote: 'Simplicity is the essence of clarity and purpose.', author: 'Jony Ive' },
  { quote: 'Perfection is achieved when there is nothing left to take away.', author: 'Antoine de Saint-Exupéry' },
]

export function QuoteMarquee({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative isolate border-y border-gold-500/15 bg-card/20 backdrop-blur-xs py-3 sm:py-3.5 overflow-hidden',
        className
      )}
      aria-label="Philosophy and Craft"
    >
      {/* ── Mobile Layout: Static elegant single highlighted quote (0% animation, 0% CPU skip) ── */}
      <div className="flex md:hidden px-4 items-center justify-center text-center">
        <div className="flex items-center gap-2 text-xs font-serif italic text-gold-500/80 tracking-wide">
          <span className="text-gold-500/40 text-base leading-none">“</span>
          <span>Simplicity is the ultimate sophistication.</span>
          <span className="text-gold-500/40 text-base leading-none">”</span>
          <span className="text-[10px] font-sans not-italic font-bold tracking-widest uppercase text-muted-foreground ml-1">
            — Da Vinci
          </span>
        </div>
      </div>

      {/* ── Tablet & Desktop Layout: Ultra-smooth infinite CSS marquee with gradient masks ── */}
      <div className="hidden md:block relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max items-center gap-12 pr-12 animate-marquee">
          {[...QUOTES, ...QUOTES].map((item, index) => (
            <div
              key={`${item.author}-${index}`}
              aria-hidden={index >= QUOTES.length}
              className="flex shrink-0 items-center gap-12 font-serif text-[13px] tracking-wide text-foreground/80"
            >
              <div className="flex items-center gap-2">
                <span className="text-gold-500/50 italic text-sm">“</span>
                <span className="italic">{item.quote}</span>
                <span className="text-gold-500/50 italic text-sm">”</span>
                <span className="font-sans not-italic text-[10px] font-bold tracking-widest uppercase text-gold-600/80 dark:text-gold-400/80 ml-1.5">
                  — {item.author}
                </span>
              </div>
              <span className="size-1 shrink-0 rounded-full bg-gold-500/40" aria-hidden />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
