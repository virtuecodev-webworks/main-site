'use client'

import * as React from 'react'
import { MessageSquare, FileText, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OrderInteractiveViewProps {
  conversationNode: React.ReactNode
  detailsNode: React.ReactNode
  unreadCount?: number
}

/**
 * Responsive dual-view switcher for Order Threads:
 * - On Mobile (< lg): Renders a sleek iOS/Android segmented tab bar:
 *   [💬 Discussion & Messages]  |  [📋 Project Spec & Details]
 * - On Desktop (>= lg): Displays both as a spacious 2-column workspace layout.
 */
export function OrderInteractiveView({
  conversationNode,
  detailsNode,
  unreadCount = 0,
}: OrderInteractiveViewProps) {
  const [activeTab, setActiveTab] = React.useState<'chat' | 'details'>('chat')

  return (
    <div className="flex flex-col gap-5">
      {/* Mobile Segmented Tab Control (Visible only on mobile / tablet < lg) */}
      <div className="flex lg:hidden w-full rounded-2xl bg-muted/80 p-1.5 border border-border shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all duration-200',
            activeTab === 'chat'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <MessageSquare className="size-4 text-primary" />
          <span>Discussion &amp; Files</span>
          {unreadCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all duration-200',
            activeTab === 'details'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FileText className="size-4 text-primary" />
          <span>Spec &amp; Milestones</span>
        </button>
      </div>

      {/* Main Grid: On desktop shows side-by-side; on mobile shows active tab */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left Column: Conversation */}
        <div className={cn(activeTab === 'chat' ? 'block' : 'hidden lg:block')}>
          {conversationNode}
        </div>

        {/* Right Column: Spec, Brief, Milestones, History */}
        <div className={cn('flex flex-col gap-6', activeTab === 'details' ? 'block' : 'hidden lg:flex')}>
          {detailsNode}
        </div>
      </div>
    </div>
  )
}
