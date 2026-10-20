'use client'

import * as React from 'react'
import Image from 'next/image'
import { ImagePlus, Trash2 } from 'lucide-react'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { publicMediaUrl } from '@/lib/supabase/env'
import { PROJECTS_BUCKET } from '@/lib/constants'
import { cn } from '@/lib/utils'

const MAX_BYTES = 5 * 1024 * 1024

export interface MediaUploaderProps {
  /** Hidden `<input name>` the object paths are submitted under. */
  name: string
  label: string
  hint?: string
  /** 1 for a single cover, N for a gallery. */
  maxFiles?: number
  folder?: string
  initialPaths?: string[]
  className?: string
}

/**
 * Browser → Supabase Storage uploader.
 *
 * Files are uploaded directly from the browser using the signed-in admin's
 * session (enforced by Storage RLS), so only the resulting object *paths* are
 * submitted with the form. That keeps large binaries out of the Server Action
 * body and avoids Vercel's request-size ceiling.
 */
export function MediaUploader({
  name,
  label,
  hint,
  maxFiles = 1,
  folder = 'projects',
  initialPaths = [],
  className,
}: MediaUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [paths, setPaths] = React.useState<string[]>(initialPaths)
  const [busy, setBusy] = React.useState(false)

  const remaining = maxFiles - paths.length

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return

    const selected = Array.from(files).slice(0, Math.max(0, remaining))
    if (!selected.length) {
      toast.error(`You can upload up to ${maxFiles} file${maxFiles > 1 ? 's' : ''}.`)
      return
    }

    setBusy(true)

    try {
      const supabase = createClient()
      const uploaded: string[] = []

      for (const file of selected) {
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} is larger than 5 MB.`)
          continue
        }

        const extension = file.name.split('.').pop()?.toLowerCase() ?? 'png'
        const objectPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`

        const { error } = await supabase.storage.from(PROJECTS_BUCKET).upload(objectPath, file, {
          cacheControl: '31536000',
          upsert: false,
          contentType: file.type || undefined,
        })

        if (error) {
          console.error('[storage] upload failed:', error.message)
          toast.error(`Could not upload ${file.name}.`, { description: error.message })
          continue
        }

        uploaded.push(objectPath)
      }

      if (uploaded.length) {
        setPaths((previous) => [...previous, ...uploaded].slice(0, maxFiles))
        toast.success(`Uploaded ${uploaded.length} file${uploaded.length > 1 ? 's' : ''}.`)
      }
    } catch {
      toast.error('Upload unavailable', {
        description: 'Supabase Storage is not configured, or your session has expired.',
      })
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function remove(path: string) {
    setPaths((previous) => previous.filter((entry) => entry !== path))
  }

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <Label htmlFor={`media-${name}`}>{label}</Label>

      <div className="flex flex-wrap gap-3">
        {paths.map((path) => {
          const url = publicMediaUrl(path)
          return (
            <div
              key={path}
              className="group relative size-24 overflow-hidden rounded-xl border border-border bg-muted"
            >
              {url ? (
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="96px"
                  unoptimized
                  className="object-cover"
                />
              ) : null}
              <button
                type="button"
                onClick={() => remove(path)}
                aria-label="Remove image"
                className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-ink-950/75 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          )
        })}

        {remaining > 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="grid size-24 place-items-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-gold-400 hover:bg-gold-50/60 hover:text-gold-800 disabled:opacity-60"
          >
            {busy ? (
              <VirtueSpinner className="size-5" />
            ) : (
              <>
                <ImagePlus className="size-5" />
                <span className="text-[10px] font-medium">Add</span>
              </>
            )}
          </button>
        ) : null}
      </div>

      <input
        id={`media-${name}`}
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        multiple={maxFiles > 1}
        className="sr-only"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {paths.map((path) => (
        <input key={path} type="hidden" name={name} value={path} />
      ))}

      {hint ? <p className="text-[11.5px] text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
