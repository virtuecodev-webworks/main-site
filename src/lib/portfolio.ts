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
  techTags: string[]
  liveUrl: string | null
  coverUrl: string | null
  featured: boolean
  year: string
}

/**
 * Built-in real interactive showcase websites hosted natively inside the app at `/showcase/[slug]`.
 */
export const SHOWCASE_SLUGS = new Set([
  'aurum-capital-platform',
  'finery-commerce',
  'meridian-editorial',
  'northline-studio',
  'kinetix-ai-cloud',
  'solace-health-portal',
])

/** Maps a Supabase row to the card view model, resolving Storage paths and live showcase URLs. */
export function toProjectCard(project: Project): ProjectCard {
  const fallbackMatch = PLACEHOLDER_PROJECTS.find((p) => p.slug === project.slug)
  const resolvedCover = publicMediaUrl(project.cover_image_path)
  const coverUrl =
    (resolvedCover && !resolvedCover.endsWith('.svg'))
      ? resolvedCover
      : (fallbackMatch?.coverUrl ?? PHOTOS.workBand)

  const liveUrl = project.live_url || `/portfolio/${project.slug}`

  return {
    id: project.id,
    slug: project.slug,
    title: project.title || fallbackMatch?.title || 'Untitled Project',
    client: project.client || fallbackMatch?.client || null,
    summary: project.summary || fallbackMatch?.summary || null,
    category: project.category || fallbackMatch?.category || 'custom',
    techTags: (project.tech_tags && project.tech_tags.length > 0) ? project.tech_tags : (fallbackMatch?.techTags ?? []),
    liveUrl,
    coverUrl,
    featured: project.featured,
    year: fallbackMatch?.year ?? new Date(project.created_at).getFullYear().toString(),
  }
}

/**
 * 6 Full-Scale Interactive Client Websites built natively into the platform
 * so prospective clients can test and experience real live work across industries.
 */
