import { getTranslations } from 'next-intl/server'
import {
  Download,
  ExternalLink,
  FileArchive,
  FileCode,
  FileImage,
  FileText,
  File as FileGeneric,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OrderMessage } from '@/lib/supabase/types'
import { parseChatMessage, formatBytes, type ChatAttachment, type ChatLink } from '@/lib/chat/format'

function AttachmentCard({ attachment }: { attachment: ChatAttachment }) {
  const isImage = attachment.type.startsWith('image/')
  let icon = <FileGeneric className="size-4 text-muted-foreground" />
  if (isImage) icon = <FileImage className="size-4 text-emerald-500" />
  else if (attachment.type.includes('pdf') || attachment.name.endsWith('.pdf'))
    icon = <FileText className="size-4 text-blue-500" />
  else if (attachment.type.includes('zip') || attachment.name.endsWith('.zip'))
    icon = <FileArchive className="size-4 text-amber-500" />
  else if (attachment.type.includes('json') || attachment.name.endsWith('.ts') || attachment.name.endsWith('.tsx'))
    icon = <FileCode className="size-4 text-purple-500" />

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm max-w-sm">
      {isImage && attachment.dataUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-muted/40">
          <img
            src={attachment.dataUrl}
            alt={attachment.name}
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="shrink-0 p-1 rounded-md bg-muted/60">{icon}</div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-xs font-semibold text-foreground">{attachment.name}</span>
            <span className="text-[10px] text-muted-foreground">{formatBytes(attachment.size)}</span>
          </div>
        </div>

        {attachment.dataUrl ? (
          <a
            href={attachment.dataUrl}
            download={attachment.name}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 shrink-0 rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted hover:border-primary/50 transition-colors"
          >
            <Download className="size-3 text-primary" />
            <span>Download</span>
          </a>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">Uploaded</span>
        )}
      </div>
    </div>
  )
}

function LinkPill({ link }: { link: ChatLink }) {
  let badgeTone = 'border-border bg-muted/60 text-foreground'
  if (link.category === 'staging') badgeTone = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  else if (link.category === 'figma') badgeTone = 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400'
  else if (link.category === 'github') badgeTone = 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium hover:opacity-85 transition-opacity',
        badgeTone,
      )}
    >
      {link.category === 'staging' && <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      <span>{link.title}</span>
      <ArrowUpRight className="size-3 shrink-0 opacity-70" />
    </a>
  )
}

/**
 * The conversation, newest last.
 * Supports rich message bodies: Progress Reports, File Downloads, Links, and Internal Notes.
 */
export async function MessageList({
  messages,
  viewerId,
  clientName,
  locale,
}: {
  messages: OrderMessage[]
  viewerId: string
  clientName?: string | null
  locale: string
}) {
  const t = await getTranslations('Portal')
  const tRole = await getTranslations('Orders.role')

  if (!messages.length) {
    return <p className="text-sm text-muted-foreground">{t('conversationEmpty')}</p>
  }

  return (
    <ol className="flex flex-col gap-5">
      {messages.map((message) => {
        const mine = message.author_id === viewerId
        const label = mine
          ? t('you')
          : message.author_role === 'client'
            ? (clientName ?? tRole('client'))
            : tRole(message.author_role)

        const parsed = parseChatMessage(message.body)

        return (
          <li key={message.id} className={cn('flex flex-col gap-2', mine && 'items-end')}>
            {/* Header: Author + Timestamp + Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] font-semibold text-foreground">{label}</span>
              {message.author_role === 'admin' ? (
                <Badge variant="gold" className="text-[10px] px-2 py-0">
                  Lead Engineer
                </Badge>
              ) : message.author_role === 'agent' ? (
                <Badge variant="gold" className="text-[10px] px-2 py-0">
                  Senior Staff
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] px-2 py-0 text-muted-foreground">
                  Client
                </Badge>
              )}
              <time
                dateTime={message.created_at}
                className="text-[11px] text-muted-foreground"
              >
                {new Date(message.created_at).toLocaleString(locale, {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
              {message.internal ? (
                <Badge variant="muted" className="border-dashed border-primary/40 text-[10px] gap-1">
                  <ShieldAlert className="size-3 text-primary" />
                  {t('internalNote')}
                </Badge>
              ) : null}
            </div>

            {/* Bubble Container */}
            <div
              className={cn(
                'flex flex-col gap-3.5 max-w-prose rounded-2xl px-4 py-3.5 text-[13.5px] leading-relaxed shadow-sm',
                message.internal
                  ? 'border border-dashed border-border bg-muted/60 text-muted-foreground'
                  : mine
                    ? 'border border-primary/20 bg-gold-500/10 text-foreground'
                    : 'border border-border bg-card text-foreground',
              )}
            >
              {/* Executive Progress Report Card (if present) */}
              {parsed.report && (
                <div className="flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Sparkles className="size-4 text-emerald-500" />
                      <span>{parsed.report.sprint}</span>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      {parsed.report.percent}% Complete
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${parsed.report.percent}%` }}
                    />
                  </div>

                  {/* Deliverables Checklist */}
                  {parsed.report.deliverables.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                        Delivered
                      </span>
                      <ul className="flex flex-col gap-1 text-foreground">
                        {parsed.report.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Steps & Staging Action */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-emerald-500/20 pt-2 text-[11px]">
                    {parsed.report.nextSteps && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="font-medium text-foreground">Next:</span>
                        <span>{parsed.report.nextSteps}</span>
                      </div>
                    )}
                    {parsed.report.stagingUrl && (
                      <a
                        href={parsed.report.stagingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700 transition-colors ml-auto"
                      >
                        <span>Open Staging Build</span>
                        <ArrowRight className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Main Text Content */}
              {parsed.text && (
                <div className="whitespace-pre-wrap">{parsed.text}</div>
              )}

              {/* Attached Links */}
              {parsed.links.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {parsed.links.map((link, idx) => (
                    <LinkPill key={idx} link={link} />
                  ))}
                </div>
              )}

              {/* Attached Files */}
              {parsed.attachments.length > 0 && (
                <div className="flex flex-col gap-2 pt-1 border-t border-border/50">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Attached Files ({parsed.attachments.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {parsed.attachments.map((att) => (
                      <AttachmentCard key={att.id} attachment={att} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
