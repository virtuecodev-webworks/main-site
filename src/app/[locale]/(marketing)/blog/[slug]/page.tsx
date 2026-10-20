import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'
import { BlogCard } from '@/components/site/blog-card'
import { SectionHeading } from '@/components/site/section-heading'
import { Reveal } from '@/components/motion/reveal'
import {
  PLACEHOLDER_POSTS,
  getPostBySlug,
  getPublishedPosts,
  parseMarkdown,
  toPostCard,
  type MarkdownBlock,
} from '@/lib/content'
import { locales } from '@/i18n/routing'
import { buildPageMetadata } from '@/lib/seo'

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    PLACEHOLDER_POSTS.map((post) => ({ locale, slug: post.slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const path = `/blog/${slug}`

  const post = await getPostBySlug(slug)
  if (!post) {
    return buildPageMetadata({
      locale,
      path,
      namespace: 'Blog',
      titleKey: 'metaTitle',
      descriptionKey: 'metaDescription',
    })
  }

  const base = await buildPageMetadata({
    locale,
    path,
    namespace: 'Blog',
    titleKey: 'metaTitle',
    descriptionKey: 'metaDescription',
    type: 'article',
  })

  return { ...base, title: post.title, description: post.excerpt }
}

/** Renders the parsed Markdown body in a readable prose column. */
function ArticleBody({ blocks }: { blocks: MarkdownBlock[] }) {
  return (
    <div className="flex flex-col gap-5 text-[15.5px] leading-[1.85] text-ink-700 dark:text-ink-200">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const Heading = block.level === 3 ? 'h3' : 'h2'
          return (
            <Heading
              key={index}
              className="font-sans mt-6 text-xl leading-snug font-semibold text-foreground sm:text-2xl"
            >
              {block.text}
            </Heading>
          )
        }

        if (block.type === 'list') {
          return (
            <ul key={index} className="flex flex-col gap-2.5 pl-1">
              {block.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )
        }

        return <p key={index}>{block.text}</p>
      })}
    </div>
  )
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const t = await getTranslations('Blog')

  const related = (await getPublishedPosts())
    .filter((entry) => entry.slug !== post.slug)
    .slice(0, 3)
    .map(toPostCard)

  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(post.publishedAt))

  const blocks = parseMarkdown(post.body)

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[12.5px] text-muted-foreground transition-colors hover:text-gold-700"
        >
          <ArrowLeft className="size-3.5" />
          {t('back')}
        </Link>

        <div className="mx-auto mt-8 max-w-3xl">
          {post.tags.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="outline">{tag}</Badge>
                </li>
              ))}
            </ul>
          ) : null}

          <Reveal immediate>
            <h1 className="mt-5 text-[2rem] leading-[1.12] font-semibold text-balance sm:text-4xl lg:text-[2.75rem]">
              {post.title}
            </h1>
          </Reveal>

          {post.excerpt ? (
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-5 text-[12.5px] text-muted-foreground">
            <span>
              {t('publishedOn')}{' '}
              <time dateTime={post.publishedAt} className="font-medium text-ink-700 dark:text-ink-200">
                {formattedDate}
              </time>
            </span>
            <span aria-hidden className="hidden size-1 rounded-full bg-border sm:block" />
            <span>{t('readTime', { minutes: post.readingMinutes })}</span>
            <span aria-hidden className="hidden size-1 rounded-full bg-border sm:block" />
            <span className="font-medium text-ink-700 dark:text-ink-200">{post.author}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-5xl px-5 sm:px-8">
        <div className="relative aspect-16/9 overflow-hidden rounded-2xl border border-border bg-muted">
          {post.coverUrl ? (
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
            />
          ) : (
            <div aria-hidden className="grid size-full place-items-center bg-ink-950">
              <span className="gold-text font-sans text-5xl font-bold opacity-80">
                {post.title.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
        <article>
          <ArticleBody blocks={blocks} />
        </article>
      </div>

      {related.length ? (
        <section className="border-t border-border bg-muted/45">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <SectionHeading title={t('relatedTitle')} />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((entry, index) => (
                <BlogCard key={entry.slug} post={entry} delay={index * 0.06} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
