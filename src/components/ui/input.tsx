import * as React from 'react'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full min-w-0 rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground shadow-[inset_0_1px_0_rgb(26_26_26/0.02)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/70 focus-visible:border-gold-400 focus-visible:ring-3 focus-visible:ring-gold-500/18 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldBase,
        'h-11 file:mr-3 file:h-7 file:rounded-md file:border-0 file:bg-muted file:px-2.5 file:text-xs file:font-medium file:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldBase, 'min-h-32 resize-y leading-relaxed', className)}
      {...props}
    />
  )
}

export { Input, Textarea, fieldBase }
