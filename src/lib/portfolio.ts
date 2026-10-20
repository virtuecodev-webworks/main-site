import type { Project } from '@/lib/supabase/types'
import type { ProjectCategory } from '@/lib/constants'
import { publicMediaUrl } from '@/lib/supabase/env'

/** Serialisable view model handed to the client-side portfolio grid. */
export interface ProjectCard {
  id: string
  slug: string
  title: string
  client: string | null
  summary: string | null
  category: ProjectCategory
  techTags: string[]
  liveUrl: string | null
  coverUrl: string | null
  featured: boolean
  year: string
}

/** Maps a Supabase row to the card view model, resolving Storage paths to URLs. */
export function toProjectCard(project: Project): ProjectCard {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    client: project.client,
    summary: project.summary,
    category: project.category,
    techTags: project.tech_tags ?? [],
    liveUrl: project.live_url,
    coverUrl: publicMediaUrl(project.cover_image_path),
    featured: project.featured,
    year: new Date(project.created_at).getFullYear().toString(),
  }
}

/**
 * Demo entries rendered when Supabase isn't configured yet, so the portfolio
 * grid is never an empty void on a fresh clone.
 */
export const PLACEHOLDER_PROJECTS: ProjectCard[] = [
  {
    id: 'placeholder-1',
    slug: 'aurum-capital-platform',
    title: 'Aurum Capital - Investor Platform',
    client: 'Aurum Capital',
    summary:
      'A multi-currency investor portal with KYC onboarding, portfolio dashboards and a Supabase-backed document vault.',
    category: 'custom',
    techTags: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Vercel'],
    liveUrl: null,
    coverUrl: '/media/projects/aurum-capital.svg',
    featured: true,
    year: '2025',
  },
  {
    id: 'placeholder-2',
    slug: 'finery-commerce',
    title: 'Finery - Commerce Replatform',
    client: 'Finery',
    summary:
      'Headless commerce replatform with multi-currency checkout, inventory sync and a rebuilt mobile shopping flow.',
    category: 'ecommerce',
    techTags: ['Next.js', 'Stripe', 'Supabase', 'Resend'],
    liveUrl: null,
    coverUrl: '/media/projects/finery-commerce.svg',
    featured: true,
    year: '2025',
  },
  {
    id: 'placeholder-3',
    slug: 'meridian-editorial',
    title: 'Meridian - Editorial Platform',
    client: 'Meridian Media',
    summary:
      'A block-based WordPress newsroom with custom post types, editorial workflows and a 94 Lighthouse performance score.',
    category: 'wordpress',
    techTags: ['WordPress', 'ACF Pro', 'Gutenberg', 'PHP'],
    liveUrl: null,
    coverUrl: '/media/projects/meridian-editorial.svg',
    featured: false,
    year: '2024',
  },
  {
    id: 'placeholder-4',
    slug: 'northline-studio',
    title: 'Northline Studio - Brand Launch',
    client: 'Northline Studio',
    summary:
      'A Wix Studio launch site shipped in nine days with Velo-driven booking logic and localised pricing.',
    category: 'wix',
    techTags: ['Wix Studio', 'Velo', 'CMS Collections'],
    liveUrl: null,
    coverUrl: '/media/projects/northline-studio.svg',
    featured: false,
    year: '2024',
  },
]
