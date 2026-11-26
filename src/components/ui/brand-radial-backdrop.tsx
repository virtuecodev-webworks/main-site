import { cn } from '@/lib/utils'

export interface BrandRadialBackdropProps {
  className?: string
  subtleGrid?: boolean
}

/**
 * Virtue & Co. Webworks branded radial horizon backdrop:
 * deep obsidian ink (#0a0a0a) transitioning into deep bronze (#68500a) and rich brand gold (#dcaa28).
 */
export function BrandRadialBackdrop({
  className,
  subtleGrid = false,
}: BrandRadialBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
    >
      <div
        className="absolute inset-0 h-full w-full"
        style={{
          background:
            'radial-gradient(125% 125% at 50% 10%, #0a0a0a 40%, #68500a 78%, #dcaa28 100%)',
        }}
      />
      {subtleGrid ? (
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(245,244,240,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,244,240,0.16) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
      ) : null}
    </div>
  )
}
