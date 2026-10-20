'use client'

import * as React from 'react'
import { Trash2, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input, fieldBase } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { createClient } from '@/lib/supabase/client'
import { registerUploadedFont, removeFont } from '@/lib/actions/design'
import { IDLE_STATE } from '@/lib/actions/state'
import { FONTS_BUCKET, type InstalledFont, type SiteDesign } from '@/lib/design/tokens'
import { designErrorKey } from '@/lib/design/messages'
import { cn } from '@/lib/utils'
import { useRouter } from '@/i18n/navigation'

/** Matches the bucket's own limit in `0005_design.sql`. */
const MAX_BYTES = 4 * 1024 * 1024

export interface FontLibraryProps {
  design: SiteDesign
  /** Lets the editor adopt the new face and refresh its preview. */
  onInstalled: (font: InstalledFont, slot: 'body' | 'display') => void
  onRemoved: (family: string) => void
}

/**
 * Custom font uploads.
 *
 * The file goes from the browser straight to Supabase Storage under the admin's
 * own session - Storage RLS is what authorises it - and only the resulting path
 * is handed to the Server Action. Keeping the binary out of the action body
 * avoids the request-size ceiling that a 4 MB font would otherwise hit.
 *
 * Google families are deliberately absent from this panel: choosing one in the
 * typography selects registers it, so there is nothing to install.
 */
export function FontLibrary({ design, onInstalled, onRemoved }: FontLibraryProps) {
  const t = useTranslations('Admin.design.library')
  const tErrors = useTranslations('Admin.design.errors')
  const router = useRouter()

  const fileRef = React.useRef<HTMLInputElement>(null)
  const [family, setFamily] = React.useState('')
  const [slot, setSlot] = React.useState<'body' | 'display'>('display')
  const [busy, setBusy] = React.useState(false)

  const uploads = design.fonts.filter((font) => font.kind === 'upload')

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast.error(t('needFile'))
      return
    }
    if (!family.trim()) {
      toast.error(t('needFamily'))
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error(t('tooBig'))
      return
    }

    setBusy(true)

    try {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? 'woff2'
      const path = `fonts/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`
      const supabase = createClient()

      const { error: uploadError } = await supabase.storage.from(FONTS_BUCKET).upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
        contentType: file.type || undefined,
      })

      if (uploadError) {
        toast.error(t('uploadFailed'), { description: uploadError.message })
        return
      }

      const payload = new FormData()
      payload.set('family', family.trim())
      payload.set('path', path)
      payload.set('slot', slot)

      const result = await registerUploadedFont(IDLE_STATE, payload)

      if (result.status === 'error') {
        toast.error(tErrors(designErrorKey(result.message)))
        return
      }

      toast.success(t('installed', { family: family.trim() }))
      onInstalled(
        { family: family.trim(), kind: 'upload', path, weights: ['400', '700'] },
        slot,
      )
      setFamily('')
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch {
      toast.error(t('unavailable'))
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(name: string) {
    setBusy(true)

    try {
      const payload = new FormData()
      payload.set('family', name)

      const result = await removeFont(IDLE_STATE, payload)

      if (result.status === 'error') {
        toast.error(tErrors(designErrorKey(result.message)))
        return
      }

      toast.success(t('removed', { family: name }))
      onRemoved(name)
      router.refresh()
    } catch {
      toast.error(t('unavailable'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {uploads.length ? (
        <ul className="flex flex-col gap-2">
          {uploads.map((font) => {
            const inUse = design.fontBody === font.family || design.fontDisplay === font.family

            return (
              <li
                key={font.family}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium text-foreground">
                    {font.family}
                  </p>
                  <p className="truncate text-[11.5px] text-muted-foreground">
                    {font.path ?? t('noFile')}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {inUse ? (
                    <span className="rounded-full bg-gold-500/12 px-2.5 py-1 text-[10.5px] font-semibold tracking-wide text-gold-700 uppercase">
                      {t('inUse')}
                    </span>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => handleRemove(font.family)}
                    aria-label={t('removeLabel', { family: font.family })}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-[13px] text-muted-foreground">{t('empty')}</p>
      )}

      <form onSubmit={handleUpload} className="flex flex-col gap-4 border-t border-border pt-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="font-family">{t('family')}</Label>
            <Input
              id="font-family"
              value={family}
              onChange={(event) => setFamily(event.target.value)}
              placeholder={t('familyPlaceholder')}
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-[11.5px] text-muted-foreground">{t('familyHint')}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="font-slot">{t('slot')}</Label>
            <select
              id="font-slot"
              className={cn(fieldBase, 'h-11')}
              value={slot}
              onChange={(event) => setSlot(event.target.value === 'body' ? 'body' : 'display')}
            >
              <option value="display">{t('slotDisplay')}</option>
              <option value="body">{t('slotBody')}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="font-file">{t('file')}</Label>
          <input
            id="font-file"
            ref={fileRef}
            type="file"
            accept=".woff2,.woff,.otf,.ttf"
            className={cn(
              fieldBase,
              'h-11 py-2 text-[13px] file:mr-3 file:h-7 file:rounded-md file:border-0 file:bg-muted file:px-2.5 file:text-xs file:font-medium file:text-foreground',
            )}
          />
          <p className="text-[11.5px] text-muted-foreground">{t('fileHint')}</p>
        </div>

        <div>
          <Button type="submit" variant="outline" disabled={busy}>
            {busy ? <VirtueSpinner className="size-4" /> : <Upload aria-hidden />}
            {busy ? t('uploading') : t('submit')}
          </Button>
        </div>
      </form>
    </div>
  )
}
