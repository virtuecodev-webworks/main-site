import { VirtueSpinner } from '@/components/brand/virtue-spinner'

export default function PortalLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* Mobile Hero Skeleton */}
      <div className="lg:hidden h-48 rounded-[26px] bg-muted/60 border border-border" />

      {/* Desktop Header Skeleton */}
      <div className="hidden lg:flex flex-col gap-4">
        <div className="h-8 w-64 rounded-xl bg-muted/60" />
        <div className="flex gap-3">
          <div className="h-7 w-36 rounded-full bg-muted/50" />
          <div className="h-7 w-36 rounded-full bg-muted/50" />
          <div className="h-7 w-36 rounded-full bg-muted/50" />
        </div>
      </div>

      {/* Projects Card Skeleton */}
      <div className="surface rounded-2xl border border-border p-6 flex flex-col items-center justify-center min-h-[320px] gap-4">
        <VirtueSpinner className="size-8 text-gold-500 animate-spin" />
        <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
          Loading Workspace...
        </p>
      </div>
    </div>
  )
}
