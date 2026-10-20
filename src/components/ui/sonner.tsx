'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'

/**
 * Brand-themed toast host. Mounted once in the locale layout so both the public
 * site and the admin dashboard share the same notification surface.
 */
export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      closeButton
      duration={4200}
      toastOptions={{
        classNames: {
          toast:
            'rounded-2xl border-border bg-popover text-popover-foreground shadow-elevation-3 font-sans',
          title: 'text-sm font-semibold',
          description: 'text-sm text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground rounded-full',
          cancelButton: 'bg-muted text-muted-foreground rounded-full',
          success: '[&_[data-icon]]:text-[var(--success)]',
          error: '[&_[data-icon]]:text-[var(--destructive)]',
        },
      }}
      {...props}
    />
  )
}
