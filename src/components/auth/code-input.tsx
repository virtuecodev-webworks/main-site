'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface CodeInputProps {
  name?: string
  value?: string
  onChange?: (val: string) => void
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

/**
 * 6-Digit OTP Code Input matched precisely to the reference screenshot design:
 * - 6 individual elevated digit boxes with rounded corners & soft shadow
 * - Auto-advances focus on digit entry
 * - Backspace moves focus back
 * - Paste distributes all 6 digits automatically
 * - Synchronizes with a hidden input for native form actions
 */
export function CodeInput({
  name = 'token',
  value: controlledValue,
  onChange,
  disabled = false,
  autoFocus = true,
  className,
}: CodeInputProps) {
  const [digits, setDigits] = React.useState<string[]>(['', '', '', '', '', ''])
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Keep in sync with controlled value if provided
  React.useEffect(() => {
    if (controlledValue !== undefined) {
      const clean = controlledValue.replace(/\D/g, '').slice(0, 6)
      const arr = ['', '', '', '', '', '']
      for (let i = 0; i < clean.length; i++) {
        arr[i] = clean[i]
      }
      setDigits(arr)
    }
  }, [controlledValue])

  // Focus first input on mount
  React.useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus])

  const fullCode = digits.join('')

  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = char
    setDigits(newDigits)

    const updated = newDigits.join('')
    onChange?.(updated)

    // Move to next input if digit entered
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back and clear
        inputRefs.current[index - 1]?.focus()
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        setDigits(newDigits)
        onChange?.(newDigits.join(''))
      } else {
        const newDigits = [...digits]
        newDigits[index] = ''
        setDigits(newDigits)
        onChange?.(newDigits.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const newDigits = ['', '', '', '', '', '']
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]
    }
    setDigits(newDigits)
    onChange?.(newDigits.join(''))

    // Focus last filled or next input
    const nextIdx = Math.min(pasted.length, 5)
    inputRefs.current[nextIdx]?.focus()
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Hidden input for standard HTML form submission */}
      <input type="hidden" name={name} value={fullCode} />

      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={digit}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={cn(
              'size-11 sm:size-13 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl',
              'bg-card text-foreground border-2 border-border/80 shadow-xs transition-all duration-150',
              'focus:border-gold-500 focus:bg-background focus:ring-4 focus:ring-gold-500/20 focus:outline-hidden',
              digit ? 'border-gold-500/70 bg-gold-500/5' : 'text-muted-foreground',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Digit ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
