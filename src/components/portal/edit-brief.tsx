'use client'

import * as React from 'react'
import { Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateOrderRequest } from '@/lib/actions/orders'
import { IDLE_STATE } from '@/lib/actions/state'

/**
 * Editing a brief, only while the request is still just a request.
 *
 * Once the studio has picked the work up, `orders_client_edit_own_request` stops
 * matching and the action reports `not-editable`. The lock is the database's, so
 * the worse it can be explained here rather than enforced here.
 */
export function EditBrief({
  locale,
  orderId,
  reference,
  title,
  brief,
}: {
  locale: string
  orderId: string
  reference: string
  title: string
  brief: string
}) {
  const t = useTranslations('Portal')
  const [state, action, pending] = React.useActionState(updateOrderRequest, IDLE_STATE)

  const errorText = state.status === 'error' ? t(`errors.${state.message}`) : null

  return (
    <details className="surface p-5 [&[open]>summary]:mb-4">
      <summary className="cursor-pointer text-[13.5px] font-medium">
        {t('edit.title')}
      </summary>

      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="orderId" value={orderId} />
        <input type="hidden" name="reference" value={reference} />

        <div className="flex flex-col gap-2">
          <Label htmlFor={`edit-title-${orderId}`}>{t('request.projectTitle')}</Label>
          <Input
            id={`edit-title-${orderId}`}
            name="title"
            defaultValue={title}
            required
            maxLength={140}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`edit-brief-${orderId}`}>{t('request.brief')}</Label>
          <textarea
            id={`edit-brief-${orderId}`}
            name="brief"
            rows={5}
            defaultValue={brief}
            required
            maxLength={4000}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-gold-400 focus-visible:ring-3 focus-visible:ring-gold-500/18"
          />
        </div>

        {errorText ? (
          <p className="text-[12.5px] text-destructive" role="alert">
            {errorText}
          </p>
        ) : null}

        {state.status === 'success' ? (
          <p className="text-[12.5px] text-[var(--success)]" role="status">
            {t('edit.saved')}
          </p>
        ) : null}

        <div>
          <Button type="submit" variant="outline" size="default" disabled={pending}>
            {pending ? (
              <>
                <VirtueSpinner className="size-4" />
                {t('edit.saving')}
              </>
            ) : (
              <>
                <Save className="size-4" />
                {t('edit.submit')}
              </>
            )}
          </Button>
        </div>
      </form>
    </details>
  )
}
