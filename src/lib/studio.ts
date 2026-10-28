import {
  Braces,
  Blocks,
  Layers,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react'
import type { ProjectCategory } from '@/lib/constants'

/**
 * Non-translatable presentation metadata for the four service lines.
 * Human-readable copy lives in `src/messages/*.json` under `Services.items.<key>`.
 */
export interface ServiceMeta {
  key: ProjectCategory
  icon: LucideIcon
  /** Flat chip colours for the icon badge (no gradients, dark-mode aware). */
  accent: string
  /** Representative stack badges, also language-independent. */
  stack: string[]
}

export const SERVICES: ServiceMeta[] = [
  {
    key: 'custom',
    icon: Braces,
    accent: 'bg-gold-50 text-gold-700 dark:bg-gold-500/12 dark:text-gold-300',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vercel'],
  },
  {
    key: 'wordpress',
    icon: Blocks,
    accent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300',
    stack: ['WordPress', 'PHP', 'ACF Pro', 'Gutenberg', 'WooCommerce'],
  },
  {
    key: 'wix',
    icon: Layers,
    accent: 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200',
    stack: ['Wix Studio', 'Velo', 'CMS Collections', 'Wix Payments'],
  },
  {
    key: 'ecommerce',
    icon: ShoppingBag,
    accent: 'bg-gold-50 text-gold-700 dark:bg-gold-500/12 dark:text-gold-300',
    stack: ['Stripe', 'Supabase', 'Resend', 'Apple Pay'],
  },
]

export function serviceByKey(key: string) {
  return SERVICES.find((service) => service.key === key)
}

/** Category → Tailwind chip classes used across the portfolio grid and CMS. */
export const CATEGORY_STYLES: Record<ProjectCategory, string> = {
  custom:
    'bg-ink-900 text-gold-200 border-ink-900 dark:bg-ink-100 dark:text-ink-900 dark:border-ink-100',
  wordpress: 'bg-muted text-ink-700 border-border',
  wix: 'bg-gold-50 text-gold-800 border-gold-200 dark:bg-gold-500/12 dark:text-gold-300 dark:border-gold-500/25',
  ecommerce:
    'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/12 dark:text-emerald-300 dark:border-emerald-500/25',
}

/** Ordered nav, shared by the header, mobile drawer and footer. */
export const PRIMARY_NAV = [
  { href: '/', labelKey: 'home' },
  { href: '/services', labelKey: 'services' },
  { href: '/portfolio', labelKey: 'portfolio' },
  { href: '/about', labelKey: 'about' },
  { href: '/blog', labelKey: 'blog' },
  { href: '/contact', labelKey: 'contact' },
] as const

/** Secondary links that live in the footer. */
export const FOOTER_LEGAL = [
  { href: '/privacy', labelKey: 'privacy' },
  { href: '/terms', labelKey: 'terms' },
] as const

/**
 * Capability stats.
 *
 * Deliberately about *how we work* rather than invented traction — the studio is
 * new, so numbers like "120+ projects" would be a lie. `key` resolves to a label
 * in `Home.stats.<key>`.
 */
export const STATS = [
  { key: 'launch', value: '2-4 wks' },
  { key: 'lighthouse', value: '100' },
  { key: 'senior', value: '1:1' },
  { key: 'response', value: '< 48h' },
] as const

/**
 * Every tool we work in day to day, in the order we reach for them.
 * Rendered as the scrolling stack band that replaced the old client marquee.
 */
export const TECH_STACK = [
  'Next.js',
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Supabase',
  'Node.js',
  'WordPress',
  'ACF Pro',
  'Gutenberg',
  'Wix Studio',
  'Velo',
  'WooCommerce',
  'Stripe',
  'Paystack',
  'Flutterwave',
  'Resend',
  'Remotion',
  'next-intl',
] as const

export const PROMISES = ['senior', 'scope', 'reply', 'handover'] as const

export const PRICE_FLOOR: Record<string, number> = {
  USD: 100,
  NGN: 135000,
}

/** The currency the floor is anchored to when there is no local figure. */
export const PRICE_FLOOR_ANCHOR = 'USD'

/** Frequently asked questions. Copy lives in `Faq.items.<key>`. */
export const FAQ_KEYS = ['timeline', 'stack', 'ownership', 'support', 'payments', 'start'] as const

/** Office hours shown on the contact page, in the studio's own time. */
export const OFFICE_HOURS = [
  { key: 'weekdays', time: '09:00 - 18:00' },
  { key: 'saturday', time: '10:00 - 14:00' },
  { key: 'sunday', time: '-' },
] as const
