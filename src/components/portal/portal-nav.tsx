'use client'

import * as React from 'react'
import {
  CreditCard,
  FolderGit2,
  LayoutList,
  Plus,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { GlassyShell, type GlassyNavItem } from '@/components/dashboard/glassy-shell'
import { NotificationBellSheet } from '@/components/portal/notification-bell-sheet'
import { signOutAction } from '@/lib/actions/auth'

export function PortalNav({
  locale,
  name,
  email,
  unreadCount = 0,
  children,
}: {
  locale: string
  name: string | null
  email: string | null
  unreadCount?: number
  children: React.ReactNode
}) {
  const t = useTranslations('Portal')
  const tNav = useTranslations('Nav')

  const navItems: GlassyNavItem[] = [
    {
      href: '/portal',
      label: t('title'),
      short: 'Projects',
      description: 'Active project builds, milestones, and engineer updates.',
      icon: <LayoutList aria-hidden="true" />,
      exact: true,
    },
    {
      href: '/portal#new-request',
      label: t('request.title'),
      short: 'New Brief',
      description: 'Submit a new custom build brief or feature scope.',
      icon: <Plus aria-hidden="true" />,
    },
    {
      href: '/payment',
      label: 'Instant Pay',
      short: 'Pay',
      description: 'Complete milestone settlements with encrypted checkout.',
      icon: <CreditCard aria-hidden="true" />,
    },
    {
      href: '/portfolio',
      label: 'Flagship Work',
      short: 'Showcase',
      description: 'Explore live production websites engineered by Virtue & Co.',
      icon: <FolderGit2 aria-hidden="true" />,
    },
  ]

  return (
    <GlassyShell
      workspaceName="VIRTUE & CO."
      workspaceSubtitle="Client Portal"
      promptText="Show me my active project milestones & updates."
      navItems={navItems}
      navLabel={t('title')}
      userName={name}
      userEmail={email}
      userRoleLabel={tNav('account')}
      themeLabel={tNav('theme')}
      backToSiteLabel={t('backToSite')}
      signOutLabel={t('signOut')}
      signOutAction={signOutAction}
      signOutLocale={locale}
      signOutNext={`/${locale}`}
      notificationSlot={
        <NotificationBellSheet
          unreadCount={unreadCount}
          triggerClassName="gd-icon-button gd-notices !size-10 !rounded-full !border-[var(--gd-line)] !bg-[var(--gd-raised)]"
        />
      }
    >
      {children}
    </GlassyShell>
  )
}
