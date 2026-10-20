'use client'

import * as React from 'react'
import { Mail } from 'lucide-react'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { updateInquiryStatus } from '@/lib/actions/admin-inquiries'
import { INQUIRY_STATUSES, type InquiryStatus } from '@/lib/constants'
import type { Inquiry } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: 'border-gold-500/40 bg-gold-500/12 text-gold-800 dark:text-gold-300',
  contacted: 'border-border bg-muted text-ink-700 dark:text-ink-200',
  won: 'border-transparent bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]',
  archived: 'border-border bg-background text-muted-foreground',
}

export function InquiriesTable({ inquiries, locale }: { inquiries: Inquiry[]; locale: string }) {
  const t = useTranslations('Admin.inquiries')
  const tStatus = useTranslations('Admin.status')
  const [pendingId, setPendingId] = React.useState<string | null>(null)

  async function changeStatus(id: string, status: string) {
    setPendingId(id)
    try {
      const formData = new FormData()
      formData.set('id', id)
      formData.set('status', status)

      const result = await updateInquiryStatus(formData)
      if (result.ok) {
        toast.success(t('updateStatus'))
        // Re-render the server component so counts + ordering stay in sync.
        window.location.reload()
      } else {
        toast.error('Could not update the status.')
      }
    } finally {
      setPendingId(null)
    }
  }

  if (!inquiries.length) {
    return (
      <div className="surface px-6 py-16 text-center text-sm text-muted-foreground">
        {t('empty')}
      </div>
    )
  }

  return (
    <div className="surface overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead className="hidden lg:table-cell">{t('service')}</TableHead>
            <TableHead className="hidden xl:table-cell">{t('budget')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('received')}</TableHead>
            <TableHead>{t('message')}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {inquiries.map((inquiry) => (
            <TableRow key={inquiry.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{inquiry.name}</span>
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-[12px] text-muted-foreground underline-offset-2 hover:text-gold-700 hover:underline"
                  >
                    {inquiry.email}
                  </a>
                  {inquiry.company ? (
                    <span className="text-[11.5px] text-muted-foreground">{inquiry.company}</span>
                  ) : null}
                </div>
              </TableCell>

              <TableCell className="hidden text-[12.5px] lg:table-cell">
                <span className="flex flex-col gap-1">
                  <span>{inquiry.service ?? '-'}</span>
                  {inquiry.timeline ? (
                    <span className="text-[11.5px] text-muted-foreground">{inquiry.timeline}</span>
                  ) : null}
                </span>
              </TableCell>

              <TableCell className="hidden text-[12.5px] text-muted-foreground xl:table-cell">
                {inquiry.budget ?? '-'}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Select
                    value={inquiry.status}
                    onValueChange={(value) => void changeStatus(inquiry.id, value)}
                  >
                    <SelectTrigger size="sm" className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INQUIRY_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          <Badge className={cn('border', STATUS_STYLES[status])}>
                            {tStatus(status)}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {pendingId === inquiry.id ? (
                    <VirtueSpinner className="size-3.5 text-muted-foreground" />
                  ) : null}
                </div>
              </TableCell>

              <TableCell className="hidden text-[12.5px] text-muted-foreground md:table-cell">
                {new Date(inquiry.created_at).toLocaleDateString(locale, {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>

              <TableCell className="max-w-md">
                <details className="group">
                  <summary className="cursor-pointer list-none text-[12.5px] text-muted-foreground">
                    <span className="line-clamp-2 group-open:hidden">{inquiry.message}</span>
                    <span className="hidden group-open:inline whitespace-pre-wrap">
                      {inquiry.message}
                    </span>
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={`mailto:${inquiry.email}?subject=${encodeURIComponent('Re: your project enquiry')}`}>
                        <Mail className="size-3.5" />
                        Reply
                      </a>
                    </Button>
                  </div>
                </details>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
