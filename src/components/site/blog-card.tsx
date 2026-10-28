import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/motion/reveal'
import type { BlogPostCard } from '@/lib/content'
import { PHOTOS } from '@/lib/photos'
import { cn } from '@/lib/utils'

export interface BlogCardProps {
  post: BlogPostCard
  delay?: number
  className?: string
  headingLevel?: 2 | 3
}

/** Vantra editorial article card. */
export async function BlogCard({
  post,
  delay = 0,
  className,
  headingLevel = 3,
}: BlogCardProps) {
  const t = await getTranslations('Blog')
  const Heading: 'h2' | 'h3' = headingLevel === 2 ? 'h2' : 'h3'
  const cover = post.coverUrl ?? PHOTOS.blog.performance
  const primaryTag = post.tags[0] ?? 'Engineering'

  return (
    <Reveal delay={delay} className={cn('h-full', className)}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-card transition-all duration-300 hover:border-primary/60">
        <Link
          href={`/blog/${post.slug}`}
          className="absolute inset-0 z-10 rounded-[inherit]"
        >
          <span className="sr-only">{post.title}</span>
        </Link>

        <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-[#0a0a0a]">
          <Image
            src={cover}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:scale-105"
          />
          <div className="absolute top-3.5 left-3.5 rounded-lg border border-[#f5f4f024] bg-[#0a0a0a99] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-primary uppercase backdrop-blur-md">
            ( &nbsp;{primaryTag}&nbsp; )
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <Heading className="heading-style-h4 text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </Heading>

          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 mt-6 text-xs text-muted-foreground">
            <span>{t('readTime', { minutes: post.readingMinutes })}</span>
            <span className="inline-flex items-center gap-1 font-medium text-foreground uppercase tracking-[0.04em] transition-colors group-hover:text-primary">
              {t('readMore')}
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Reveal>
  )
}