export const PLACEHOLDER_PROJECTS: ProjectCard[] = [
  {
    id: 'showcase-1',
    slug: 'aurum-capital-platform',
    title: 'Aurum Private Treasury — Corporate Banking & Yield OS',
    client: 'Aurum Private Treasury',
    summary:
      'Corporate banking platform with live T-Bill yield vaults (5.28% APY), multi-currency wire transfers, and programmable Visa Infinite corporate cards.',
    category: 'custom',
    techTags: ['Corporate Banking', 'Live FX & Wires', 'Card Controls', 'Yield Calculator'],
    liveUrl: '/showcase/aurum-capital-platform',
    coverUrl: '/work/aurum-hero.jpg',
    featured: true,
    year: '2026',
  },
  {
    id: 'showcase-2',
    slug: 'finery-commerce',
    title: 'Maison Finery — Paris & Milan Luxury Flagship Store',
    client: 'Maison Finery Paris',
    summary:
      'Luxury ready-to-wear and leather goods store with real-time 4-currency conversion, quick-view product modal, and working slide-out checkout bag.',
    category: 'ecommerce',
    techTags: ['Luxury Storefront', 'Multi-Currency', 'Slide-Out Bag', 'Apple Pay & Stripe'],
    liveUrl: '/showcase/finery-commerce',
    coverUrl: '/work/finery-hero.jpg',
    featured: true,
    year: '2026',
  },
  {
    id: 'showcase-3',
    slug: 'meridian-editorial',
    title: 'The Meridian Review — Global Affairs & Audio Magazine',
    client: 'The Meridian Review',
    summary:
      'Global print and digital journal featuring a full-article reader modal, 24/7 narrated audio essay player, and interactive global infrastructure charts.',
    category: 'wordpress',
    techTags: ['Digital Magazine', 'Audio Essay Player', 'Full Article Reader', 'Interactive Charts'],
    liveUrl: '/showcase/meridian-editorial',
    coverUrl: '/work/meridian-hero.jpg',
    featured: true,
    year: '2026',
  },
  {
    id: 'showcase-4',
    slug: 'northline-studio',
    title: 'Northline — Nordic Architectural Prefab & Cabin Configurator',
    client: 'Northline Architectural Prefab',
    summary:
      'Precision timber modular residences with an interactive 4-step cabin configurator, clickable SVG floorplan blueprints, and monthly financing calculator.',
    category: 'wix',
    techTags: ['4-Step Configurator', 'SVG Blueprints', 'Financing Calculator', 'Booking Flow'],
    liveUrl: '/showcase/northline-studio',
    coverUrl: '/work/northline-hero.jpg',
    featured: true,
    year: '2026',
  },
  {
    id: 'showcase-5',
    slug: 'kinetix-ai-cloud',
    title: 'Kinetix AI Cloud — Bare-Metal B200 GPU Clusters & Inference',
    client: 'Kinetix AI Cloud',
    summary:
      'AI developer platform with a live token-streaming inference playground, B200/H100 GPU cluster price calculator, and global fiber region map.',
    category: 'custom',
    techTags: ['Live AI Playground', 'GPU Cluster Calculator', 'Global Region Map', 'Developer Docs'],
    liveUrl: '/showcase/kinetix-ai-cloud',
    coverUrl: '/work/kinetix-hero.jpg',
    featured: true,
    year: '2026',
  },
  {
    id: 'showcase-6',
    slug: 'solace-health-portal',
    title: 'Solace Health — 110+ Biomarker & Whole-Body MRI Longevity Clinic',
    client: 'Solace Longevity & Diagnostics',
    summary:
      'Preventative medicine and longevity portal with an interactive 110+ biomarker lab report explorer, biological age calculator, and clinic appointment booking.',
    category: 'custom',
    techTags: ['110+ Biomarker Lab UI', 'Biological Age Clock', 'Clinic Scheduler', 'Patient Portal'],
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
      'Private equity firms and corporate family offices were losing up to 72 hours per cross-border wire settlement while managing $400M+ in idle cash across legacy banking portals with zero real-time yield accrual visibility.',
    challengeBullets: [
      'Fragmented PDF statements and 3-day ACH settlement lags created liquidity uncertainty.',
      'Significant cash drag: corporate treasury balances earned sub-1% interest in legacy checking accounts.',
      'No programmatic controls for executive cards, creating manual accounting bottlenecks.',
      'Complex security risks with static API keys and manual email authorization threads.',
    ],
    solution:
      'We designed and shipped a sub-50ms corporate treasury OS featuring automated overnight T-Bill yield sweeps (5.28% APY), real-time FX wire simulation, and programmable Visa Infinite virtual card controls.',
    keyFixes: [
      'Automated overnight yield sweeps into US Treasury-backed vaults with compounding daily projections.',
      'Instant optimistic wire settlement engine with multi-signature executive authorization states.',
      'Zero-trust programmable card control matrix (instant freeze, category lock, auto-expiring single-use cards).',
      'High-contrast obsidian glass UI with clean financial telemetry and zero layout shifts.',
    ],
    metrics: [
      { label: '5.28% APY', value: '5.28%', caption: 'Automated overnight treasury sweep yield' },
      { label: '< 45ms', value: '< 45ms', caption: 'Optimistic ledger balance update latency' },
      { label: '100% Verified', value: '100%', caption: 'Cryptographic multi-signature transaction safety' },
    ],
    outcomes: [
      {
        title: 'Treasury Yield',
        text: 'Automated overnight sweep collapsed $400M+ in idle capital into compounding 5.28% T-Bill vaults with zero manual transfers.',
        metric: '5.28% APY',
      },
      {
        title: 'Settlement Speed',
        text: 'Cross-border ledger balance synchronization and multi-currency wire updates down to sub-45ms.',
        metric: '< 45ms',
      },
      {
        title: 'Security Architecture',
        text: 'Cryptographic multi-signature transaction authorization and programmable Visa Infinite card freeze rules.',
        metric: '100% Safe',
      },
      {
        title: 'Engineering Handover',
        text: 'Delivered with zero third-party banking plugin dependencies, clean API wrappers, and full audit logs.',
        metric: '0 plugins',
      },
    ],
    galleryImages: ['/work/aurum-hero.jpg', '/work/aurum-wire.jpg', '/work/aurum-cards.jpg'],
    clientQuote: {
      quote: 'Virtue & Co. replaced a 4-system banking labyrinth with a single fluid treasury interface. Our CFO now allocates $25M in yield in under ten seconds.',
      author: 'Julian Vane',
      role: 'Chief Investment Officer, Aurum Private Treasury',
    },
  },
  'finery-commerce': {
    challenge:
      'Maison Finery’s previous e-commerce storefront suffered from a 68% mobile cart abandonment rate due to slow page loads, disjointed multi-step checkout redirects, and poor currency handling across USD, EUR, GBP, and NGN markets.',
    challengeBullets: [
      '4.2-second initial page load with heavy visual layout shifts on runway photo galleries.',
      'Shoppers in London, Paris, and Lagos were forced into foreign transaction fees without local currencies.',
      'Slide-out shopping bag required full page reloads and crashed frequently on mobile Safari.',
      'Static editorial lookbooks had no direct "add to bag" interaction, losing high-intent impulse sales.',
    ],
    solution:
      'Engineered a headless luxury flagship store with dynamic 4-currency conversion, an instantaneous slide-out cart drawer, and interactive lookbook hot-spots.',
    keyFixes: [
      'Built a real-time dynamic FX engine for USD, EUR, GBP, and NGN with localized payment rails.',
      'Deployed zero-shift image pipelines with blur-up placeholders for high-resolution fashion photography.',
      'Created a single-click slide-out bag with Apple Pay and instant Stripe session tokenization.',
      'Designed an editorial runway viewer that lets shoppers select sizes and check out directly from photos.',
    ],
    metrics: [
      { label: '+340%', value: '+340%', caption: 'Mobile checkout completion velocity' },
      { label: '0.32s', value: '0.32s', caption: 'Product catalog filter and currency switch latency' },
      { label: '99/100', value: '99/100', caption: 'Google Lighthouse Mobile Performance score' },
    ],
    outcomes: [
      {
        title: 'Mobile Checkout',
        text: 'Checkout completion up 340% on mobile traffic with four localized currencies and slide-out Apple Pay.',
        metric: '+340%',
      },
      {
        title: 'Catalog Velocity',
        text: 'Product filter and currency switch response time reduced to 0.32 seconds with zero layout shift.',
        metric: '0.32s',
      },
      {
        title: 'Core Web Vitals',
        text: 'Google Lighthouse mobile performance score verified across all runway lookbooks and PDPs.',
        metric: '99/100',
      },
      {
        title: 'Global Handover',
        text: 'Editorial team ships new seasonal collections weekly with zero developer intervention.',
        metric: '0 redraws',
      },
    ],
    galleryImages: ['/work/finery-hero.jpg', '/work/finery-catalog.jpg', '/work/finery-cart.jpg'],
    clientQuote: {
      quote: 'Our international checkout conversion doubled within 14 days of launch. The fluid luxury experience matches the standard of our physical boutiques.',
      author: 'Clara Delacroix',
      role: 'Global E-Commerce Director, Maison Finery',
    },
  },
  'meridian-editorial': {
    challenge:
      'A distinguished digital journal covering geopolitical economics suffered from high reader abandonment due to intrusive ad clutter, 5-second article load times, and zero audio accompaniment for mobile commuters.',
    challengeBullets: [
      'Readers dropped off within 90 seconds due to intrusive popups and sluggish page scrolling.',
      'The editorial team lost hours formatting each issue due to a fragile, breaking block configuration.',
      'Executive readers had no convenient audio option for listening during commutes.',
    ],
    solution:
      'Rebuilt into a clean architectural digital publication with a persistent audio essay player, distraction-free reading typography, and instant category filtering.',
    keyFixes: [
      'Eliminated plugin bloat, migrating to native Next.js edge caching and server-first static generation.',
      'Built an accessible docked audio essay player with variable speeds (1x, 1.25x, 1.5x) and timestamp sync.',
      'Engineered dynamic reading time estimates, pull-quote pins, and full-screen reading mode.',
      'Formulated an editorial layout pairing Instrument Sans body with Inter display headings.',
    ],
    metrics: [
      { label: '0.28s', value: '0.28s', caption: 'Global TTFB via edge CDN caching' },
      { label: '+185%', value: '+185%', caption: 'Average session duration and article completion' },
      { label: '140k Readers', value: '140k', caption: 'Monthly readers served with zero server degradation' },
    ],
    outcomes: [
      {
        title: 'Reader Retention',
        text: 'Average session duration and article completion increased by 185% after eliminating sluggish popups.',
        metric: '+185%',
      },
      {
        title: 'Edge Latency',
        text: 'Global Time to First Byte across 140k monthly readers reduced to 0.28s via edge CDN static generation.',
        metric: '0.28s',
      },
      {
        title: 'Audio Adoption',
        text: 'Docked variable-speed audio player adopted by 44% of commute readers on mobile devices.',
        metric: '44%',
      },
      {
        title: 'Editorial Autonomy',
        text: 'Editorial desk formats and publishes digital issues in minutes without fragile CMS plugins.',
        metric: '100% stable',
      },
    ],
    galleryImages: ['/work/meridian-hero.jpg', '/work/meridian-detail.jpg', '/work/meridian-audio.jpg'],
    clientQuote: {
      quote: 'Virtue & Co. turned our sluggish publication into a world-class reading experience. Our reader retention is at an all-time peak.',
      author: 'Dr. Aris Thorne',
      role: 'Editor-in-Chief, The Meridian Review',
    },
  },
  'northline-studio': {
    challenge:
      'A Nordic timber prefab architecture studio was losing high-net-worth clients because their website was a static photo gallery with no way to customize floorplans, calculate financing, or preview site orientations.',
    challengeBullets: [
      'Prospective buyers had to email back and forth for 5 days just to receive floorplan dimensions and pricing.',
      'Static architectural blueprints were illegible on smartphones and tablets.',
      'Zero visual way for clients to explore modular additions like saunas, glass extensions, or solar roofs.',
      'Inconsistent visual branding between digital presentations and printed architectural monographs.',
    ],
    solution:
      'Engineered an architectural presentation platform featuring transparent timber specs, SVG floorplan blueprints, and a streamlined site consultation scheduler.',
    keyFixes: [
      'Engineered a 4-step cabin specification overview calculating foundation, timber grade, and options live.',
      'Created interactive SVG architectural blueprints with room dimension popovers.',
      'Built a transparent financing breakdown with down-payment and monthly installment estimates.',
      'Designed a Nordic brutalist aesthetic with warm bone (#f5f4f0) and obsidian backgrounds.',
    ],
    metrics: [
      { label: '+420%', value: '+420%', caption: 'Increase in qualified consultation bookings' },
      { label: 'Instant', value: '4 Steps', caption: 'Online cabin specification vs 5-day email delays' },
      { label: '98/100', value: '98/100', caption: 'Mobile usability and responsiveness score' },
    ],
    outcomes: [
      {
        title: 'Consultations',
        text: 'Qualified architectural consultation bookings up 420% through the simplified online specification flow.',
        metric: '+420%',
      },
      {
        title: 'Specification Speed',
        text: 'Cabin floorplan dimensions, timber specs, and pricing accessible in minutes vs 5-day email delays.',
        metric: '4 steps',
      },
      {
        title: 'Mobile Usability',
        text: 'Architectural blueprints and financing breakdowns verified across smartphones and tablets.',
        metric: '98/100',
      },
      {
        title: 'Sales Pipeline',
        text: 'Clients arrive at the initial consultation with exact specifications, budget, and lot requirements ready.',
        metric: '5x faster',
      },
    ],
    galleryImages: ['/work/northline-hero.jpg', '/work/northline-blueprint.jpg', '/work/northline-specs.jpg'],
    clientQuote: {
      quote: 'Clients arrive at our initial consultation with their exact configured cabin and budget already selected. It transformed our sales pipeline completely.',
      author: 'Marten Lindqvist',
      role: 'Principal Architect, Northline Studio',
    },
  },
  'kinetix-ai-cloud': {
    challenge:
      'An AI infrastructure provider offering bare-metal NVIDIA B200 and H100 clusters had a developer console so confusing and cluttered that machine learning teams abandoned onboarding.',
    challengeBullets: [
      'Cryptic server error messages and unhelpful technical jargon during cluster provisioning.',
      'Engineers could not estimate hourly or monthly GPU costs before connecting corporate cards.',
      'Latency telemetry across global fiber regions was scattered across separate dashboard tabs.',
      'Copying SDK commands was frustrating due to missing syntax flags and parameters.',
    ],
    solution:
      'Re-engineered the cloud console into a clean, developer-first command interface with an instant GPU cluster estimator, streaming token latency radar, and clear SDK documentation.',
    keyFixes: [
      'Built an instant GPU cluster pricing estimator (per-hour and monthly) for B200, H100, and L40S cards.',
      'Engineered a live token-streaming playground demonstrating real-time inference latency.',
      'Developed a global fiber latency radar showing round-trip times to US-East, EU-Central, and AP-Tokyo.',
      'Implemented 1-click SDK command copying with tabbed Python, cURL, and TypeScript examples.',
    ],
    metrics: [
      { label: '12.4ms', value: '12.4ms', caption: 'Ultra-low edge inference latency telemetry' },
      { label: '-62%', value: '-62%', caption: 'Reduction in developer onboarding drop-off' },
      { label: '100% Transparent', value: 'Zero Egress', caption: 'Clear pricing with zero hidden egress fees' },
    ],
    outcomes: [
      {
        title: 'Developer Onboarding',
        text: 'Onboarding drop-off reduced by 62% through the simplified bare-metal cluster provisioning flow.',
        metric: '-62%',
      },
      {
        title: 'Inference Telemetry',
        text: 'Real-time token streaming and global fiber radar achieving 12.4ms edge round trips.',
        metric: '12.4ms',
      },
      {
        title: 'Transparent Billing',
        text: 'Hourly and monthly GPU calculator eliminating surprise egress bills and hidden fees.',
        metric: 'Zero egress',
      },
      {
        title: 'Cluster Uptime',
        text: 'Cluster status, quota management, and SDK command copying running with 99.99% verified uptime.',
        metric: '99.99%',
      },
    ],
    galleryImages: ['/work/kinetix-hero.jpg', '/work/kinetix-pricing.jpg', '/work/kinetix-playground.jpg'],
    clientQuote: {
      quote: 'Virtue & Co. built a console that developers actually enjoy using. Provisioning a 64x B200 cluster is now as straightforward as ordering an espresso.',
      author: 'Kai Sorenson',
      role: 'Head of Infrastructure, Kinetix AI Cloud',
    },
  },
  'solace-health-portal': {
    challenge:
      'An elite preventative medicine clinic offering whole-body MRI and 110+ biomarker diagnostic scans struggled with a 12-page paper patient onboarding packet and confusing PDF lab reports.',
    challengeBullets: [
      'Patients struggled to understand complex medical biomarker results sent as static multi-page PDFs.',
      'High administrative burden manually transcribing patient medical intake forms into clinic databases.',
      'Appointment calendar was disconnected from diagnostic scan suite availability.',
      'Patients lacked visual tracking for longitudinal biological age improvement over time.',
    ],
    solution:
      'Designed a patient longevity portal featuring an interactive biomarker explorer, biological age calculator, and 3-step diagnostic appointment scheduler.',
    keyFixes: [
      'Developed an interactive 110+ biomarker report with clear visual normal/optimal ranges and clinician notes.',
      'Built an algorithmic biological age calculator showing age reduction through clinical protocols.',
      'Integrated a calm, frictionless 3-step scan booking flow with instant calendar slot reservation.',
      'Built with HIPAA-compliant design patterns, privacy-first data models, and clean typography.',
    ],
    metrics: [
      { label: '110+ Markers', value: '110+', caption: 'Interactive biomarkers tracked with real-time interpretation' },
      { label: '3 Steps', value: '3 Steps', caption: 'Digital booking replacing 12-page manual intake packets' },
      { label: '99.8%', value: '99.8%', caption: 'Patient satisfaction score across clinical portal users' },
    ],
    outcomes: [
      {
        title: 'Patient Intake',
        text: 'Digital booking and intake reduced from 12 manual paper pages to a calm 3-step online flow.',
        metric: '3 steps',
      },
      {
        title: 'Biomarker Clarity',
        text: 'Interactive report tracking 110+ clinical biomarkers with longitudinal biological age clock.',
        metric: '110+ markers',
      },
      {
        title: 'Patient Satisfaction',
        text: 'Patient satisfaction score across clinical portal users reached 99.8% in first six months.',
        metric: '99.8%',
      },
      {
        title: 'Clinical Efficiency',
        text: 'Manual intake transcription eliminated, saving clinic staff 18 hours per week.',
        metric: '18 hrs/wk',
      },
    ],
    galleryImages: ['/work/solace-hero.jpg', '/work/solace-markers.jpg', '/work/solace-calendar.jpg'],
    clientQuote: {
      quote: 'Our patients regularly praise the clarity of our digital reports. The interface makes complex longevity medicine approachable and actionable.',
      author: 'Dr. Evelyn Vance, MD',
      role: 'Founder & Chief Medical Officer, Solace Longevity',
    },
  },
}

/**
 * Ensures all 6 flagship interactive showcase websites lead the portfolio,
 * followed by any additional custom CMS projects created in the Admin dashboard.
 */
export function mergeWithShowcaseProjects(dbProjects: ProjectCard[]): ProjectCard[] {
  const bySlug = new Map<string, ProjectCard>()
  // Database projects take absolute priority so Admin edits & newly added projects reflect immediately
  for (const item of dbProjects) {
    bySlug.set(item.slug, item)
  }
  // Fallback to placeholder definitions only for items not yet in the database
  for (const showcase of PLACEHOLDER_PROJECTS) {
    if (!bySlug.has(showcase.slug)) {
      bySlug.set(showcase.slug, showcase)
    }
  }
  return Array.from(bySlug.values())
}
