'use client'

import * as React from 'react'
import { Eye, EyeOff, Check, Dot } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends React.ComponentProps<'input'> {
  showRequirements?: boolean
}

interface RequirementItem {
  label: string
  valid: boolean
}

export function PasswordInput({
  id = 'password',
  name = 'password',
  value: controlledValue,
  onChange,
  showRequirements = false,
  className,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState('')

  const password = controlledValue !== undefined ? String(controlledValue) : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value)
    onChange?.(e)
  }

  // Google-style password requirements
  const requirements: RequirementItem[] = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'At least one number (0–9)', valid: /[0-9]/.test(password) },
    { label: 'At least one uppercase letter (A–Z)', valid: /[A-Z]/.test(password) },
    { label: 'At least one symbol (!@#$%^&*)', valid: /[^A-Za-z0-9]/.test(password) },
  ]

  const isFocusedOrTyped = password.length > 0

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={password}
          onChange={handleChange}
          className={cn('pr-10 font-sans tracking-normal', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md focus:outline-hidden"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {showRequirements && isFocusedOrTyped && (
        <div className="mt-1 p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5 animate-in fade-in duration-200">
          <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
            Password Strength:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {requirements.map((req) => (
              <div
                key={req.label}
                className={cn(
                  'flex items-center gap-1.5 text-[11.5px] transition-colors',
                  req.valid ? 'text-emerald-500 font-medium' : 'text-muted-foreground'
                )}
              >
                {req.valid ? (
                  <Check className="size-3.5 shrink-0 stroke-[2.5]" />
                ) : (
                  <Dot className="size-3.5 shrink-0" />
                )}
                <span>{req.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
