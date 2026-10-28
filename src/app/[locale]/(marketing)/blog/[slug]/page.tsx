import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { JournalSection } from '@/components/site/journal-section'
import { CtaBand } from '@/components/site/cta-band'
import { VirtueMark } from '@/components/brand/virtue-mark'
import {
  PLACEHOLDER_POSTS,
  getPostBySlug,
  getPublishedPosts,
  parseMarkdown,
  toPostCard,
  type MarkdownBlock,
} from '@/lib/content'
import { PHOTOS } from '@/lib/photos'
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

function ArticleBody({ blocks }: { blocks: MarkdownBlock[] }) {
  return (
    <div className="article_prose flex flex-col gap-6 text-[16.5px] leading-[1.78] text-foreground/85">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const Heading = block.level === 3 ? 'h3' : 'h2'
          return (
            <Heading
              key={index}
              className="heading-style-h3 mt-8 text-foreground"
            >
              {block.text}
            </Heading>
          )
        }

        if (block.type === 'list') {
          return (
            <ul key={index} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
              {block.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px]">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
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
    .slice(0, 4)
    .map(toPostCard)

  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(post.publishedAt))

  const blocks = parseMarkdown(post.body)
  const cover = post.coverUrl ?? PHOTOS.blog.performance

  return (
    <>
      {/* 1. Vantra Article Header (`section.section_article-hero`) */}
      <section className="section_article-hero padding-global pt-28 pb-10 sm:pt-36">
        <div className="container-max">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.04em] text-muted-foreground uppercase transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-3.5" />
              <span>{t('back')}</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="label-mono text-primary">
                  ( &nbsp;&nbsp;{tag}&nbsp;&nbsp; )
                </span>
              ))}
            </div>
          </div>

          <h1 className="heading-style-h1 mt-10 max-w-[18ch] text-balance text-foreground">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {post.excerpt}
            </p>
          )}

          {/* 21:9 Panoramic Article Cover */}
          <div className="relative mt-12 aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-[#0a0a0a] sm:aspect-[21/9]">
            <Image
              src={cover}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 2. Vantra 12-Col Sticky Left Author Rail + Right Prose Column */}
      <section className="padding-global padding-section">
        <div className="container-max">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
            {/* Sticky Left Rail (`.article_rail`) */}
            <aside className="article_rail flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24 lg:col-span-4">
              <div className="flex items-center gap-3.5 border-b border-border pb-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0a0a0a] p-2">
                  <VirtueMark className="size-full" animate={false} tone="invert" />
                </span>
                <div>
                  <div className="font-display text-sm font-semibold text-foreground">
                    {post.author}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Principal Engineering &amp; Design
                  </div>
                </div>
              </div>

              <dl className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="label-mono-xs text-muted-foreground">{t('publishedOn')}</dt>
                  <dd className="font-medium text-foreground">
                    <time dateTime={post.publishedAt}>{formattedDate}</time>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="label-mono-xs text-muted-foreground">Reading time</dt>
                  <dd className="font-mono text-foreground">
                    {t('readTime', { minutes: post.readingMinutes })}
                  </dd>
                </div>
              </dl>

              {post.tags.length > 0 && (
                <div className="border-t border-border pt-4">
                  <span className="label-mono-xs text-muted-foreground">Topics</span>
                  <ul className="mt-2.5 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>

            {/* Right Prose Column */}
            <article className="lg:col-span-7 lg:col-start-6">
              <ArticleBody blocks={blocks} />
            </article>
          </div>
        </div>
      </section>

      {/* 3. More Notes from the Studio */}
      {related.length > 0 && (
        <div className="border-t border-border">
          <JournalSection posts={related} />
        </div>
      )}

      <CtaBand className="mt-8" />
    </>
  )
}
