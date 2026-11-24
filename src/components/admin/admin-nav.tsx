'use client'

import * as React from 'react'
import {
  FolderKanban,
  Images,
  Inbox,
  LayoutDashboard,
  Mail,
  Palette,
  Radar,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { GlassyShell, type GlassyNavItem } from '@/components/dashboard/glassy-shell'
import { NotificationBellSheet } from '@/components/portal/notification-bell-sheet'
import { signOutAction } from '@/lib/actions/auth'

const ITEMS = [
  {
    href: '/admin',
    labelKey: 'overview',
    short: 'Desk',
    description: 'Revenue, pipeline activity, and studio operations.',
    icon: LayoutDashboard,
    exact: true,
    adminOnly: true,
  },
  {
    href: '/admin/orders',
    labelKey: 'orders',
    short: 'Orders',
    description: 'Live client builds, briefs, and milestone status.',
    icon: FolderKanban,
    exact: false,
    adminOnly: false,
  },
  {
    href: '/admin/portfolio',
    labelKey: 'portfolio',
    short: 'Work',
    description: 'Published flagship showcase projects and drafts.',
    icon: Images,
    exact: false,
    adminOnly: true,
  },
  {
    href: '/admin/inquiries',
    labelKey: 'inquiries',
    short: 'Leads',
    description: 'Inbound client inquiries and proposal intake.',
    icon: Inbox,
    exact: false,
    adminOnly: true,
  },
  {
    href: '/admin/newsletter',
    labelKey: 'newsletter',
    short: 'Mail',
    description: 'Studio dispatch, subscribers, and mailings.',
    icon: Mail,
    exact: false,
    adminOnly: true,
  },
  {
    href: '/admin/outreach',
    labelKey: 'outreach',
    short: 'Radar',
    description: 'Autonomous scouting runs and prospect queue.',
    icon: Radar,
    exact: false,
    adminOnly: true,
  },
  {
    href: '/admin/design',
    labelKey: 'design',
    short: 'Design',
    description: 'Brand palette, typography, and surface tokens.',
    icon: Palette,
    exact: false,
    adminOnly: true,
  },
] as const

export function AdminNav({
  locale,
  email,
  name,
  isAdmin,
  children,
}: {
  locale: string
  email: string | null
  name: string | null
  isAdmin: boolean
  children: React.ReactNode
}) {
  const t = useTranslations('Admin.nav')
  const tAdmin = useTranslations('Admin')
  const tNav = useTranslations('Nav')

  const navItems: GlassyNavItem[] = ITEMS.filter((item) => !item.adminOnly || isAdmin).map(
    (item) => {
      const Icon = item.icon
      return {
        href: item.href,
        label: t(item.labelKey),
        short: item.short,
        description: item.description,
        exact: item.exact,
        icon: <Icon aria-hidden="true" />,
      }
    },
  )

  return (
    <GlassyShell
      workspaceName="VIRTUE & CO."
      workspaceSubtitle="Admin Workspace"
      promptText="Show me studio operations & active builds."
      navItems={navItems}
      navLabel={t('label')}
      userName={name}
      userEmail={email}
      userRoleLabel={isAdmin ? tAdmin('roles.admin') : tAdmin('roles.agent')}
      themeLabel={tNav('theme')}
      backToSiteLabel={t('viewSite')}
      signOutLabel={tAdmin('signOut')}
      signOutAction={signOutAction}
      signOutLocale={locale}
      signOutNext={`/${locale}/login`}
      notificationSlot={
        <NotificationBellSheet triggerClassName="gd-icon-button gd-notices !size-10 !rounded-full !border-[var(--gd-line)] !bg-[var(--gd-raised)]" />
      }
    >
      {children}
    </GlassyShell>
  )
}
