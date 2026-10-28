import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/site/page-hero'
import { JournalSection } from '@/components/site/journal-section'
import { CtaBand } from '@/components/site/cta-band'
import { getPublishedPosts, toPostCard } from '@/lib/content'
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
  const posts = (await getPublishedPosts()).map(toPostCard)

  return (
    <>
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle')}
        align="center"
      />

      {posts.length ? (
        <JournalSection posts={posts} showHeader={false} className="pt-6" />
      ) : (
        <div className="padding-global py-20">
          <div className="container-max surface grid place-items-center px-6 py-20 text-center">
            <p className="text-base font-medium">{t('empty')}</p>
          </div>
        </div>
      )}

      <CtaBand className="mt-8" />
    </>
  )
}
