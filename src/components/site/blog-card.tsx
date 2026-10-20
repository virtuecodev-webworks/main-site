import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/motion/reveal'
import type { BlogPostCard } from '@/lib/content'
import { cn } from '@/lib/utils'

export interface BlogCardProps {
  post: BlogPostCard
  /** Seconds to delay the reveal — used to stagger a grid. */
  delay?: number
  className?: string
  /**
   * Heading level for the article title.
   *
   * `2` on the blog index, where the cards *are* the page content and sit
   * directly under the page `h1`. `3` (the default) inside a home-page section
   * that already owns an `h2`, so the outline stays `h2` → `h3` instead of
   * skipping a level.
   */
  headingLevel?: 2 | 3
}

/** Flat, editorial article card shared by the blog index and related strip. */
export async function BlogCard({
  post,
  delay = 0,
  className,
  headingLevel = 3,
}: BlogCardProps) {
  const t = await getTranslations('Blog')
  const Heading: 'h2' | 'h3' = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <Reveal delay={delay} className={cn('h-full', className)}>
      <article className="group surface relative flex h-full flex-col overflow-hidden p-0 shadow-elevation-1 transition-all duration-400 hover:-translate-y-1 hover:border-gold-300 hover:shadow-elevation-3">
        {/* Stretched link: the whole card is clickable without nesting anchors. */}
        <Link
          href={`/blog/${post.slug}`}
          className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="sr-only">{post.title}</span>
        </Link>

        <div className="relative aspect-16/10 overflow-hidden border-b border-border bg-muted">
          {post.coverUrl ? (
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-emphasized)] group-hover:scale-[1.04]"
            />
          ) : (
            <div aria-hidden className="grid size-full place-items-center bg-ink-950">
              <span className="gold-text font-display text-4xl font-bold opacity-80">
                {post.title.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          {post.tags.length ? (
            <ul className="relative flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <li key={tag}>
                  <Badge variant="outline">{tag}</Badge>
                </li>
              ))}
            </ul>
          ) : null}

          <Heading className="relative mt-3 text-base leading-snug font-semibold">
            {post.title}
          </Heading>

          <p className="relative mt-2.5 line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>

          <div className="relative mt-auto flex items-center justify-between gap-3 pt-5 text-[12px] text-muted-foreground">
            <span>{t('readTime', { minutes: post.readingMinutes })}</span>
            <span className="inline-flex items-center gap-1 font-medium text-ink-700 transition-colors duration-300 group-hover:text-gold-700 dark:text-ink-300 dark:group-hover:text-gold-300">
              {t('readMore')}
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Reveal>
  )
}
