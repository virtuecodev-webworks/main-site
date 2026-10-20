'use client'

import * as React from 'react'
import {
  Send,
  Paperclip,
  Link as LinkIcon,
  BarChart3,
  X,
  FileText,
  FileImage,
  FileArchive,
  FileCode,
  File as FileGeneric,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { postMessage } from '@/lib/actions/orders'
import { IDLE_STATE } from '@/lib/actions/state'
import {
  encodeChatMessage,
  formatBytes,
  type ChatAttachment,
  type ChatLink,
  type ChatProgressReport,
} from '@/lib/chat/format'
import { cn } from '@/lib/utils'

function getFileIcon(type: string, name: string) {
  if (type.startsWith('image/')) return <FileImage className="size-4 text-emerald-500" />
  if (type.includes('pdf') || type.includes('document') || name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.doc'))
    return <FileText className="size-4 text-blue-500" />
  if (type.includes('zip') || type.includes('tar') || name.endsWith('.zip') || name.endsWith('.rar'))
    return <FileArchive className="size-4 text-amber-500" />
  if (type.includes('json') || name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.sql'))
    return <FileCode className="size-4 text-purple-500" />
  return <FileGeneric className="size-4 text-muted-foreground" />
}

export function MessageComposer({
  locale,
  orderId,
  reference,
  canPostInternal = false,
}: {
  locale: string
  orderId: string
  reference: string
  canPostInternal?: boolean
}) {
  const t = useTranslations('Portal')
  const [state, action, pending] = React.useActionState(postMessage, IDLE_STATE)
  const formRef = React.useRef<HTMLFormElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [bodyText, setBodyText] = React.useState('')
  const [attachments, setAttachments] = React.useState<ChatAttachment[]>([])
  const [links, setLinks] = React.useState<ChatLink[]>([])
  const [showLinkModal, setShowLinkModal] = React.useState(false)
  const [showReportModal, setShowReportModal] = React.useState(false)

  // Link modal state
  const [linkTitle, setLinkTitle] = React.useState('')
  const [linkUrl, setLinkUrl] = React.useState('')
  const [linkCategory, setLinkCategory] = React.useState<ChatLink['category']>('staging')

  // Progress report modal state
  const [reportSprint, setReportSprint] = React.useState('Sprint 2: Core Frontend & Database')
  const [reportPercent, setReportPercent] = React.useState(75)
  const [reportDeliverables, setReportDeliverables] = React.useState(
    'Responsive Questrial views complete\nSupabase authentication integrated\nStripe checkout tested with 100/100 Lighthouse',
  )
  const [reportNextSteps, setReportNextSteps] = React.useState('Staging review and final client acceptance')
  const [reportStagingUrl, setReportStagingUrl] = React.useState('https://staging.virtueco.dev')

  React.useEffect(() => {
    if (state.status === 'success') {
      setBodyText('')
      setAttachments([])
      setLinks([])
      formRef.current?.reset()
    }
  }, [state])

  // Handle file uploads (converts file < 2MB to base64, keeps metadata)
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const id = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      const reader = new FileReader()

      if (file.size <= 2.5 * 1024 * 1024) {
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id,
              name: file.name,
              size: file.size,
              type: file.type || 'application/octet-stream',
              dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
            },
          ])
        }
        reader.readAsDataURL(file)
      } else {
        // Larger file: keep metadata for demonstration
        setAttachments((prev) => [
          ...prev,
          {
            id,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
          },
        ])
      }
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const removeLink = (url: string) => {
    setLinks((prev) => prev.filter((l) => l.url !== url))
  }

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkUrl) return
    const formattedUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
    setLinks((prev) => [
      ...prev,
      {
        title: linkTitle || formattedUrl,
        url: formattedUrl,
        category: linkCategory,
      },
    ])
    setLinkTitle('')
    setLinkUrl('')
    setShowLinkModal(false)
  }

  const handleInsertReport = (e: React.FormEvent) => {
    e.preventDefault()
    const reportData: ChatProgressReport = {
      sprint: reportSprint,
      percent: reportPercent,
      deliverables: reportDeliverables.split('\n').filter((d) => d.trim().length > 0),
      nextSteps: reportNextSteps,
      stagingUrl: reportStagingUrl,
    }

    const reportSummary = `[PROGRESS REPORT] 🚀 ${reportData.sprint}\nProgress: ${reportData.percent}% Complete\n\nKey Deliverables:\n${reportData.deliverables.map((d) => `• ${d}`).join('\n')}\n\nNext Step: ${reportData.nextSteps}\nStaging Preview: ${reportData.stagingUrl}`

    setBodyText((prev) => (prev ? `${prev}\n\n${reportSummary}` : reportSummary))
    if (reportStagingUrl) {
      setLinks((prev) => [
        ...prev.filter((l) => l.url !== reportStagingUrl),
        { title: 'Staging Preview', url: reportStagingUrl, category: 'staging' },
      ])
    }
    setShowReportModal(false)
  }

  // Keyboard shortcut: Cmd/Ctrl + Enter sends
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (bodyText.trim() || attachments.length > 0 || links.length > 0) {
        formRef.current?.requestSubmit()
      }
    }
  }

  // Client quick templates
  const applyClientTemplate = (promptText: string) => {
    setBodyText((prev) => (prev ? `${prev} ${promptText}` : promptText))
    textareaRef.current?.focus()
  }

  // Encoded payload to submit in hidden form field
  const finalBody = encodeChatMessage({
    text: bodyText,
    links,
    attachments,
  })

  const errorText = state.status === 'error' ? t(`errors.${state.message}`) : null

  return (
    <div className="flex flex-col gap-3 font-sans">
      <form ref={formRef} action={action} className="flex flex-col gap-3">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="orderId" value={orderId} />
        <input type="hidden" name="reference" value={reference} />
        {/* Hidden field carrying the full encoded payload */}
        <input type="hidden" name="body" value={finalBody} />

        {/* Client quick prompts if empty */}
        {!canPostInternal && !bodyText && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Quick actions:</span>
            <button
              type="button"
              onClick={() => applyClientTemplate('Could we review the latest staging preview build?')}
              className="rounded-full border border-border bg-muted/50 px-2.5 py-1 hover:border-primary/50 hover:bg-muted transition-colors text-foreground"
            >
              Request Staging Review
            </button>
            <button
              type="button"
              onClick={() => applyClientTemplate('Attaching our updated SVG logo assets and typography guidelines.')}
              className="rounded-full border border-border bg-muted/50 px-2.5 py-1 hover:border-primary/50 hover:bg-muted transition-colors text-foreground"
            >
              Send Brand Assets
            </button>
            <button
              type="button"
              onClick={() => applyClientTemplate('What is our estimated timeline for the next milestone?')}
              className="rounded-full border border-border bg-muted/50 px-2.5 py-1 hover:border-primary/50 hover:bg-muted transition-colors text-foreground"
            >
              Timeline Check
            </button>
          </div>
        )}

        {/* Textarea container */}
        <div className="relative rounded-xl border border-input bg-background transition-[border-color,box-shadow] duration-200 focus-within:border-gold-400 focus-within:ring-2 focus-within:ring-gold-500/20 overflow-hidden">
          <Label htmlFor={`message-${orderId}`} className="sr-only">
            {t('messagePlaceholder')}
          </Label>
          <textarea
            ref={textareaRef}
            id={`message-${orderId}`}
            rows={3}
            required={attachments.length === 0 && links.length === 0}
            maxLength={10000}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              canPostInternal
                ? 'Send message to client, or check internal note below… (Cmd+Enter to send)'
                : 'Write a message, attach files, or share links… (Cmd+Enter to send)'
            }
            className="w-full bg-transparent px-3.5 py-3 text-sm text-foreground outline-none resize-none placeholder:text-muted-foreground"
          />

          {/* Attachments preview tray */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pb-2.5 pt-1 border-t border-border/50 bg-muted/20">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground shadow-sm"
                >
                  {getFileIcon(att.type, att.name)}
                  <span className="max-w-[140px] truncate font-medium">{att.name}</span>
                  <span className="text-[10px] text-muted-foreground">({formatBytes(att.size)})</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Attached links preview tray */}
          {links.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pb-2.5 pt-1 border-t border-border/50 bg-muted/20">
              {links.map((link) => (
                <div
                  key={link.url}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground shadow-sm"
                >
                  <ExternalLink className="size-3 text-primary" />
                  <span className="max-w-[160px] truncate font-medium">{link.title}</span>
                  <button
                    type="button"
                    onClick={() => removeLink(link.url)}
                    className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Composer Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/40 px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5">
              {/* File Attachment Button */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
                accept="*/*"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                title="Attach files (images, PDFs, documents, archives, Figma exports)"
              >
                <Paperclip className="size-3.5 text-primary" />
                <span>Attach File</span>
              </Button>

              {/* Link Inserter Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkModal(true)}
                className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                title="Share staging preview, Figma, GitHub, or documentation links"
              >
                <LinkIcon className="size-3.5 text-blue-500" />
                <span>Add Link</span>
              </Button>

              {/* Progress Report Button (Lead / Staff only) */}
              {canPostInternal && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReportModal(true)}
                  className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  title="Generate structured sprint progress update or staging review"
                >
                  <BarChart3 className="size-3.5 text-emerald-500" />
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Progress Report</span>
                </Button>
              )}
            </div>

            <span className="hidden sm:inline text-[11px] text-muted-foreground">Cmd + Enter to send</span>
          </div>
        </div>

        {/* Staff Internal Note Switch */}
        {canPostInternal ? (
          <div className="flex items-center gap-2.5 px-1">
            <input
              id={`internal-${orderId}`}
              name="internal"
              type="checkbox"
              value="true"
              className="size-4 rounded border-input accent-[var(--color-gold-500)]"
            />
            <Label htmlFor={`internal-${orderId}`} className="text-[12.5px] font-normal cursor-pointer select-none">
              {t('noteInternal')} (Only visible to studio team, hidden from client)
            </Label>
          </div>
        ) : null}

        {errorText ? (
          <p className="text-[12.5px] text-destructive" role="alert">
            {errorText}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="gold"
            size="default"
            disabled={pending || (!bodyText.trim() && attachments.length === 0 && links.length === 0)}
          >
            {pending ? (
              <>
                <VirtueSpinner className="size-4" />
                {t('sending')}
              </>
            ) : (
              <>
                <Send className="size-4" />
                {t('send')}
              </>
            )}
          </Button>

          {state.status === 'success' ? (
            <p className="inline-flex items-center gap-1 text-[12.5px] text-[var(--success)]" role="status">
              <CheckCircle2 className="size-3.5" />
              {t('sent')}
            </p>
          ) : null}
        </div>
      </form>

      {/* Add Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <LinkIcon className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Attach Resource Link</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddLink} className="mt-4 flex flex-col gap-3">
              <div>
                <Label className="text-xs">Category</Label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: 'staging', label: 'Staging Preview' },
                      { id: 'figma', label: 'Figma Prototype' },
                      { id: 'github', label: 'GitHub Repository' },
                      { id: 'loom', label: 'Loom Video' },
                      { id: 'drive', label: 'Cloud Drive' },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setLinkCategory(cat.id)
                        if (!linkTitle) setLinkTitle(cat.label)
                      }}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium transition-colors border',
                        linkCategory === cat.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-muted/60 text-foreground hover:bg-muted',
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="link-title" className="text-xs">
                  Link Title
                </Label>
                <input
                  id="link-title"
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="e.g. Staging Preview V2"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <Label htmlFor="link-url" className="text-xs">
                  Destination URL *
                </Label>
                <input
                  id="link-url"
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://staging.virtueco.dev or figma.com/..."
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowLinkModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" size="sm">
                  Attach Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Report Builder Modal (Agency / Staff) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-500" />
                <h3 className="text-base font-semibold text-foreground">Post Progress Report</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleInsertReport} className="mt-4 flex flex-col gap-4">
              <div>
                <Label htmlFor="sprint-name" className="text-xs font-medium">
                  Sprint / Phase Name
                </Label>
                <input
                  id="sprint-name"
                  type="text"
                  required
                  value={reportSprint}
                  onChange={(e) => setReportSprint(e.target.value)}
                  placeholder="Sprint 2: Core Frontend & Database Setup"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Milestone Completion</Label>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {reportPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={reportPercent}
                  onChange={(e) => setReportPercent(parseInt(e.target.value, 10))}
                  className="mt-2 w-full accent-emerald-500 cursor-pointer"
                />
                <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                  <span>25% Planning</span>
                  <span>50% Build</span>
                  <span>75% Review</span>
                  <span>100% Shipped</span>
                </div>
              </div>

              <div>
                <Label htmlFor="deliverables" className="text-xs font-medium">
                  Completed Deliverables (One per line)
                </Label>
                <textarea
                  id="deliverables"
                  rows={3}
                  required
                  value={reportDeliverables}
                  onChange={(e) => setReportDeliverables(e.target.value)}
                  placeholder="Built responsive layouts&#10;Integrated payments&#10;Optimized performance"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="next-steps" className="text-xs font-medium">
                    Next Immediate Step
                  </Label>
                  <input
                    id="next-steps"
                    type="text"
                    value={reportNextSteps}
                    onChange={(e) => setReportNextSteps(e.target.value)}
                    placeholder="Staging review with client"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="staging-url" className="text-xs font-medium">
                    Staging Link
                  </Label>
                  <input
                    id="staging-url"
                    type="text"
                    value={reportStagingUrl}
                    onChange={(e) => setReportStagingUrl(e.target.value)}
                    placeholder="https://staging.virtueco.dev"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-end gap-2 border-t border-border pt-4">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowReportModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" size="sm">
                  Insert Report Into Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
