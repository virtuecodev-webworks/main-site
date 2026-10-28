import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium outline-none transition-[background,box-shadow,transform,color,border-color] duration-200 ease-[var(--ease-vantra)] focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-elevation-1 hover:bg-primary-hover hover:text-primary-hover-foreground',
        gold: 'bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover hover:text-primary-hover-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-elevation-1 hover:bg-secondary-hover',
        outline:
          'border border-border bg-background/70 backdrop-blur-sm text-foreground hover:border-foreground/50 hover:bg-muted/50 hover:text-foreground',
        ghost: 'text-foreground hover:bg-muted',
        subtle: 'bg-muted text-foreground hover:bg-ink-200/70',
        destructive:
          'bg-destructive text-destructive-foreground shadow-elevation-1 hover:bg-destructive/90',
        link: 'h-auto rounded-none px-0 text-foreground underline-offset-4 hover:text-gold-700 hover:underline',
      },
      size: {
        sm: 'h-9 px-3.5 text-[13px] rounded-lg',
        default: 'h-11 px-5 rounded-xl',
        lg: 'h-12 px-6 text-[15px] rounded-xl',
        xl: 'h-14 px-8 text-base rounded-xl',
        icon: 'size-10 rounded-xl',
        'icon-sm': 'size-8 rounded-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
