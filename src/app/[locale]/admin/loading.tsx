import { VirtueSpinner } from '@/components/brand/virtue-spinner'

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="hidden lg:flex items-center justify-between border-b border-border pb-5">
        <div className="h-9 w-72 rounded-xl bg-muted/60" />
        <div className="h-9 w-32 rounded-xl bg-muted/60" />
      </div>

      {/* Greeting Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-32 rounded bg-muted/50" />
        <div className="h-8 w-64 rounded-xl bg-muted/60" />
        <div className="flex gap-2.5 pt-2 flex-wrap">
          <div className="h-7 w-36 rounded-full bg-muted/50" />
          <div className="h-7 w-36 rounded-full bg-muted/50" />
          <div className="h-7 w-36 rounded-full bg-muted/50" />
        </div>
      </div>

      {/* Center Console Skeleton */}
      <div className="surface rounded-2xl border border-border p-8 flex flex-col items-center justify-center min-h-[340px] gap-4">
        <VirtueSpinner className="size-8 text-gold-500 animate-spin" />
        <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
          Loading Studio Command...
        </p>
      </div>
    </div>
  )
}
