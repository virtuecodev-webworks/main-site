import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { VantraButton } from '@/components/ui/vantra-button'
import type { BlogPostCard } from '@/lib/content'
import { PHOTOS } from '@/lib/photos'
import { cn } from '@/lib/utils'

const FALLBACK_IMAGES = [
  PHOTOS.blog.performance,
  PHOTOS.blog.payments,
  PHOTOS.blog.cms,
  PHOTOS.blog.studio,
]

export function JournalSection({
  posts,
  className,
  showHeader = true,
}: {
  posts: BlogPostCard[]
  className?: string
  showHeader?: boolean
}) {
  if (!posts.length) return null

  const featured = posts.slice(0, 2)
  const indexRows = posts.slice(2)

  const tBlog = useTranslations('Blog')
  const tCommon = useTranslations('Common')

  return (
    <section
      id="journal"
      aria-labelledby="journal-heading"
      className={cn('section_more-journal padding-global padding-section', className)}
    >
      <div className="container-max">
        {showHeader && (
          <div className="section_header">
            <h2 id="journal-heading" className="heading-style-h2">
              {tBlog('title')}
            </h2>
            <div className="flex items-center gap-6">
              <div className="section_meta hidden sm:flex">
                <span className="label-mono text-primary">
                  ( &nbsp;&nbsp;&nbsp;{tBlog('eyebrow')}&nbsp;&nbsp;&nbsp; )
                </span>
                <span className="text-muted-foreground">{tBlog('subtitle')}</span>
              </div>
              <VantraButton href="/blog" variant="dark">
                {tCommon('viewAll')}
              </VantraButton>
            </div>
          </div>
        )}

        {/* Top 2-Column Featured Journal Grid (`.journal_grid`) */}
        <div className="journal_grid grid grid-cols-1 gap-2 md:grid-cols-2">
          {featured.map((post, idx) => {
            const cover = post.coverUrl ?? FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]
            const primaryTag = post.tags[0] ?? 'Engineering'
            const dateStr = new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="journal_card group relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-[20px] bg-[#0a0a0a] p-6 text-[#f5f4f0] sm:p-8"
              >
                <Image
                  src={cover}
                  alt={post.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:scale-105"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.18) 42%, rgba(10,10,10,0.9) 100%)',
                  }}
                />

                {/* Top Meta Row */}
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <span className="label-mono text-primary">
                    ( &nbsp;&nbsp;&nbsp;{primaryTag}&nbsp;&nbsp;&nbsp; )
                  </span>
                  <span className="label-mono-xs text-[#f5f4f0]/75">
                    {post.readingMinutes} min read · {dateStr}
                  </span>
                </div>

                {/* Bottom Title & Excerpt */}
                <div className="relative z-10 mt-auto max-w-xl">
                  <h3 className="heading-style-h3 text-balance text-[#f5f4f0] transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#f5f4f0]/70">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.04em] text-primary uppercase">
                    <span>Read article</span>
                    <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom Editorial Index Rows (`.journal-index_list`) */}
        {indexRows.length > 0 && (
          <div className="journal-index_list mt-8 border-t border-border">
            {indexRows.map((post, idx) => {
              const cover = post.coverUrl ?? FALLBACK_IMAGES[(idx + 2) % FALLBACK_IMAGES.length]
              const primaryTag = post.tags[0] ?? 'Studio'
              const dateStr = new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })

              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="journal-index_row group relative flex flex-col gap-4 border-b border-border py-7 transition-all duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] hover:px-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-8">
                    <span className="label-mono w-36 shrink-0 text-muted-foreground group-hover:text-primary">
                      ( &nbsp;&nbsp;{primaryTag}&nbsp;&nbsp; )
                    </span>
                    <h4 className="heading-style-h4 text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </h4>
                  </div>

                  {/* Floating Preview Image on Hover */}
                  <div
                    aria-hidden="true"
                    className="journal-index_preview pointer-events-none absolute top-1/2 right-56 z-20 hidden aspect-[3/2] w-60 -translate-y-1/2 scale-95 overflow-hidden rounded-2xl border border-border bg-[#0a0a0a] opacity-0 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:scale-100 group-hover:opacity-100 xl:block"
                  >
                    <Image src={cover} alt="" fill sizes="240px" className="object-cover" />
                  </div>

                  <div className="flex items-center gap-5 text-xs text-muted-foreground shrink-0">
                    <span>{post.readingMinutes} min read</span>
                    <span>{dateStr}</span>
                    <span className="flex size-8 items-center justify-center rounded-lg border border-border transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-[#0a0a0a]">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
