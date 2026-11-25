import type { Project } from '@/lib/supabase/types'
import type { ProjectCategory } from '@/lib/constants'
import { PHOTOS } from '@/lib/photos'
import { publicMediaUrl } from '@/lib/supabase/env'

/** Serialisable view model handed to the client-side portfolio grid. */
export interface ProjectCard {
  id: string
  slug: string
  title: string
  client: string | null
  summary: string | null
  category: ProjectCategory
  kind: 'client' | 'concept'
  techTags: string[]
  liveUrl: string | null
  coverUrl: string | null
  featured: boolean
  year: string
}

/**
 * Built-in interactive concept websites hosted natively inside the app at `/showcase/[slug]`
 * so visitors can test UI craft and application logic live in the browser.
 */
export const SHOWCASE_SLUGS = new Set([
  'aurum-capital-platform',
  'finery-commerce',
  'the-royal-banquet',
  'meridian-editorial',
  'northline-studio',
  'kinetix-ai-cloud',
  'solace-health-portal',
])

/** Maps a Supabase row to the card view model, resolving Storage paths and live showcase URLs. */
export function toProjectCard(project: Project): ProjectCard {
  const fallbackMatch = PLACEHOLDER_PROJECTS.find((p) => p.slug === project.slug)
  const isBuiltInShowcase = SHOWCASE_SLUGS.has(project.slug) && Boolean(fallbackMatch)
  const resolvedCover = publicMediaUrl(project.cover_image_path)
  const coverUrl =
    resolvedCover && !resolvedCover.endsWith('.svg')
      ? resolvedCover
      : (fallbackMatch?.coverUrl ?? PHOTOS.workBand)

  if (isBuiltInShowcase && fallbackMatch) {
    return {
      ...fallbackMatch,
      id: project.id,
      coverUrl,
      featured: project.featured,
    }
  }

  const liveUrl = project.live_url || `/portfolio/${project.slug}`
  const isExternalLive = Boolean(project.live_url && /^https?:\/\//i.test(project.live_url))

  return {
    id: project.id,
    slug: project.slug,
    title: project.title || fallbackMatch?.title || 'Untitled Project',
    client: project.client || fallbackMatch?.client || null,
    summary: project.summary || fallbackMatch?.summary || null,
    category: project.category || fallbackMatch?.category || 'custom',
    kind: isExternalLive ? 'client' : 'concept',
    techTags:
      project.tech_tags && project.tech_tags.length > 0
        ? project.tech_tags
        : (fallbackMatch?.techTags ?? []),
    liveUrl,
    coverUrl,
    featured: project.featured,
    year: fallbackMatch?.year ?? new Date(project.created_at).getFullYear().toString(),
  }
}

/**
 * 7 Interactive Studio Concept Demos built natively into the platform so
 * prospective clients can test UI patterns, calculators, and responsive flows
 * directly in the browser.
 */
export const PLACEHOLDER_PROJECTS: ProjectCard[] = [
  {
    id: 'showcase-1',
    slug: 'aurum-capital-platform',
    title: 'Aurum Treasury — Financial Dashboard UI Concept',
    client: 'Studio Concept · Fintech UI',
    summary:
      'Interactive concept build demonstrating treasury allocation views, simulated FX transfer flows, and responsive card-control UI patterns.',
    category: 'custom',
    kind: 'concept',
    techTags: ['Interactive Demo', 'Fintech UI', 'Card Controls', 'Yield Calculator'],
    liveUrl: '/showcase/aurum-capital-platform',
    coverUrl: '/work/aurum-hero.jpg',
    featured: true,
    year: '2026',
  },
  {
    id: 'showcase-2',
    slug: 'finery-commerce',
    title: 'Maison Finery — Multi-Currency Storefront Concept',
    client: 'Studio Concept · E-Commerce',
    summary:
      'Interactive storefront prototype with 4-currency display switching, quick-view product modal, and a working slide-out shopping bag.',
    category: 'ecommerce',
    kind: 'concept',
    techTags: ['Interactive Demo', 'Multi-Currency UI', 'Slide-Out Bag', 'Checkout Flow'],
    liveUrl: '/showcase/finery-commerce',
    coverUrl: '/work/finery-hero.jpg',
    featured: true,
    year: '2026',
  },
  {
    id: 'showcase-7',
    slug: 'the-royal-banquet',
    title: 'The Royal Banquet — Event Ticketing & Menu Concept',
    client: 'Studio Concept · Event Platform',
    summary:
      'Interactive event-site concept featuring multi-tier RSVP selection, client-side QR pass preview, and a dual-kitchen menu explorer.',
    category: 'wix',
    kind: 'concept',
    techTags: ['Interactive Demo', 'RSVP Modal', 'QR Pass Preview', 'Menu Explorer'],
    liveUrl: '/showcase/the-royal-banquet',
    coverUrl: '/work/royal-banquet-hero.jpg',
    featured: true,
    year: '2026',
  },
  {
    id: 'showcase-3',
    slug: 'meridian-editorial',
    title: 'The Meridian Review — Digital Magazine Concept',
    client: 'Studio Concept · Editorial',
    summary:
      'Editorial publication prototype featuring a full-article reader modal, docked audio player UI, and interactive data visualizations.',
    category: 'wordpress',
    kind: 'concept',
    techTags: ['Interactive Demo', 'Editorial UI', 'Audio Player', 'Article Reader'],
    liveUrl: '/showcase/meridian-editorial',
    coverUrl: '/work/meridian-hero.jpg',
    featured: true,
    year: '2026',
  },
  {
    id: 'showcase-4',
    slug: 'northline-studio',
    title: 'Northline — Architectural Cabin Configurator Concept',
    client: 'Studio Concept · Architecture',
    summary:
      'Interactive architectural showcase with a 4-step cabin specification configurator, SVG floorplan explorer, and estimate calculator.',
    category: 'wix',
    kind: 'concept',
    techTags: ['Interactive Demo', '4-Step Configurator', 'SVG Blueprints', 'Cost Estimator'],
    liveUrl: '/showcase/northline-studio',
    coverUrl: '/work/northline-hero.jpg',
    featured: true,
    year: '2026',
  },
  {
    id: 'showcase-5',
    slug: 'kinetix-ai-cloud',
    title: 'Kinetix AI Cloud — Developer Console UI Concept',
    client: 'Studio Concept · Developer Tools',
    summary:
      'Developer platform concept with a simulated token-streaming playground, GPU cluster pricing calculator, and tabbed SDK snippets.',
    category: 'custom',
    kind: 'concept',
    techTags: ['Interactive Demo', 'Playground UI', 'Pricing Calculator', 'SDK Tabs'],
    liveUrl: '/showcase/kinetix-ai-cloud',
    coverUrl: '/work/kinetix-hero.jpg',
    featured: true,
    year: '2026',
  },
  {
    id: 'showcase-6',
    slug: 'solace-health-portal',
    title: 'Solace Health — Diagnostics & Booking UI Concept',
    client: 'Studio Concept · Health UX',
    summary:
      'Interactive patient portal prototype showcasing searchable lab-range UI, summary score visualizations, and a 3-step booking flow.',
    category: 'custom',
    kind: 'concept',
    techTags: ['Interactive Demo', 'Lab Results UI', 'Booking Flow', 'Patient UX'],
    liveUrl: '/showcase/solace-health-portal',
    coverUrl: '/work/solace-hero.jpg',
    featured: true,
    year: '2026',
  },
]

export interface CaseStudyMetric {
  label: string
  value: string
  caption: string
}

export interface CaseStudyOutcome {
  title: string
  text: string
  metric: string
}

export interface CaseStudyDetails {
  challenge: string
  challengeBullets: string[]
  solution: string
  keyFixes: string[]
  metrics: CaseStudyMetric[]
  outcomes: CaseStudyOutcome[]
  galleryImages: [string, string, string]
  clientQuote?: { quote: string; author: string; role: string }
}

export const CASE_STUDY_DETAILS: Record<string, CaseStudyDetails> = {
  'aurum-capital-platform': {
    challenge:
      'Financial portals frequently bury key treasury actions behind dense multi-page tables, slow PDF exports, and fragmented card-management screens.',
    challengeBullets: [
      'Complex balance and yield views are hard to scan quickly on desktop or mobile.',
      'Transfer workflows often force full-page reloads and unclear confirmation states.',
      'Card freeze and spending-limit controls are commonly hidden in nested settings.',
    ],
    solution:
      'This interactive studio concept demonstrates a unified financial dashboard UI with a simulated yield calculator, multi-currency wire preview, and instant card-control toggles.',
    keyFixes: [
      'Interactive yield projection calculator for comparing allocation scenarios.',
      'Optimistic transfer preview state with clear validation and confirmation steps.',
      'Card-control matrix UI for instant freeze, limit sliders, and category toggles.',
      'High-contrast dark interface with accessible data hierarchy and zero layout shift.',
    ],
    metrics: [
      { label: 'Concept Build', value: 'Interactive', caption: 'Testable financial UI demo in browser' },
      { label: '4 Modules', value: '4 Views', caption: 'Overview, yield calculator, transfers, cards' },
      { label: 'Responsive', value: 'Mobile + Web', caption: 'Adaptive dashboard layout across viewports' },
    ],
    outcomes: [
      {
        title: 'Yield Calculator UI',
        text: 'Interactive allocation slider demonstrating real-time React state updates without page reloads.',
        metric: 'Interactive',
      },
      {
        title: 'Transfer Flow UX',
        text: 'Step-by-step wire preview and confirmation pattern designed for clarity and error prevention.',
        metric: '3 Steps',
      },
      {
        title: 'Card Controls',
        text: 'Instant toggle states and spending-limit controls illustrating complex state management.',
        metric: 'Live UI',
      },
      {
        title: 'Clean Architecture',
        text: 'Built with modular TypeScript components and zero third-party dashboard template bloat.',
        metric: 'TypeScript',
      },
    ],
    galleryImages: ['/work/aurum-hero.jpg', '/work/aurum-wire.jpg', '/work/aurum-cards.jpg'],
  },
  'finery-commerce': {
    challenge:
      'Editorial e-commerce storefronts often suffer from jarring layout shifts on large lookbook imagery, clunky currency switches, and slow cart drawers on mobile.',
    challengeBullets: [
      'Heavy image galleries can shift page content when dimensions are not reserved.',
      'Currency selectors often reset cart state or require full page reloads.',
      'Shoppable lookbooks frequently lack direct quick-add interactions.',
    ],
    solution:
      'This interactive storefront demo showcases dynamic 4-currency formatting, a quick-view product modal, and an instant slide-out shopping bag.',
    keyFixes: [
      'Client-side 4-currency switcher (USD, EUR, GBP, NGN) updating prices across the catalog.',
      'Reserved aspect-ratio image containers to keep gallery layouts stable.',
      'Slide-out shopping bag drawer with quantity controls and subtotal calculation.',
      'Editorial lookbook modal pattern for inspecting sizing and adding items directly.',
    ],
    metrics: [
      { label: 'Concept Build', value: 'Interactive', caption: 'Testable storefront prototype in browser' },
      { label: '4 Currencies', value: 'USD/EUR/GBP/NGN', caption: 'Instant client-side price formatting demo' },
      { label: 'Cart Drawer', value: 'Live Bag', caption: 'Add, remove, and update quantities live' },
    ],
    outcomes: [
      {
        title: 'Slide-Out Shopping Bag',
        text: 'Full client-side cart state with quantity updates, item removal, and subtotal breakdown.',
        metric: 'Live Cart',
      },
      {
        title: 'Currency Switching',
        text: 'Instant conversion preview across USD, EUR, GBP, and NGN without losing bag state.',
        metric: '4 Currencies',
      },
      {
        title: 'Responsive Catalog',
        text: 'Category filters and quick-view modals tailored for both mobile and desktop shoppers.',
        metric: 'Mobile-First',
      },
      {
        title: 'Editorial Handover Pattern',
        text: 'Structured product data schema designed to plug cleanly into Stripe or headless CMS.',
        metric: 'Modular',
      },
    ],
    galleryImages: ['/work/finery-hero.jpg', '/work/finery-catalog.jpg', '/work/finery-cart.jpg'],
  },
  'the-royal-banquet': {
    challenge:
      'Event and hospitality websites built on heavy drag-and-drop templates frequently suffer from slow mobile rendering, confusing RSVP steps, and static PDF menus.',
    challengeBullets: [
      'Large unoptimized template bundles slow down mobile access for event guests.',
      'Static text blocks make comparing ticket tiers and seating options tedious.',
      'Multi-menu events need clear filtering for courses and dietary notes.',
    ],
    solution:
      'This interactive event concept demonstrates a custom Next.js event layout with 3-tier pass selection, a client-side QR preview, and a dual-kitchen menu explorer.',
    keyFixes: [
      'Interactive 3-tier pass selector with guest count and instant booking summary.',
      'Client-side pass preview card showing how digital confirmation tickets can be presented.',
      'Tabbed dual-kitchen menu explorer with dietary indicators and course breakdowns.',
      'Responsive typography and high-contrast gold-on-obsidian event styling.',
    ],
    metrics: [
      { label: 'Concept Build', value: 'Interactive', caption: 'Testable event & ticketing demo in browser' },
      { label: '3 Pass Tiers', value: '3 Tiers', caption: 'Interactive ticket selection & preview' },
      { label: '2 Menus', value: 'Dual Kitchen', caption: 'Filterable tasting & dietary presentation' },
    ],
    outcomes: [
      {
        title: 'Interactive Pass Flow',
        text: 'Tier selection modal with guest count, summary calculation, and digital pass preview.',
        metric: '3 Tiers',
      },
      {
        title: 'Culinary Showcase',
        text: 'Tabbed dual-kitchen menu layout with course details and dietary tags.',
        metric: '2 Kitchens',
      },
      {
        title: 'Mobile Layout',
        text: 'Structured for single-hand smartphone navigation with clear action targets.',
        metric: 'Responsive',
      },
      {
        title: 'Custom Codebase',
        text: 'Demonstrates how a bespoke Next.js build replaces heavy template scripts.',
        metric: 'Zero Bloat',
      },
    ],
    galleryImages: ['/work/royal-banquet-hero.jpg', '/work/royal-banquet-hero.jpg', '/work/royal-banquet-hero.jpg'],
  },
  'meridian-editorial': {
    challenge:
      'Content-heavy publications often bury long-form journalism under intrusive popups, cluttered sidebars, and inconsistent reading layouts on smaller screens.',
    challengeBullets: [
      'Distracting page chrome interrupts reading flow on mobile and tablet devices.',
      'Fragile block formatting can make multi-column editorial layouts break on resize.',
      'Audio companions are rarely integrated cleanly with article reading views.',
    ],
    solution:
      'This interactive publication concept demonstrates distraction-free editorial typography, a full-article reader modal, and a docked audio-player UI.',
    keyFixes: [
      'Clean article grid with category filters and reading-time indicators.',
      'Docked audio player UI supporting playback controls and speed selection.',
      'Distraction-free article reader modal with typographic hierarchy.',
      'Editorial pairing of Inter display headings and Instrument Sans body copy.',
    ],
    metrics: [
      { label: 'Concept Build', value: 'Interactive', caption: 'Testable editorial publication demo' },
      { label: 'Audio Player', value: 'Docked UI', caption: 'Variable playback control prototype' },
      { label: 'Reader Mode', value: 'Full Modal', caption: 'Clean typographic article view' },
    ],
    outcomes: [
      {
        title: 'Reader Experience',
        text: 'Focused article modal designed for legible long-form reading across screen sizes.',
        metric: 'Reader UI',
      },
      {
        title: 'Audio Companion UI',
        text: 'Persistent player bar prototype with play/pause and speed-toggle controls.',
        metric: 'Audio UI',
      },
      {
        title: 'Category Filtering',
        text: 'Instant client-side filtering across editorial sections without page reloads.',
        metric: 'Instant',
      },
      {
        title: 'CMS-Ready Schema',
        text: 'Structured article data model ready to connect to headless WordPress or Supabase.',
        metric: 'CMS-Ready',
      },
    ],
    galleryImages: ['/work/meridian-hero.jpg', '/work/meridian-detail.jpg', '/work/meridian-audio.jpg'],
  },
  'northline-studio': {
    challenge:
      'Architecture and custom-build websites often rely on static PDF brochures, forcing visitors to trade emails just to see floorplan dimensions or rough pricing.',
    challengeBullets: [
      'Static architectural drawings are difficult to inspect on smartphone screens.',
      'Prospects have no interactive way to compare models, finishes, or add-ons.',
      'Manual back-and-forth slows down initial project scoping.',
    ],
    solution:
      'This interactive showcase concept pairs a 4-step cabin configurator with clickable SVG floorplan views and a live estimate summary.',
    keyFixes: [
      '4-step interactive cabin configurator updating specs and estimated totals live.',
      'Scalable SVG floorplan blueprints with clear room dimensions.',
      'Transparent monthly financing estimator alongside total build figures.',
      'Warm bone and obsidian palette tailored for architectural photography.',
    ],
    metrics: [
      { label: 'Concept Build', value: 'Interactive', caption: 'Testable configurator prototype in browser' },
      { label: '4 Steps', value: '4-Step Flow', caption: 'Model, finishes, add-ons, and summary' },
      { label: 'SVG Plans', value: 'Scalable UI', caption: 'Crisp blueprints at any zoom level' },
    ],
    outcomes: [
      {
        title: 'Interactive Configurator',
        text: '4-step selection flow letting visitors explore models, cladding, and add-on options.',
        metric: '4 Steps',
      },
      {
        title: 'SVG Blueprints',
        text: 'Crisp vector floorplans that stay legible on both mobile phones and wide displays.',
        metric: 'Vector UI',
      },
      {
        title: 'Live Estimate Summary',
        text: 'Dynamic price and financing breakdown updating as options are toggled.',
        metric: 'Live Calc',
      },
      {
        title: 'Lead Brief Handoff',
        text: 'Structured summary format ready to pass straight into a consultation request.',
        metric: 'Scoped',
      },
    ],
    galleryImages: ['/work/northline-hero.jpg', '/work/northline-blueprint.jpg', '/work/northline-specs.jpg'],
  },
  'kinetix-ai-cloud': {
    challenge:
      'Infrastructure and developer-tool websites often hide real pricing behind sales gates and scatter SDK examples across disconnected documentation pages.',
    challengeBullets: [
      'Developers want to estimate hourly and monthly compute costs before signing up.',
      'Switching between cURL, Python, and TypeScript snippets is often clunky.',
      'Complex specs need clear visual hierarchy without overwhelming the viewport.',
    ],
    solution:
      'This developer-console concept demonstrates an interactive GPU cluster cost calculator, simulated token-streaming playground, and 1-click SDK snippet tabs.',
    keyFixes: [
      'Interactive hourly and monthly GPU cluster estimator across hardware tiers.',
      'Simulated streaming inference playground demonstrating responsive output states.',
      'Regional endpoint selector UI comparing sample latency regions.',
      'Tabbed Python, cURL, and TypeScript code blocks with copy-to-clipboard.',
    ],
    metrics: [
      { label: 'Concept Build', value: 'Interactive', caption: 'Testable developer console UI in browser' },
      { label: 'Calculator', value: 'Hourly / Monthly', caption: 'Real-time GPU cluster cost estimator' },
      { label: 'SDK Tabs', value: '3 Languages', caption: 'Copyable cURL, Python & TypeScript snippets' },
    ],
    outcomes: [
      {
        title: 'Cluster Cost Calculator',
        text: 'Interactive node-count and GPU-tier estimator updating hourly and monthly totals.',
        metric: 'Live Calc',
      },
      {
        title: 'Playground UI',
        text: 'Simulated token-streaming interface showing clean developer UX patterns.',
        metric: 'Interactive',
      },
      {
        title: 'SDK Code Switcher',
        text: 'Clean tabbed code samples with copy feedback across Python, cURL, and TypeScript.',
        metric: '3 Tabs',
      },
      {
        title: 'Developer Hierarchy',
        text: 'Structured dark-mode layout keeping pricing, specs, and docs scannable.',
        metric: 'Clean UI',
      },
    ],
    galleryImages: ['/work/kinetix-hero.jpg', '/work/kinetix-pricing.jpg', '/work/kinetix-playground.jpg'],
  },
  'solace-health-portal': {
    challenge:
      'Healthcare and diagnostics portals often present lab results as dense, unsearchable PDFs and rely on multi-page forms for appointment scheduling.',
    challengeBullets: [
      'Static lab tables make it difficult for users to scan reference ranges.',
      'Long intake forms create friction on mobile screens.',
      'Scheduling interfaces are frequently disconnected from service descriptions.',
    ],
    solution:
      'This patient-portal UI concept demonstrates an interactive biomarker explorer with sample data, visual range bars, and a 3-step appointment scheduler.',
    keyFixes: [
      'Searchable and filterable sample biomarker table with clear visual range indicators.',
      'Interactive summary view illustrating how longitudinal trends can be presented.',
      'Calm 3-step appointment scheduling flow designed for clarity on mobile.',
      'Accessible typography and high-contrast status indicators.',
    ],
    metrics: [
      { label: 'Concept Build', value: 'Interactive', caption: 'Testable health portal UI demo (sample data)' },
      { label: '3 Steps', value: 'Booking Flow', caption: 'Streamlined appointment selection prototype' },
      { label: 'Range UI', value: 'Visual Bars', caption: 'Clear presentation of sample lab ranges' },
    ],
    outcomes: [
      {
        title: '3-Step Scheduling UI',
        text: 'Guided appointment booking prototype reducing form clutter on mobile and desktop.',
        metric: '3 Steps',
      },
      {
        title: 'Interactive Lab Explorer',
        text: 'Filterable sample biomarker cards with visual reference-range bars.',
        metric: 'Filterable',
      },
      {
        title: 'Accessible Layout',
        text: 'High-contrast labels and spacious spacing designed for readability.',
        metric: 'Accessible',
      },
      {
        title: 'Production-Ready Foundation',
        text: 'UI architecture ready to integrate with a client’s compliant backend and auth.',
        metric: 'Modular',
      },
    ],
    galleryImages: ['/work/solace-hero.jpg', '/work/solace-markers.jpg', '/work/solace-calendar.jpg'],
  },
}

/**
 * Ensures the 7 flagship interactive concept demos lead the portfolio,
 * followed by any additional custom CMS projects created in the Admin dashboard.
 */
export function mergeWithShowcaseProjects(dbProjects: ProjectCard[]): ProjectCard[] {
  const bySlug = new Map<string, ProjectCard>()
  // Database projects take priority so Admin edits & newly added client projects reflect immediately
  for (const item of dbProjects) {
    bySlug.set(item.slug, item)
  }
  // Fallback to built-in concept demos for slugs not in the database
  for (const showcase of PLACEHOLDER_PROJECTS) {
    if (!bySlug.has(showcase.slug)) {
      bySlug.set(showcase.slug, showcase)
    }
  }
  return Array.from(bySlug.values())
}
