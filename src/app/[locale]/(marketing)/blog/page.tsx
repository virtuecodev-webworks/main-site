import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/site/page-hero'
import { PhotoBand } from '@/components/site/photo-band'
import { BlogCard } from '@/components/site/blog-card'
import { CtaBand } from '@/components/site/cta-band'
import { getPublishedPosts, toPostCard } from '@/lib/content'
import { PHOTOS } from '@/lib/photos'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPageMetadata({
    locale,
    path: '/blog',
    namespace: 'Blog',
    titleKey: 'metaTitle',
    descriptionKey: 'metaDescription',
  })
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Blog')
  const tPhotos = await getTranslations('Photos')

  const posts = (await getPublishedPosts()).map(toPostCard)

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      <PhotoBand
        src={PHOTOS.heroAlt}
        alt={tPhotos('blog.alt')}
        caption={tPhotos('blog.caption')}
        className="mt-16 sm:mt-20"
        priority
      />

      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        {posts.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <BlogCard key={post.slug} post={post} delay={index * 0.06} headingLevel={2} />
            ))}
          </div>
        ) : (
          <div className="surface grid place-items-center px-6 py-20 text-center">
            <p className="text-base font-medium">{t('empty')}</p>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <CtaBand />
      </div>
    </>
  )
}
