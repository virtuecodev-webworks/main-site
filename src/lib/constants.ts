/**
 * Brand-wide constants that are not translated (codes, keys, enum values).
 * Human-readable copy that needs translating lives in src/messages/*.json.
 */

export const AGENCY = {
  name: 'Virtue & Co. Webworks',
  shortName: 'Virtue & Co.',
  domain: 'virtuecowebworks.solutions',
  email: 'admin@virtuecowebworks.solutions',
  fallbackEmail: 'virtueco.dev@gmail.com',
  teamEmails: [
    'admin@virtuecowebworks.solutions',
    'divine@virtuecowebworks.solutions',
    'glory@virtuecowebworks.solutions',
  ],
  /** Drives the `tel:` links and the WhatsApp deep links; digits derived below. */
  phone: '+2349168047236',
  founded: 2024,
} as const

/** Digits-only form of the studio phone, for `wa.me` deep links. */
export const WHATSAPP_DIGITS = AGENCY.phone.replace(/[^\d]/g, '')

/**
 * Real, working contact channels only.
 *
 * Deliberately no placeholder social links: a footer full of links to
 * `github.com` homepages looks unfinished, so we send people to channels that
 * actually reach a human.
 */
export const CONTACT_CHANNELS = [
  { key: 'email', label: 'Email', href: `mailto:${AGENCY.email}` },
  { key: 'packages', label: 'Explore Packages', href: '/#services-catalog' },
  { key: 'call', label: 'Book a call', href: '/contact#book' },
] as const

/** Portfolio taxonomy. Must stay in sync with the Postgres enum in the migration. */
export const PROJECT_CATEGORIES = ['custom', 'wordpress', 'wix', 'ecommerce'] as const
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]

export const MENU_SERVICES = ['custom', 'wordpress', 'wix', 'ecommerce'] as const

export const INQUIRY_STATUSES = ['new', 'contacted', 'won', 'archived'] as const
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

/**
 * Order lifecycle. Must stay in sync with the `order_status` Postgres enum.
 *
 * Order matters twice over: it is the sequence the timeline is read in, and
 * `isOpenOrderStatus` uses it to decide what still needs somebody's attention.
 */
export const ORDER_STATUSES = [
  'inquiry',
  'scoping',
  'quoted',
  'active',
  'review',
  'delivered',
  'closed',
  'cancelled',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

/** Statuses where the client is waiting on the studio, rather than the reverse. */
export const ORDER_STATUS_NEEDS_STUDIO: readonly OrderStatus[] = ['inquiry', 'scoping', 'review']

/** Statuses that still represent live work. Everything else is history. */
export const ORDER_STATUS_LIVE: readonly OrderStatus[] = [
  'inquiry',
  'scoping',
  'quoted',
  'active',
  'review',
  'delivered',
]

export function isLiveOrderStatus(status: OrderStatus): boolean {
  return ORDER_STATUS_LIVE.includes(status)
}

export const MILESTONE_STATUSES = ['pending', 'invoiced', 'paid'] as const
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number]

export type ProfileRole = 'admin' | 'agent' | 'client' | 'editor' | 'viewer'

/** Everyone on the studio side. Kept in one place so the two gates cannot drift. */
export function isStaffRole(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'agent'
}

/**
 * Project scope bands.
 *
 * Deliberately **not** money. Absolute bands would have to be denominated in one
 * currency, which makes them meaningless to everyone else — and would mean
 * publishing figures the studio has not actually agreed to. Scope travels.
 */
export const BUDGET_BANDS = [
  'single-page',
  'multi-page',
  'platform',
  'ongoing',
  'not-sure',
] as const
export type BudgetBand = (typeof BUDGET_BANDS)[number]

export const TIMELINES = ['asap', '2-4-weeks', '1-3-months', 'flexible'] as const
export type Timeline = (typeof TIMELINES)[number]

/**
 * Supported currencies on the Flutterwave inline checkout.
 *
 * These are payment instruments, not audience signals: a currency keeps its
 * standard name because a payer has to recognise it. Nothing here hints at
 * where the studio is or who the site is for.
 */
export const CURRENCIES = [
  { code: 'NGN', symbol: '₦', label: 'Naira' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'Pound Sterling' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
] as const
export type CurrencyCode = (typeof CURRENCIES)[number]['code']

/** Supabase Storage bucket that holds portfolio screenshots + covers. */
export const PROJECTS_BUCKET = 'project-media'

export const SITE_LOCALE_COOKIE = 'NEXT_LOCALE'
