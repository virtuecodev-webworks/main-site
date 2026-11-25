import type { ProjectCategory } from '@/lib/constants'

export type PackageTier = 'starter' | 'business' | 'enterprise'

export interface ServicePackage {
  id: string
  name: string
  tier: PackageTier
  tagline: string
  priceUsd: number
  priceNgn: number
  deliveryDays: number
  revisions: number | 'Unlimited'
  features: string[]
  popular?: boolean
}

export interface AgencyServiceOffering {
  category: ProjectCategory
  title: string
  headline: string
  shortDesc: string
  badge: string
  deliveryTimeRange: string
  packages: Record<PackageTier, ServicePackage>
}

export const AGENCY_SERVICES: AgencyServiceOffering[] = [
  {
    category: 'custom',
    title: 'Custom Next.js & React Web Apps',
    headline: 'Bespoke high-performance web applications built from scratch with Next.js 16 and Supabase.',
    shortDesc: 'Tailored for SaaS products, portals, interactive web platforms, and custom business tools.',
    badge: 'Custom Engineering',
    deliveryTimeRange: '5 - 21 business days',
    packages: {
      starter: {
        id: 'custom-starter',
        name: 'Starter Architecture',
        tier: 'starter',
        tagline: 'Focused high-converting landing page or single-page MVP.',
        priceUsd: 150,
        priceNgn: 225000,
        deliveryDays: 5,
        revisions: 2,
        features: [
          'Next.js 16 App Router + React 19',
          'Responsive design across mobile & desktop',
          'Tailwind CSS v4 + subtle motion details',
          'Core Web Vitals optimization (90+ target on delivered pages)',
          'Lead capture / contact form integration',
          'Vercel edge deployment setup',
        ],
      },
      business: {
        id: 'custom-business',
        name: 'Business Platform',
        tier: 'business',
        tagline: 'Complete production multi-page application with database & CMS.',
        priceUsd: 450,
        priceNgn: 675000,
        deliveryDays: 14,
        revisions: 4,
        popular: true,
        features: [
          'Up to 8 custom application routes',
          'Supabase PostgreSQL database & Auth',
          'Self-serve admin content management',
          'Interactive dashboard components',
          'Multi-currency / localization ready',
          'Structured SEO & OpenGraph metadata',
          '30-day post-launch bug-fix warranty',
        ],
      },
      enterprise: {
        id: 'custom-enterprise',
        name: 'Enterprise Full-Stack',
        tier: 'enterprise',
        tagline: 'Custom full-stack web application with client portal and workflow automation.',
        priceUsd: 950,
        priceNgn: 1425000,
        deliveryDays: 21,
        revisions: 6,
        features: [
          'Full-scale web application & portal',
          'Supabase Row Level Security (RLS) policies',
          'Payment gateway integration (Stripe / Flutterwave)',
          'Automated transactional emails',
          'Role-based access control (Admin/Staff/Client)',
          'Custom REST / server action APIs',
          'Full intellectual property & source code handover',
          '60-day priority support window',
        ],
      },
    },
  },
  {
    category: 'ecommerce',
    title: 'E-Commerce & Multi-Currency Stores',
    headline: 'Conversion-focused online stores engineered for clean checkout and multi-currency settlement.',
    shortDesc: 'Catalog setup, Stripe & card checkout, order ledgers, and automated client receipts.',
    badge: 'Digital Commerce',
    deliveryTimeRange: '7 - 21 business days',
    packages: {
      starter: {
        id: 'ecommerce-starter',
        name: 'Product Storefront',
        tier: 'starter',
        tagline: 'Streamlined online shop for up to 15 products with card checkout.',
        priceUsd: 250,
        priceNgn: 375000,
        deliveryDays: 7,
        revisions: 2,
        features: [
          'Up to 15 products catalog setup',
          'Secure payment gateway (Cards & Apple Pay)',
          'Mobile-first responsive cart & checkout',
          'Instant customer email confirmation receipts',
          'Order notification to client inbox',
        ],
      },
      business: {
        id: 'ecommerce-business',
        name: 'Growth Commerce',
        tier: 'business',
        tagline: 'Full multi-currency online store with inventory management & coupon system.',
        priceUsd: 450,
        priceNgn: 675000,
        deliveryDays: 14,
        revisions: 4,
        popular: true,
        features: [
          'Up to 60 categorized products',
          'Multi-currency settlement (NGN, USD, GBP, EUR)',
          'Dynamic currency detection by country',
          'Discount codes & promo coupons engine',
          'Customer order history & tracking',
          'Inventory management & low-stock alerts',
        ],
      },
      enterprise: {
        id: 'ecommerce-enterprise',
        name: 'Enterprise Commerce',
        tier: 'enterprise',
        tagline: 'Headless / custom storefront with recurring billing and webhook reconciliation.',
        priceUsd: 650,
        priceNgn: 975000,
        deliveryDays: 21,
        revisions: 6,
        features: [
          'Unlimited catalog categories & faceted filters',
          'Subscription billing & recurring payments',
          'Verified webhook ledger & audit reconciliation',
          'Custom shipping rate matrix by region',
          'B2B pricing tier support',
          'API syncing with external inventory tools',
        ],
      },
    },
  },
  {
    category: 'wordpress',
    title: 'WordPress & Headless CMS Engineering',
    headline: 'Lightweight, clean-coded WordPress builds using custom block patterns — no bloated builders.',
    shortDesc: 'Custom ACF fields, Gutenberg patterns, security hardening, and clean SEO structure.',
    badge: 'CMS Specialist',
    deliveryTimeRange: '5 - 18 business days',
    packages: {
      starter: {
        id: 'wordpress-starter',
        name: 'Publisher Foundation',
        tier: 'starter',
        tagline: 'Custom blog or editorial layout with clean Gutenberg block authoring.',
        priceUsd: 150,
        priceNgn: 225000,
        deliveryDays: 5,
        revisions: 2,
        features: [
          'Custom lightweight WordPress theme',
          'Homepage + Blog archive + Article layout',
          'Custom fields for easy content editing',
          'SEO setup & XML sitemap generation',
          'Security & anti-spam hardening',
          'Page caching configuration',
        ],
      },
      business: {
        id: 'wordpress-business',
        name: 'Corporate Site',
        tier: 'business',
        tagline: 'Complete business website with services, portfolio, newsroom, and lead capture.',
        priceUsd: 350,
        priceNgn: 525000,
        deliveryDays: 10,
        revisions: 4,
        popular: true,
        features: [
          'Up to 7 custom designed page layouts',
          'Custom post types (Case Studies, Team, Services)',
          'Lead capture forms with email notification',
          'Core Web Vitals optimization (90+ target on delivered pages)',
          'Multi-language translation setup',
          'Editor walkthrough video & guide',
        ],
      },
      enterprise: {
        id: 'wordpress-enterprise',
        name: 'High-Volume Enterprise',
        tier: 'enterprise',
        tagline: 'High-traffic publication or WooCommerce store with caching & staging workflow.',
        priceUsd: 600,
        priceNgn: 900000,
        deliveryDays: 18,
        revisions: 6,
        features: [
          'WooCommerce / multi-author editorial architecture',
          'Object caching & CDN edge rules',
          'Staging-to-production deployment pipeline',
          'Role & editorial approval workflow',
          'Custom third-party API webhooks',
          '60-day maintenance support window',
        ],
      },
    },
  },
  {
    category: 'wix',
    title: 'Wix Studio & Rapid Launch Sites',
    headline: 'Precision visual layouts built on Wix Studio for brands requiring rapid turnaround and visual editing.',
    shortDesc: 'Fluid breakpoint responsiveness, custom interactions, CMS collections, and clean client handover.',
    badge: 'Rapid Delivery',
    deliveryTimeRange: '5 - 14 business days',
    packages: {
      starter: {
        id: 'wix-starter',
        name: 'Rapid One-Pager',
        tier: 'starter',
        tagline: 'Focused visual landing page launched within 5 business days.',
        priceUsd: 150,
        priceNgn: 225000,
        deliveryDays: 5,
        revisions: 2,
        features: [
          'Custom Wix Studio responsive layout',
          'Desktop, tablet, and mobile fluid breakpoints',
          'Contact & lead capture form with email alerts',
          'Domain connection & SSL configuration',
          'On-page SEO metadata setup',
        ],
      },
      business: {
        id: 'wix-business',
        name: 'Full Studio Presence',
        tier: 'business',
        tagline: 'Multi-page branded site with CMS dynamic lists for portfolios, menus, or services.',
        priceUsd: 300,
        priceNgn: 450000,
        deliveryDays: 10,
        revisions: 4,
        popular: true,
        features: [
          '5-page custom Wix Studio structure',
          'CMS dynamic collections (Projects, Blog, FAQ)',
          'Custom scroll motion & hover interactions',
          'Wix Bookings or Event calendar integration',
          'Visual editor handover with video walkthrough',
        ],
      },
      enterprise: {
        id: 'wix-enterprise',
        name: 'Wix Velo Custom App',
        tier: 'enterprise',
        tagline: 'Wix Studio site enhanced with Velo JavaScript logic, custom forms, and member areas.',
        priceUsd: 500,
        priceNgn: 750000,
        deliveryDays: 14,
        revisions: 6,
        features: [
          'Velo JavaScript custom logic & calculations',
          'Private member dashboard / portal area',
          'Custom database queries & external API integrations',
          'Multi-currency payment setup',
          '45-day post-launch support window',
        ],
      },
    },
  },
]

export function getServiceByCategory(category: ProjectCategory) {
  return AGENCY_SERVICES.find((s) => s.category === category)
}
