import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { ShowcaseWebsiteRenderer } from '@/components/showcase/showcase-websites'
import { PLACEHOLDER_PROJECTS } from '@/lib/portfolio'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PLACEHOLDER_PROJECTS.map((p) => ({
      locale,
      slug: p.slug,
    })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = PLACEHOLDER_PROJECTS.find((p) => p.slug === slug)
  return {
    title: project
      ? `${project.title} — Live Interactive Showcase | Virtue & Co. Webworks`
      : 'Live Interactive Showcase | Virtue & Co. Webworks',
    description:
      project?.summary ??
      'Interactive production web application built and engineered by Virtue & Co. Webworks.',
  }
}

export default async function ShowcaseSitePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  return <ShowcaseWebsiteRenderer slug={slug} />
}
