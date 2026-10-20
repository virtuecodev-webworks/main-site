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
    badge: 'Virtue Verified Core',
    deliveryTimeRange: '5 - 21 days',
    packages: {
      starter: {
        id: 'custom-starter',
        name: 'Starter Architecture',
        tier: 'starter',
        tagline: 'High-converting interactive single-page app or MVP.',
        priceUsd: 120,
        priceNgn: 200000,
        deliveryDays: 5,
        revisions: 2,
        features: [
          'Next.js 16 App Router + React 19',
          'Responsive design for all screens',
          'Tailwind CSS v4 + 21st.dev micro-interactions',
          '100/100 Lighthouse performance SLA',
          'Lead capture / contact form integration',
          'Vercel edge deployment setup',
        ],
      },
      business: {
        id: 'custom-business',
        name: 'Business Platform',
        tier: 'business',
        tagline: 'Complete production multi-page application with database & CMS.',
        priceUsd: 350,
        priceNgn: 580000,
        deliveryDays: 12,
        revisions: 4,
        popular: true,
        features: [
          'Up to 8 custom application routes',
          'Supabase PostgreSQL database & Auth',
          'Self-serve admin content management',
          'Interactive dashboard components',
          'Multi-currency / localization ready',
          'Advanced SEO & OpenGraph card generator',
          '30-day post-launch warranty',
        ],
      },
      enterprise: {
        id: 'custom-enterprise',
        name: 'Enterprise Full-Stack',
        tier: 'enterprise',
        tagline: 'Custom full-stack web application with client portal and workflow automation.',
        priceUsd: 750,
        priceNgn: 1250000,
        deliveryDays: 21,
        revisions: 'Unlimited',
        features: [
          'Full-scale web application & portal',
          'Supabase Row Level Security (RLS) policies',
          'Payment gateway integration (Stripe & Global Cards)',
          'Automated transactional emails (Resend)',
          'Role-based access control (Admin/Staff/Client)',
          'Custom REST / server action APIs',
          'Full intellectual property & source code handover',
          '60-day VIP priority support',
        ],
      },
    },
  },
  {
    category: 'ecommerce',
    title: 'E-Commerce & Multi-Currency Stores',
    headline: 'High-converting online stores engineered for frictionless checkout and global payment settlement.',
    shortDesc: 'Automated inventory, Stripe & global card checkout, order ledgers, and client receipts.',
    badge: 'Fintech Verified',
    deliveryTimeRange: '7 - 25 days',
    packages: {
      starter: {
        id: 'ecommerce-starter',
        name: 'Product Storefront',
        tier: 'starter',
        tagline: 'Streamlined online shop for up to 15 products with instant checkout.',
        priceUsd: 160,
        priceNgn: 270000,
        deliveryDays: 7,
        revisions: 2,
        features: [
          'Up to 15 products catalog setup',
          'Inline secure payment gateway (Cards & Apple Pay)',
          'Mobile-first responsive cart & checkout',
          'Instant customer email confirmation receipts',
          'WhatsApp direct order link widget',
          'Order notification to agency / client inbox',
        ],
      },
      business: {
        id: 'ecommerce-business',
        name: 'Growth Commerce',
        tier: 'business',
        tagline: 'Full multi-currency online store with inventory management & coupon system.',
        priceUsd: 390,
        priceNgn: 650000,
        deliveryDays: 14,
        revisions: 5,
        popular: true,
        features: [
          'Up to 60 categorized products',
          'Multi-currency settlement (NGN, USD, GBP, EUR)',
          'Dynamic currency auto-detection by country',
          'Discount codes & promo coupons engine',
          'Customer order history & tracking',
          'Inventory management & low-stock alerts',
          'Abandoned cart recovery hooks',
        ],
      },
      enterprise: {
        id: 'ecommerce-enterprise',
        name: 'Enterprise Commerce',
        tier: 'enterprise',
        tagline: 'Headless / custom marketplace with recurring billing and ERP integration.',
        priceUsd: 790,
        priceNgn: 1300000,
        deliveryDays: 25,
        revisions: 'Unlimited',
        features: [
          'Unlimited products & advanced faceted filters',
          'Subscription billing & recurring payments',
          'Verified webhook ledger & audit reconciliation',
          'Custom shipping rate matrix by state/region',
          'B2B wholesale pricing tier toggles',
          'Full API syncing with ERP / external warehouse',
          'Dedicated launch sprint & SLA guarantee',
        ],
      },
    },
  },
  {
    category: 'wordpress',
    title: 'WordPress & Headless CMS Engineering',
    headline: 'Lightning-fast, clean-coded WordPress builds using custom block patterns — no bloated builders.',
    shortDesc: 'Bespoke ACF Pro fields, Gutenberg patterns, bulletproof security hardening, and SEO.',
    badge: 'CMS Specialist',
    deliveryTimeRange: '4 - 15 days',
    packages: {
      starter: {
        id: 'wordpress-starter',
        name: 'Publisher Foundation',
        tier: 'starter',
        tagline: 'Custom blog or editorial layout with clean Gutenberg block authoring.',
        priceUsd: 95,
        priceNgn: 160000,
        deliveryDays: 4,
        revisions: 2,
        features: [
          'Custom lightweight WordPress theme',
          'Homepage + Blog archive + Article layout',
          'ACF Pro custom fields for easy editing',
          'SEO plugin setup & XML sitemap generation',
          'Basic security & anti-spam hardening',
          'Fast page caching configuration',
        ],
      },
      business: {
        id: 'wordpress-business',
        name: 'Corporate Site',
        tier: 'business',
        tagline: 'Complete business website with services, portfolio, newsroom, and lead capture.',
        priceUsd: 260,
        priceNgn: 430000,
        deliveryDays: 10,
        revisions: 4,
        popular: true,
        features: [
          'Up to 7 custom designed page layouts',
          'Custom post types (Case Studies, Team, Services)',
          'Dynamic lead capture forms with CRM notification',
          'Core Web Vitals green score optimization',
          'Multi-language translation plugin integration',
          'Comprehensive editor video tutorial & guide',
        ],
      },
      enterprise: {
        id: 'wordpress-enterprise',
        name: 'High-Volume Enterprise',
        tier: 'enterprise',
        tagline: 'High-traffic publication or WooCommerce store with dedicated caching & staging.',
        priceUsd: 550,
        priceNgn: 920000,
        deliveryDays: 18,
        revisions: 'Unlimited',
        features: [
          'WooCommerce / Complex publication architecture',
          'Redis object caching & CDN edge rules',
          'Staging-to-production deployment pipeline',
          'Enterprise role & editorial approval workflow',
          'Custom third-party API webhooks',
          'Penetration testing & malware protection',
          'Priority maintenance for 60 days',
        ],
      },
    },
  },
  {
    category: 'wix',
    title: 'Wix Studio & Rapid Launch Sites',
    headline: 'Precision visual layouts built on Wix Studio for brands requiring rapid turnaround and visual editing.',
    shortDesc: 'Fluid breakpoint responsiveness, custom interactions, CMS collections, and easy client handover.',
    badge: 'Rapid Delivery',
    deliveryTimeRange: '3 - 10 days',
    packages: {
      starter: {
        id: 'wix-starter',
        name: 'Rapid One-Pager',
        tier: 'starter',
        tagline: 'High-impact visual landing page launched in 3 business days.',
        priceUsd: 80,
        priceNgn: 135000,
        deliveryDays: 3,
        revisions: 2,
        features: [
          'Custom Wix Studio responsive layout',
          'Desktop, tablet, and mobile fluid breakpoints',
          'Contact & lead capture form with email alerts',
          'Domain connection & SSL configuration',
          'Basic on-page SEO setup',
        ],
      },
      business: {
        id: 'wix-business',
        name: 'Full Studio Presence',
        tier: 'business',
        tagline: 'Multi-page branded site with CMS dynamic lists for portfolios, menus, or services.',
        priceUsd: 220,
        priceNgn: 360000,
        deliveryDays: 7,
        revisions: 4,
        popular: true,
        features: [
          '5-page custom Wix Studio structure',
          'CMS dynamic collections (Projects, Blog, FAQ)',
          'Custom scroll motion & hover micro-interactions',
          'Wix Bookings or Event calendar integration',
          'Full visual editor handover with video walkthrough',
        ],
      },
      enterprise: {
        id: 'wix-enterprise',
        name: 'Wix Velo Custom App',
        tier: 'enterprise',
        tagline: 'Wix Studio site enhanced with Velo JavaScript logic, custom forms, and member areas.',
        priceUsd: 450,
        priceNgn: 750000,
        deliveryDays: 12,
        revisions: 'Unlimited',
        features: [
          'Velo JavaScript custom business logic & calculations',
          'Private member dashboard / portal area',
          'Custom database queries & external API integrations',
          'Multi-currency payment processing',
          'Priority revisions & 45-day support warranty',
        ],
      },
    },
  },
]

export function getServiceByCategory(category: ProjectCategory) {
  return AGENCY_SERVICES.find((s) => s.category === category)
}
