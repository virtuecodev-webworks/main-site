'use client'

import * as React from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'

export interface ConfirmSubmitProps extends ButtonProps {
  /** Shown in the native confirm dialog before the form submits. */
  message: string
}

/** Submit button that asks for confirmation before letting the form through. */
export function ConfirmSubmit({ message, onClick, ...props }: ConfirmSubmitProps) {
  return (
    <Button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault()
          return
        }
        onClick?.(event)
      }}
      {...props}
    />
  )
}
